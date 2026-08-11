import { importTeamFromPSFormat, exportTeamToPSFormat } from './src/utils/psFormat.ts';
import { getMovepoolForSpecies } from './src/utils/movepoolQuery.ts';
import { calculateSpeed } from './src/utils/speedCalculator.ts';
import { calculateDamage } from './src/utils/damageCalc.ts';
import {
  CHAMPIONS_USAGE_META,
  CHAMPIONS_USAGE_RANKINGS,
  getChampionsUsageRank,
} from './src/data/championsUsageRankings.ts';
import { getChampionsUsageData } from './src/data/championsUsageDetails.ts';
import {
  calculateAllStats,
  calculateHP,
  calculateStat,
  getRemainingEVs,
  isValidEVSpread,
  MAX_TOTAL_EVS,
} from './src/utils/statCalc.ts';
import { normalizePokemonData, normalizeTeamData } from './src/lib/teamData.ts';
import { getEffectiveness } from './src/data/typesData.ts';
import {
  getTeamDefensiveCoverage,
  getTeamOffensiveCoverage,
} from './src/utils/typeChart.ts';
import { analyzeTeamWeaknesses } from './src/utils/weaknessAnalyzer.ts';
import { TOOLS, getToolByName, toOllamaToolSchema, toLocalToolSchema } from './src/lib/llm/tools.ts';
import { buildSystemPrompt, SYSTEM_PROMPT } from './src/lib/llm/systemPrompt.ts';
import { sendMessage as localSendMessage } from './src/lib/llm/localLlamaCpp.ts';
import { useStore, mergeStoreState } from './src/store/useStore.ts';
import { readFileSync } from 'node:fs';

// Simple assert helper
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
}

async function runTests() {
  console.log('--- PocketForge Integration Verification ---');

  // Test 1: Team Import/Export
  console.log('Testing Team Import/Export...');
  const psText = `
=== VGC Team ===
// Format: gen9ou

Gengar @ Choice Specs
Ability: Cursed Body
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
IVs: 0 Atk
- Shadow Ball
- Focus Blast
- Sludge Bomb
- Nasty Plot
`;
  const team = importTeamFromPSFormat(psText);
  assert(team.name === 'VGC Team', 'Team name mismatch');
  assert(team.format === 'gen9ou', 'Format mismatch');
  assert(team.pokemon.length === 1, 'Pokemon count mismatch');
  
  const gengar = team.pokemon[0];
  assert(gengar.species === 'Gengar', 'Species mismatch');
  assert(gengar.item === 'Choice Specs', 'Item mismatch');
  assert(gengar.ability === 'Cursed Body', 'Ability mismatch');
  assert(gengar.evs.spa === 252 && gengar.evs.spe === 252, 'EVs mismatch');
  assert(gengar.ivs.atk === 0, 'IVs mismatch');
  assert(gengar.moves.includes('Shadow Ball'), 'Moves mismatch');

  const exported = exportTeamToPSFormat(team);
  assert(exported.includes('=== VGC Team ==='), 'Export header missing');
  assert(exported.includes('Choice Specs'), 'Export item missing');
  console.log('✅ Team Import/Export matches successfully!');

  // Test 2: Movepool Query and Pre-evolution Inheritance
  console.log('Testing Movepool Query & Inheritance...');
  const garchompMovepool = await getMovepoolForSpecies('Garchomp');
  assert(garchompMovepool.length > 50, 'Movepool size too small');
  const moveNames = garchompMovepool.map(m => m.name.toLowerCase());
  
  assert(moveNames.includes('earthquake'), 'Missing Earthquake');
  // Egg moves should be inherited from Gible
  assert(moveNames.includes('outrage'), 'Missing Outrage (inherited egg move)');
  
  const levelUpMoves = garchompMovepool.filter(m => m.acquisition === 'Level');
  assert(levelUpMoves.length > 0, 'No level up moves found');
  console.log(`✅ Garchomp movepool resolved: ${garchompMovepool.length} moves (Level up: ${levelUpMoves.length})`);

  // Test 3: Speed Calculations
  console.log('Testing Speed Calculations...');
  gengar.level = 50;
  const gengarSpe = calculateSpeed(gengar); // base 110, Timid (1.1x), 252 EVs -> 178 Spe
  assert(gengarSpe === 178, `Expected Gengar Speed to be 178, got ${gengarSpe}`);

  // Choice Scarf modifier (1.5x)
  const gengarScarfSpe = calculateSpeed(gengar, { isScarf: true });
  assert(gengarScarfSpe === 267, `Expected Gengar Scarf Speed to be 267, got ${gengarScarfSpe}`);

  // Sticky Web (-1 stage -> 0.67x)
  const gengarWebSpe = calculateSpeed(gengar, { hasStickyWeb: true });
  assert(gengarWebSpe === 118, `Expected Gengar Sticky Web Speed to be 118, got ${gengarWebSpe}`);

  // Tailwind (2x)
  const gengarTailwindSpe = calculateSpeed(gengar, { tailwindActive: true });
  assert(gengarTailwindSpe === 356, `Expected Gengar Tailwind Speed to be 356, got ${gengarTailwindSpe}`);

  console.log('✅ Speed Calculations completed successfully!');

  // Test 4: Damage Calculations
  console.log('Testing Damage Calculations...');
  const chansey = {
    name: 'Chansey',
    level: 50,
    baseStats: { hp: 250, atk: 5, def: 5, spa: 35, spd: 105, spe: 50 },
    evs: { hp: 252, atk: 0, def: 252, spa: 0, spd: 4, spe: 0 },
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    nature: 'Bold',
    ability: 'Natural Cure',
    item: 'Eviolite',
    types: ['Normal'],
    status: 'healthy',
  };

  const calcGengar = {
    name: 'Gengar',
    level: 50,
    baseStats: { hp: 60, atk: 65, def: 60, spa: 130, spd: 75, spe: 110 },
    evs: { hp: 0, atk: 0, def: 4, spa: 252, spd: 0, spe: 252 },
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    nature: 'Timid',
    ability: 'Cursed Body',
    item: 'Choice Specs',
    types: ['Ghost', 'Poison'],
    status: 'healthy',
  };

  const focusBlast = {
    name: 'Focus Blast',
    type: 'Fighting',
    category: 'Special',
    power: 120,
    accuracy: 70,
  };

  const field = {
    weather: 'none',
    terrain: 'none',
    reflect: false,
    lightScreen: false,
    auroraVeil: false,
    stealthRock: false,
    multiscale: false,
    friendGuard: false,
  };

  const dmgResult = calculateDamage(calcGengar, chansey, focusBlast, field);
  assert(dmgResult.minDamage > 0, 'Damage must be greater than 0');
  assert(dmgResult.minPercent >= 20 && dmgResult.maxPercent <= 50, 'Focus Blast damage range unexpected against Eviolite Chansey');
  assert(dmgResult.koChance.includes('3HKO') || dmgResult.koChance.includes('2HKO') || dmgResult.koChance.includes('chance'), `Expected 3HKO, got ${dmgResult.koChance}`);

  console.log(`✅ Focus Blast vs Chansey: ${dmgResult.minDamage}-${dmgResult.maxDamage} HP (${dmgResult.minPercent.toFixed(1)}% - ${dmgResult.maxPercent.toFixed(1)}%) - ${dmgResult.koChance}`);

  // Test 5: Static Champions usage snapshot
  console.log('Testing Champions ranked battle snapshot...');
  assert(CHAMPIONS_USAGE_META.format === 'Doubles', 'Champions usage format must be Doubles');
  assert(CHAMPIONS_USAGE_RANKINGS.length >= 100, 'Champions rankings snapshot is unexpectedly small');
  assert(
    new Set(CHAMPIONS_USAGE_RANKINGS.map((entry) => entry.rank)).size === CHAMPIONS_USAGE_RANKINGS.length,
    'Champions rankings contain duplicate ranks',
  );
  assert(getChampionsUsageRank('Garchomp') > 0, 'Garchomp is missing from Champions rankings');
  const garchompUsage = getChampionsUsageData('Garchomp');
  assert(garchompUsage?.moves.length, 'Garchomp detailed usage data is missing');
  assert(
    garchompUsage.moves.every((entry) => entry.usage >= 0 && entry.usage <= 100),
    'Champions move usage values must be percentages',
  );
  console.log(`✅ Champions snapshot loaded: ${CHAMPIONS_USAGE_RANKINGS.length} ranked, ${CHAMPIONS_USAGE_META.detailedPokemonCount} detailed`);

  // Test 6: Type effectiveness and team analysis
  console.log('Testing Analysis type effectiveness...');
  assert(getEffectiveness('Fire', ['Grass']) === 2, 'Fire must be super-effective against Grass');
  assert(getEffectiveness('fire', ['Grass', 'Steel']) === 4, 'Fire must be 4x against Grass/Steel');
  assert(getEffectiveness('Electric', ['Ground']) === 0, 'Ground must be immune to Electric');
  assert(getEffectiveness('Ice', ['Dragon', 'Flying']) === 4, 'Ice must be 4x against Dragon/Flying');
  assert(getEffectiveness('Fighting', ['Ghost']) === 0, 'Ghost must be immune to Fighting');
  assert(getEffectiveness('Water', ['Water', 'Dragon']) === 0.25, 'Water must be 0.25x against Water/Dragon');

  const analysisTeam = normalizeTeamData({
    name: 'Analysis Regression Team',
    pokemon: [
      { species: 'Garchomp', moves: ['Earthquake', 'Dragon Claw'] },
      { species: 'Charizard', moves: ['Flamethrower', 'Air Slash'] },
    ],
  });
  const defensiveCoverage = getTeamDefensiveCoverage(analysisTeam);
  assert(defensiveCoverage.Ice.weak === 1, 'Garchomp must register as weak to Ice');
  assert(defensiveCoverage.Ground.immune === 1, 'Charizard must register as immune to Ground');
  const offensiveCoverage = getTeamOffensiveCoverage(analysisTeam);
  assert(offensiveCoverage.Steel, 'Fire or Ground STAB must cover Steel');
  const weaknessAnalysis = analyzeTeamWeaknesses(analysisTeam);
  assert(
    weaknessAnalysis.weaknesses.some((row) => row.type === 'Ice' && row.weakMembers.includes('Garchomp')),
    'Weakness Analysis must identify Garchomp as weak to Ice',
  );
  console.log('✅ Type coverage, immunities, and weakness analysis are accurate');

  // Test 7: Lightweight stat calculations used by Analysis
  console.log('Testing Analysis stat calculations...');
  assert(calculateStat(110, 252, 31, 50, 'Timid', 'spe') === 178, 'Timid Gengar Speed should be 178');
  assert(calculateHP(60, 0, 31, 50) === 135, 'Gengar HP should be 135');
  assert(calculateHP(1, 252, 31, 100) === 1, 'Shedinja HP must remain 1');
  const calculatedStats = calculateAllStats(
    { hp: 60, atk: 65, def: 60, spa: 130, spd: 75, spe: 110 },
    { hp: 0, atk: 0, def: 252, spa: 252, spd: 0, spe: 252 },
    { hp: 31, atk: 31, def: 0, spa: 31, spd: 31, spe: 31 },
    50,
    'Timid',
  );
  assert(calculatedStats.def === 96, `Expected 96 Defense with a 0 IV, got ${calculatedStats.def}`);
  const legalEVs = { hp: 252, atk: 252, def: 6, spa: 0, spd: 0, spe: 0 };
  const illegalEVs = { ...legalEVs, def: 7 };
  assert(MAX_TOTAL_EVS === 510, 'The legal combined EV limit must be 510');
  assert(getRemainingEVs(legalEVs) === 0, 'A 510 EV spread must have no remaining EVs');
  assert(isValidEVSpread(legalEVs).valid, 'A 510 EV spread must be valid');
  assert(!isValidEVSpread(illegalEVs).valid, 'A 511 EV spread must be rejected');
  console.log('✅ Analysis stat calculations are accurate without the battle-engine bundle');

  // Test 8: Legacy/imported team normalization
  console.log('Testing saved-team normalization...');
  const recoveredPokemon = normalizePokemonData({
    species: 'Garchomp',
    evs: { spe: 252 },
  });
  assert(recoveredPokemon.evs.hp === 0 && recoveredPokemon.evs.spe === 252, 'Partial EVs were not normalized');
  assert(recoveredPokemon.ivs.spe === 31, 'Missing IVs were not restored');
  assert(Array.isArray(recoveredPokemon.moves), 'Missing moves were not restored');
  const recoveredTeam = normalizeTeamData({
    name: 'Legacy Team',
    pokemon: [recoveredPokemon],
  });
  assert(recoveredTeam.format.length > 0 && recoveredTeam.pokemon.length === 1, 'Legacy team was not normalized');
  console.log('✅ Legacy and imported teams are normalized for Analysis');

  // Test 9: AI tool registry (Ollama Cloud assistant) — no network involved, this
  // only checks that each tool handler is wired correctly to its underlying util.
  console.log('Testing AI tool registry...');
  const toolNames = TOOLS.map((t) => t.name);
  assert(new Set(toolNames).size === toolNames.length, 'Tool names must be unique');

  const schema = toOllamaToolSchema();
  assert(schema.length === TOOLS.length, 'Tool schema count must match registry');
  assert(
    schema.every((t) => t.type === 'function' && typeof t.function.name === 'string'),
    'Tool schema must be OpenAI-compatible function entries',
  );

  const toolCtx = { team: analysisTeam };

  const activeTeamResult = getToolByName('get_active_team').handler({}, toolCtx);
  assert(activeTeamResult.pokemon.length === 2, 'get_active_team must report both team members');
  assert(activeTeamResult.pokemon[0].species === 'Garchomp', 'get_active_team species mismatch');

  const analyzeResult = getToolByName('analyze_team').handler({}, toolCtx);
  assert(typeof analyzeResult.balanceScore === 'number', 'analyze_team must return a balance score');
  assert(
    analyzeResult.sharedWeaknesses.some((w) => w.type === 'Ice' && w.weakMembers.includes('Garchomp')),
    'analyze_team must surface the Ice weakness already verified above',
  );

  const validateResult = await getToolByName('validate_team').handler({}, toolCtx);
  assert(typeof validateResult.isValid === 'boolean', 'validate_team must return isValid');

  const evResult = getToolByName('explain_evs').handler({ species: 'Garchomp' }, toolCtx);
  assert(evResult.role, 'explain_evs must return a role for a team member');
  const evMissing = getToolByName('explain_evs').handler({ species: 'Pikachu' }, toolCtx);
  assert(evMissing.error, 'explain_evs must error for a species not on the team');

  const speedResult = getToolByName('calculate_speed').handler({ species: 'Garchomp' }, toolCtx);
  assert(
    typeof speedResult.speed === 'number' && speedResult.speed > 0,
    'calculate_speed must return a positive number for a team member',
  );
  const genericSpeedResult = getToolByName('calculate_speed').handler({ species: 'Gengar' }, { team: null });
  assert(
    typeof genericSpeedResult.speed === 'number' && genericSpeedResult.speed > 0,
    'calculate_speed must resolve a species not on any team',
  );

  const dmgToolResult = getToolByName('calculate_damage').handler(
    { attacker: 'Charizard', defender: 'Garchomp', move: 'Flamethrower' },
    toolCtx,
  );
  assert(
    typeof dmgToolResult.minPercent === 'number' && dmgToolResult.minPercent >= 0,
    'calculate_damage tool must return a damage percent',
  );
  const dmgUnknownMove = getToolByName('calculate_damage').handler(
    { attacker: 'Charizard', defender: 'Garchomp', move: 'Not A Real Move' },
    toolCtx,
  );
  assert(dmgUnknownMove.error, 'calculate_damage must error on an unknown move');

  // Regression: resolveCalcSubject originally looked up the dex before checking team
  // membership, so a nickname (which the dex has never heard of) always failed.
  const nicknameTeam = normalizeTeamData({
    name: 'Nickname Test Team',
    pokemon: [
      { species: 'Garchomp', nickname: 'Landy', moves: ['Earthquake'] },
      { species: 'Charizard', moves: ['Flamethrower'] },
    ],
  });
  const nicknameCtx = { team: nicknameTeam };
  const nicknameSpeedResult = getToolByName('calculate_speed').handler({ species: 'Landy' }, nicknameCtx);
  assert(
    typeof nicknameSpeedResult.speed === 'number' && nicknameSpeedResult.speed > 0,
    'calculate_speed must resolve a nickname to the matching team member',
  );
  const nicknameDamageResult = getToolByName('calculate_damage').handler(
    { attacker: 'Landy', defender: 'Charizard', move: 'Earthquake' },
    nicknameCtx,
  );
  assert(
    typeof nicknameDamageResult.minPercent === 'number' && !nicknameDamageResult.error,
    'calculate_damage must resolve a nickname to the matching team member',
  );

  // Regression: resolveCalcSubject/resolveSpeedSubject originally ignored megaActive
  // entirely, always calculating off the base form's stats and ability.
  const megaTeam = normalizeTeamData({
    name: 'Mega Test Team',
    pokemon: [
      { species: 'Aerodactyl', item: 'Aerodactylite', megaActive: true, moves: ['Rock Slide'] },
      { species: 'Chansey', moves: ['Seismic Toss'] },
    ],
  });
  const baseTeam = normalizeTeamData({
    name: 'Base Test Team',
    pokemon: [{ species: 'Aerodactyl', moves: ['Rock Slide'] }],
  });
  const megaSpeedResult = getToolByName('calculate_speed').handler({ species: 'Aerodactyl' }, { team: megaTeam });
  const baseSpeedResult = getToolByName('calculate_speed').handler({ species: 'Aerodactyl' }, { team: baseTeam });
  assert(
    megaSpeedResult.speed > baseSpeedResult.speed,
    `Mega Aerodactyl (150 base Speed) must be faster than base Aerodactyl (130 base Speed), got ${megaSpeedResult.speed} vs ${baseSpeedResult.speed}`,
  );
  const megaDamageResult = getToolByName('calculate_damage').handler(
    { attacker: 'Aerodactyl', defender: 'Chansey', move: 'Rock Slide' },
    { team: megaTeam },
  );
  assert(
    typeof megaDamageResult.minPercent === 'number' && !megaDamageResult.error,
    'calculate_damage must resolve an active Mega without erroring',
  );

  const lookupResult = getToolByName('lookup_pokemon').handler({ species: 'Garchomp' }, toolCtx);
  assert(lookupResult.types.includes('Dragon'), "lookup_pokemon must return Garchomp's types");

  const movesResult = await getToolByName('get_legal_moves').handler(
    { species: 'Garchomp', query: 'earthquake' },
    toolCtx,
  );
  assert(
    movesResult.moves.some((m) => m.name.toLowerCase() === 'earthquake'),
    'get_legal_moves must find Earthquake for Garchomp',
  );
  assert(typeof movesResult.totalMatches === 'number', 'get_legal_moves must report totalMatches');
  assert(typeof movesResult.truncated === 'boolean', 'get_legal_moves must report truncated');

  assert(TOOLS.length === 10, `Expected 10 tools (8 calculators + web_search + web_fetch), got ${TOOLS.length}`);

  console.log(`✅ AI tool registry verified: ${TOOLS.length} tools, schemas valid, calculators wired correctly`);

  // Test 9b: web_search / web_fetch — Ollama's hosted web API, reusing the chat API key.
  // Stubs global.fetch so this stays offline like every other check in this file.
  console.log('Testing web_search / web_fetch tools...');
  const originalFetch = globalThis.fetch;
  const fetchCalls = [];
  globalThis.fetch = async (url, init) => {
    fetchCalls.push({ url, headers: init.headers, body: JSON.parse(init.body) });
    if (url === 'https://ollama.com/api/web_search') {
      return {
        ok: true,
        json: async () => ({
          results: [
            { title: 'Regulation M-B ruling', url: 'https://example.com/reg-mb', content: 'x'.repeat(2000) },
          ],
        }),
      };
    }
    if (url === 'https://ollama.com/api/web_fetch') {
      return { ok: true, json: async () => ({ title: 'Example Page', content: 'y'.repeat(7000) }) };
    }
    throw new Error(`Unexpected fetch to ${url}`);
  };

  try {
    const noKeyResult = await getToolByName('web_search').handler({ query: 'test' }, { team: null });
    assert(noKeyResult.error, 'web_search must error without an API key');
    assert(fetchCalls.length === 0, 'web_search must not call fetch without an API key');

    const searchResult = await getToolByName('web_search').handler(
      { query: 'Champions Regulation M-B ruling' },
      { team: null, apiKey: 'test-key' },
    );
    assert(searchResult.results.length === 1, 'web_search must return the mocked result');
    assert(searchResult.results[0].url === 'https://example.com/reg-mb', 'web_search must pass through the result URL');
    assert(searchResult.results[0].content.length <= 1001, 'web_search must truncate long snippets');
    assert(fetchCalls[0].url === 'https://ollama.com/api/web_search', 'web_search must call the search endpoint');
    assert(fetchCalls[0].body.query === 'Champions Regulation M-B ruling', 'web_search must forward the query');
    assert(fetchCalls[0].body.max_results === 5, 'web_search must default max_results to 5');
    assert(
      fetchCalls[0].headers.Authorization === 'Bearer test-key',
      'web_search must send the API key as a Bearer token',
    );

    const fetchResult = await getToolByName('web_fetch').handler(
      { url: 'https://example.com/page' },
      { team: null, apiKey: 'test-key' },
    );
    assert(fetchResult.title === 'Example Page', 'web_fetch must return the mocked title');
    assert(fetchResult.truncated === true, 'web_fetch must flag truncation for long pages');
    assert(fetchResult.content.length <= 6001, 'web_fetch must truncate long page content');
    assert(
      fetchCalls[1].headers.Authorization === 'Bearer test-key',
      'web_fetch must send the API key as a Bearer token',
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
  console.log('✅ web_search / web_fetch call the Ollama Cloud web API correctly and truncate long content');

  // Test 10: Persisted-settings merge. Regression for a crash that would have hit
  // every existing install: zustand's persist middleware only runs `migrate` when the
  // persisted version differs from the configured one. Every existing user was
  // already at version 1, so without bumping to version 2 AND a custom `merge`,
  // `settings` would be replaced wholesale by the old persisted object (missing
  // aiEnabled/ollamaApiKey/ollamaModel) and the first `settings.ollamaApiKey.trim()`
  // call in Settings would throw on undefined. The same reasoning now applies to the
  // local llama.cpp backend fields (aiBackend/localModelPath/localModelName, added in
  // the version 2→3 bump): installs persisted at version 2 have no such keys, and
  // merge must backfill them exactly like it backfills the AI fields.
  console.log('Testing persisted-settings merge...');
  const currentState = useStore.getState();

  const oldPersistedState = {
    teams: [],
    folders: ['My Teams'],
    settings: { theme: 'dark', defaultFormat: 'champions-mb', hasCompletedOnboarding: true },
    customFormats: [],
  };
  const mergedForOldUser = mergeStoreState(oldPersistedState, currentState);
  assert(
    typeof mergedForOldUser.settings.ollamaApiKey === 'string',
    'merge must backfill ollamaApiKey for a pre-AI-feature settings object',
  );
  assert(
    typeof mergedForOldUser.settings.ollamaModel === 'string' && mergedForOldUser.settings.ollamaModel.length > 0,
    'merge must backfill ollamaModel for a pre-AI-feature settings object',
  );
  assert(
    mergedForOldUser.settings.aiBackend === 'ollamaCloud',
    'merge must backfill aiBackend to ollamaCloud for a settings object missing it',
  );
  assert(
    typeof mergedForOldUser.settings.localModelPath === 'string' && mergedForOldUser.settings.localModelPath === '',
    'merge must backfill localModelPath to empty string for a settings object missing it',
  );
  assert(
    typeof mergedForOldUser.settings.localModelName === 'string' && mergedForOldUser.settings.localModelName === '',
    'merge must backfill localModelName to empty string for a settings object missing it',
  );
  assert(
    mergedForOldUser.settings.hasCompletedOnboarding === true,
    "merge must preserve the old user's existing settings values, not just backfill new ones",
  );

  // Simulates a version-2-era persisted state: AI fields present, but the local
  // llama.cpp backend fields not yet introduced. Must behave identically to the
  // full-absence case above.
  const v2EraPersistedState = {
    ...oldPersistedState,
    settings: {
      theme: 'dark',
      defaultFormat: 'champions-mb',
      hasCompletedOnboarding: true,
      aiEnabled: false,
      ollamaApiKey: 'v2-key',
      ollamaModel: 'gemma4:cloud',
    },
  };
  const mergedForV2User = mergeStoreState(v2EraPersistedState, currentState);
  assert(
    mergedForV2User.settings.aiBackend === 'ollamaCloud',
    'merge must backfill aiBackend for a version-2-era persisted settings object',
  );
  assert(
    mergedForV2User.settings.localModelPath === '' && mergedForV2User.settings.localModelName === '',
    'merge must backfill localModelPath/localModelName for a version-2-era persisted settings object',
  );
  assert(
    mergedForV2User.settings.ollamaApiKey === 'v2-key',
    "merge must preserve the version-2-era user's existing ollamaApiKey",
  );

  // Simulates restoring a Full App Backup where ollamaApiKey was deliberately redacted.
  const redactedSettings = { ...currentState.settings, ollamaApiKey: 'should-be-overwritten' };
  delete redactedSettings.ollamaApiKey;
  delete redactedSettings.localModelPath;
  delete redactedSettings.localModelName;
  const mergedAfterRestore = mergeStoreState({ ...oldPersistedState, settings: redactedSettings }, currentState);
  assert(
    mergedAfterRestore.settings.ollamaApiKey === '',
    'merge must backfill a redacted ollamaApiKey rather than leaving it undefined',
  );
  assert(
    mergedAfterRestore.settings.localModelPath === '' && mergedAfterRestore.settings.localModelName === '',
    'merge must backfill redacted local model fields rather than leaving them undefined',
  );

  console.log('✅ Persisted-settings merge backfills missing AI/local-backend settings without crashing');

  // Test 11: lookup_pokemon must scope typing to the active format's generation —
  // Clefairy is Normal-type before Gen 6, Normal/Fairy from Gen 6 onward.
  console.log('Testing lookup_pokemon generation scoping...');
  const gen9Lookup = getToolByName('lookup_pokemon').handler(
    { species: 'Clefairy' },
    { team: { format: 'gen9ou' } },
  );
  assert(gen9Lookup.types.includes('Fairy'), 'lookup_pokemon must report Fairy typing for a Gen 9 team');
  const gen5Lookup = getToolByName('lookup_pokemon').handler(
    { species: 'Clefairy' },
    { team: { format: 'gen5ou' } },
  );
  assert(
    !gen5Lookup.types.includes('Fairy'),
    'lookup_pokemon must NOT report Fairy typing for a Gen 5 team (Fairy type did not exist yet)',
  );
  console.log('✅ lookup_pokemon resolves species data for the active generation');

  // Test 12: calculate_damage's defender Tera flag. Without it, a defender's real
  // Tera type must never apply (the earlier fix for the unconditional-Tera bug);
  // with it, the defender's own configured Tera type must actually be used.
  console.log('Testing calculate_damage defender Terastallization flag...');
  const teraTeam = normalizeTeamData({
    name: 'Defender Tera Test Team',
    pokemon: [
      { species: 'Pikachu', moves: ['Thunderbolt'] },
      { species: 'Chansey', teraType: 'Water', moves: ['Soft-Boiled'] },
    ],
  });
  const teraCtx = { team: teraTeam };
  const withoutDefenderTera = getToolByName('calculate_damage').handler(
    { attacker: 'Pikachu', defender: 'Chansey', move: 'Thunderbolt' },
    teraCtx,
  );
  const withDefenderTera = getToolByName('calculate_damage').handler(
    { attacker: 'Pikachu', defender: 'Chansey', move: 'Thunderbolt', isDefenderTerastallized: true },
    teraCtx,
  );
  assert(
    withoutDefenderTera.maxPercent !== withDefenderTera.maxPercent,
    'isDefenderTerastallized must change the outcome (Electric vs Normal-type Chansey is neutral, vs Water-Tera Chansey is super-effective)',
  );
  console.log('✅ calculate_damage only Terastallizes the defender when explicitly requested');

  // Test 13: on-device (localLlamaCpp) tool schema + system-prompt gating.
  // The local backend has no API key, so Ollama's hosted web tools must never be
  // advertised to the local model, and the system prompt must match — otherwise
  // the model would be told to call tools that can never run. Pure functions,
  // no hardware or network involved.
  console.log('Testing on-device tool schema + prompt gating...');
  const localSchema = toLocalToolSchema();
  const localNames = localSchema.map((t) => t.function.name);
  assert(
    localSchema.length === TOOLS.length - 2,
    `Local schema must advertise ${TOOLS.length - 2} tools (web tools excluded), got ${localSchema.length}`,
  );
  assert(!localNames.includes('web_search'), 'Local schema must not advertise web_search');
  assert(!localNames.includes('web_fetch'), 'Local schema must not advertise web_fetch');
  for (const name of [
    'get_active_team',
    'analyze_team',
    'validate_team',
    'explain_evs',
    'calculate_speed',
    'calculate_damage',
    'lookup_pokemon',
    'get_legal_moves',
  ]) {
    assert(localNames.includes(name), `Local schema must keep ${name}`);
  }
  assert(
    localSchema.every(
      (t) => t.type === 'function' && typeof t.function.name === 'string' && t.function.parameters,
    ),
    'Local schema entries must be OpenAI-compatible function entries',
  );
  for (const name of localNames) {
    assert(getToolByName(name), `Local schema advertises ${name}, but it is missing from the registry`);
  }

  const localPrompt = buildSystemPrompt({ includeWebTools: false });
  assert(
    !localPrompt.includes('web_search') && !localPrompt.includes('web_fetch'),
    'Local system prompt must not mention the web tools',
  );
  assert(SYSTEM_PROMPT.includes('web_search'), 'Ollama Cloud system prompt must keep the web tools guidance');
  assert(localPrompt.includes('Never calculate damage'), 'Local system prompt must keep the tools-first rule');

  // Importing the local chat client outside the native shell must not pull the
  // Capacitor bridge at module scope — the native module stays a dynamic import.
  assert(typeof localSendMessage === 'function', 'localLlamaCpp sendMessage must be importable outside the native shell');

  console.log(`✅ Local tool schema advertises ${localSchema.length} calculators (web tools excluded) and the prompt matches`);

  // Test 14: on-device native wiring consistency (static checks).
  // gradle assembleDebug (.github/workflows/android.yml) proves the native module
  // COMPILES; these checks prove the pieces are actually wired together —
  // cross-file name matches that a successful build does NOT enforce (a mismatched
  // Capacitor plugin name compiles fine and then fails silently at runtime).
  // Reads the real source files; no device, emulator, or Android SDK involved.
  console.log('Testing on-device native wiring consistency (static)...');
  const readRepoFile = (relPath) => readFileSync(new URL(relPath, import.meta.url), 'utf8');

  const mainActivity = readRepoFile('./android/app/src/main/java/com/whitedevil93/pocketforge/MainActivity.java');
  assert(
    mainActivity.includes('registerPlugin(LocalLlmPlugin.class)'),
    'MainActivity must register LocalLlmPlugin with the Capacitor bridge',
  );

  const pluginKt = readRepoFile('./android/app/src/main/java/com/whitedevil93/pocketforge/LocalLlmPlugin.kt');
  assert(
    pluginKt.includes('@CapacitorPlugin(name = "LocalLlm")'),
    'Kotlin plugin must declare the CapacitorPlugin name "LocalLlm"',
  );

  const localLlmTs = readRepoFile('./src/lib/native/localLlm.ts');
  assert(
    localLlmTs.includes("registerPlugin<LocalLlmPlugin>('LocalLlm')"),
    'TS bridge must register the plugin under the same "LocalLlm" name',
  );

  // Every method the TS bridge calls must exist on the Kotlin side, and vice versa.
  for (const method of ['ping', 'pickModelFile', 'chatOnce', 'startServer', 'stopServer', 'getServerStatus']) {
    assert(pluginKt.includes(`fun ${method}(`), `LocalLlmPlugin.kt must implement ${method}`);
    assert(localLlmTs.includes(`${method}(`), `localLlm.ts bridge must expose ${method}`);
  }
  // Event names must match across the bridge (Kotlin notifyListeners ↔ TS addListener).
  for (const event of ['modelImportProgress', 'chatOnceEvent', 'serverStatusChanged']) {
    assert(pluginKt.includes(`notifyListeners("${event}"`), `LocalLlmPlugin.kt must emit the "${event}" event`);
    assert(localLlmTs.includes(`'${event}'`), `localLlm.ts bridge must subscribe to the "${event}" event`);
  }

  // Native library name must match across System.loadLibrary and the CMake target.
  assert(pluginKt.includes('System.loadLibrary("pokekit-llm")'), 'Plugin must load the pokekit-llm native library');
  const cmake = readRepoFile('./android/app/src/main/cpp/CMakeLists.txt');
  assert(cmake.includes('add_library(pokekit-llm SHARED'), 'CMake must build the pokekit-llm shared library');

  // Foreground service + permissions the on-device server depends on.
  const manifest = readRepoFile('./android/app/src/main/AndroidManifest.xml');
  assert(manifest.includes('android:name=".LocalLlmService"'), 'Manifest must declare LocalLlmService');
  assert(
    manifest.includes('android:foregroundServiceType="specialUse"'),
    'LocalLlmService must be a specialUse foreground service',
  );
  assert(manifest.includes('FOREGROUND_SERVICE_SPECIAL_USE'), 'Manifest must request FOREGROUND_SERVICE_SPECIAL_USE');
  assert(manifest.includes('POST_NOTIFICATIONS'), 'Manifest must request POST_NOTIFICATIONS for the server notification');

  // Cleartext HTTP must stay permitted for the loopback server only.
  const netConfig = readRepoFile('./android/app/src/main/res/xml/network_security_config.xml');
  assert(
    netConfig.includes('127.0.0.1') && netConfig.includes('cleartextTrafficPermitted="true"'),
    'Cleartext must be permitted for the loopback llama-server',
  );

  // Only arm64-v8a is supported (Galaxy S25 Ultra).
  const appGradle = readRepoFile('./android/app/build.gradle');
  assert(appGradle.includes("abiFilters 'arm64-v8a'"), 'Gradle must restrict ABIs to arm64-v8a');

  console.log('✅ On-device native wiring is consistent (plugin name, methods, events, lib, service, ABI)');

  console.log('🎉 ALL INTEGRATION TESTS PASSED!');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
