// ============================================================================
// PocketForge — function-calling fine-tune dataset generator
//
// Emits multi-turn tool-calling conversations covering every tool the assistant
// can call, for retraining a model that has lost native function calling (see
// docs/finetune-function-calling.md).
//
// The defining property of this generator: it does not invent anything. Every
// example is produced by *actually executing the app's real tool handlers*
// against the real store, so recorded arguments are legal, recorded results are
// byte-identical to what the model will see at inference time, and a rejection
// in the data is a rejection the validator genuinely produced. Hand-written
// examples drift from the app the moment either changes, and worse, teach a
// model movesets that do not exist — the exact failure mode being trained out.
//
//   npm run generate-training-data            # → training-data/*.jsonl
//   node --import tsx scripts/generate-training-data.mjs --out somewhere
//
// Output is OpenAI-shaped messages JSONL (role / content / tool_calls / tool),
// deliberately NOT pre-rendered into Gemma's tool tags: every training stack
// (TRL, Unsloth, axolotl) applies the target model's own chat template, and
// baking one in here would hard-code a format this repo cannot verify and make
// the data unusable for any other base model.
// ============================================================================

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { ALL_TOOLS, getToolByName } from '../src/lib/llm/tools.ts';
import { useStore } from '../src/store/useStore.ts';
import { buildSystemPrompt } from '../src/lib/llm/systemPrompt.ts';
import { CHAMPIONS_MB_ROSTER } from '../src/data/championsRoster.ts';
import { CHAMPIONS_USAGE_RANKINGS } from '../src/data/championsUsageRankings.ts';
import { preloadBundledRegulations } from '../src/lib/regulations/regulationsRuntime.ts';

// Mirrors useRegulationsInit (App.tsx) — every Champions legality check reads a
// cache that is empty until this runs, so without it get_legal_moves returns an
// empty movepool for every species and the generated data would teach the model
// that nothing is legal. Bundled preload only; the hook's OTA fetch is a
// non-blocking refresh the app doesn't wait on either.
preloadBundledRegulations(['champions-ma', 'champions-mb']);

const OUT_DIR = (() => {
  const i = process.argv.indexOf('--out');
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : 'training-data';
})();

// ---- tool execution ---------------------------------------------------------

let callCounter = 0;

/**
 * Runs a tool for real and returns the {assistantMessage, toolMessage} pair in
 * wire shape. Everything downstream is a consequence of this: the result text
 * is whatever the handler actually returned, including errors.
 */
async function callTool(name, args) {
  const tool = getToolByName(name);
  if (!tool) throw new Error(`unknown tool ${name}`);
  const id = `call_${++callCounter}`;
  let result;
  try {
    result = await tool.handler(args, { team: activeTeam(), signal: undefined });
  } catch (error) {
    result = { error: error instanceof Error ? error.message : String(error) };
  }
  return {
    assistant: {
      role: 'assistant',
      content: '',
      tool_calls: [{ id, type: 'function', function: { name, arguments: JSON.stringify(args) } }],
    },
    tool: { role: 'tool', tool_call_id: id, name, content: JSON.stringify(result) },
    result,
  };
}

function activeTeam() {
  const s = useStore.getState();
  return s.teams.find((t) => t.id === s.currentTeamId) ?? s.teams[0] ?? null;
}

function resetStore() {
  const s = useStore.getState();
  for (const t of [...s.teams]) s.deleteTeam(t.id);
}

// ---- conversation builder ---------------------------------------------------

class Conversation {
  constructor(userText) {
    this.messages = [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: userText },
    ];
  }

  /** One tool call plus its real result, appended as two turns. */
  async call(name, args) {
    const { assistant, tool, result } = await callTool(name, args);
    this.messages.push(assistant, tool);
    return result;
  }

  /** The model's closing prose. Kept short on purpose — the app's own system
   *  prompt asks for concise answers, and long summaries in training data teach
   *  a small model to pad. */
  finish(text) {
    this.messages.push({ role: 'assistant', content: text });
    return this;
  }
}

const SYSTEM = buildSystemPrompt({ includeWebTools: false });

// ---- source data ------------------------------------------------------------

/** Top-usage Champions species, so trained examples reference Pokemon a user
 *  is actually likely to ask about rather than an arbitrary dex slice. */
function topSpecies(n) {
  const ranked = (CHAMPIONS_USAGE_RANKINGS ?? [])
    .map((r) => r.species ?? r.name ?? r)
    .filter((s) => typeof s === 'string');
  const pool = ranked.length > 0 ? ranked : CHAMPIONS_MB_ROSTER;
  return pool.slice(0, n);
}

/** Picks up to 4 legal, damaging-where-possible moves straight out of the real
 *  movepool so add_pokemon is never trained on a moveset the validator rejects
 *  (except where a rejection is the point — see selfCorrection). */
async function legalMoves(species, count = 4) {
  const res = await (getToolByName('get_legal_moves').handler({ species }, { team: activeTeam() }));
  const moves = (res.moves ?? []).map((m) => m.name);
  return moves.slice(0, count);
}

async function firstAbility(species) {
  const res = await (getToolByName('lookup_pokemon').handler({ species }, { team: activeTeam() }));
  return Array.isArray(res.abilities) ? res.abilities[0] : undefined;
}

// ---- scenario generators ----------------------------------------------------

const conversations = [];
const add = (c) => conversations.push(c);

/**
 * The headline chain, and the one the app is built around: a full six-Pokemon
 * team. Each member follows the sequence the system prompt prescribes —
 * lookup_pokemon, get_legal_moves, then add_pokemon — so the model learns that
 * a write is preceded by the checks that make it succeed, not guessed at.
 */
async function fullTeamBuild(species, teamName, userText) {
  resetStore();
  const c = new Conversation(userText);
  await c.call('create_team', { name: teamName });
  for (const s of species) {
    await c.call('lookup_pokemon', { species: s });
    await c.call('get_legal_moves', { species: s });
    const moves = await legalMoves(s);
    const ability = await firstAbility(s);
    await c.call('add_pokemon', {
      species: s,
      moves,
      ...(ability ? { ability } : {}),
      level: 50,
    });
  }
  await c.call('validate_team', {});
  c.finish(`Built ${teamName} with ${species.join(', ')}. All six are on the team and validated.`);
  add(c);
}

/**
 * Self-correction: an add_pokemon that the validator genuinely rejects, then the
 * lookup that reveals the legal options, then a successful retry. This is the
 * single most valuable shape in the set — it teaches the model that a rejection
 * is information to act on rather than a reason to apologise and stop, which is
 * exactly the loop the broken model failed at.
 */
async function selfCorrection(species) {
  resetStore();
  const c = new Conversation(`Add ${species} with Hyper Beam, Judgment, Doom Desire and Fusion Flare.`);
  await c.call('create_team', { name: 'Correction Demo' });
  const bogus = ['Hyper Beam', 'Judgment', 'Doom Desire', 'Fusion Flare'];
  const rejected = await c.call('add_pokemon', { species, moves: bogus, level: 50 });
  if (!rejected || rejected.ok !== false) {
    // The moves turned out legal for this species — no rejection to learn from,
    // so this example teaches nothing and is dropped rather than shipped as a
    // mislabelled "correction".
    return;
  }
  await c.call('get_legal_moves', { species });
  const moves = await legalMoves(species);
  await c.call('add_pokemon', { species, moves, level: 50 });
  c.finish(
    `Those moves aren't in ${species}'s legal movepool for this format. I checked what it can ` +
      `actually learn and added it with ${moves.join(', ')} instead.`
  );
  add(c);
}

/** Read-only single calls — one per tool, so no tool is absent from the data. */
async function singleCalls(species) {
  const [a, b] = species;

  resetStore();
  let c = new Conversation(`What are ${a}'s abilities and base stats?`);
  const dex = await c.call('lookup_pokemon', { species: a });
  c.finish(
    `${a} is ${(dex.types ?? []).join('/')} with ${(dex.abilities ?? []).join(', ')}.`
  );
  add(c);

  resetStore();
  c = new Conversation(`What moves can ${b} learn that are Fire type?`);
  await c.call('get_legal_moves', { species: b, query: 'fire' });
  c.finish(`Those are the Fire-type options in ${b}'s legal movepool.`);
  add(c);

  // The remaining read tools need a populated team to be meaningful.
  resetStore();
  c = new Conversation('How fast is my Tsareena with Tailwind up?');
  await c.call('create_team', { name: 'Speed Check' });
  const moves = await legalMoves('Tsareena');
  await c.call('add_pokemon', { species: 'Tsareena', moves, level: 50, evs: { spe: 252, atk: 252, hp: 4 } });
  await c.call('get_active_team', {});
  await c.call('calculate_speed', { species: 'Tsareena', tailwind: true });
  c.finish('That is its real Speed with Tailwind applied.');
  add(c);

  resetStore();
  c = new Conversation('Explain the EV spread on my Tsareena.');
  await c.call('create_team', { name: 'EV Check' });
  await c.call('add_pokemon', {
    species: 'Tsareena',
    moves: await legalMoves('Tsareena'),
    level: 50,
    evs: { atk: 252, spe: 252, hp: 4 },
  });
  await c.call('explain_evs', { species: 'Tsareena' });
  c.finish('That spread is a max-Attack, max-Speed offensive build.');
  add(c);

  // Damage: the tool the system prompt is most emphatic about never estimating,
  // so it gets both a plain roll and the spread-move and Tera variants that a
  // doubles player actually asks for.
  resetStore();
  c = new Conversation(`How much does ${a}'s strongest move do to ${b}?`);
  await c.call('create_team', { name: 'Damage Check' });
  const atkMoves = await legalMoves(a);
  await c.call('add_pokemon', { species: a, moves: atkMoves, level: 50, evs: { atk: 252, spe: 252, hp: 4 } });
  await c.call('lookup_pokemon', { species: b });
  if (atkMoves[0]) {
    await c.call('calculate_damage', { attacker: a, defender: b, move: atkMoves[0] });
    c.finish(`That is the real roll for ${atkMoves[0]} into ${b}.`);
    add(c);
  }

  resetStore();
  c = new Conversation(`If I Terastallize ${a}, how much more damage does it do to ${b} in doubles?`);
  await c.call('create_team', { name: 'Tera Damage' });
  const teraMoves = await legalMoves(a);
  await c.call('add_pokemon', { species: a, moves: teraMoves, level: 50, evs: { atk: 252, spe: 252, hp: 4 } });
  if (teraMoves[0]) {
    await c.call('calculate_damage', { attacker: a, defender: b, move: teraMoves[0], isSpreadMove: true });
    await c.call('calculate_damage', {
      attacker: a,
      defender: b,
      move: teraMoves[0],
      isSpreadMove: true,
      useTera: true,
    });
    c.finish('Those are the two rolls — spread damage without Tera, then with it.');
    add(c);
  }

  resetStore();
  c = new Conversation('Analyze my team and tell me what it is weak to.');
  await c.call('create_team', { name: 'Analysis Demo' });
  for (const s of species.slice(0, 3)) {
    await c.call('add_pokemon', { species: s, moves: await legalMoves(s), level: 50 });
  }
  await c.call('analyze_team', {});
  c.finish('Those are the coverage gaps worth addressing.');
  add(c);
}

/** Editing an existing team: the update / remove tools, plus the get_active_team
 *  call that the system prompt requires before answering anything about "my team". */
async function editing(species) {
  const [a, b] = species;

  resetStore();
  let c = new Conversation(`Swap ${a} out for ${b}.`);
  await c.call('create_team', { name: 'Swap Demo' });
  await c.call('add_pokemon', { species: a, moves: await legalMoves(a), level: 50 });
  await c.call('get_active_team', {});
  await c.call('remove_pokemon', { species: a });
  await c.call('lookup_pokemon', { species: b });
  await c.call('get_legal_moves', { species: b });
  await c.call('add_pokemon', { species: b, moves: await legalMoves(b), level: 50 });
  c.finish(`Swapped ${a} for ${b}.`);
  add(c);

  resetStore();
  c = new Conversation(`Give my ${a} a max Speed spread.`);
  await c.call('create_team', { name: 'EV Edit' });
  await c.call('add_pokemon', { species: a, moves: await legalMoves(a), level: 50 });
  await c.call('get_active_team', {});
  await c.call('update_pokemon', { species: a, evs: { spe: 252, atk: 252, hp: 4 } });
  c.finish(`${a} is now 252 Speed / 252 Attack / 4 HP.`);
  add(c);
}

/**
 * No-tool answers. Without these the model learns "always call something", and
 * starts calling create_team when the user says hello — an over-trigger that is
 * just as broken as never calling at all.
 */
function chitchat() {
  const pairs = [
    ['Hello', 'Hi — I can build teams, check legality, and run damage and speed calcs. What are you working on?'],
    ['What can you do?', 'I can build and edit your team, look up legal moves and abilities, run damage and speed calculations, and validate a team against the current regulation.'],
    ['Thanks!', 'Any time.'],
    ['What does VGC stand for?', 'Video Game Championships — the official doubles format run by The Pokemon Company.'],
  ];
  for (const [q, a] of pairs) {
    const c = new Conversation(q);
    c.finish(a);
    add(c);
  }
}

// ---- main -------------------------------------------------------------------

const candidates = topSpecies(80);

// Not every roster species has a Champions learnset entry, and one with no legal
// moves would be trained as an add_pokemon carrying an empty moveset — a legal
// call, but not the behaviour worth teaching. Filter before generating rather
// than emitting examples that model a degenerate case.
const species = [];
for (const s of candidates) {
  if ((await legalMoves(s, 1)).length > 0) species.push(s);
  if (species.length >= 60) break;
}

if (species.length < 8) {
  console.error(`Not enough Champions species with legal movepools (${species.length}) — aborting.`);
  console.error('If this is 0, the regulation cache did not load — see preloadBundledRegulations above.');
  process.exit(1);
}

console.log(`Generating from ${species.length} Champions species...`);

// Phrasings vary so the model keys on intent rather than one memorized sentence.
const BUILD_PHRASINGS = [
  (s) => `Build me a VGC team around ${s}.`,
  (s) => `Make a doubles team with ${s} as the focal point.`,
  (s) => `I want to run ${s} on the Champions ladder — build me a team for it.`,
  (s) => `Put together a balanced team built around ${s}.`,
  (s) => `Can you build a ${s} team for Regulation M-B?`,
];

// Many distinct six-Pokemon builds: the long dependent chain is the behaviour
// that was lost, so it needs to be the best-represented shape in the set.
let build = 0;
for (let i = 0; i + 6 <= species.length; i += 6, build++) {
  const six = species.slice(i, i + 6);
  await fullTeamBuild(six, `VGC Core ${build + 1}`, BUILD_PHRASINGS[build % BUILD_PHRASINGS.length](six[0]));
}
// Rotated starts give more six-member combinations without repeating a lineup.
for (let offset = 3; offset + 6 <= species.length; offset += 6, build++) {
  const six = species.slice(offset, offset + 6);
  await fullTeamBuild(six, `VGC Alt ${build + 1}`, BUILD_PHRASINGS[build % BUILD_PHRASINGS.length](six[0]));
}
await fullTeamBuild(
  ['Tsareena', ...species.filter((s) => s !== 'Tsareena').slice(0, 5)],
  'Tsareena Balance',
  'Build me a VGC doubles team with Tsareena as the focal point.'
);

// Self-correction across many species — the rejection text differs per species,
// so each one is a distinct lesson in reading a validator error.
for (const s of species.slice(0, 16)) await selfCorrection(s);

// Read/edit scenarios over several disjoint species pairs.
for (let i = 0; i + 4 <= Math.min(species.length, 24); i += 4) {
  await singleCalls(species.slice(i, i + 4));
  await editing(species.slice(i, i + 4));
}
chitchat();

// ---- write ------------------------------------------------------------------

mkdirSync(OUT_DIR, { recursive: true });

const rows = conversations.map((c) => JSON.stringify({ messages: c.messages }));
// Deterministic split by index rather than a shuffle: the generator is meant to
// be re-runnable with identical output, so a diff of the dataset shows only real
// changes in the app's tools or data.
const evalEvery = 8;
const train = rows.filter((_, i) => i % evalEvery !== 0);
const evalRows = rows.filter((_, i) => i % evalEvery === 0);

writeFileSync(join(OUT_DIR, 'train.jsonl'), train.join('\n') + '\n');
writeFileSync(join(OUT_DIR, 'eval.jsonl'), evalRows.join('\n') + '\n');

const toolCalls = conversations.reduce(
  (n, c) => n + c.messages.filter((m) => m.tool_calls).length,
  0
);
const covered = new Set(
  conversations.flatMap((c) =>
    c.messages.filter((m) => m.tool_calls).map((m) => m.tool_calls[0].function.name)
  )
);
const missing = ALL_TOOLS.map((t) => t.name).filter(
  (n) => !covered.has(n) && n !== 'web_search' && n !== 'web_fetch'
);

console.log(`\n  conversations : ${conversations.length}  (train ${train.length} / eval ${evalRows.length})`);
console.log(`  tool calls    : ${toolCalls}`);
console.log(`  tools covered : ${covered.size} — ${[...covered].sort().join(', ')}`);
if (missing.length > 0) console.log(`  ⚠ NOT covered : ${missing.join(', ')}`);
console.log(`\n  written to ${OUT_DIR}/train.jsonl and ${OUT_DIR}/eval.jsonl`);
