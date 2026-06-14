import { importTeamFromPSFormat, exportTeamToPSFormat } from './src/utils/psFormat.js';
import { getMovepoolForSpecies } from './src/utils/movepoolQuery.js';
import { calculateSpeed, rankTeamBySpeed } from './src/utils/speedCalculator.js';
import { calculateDamage } from './src/utils/damageCalc.js';

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

  console.log('🎉 ALL INTEGRATION TESTS PASSED!');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
