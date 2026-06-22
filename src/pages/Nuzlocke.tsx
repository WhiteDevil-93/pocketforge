// ============================================================================
// PocketForge — Nuzlocke Tracker (All Games)
// ============================================================================

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Skull, Archive, Heart, ChevronLeft, ChevronDown, ChevronUp, Swords, MapPin, Crosshair, Dices, Star } from 'lucide-react';
import { useNuzlockeStore } from '../store/useNuzlockeStore';
import { NUZLOCKE_GAMES, getGameById } from '../data/nuzlockeRoutes';
import PokemonSprite from '../components/PokemonSprite';
import TypeBadge from '../components/TypeBadge';
import { getEffectiveness } from '../data/typesData';
import type { NuzlockeEncounter, TeraRaidDen } from '../store/useNuzlockeStore';

// ---- Lazy-loaded encounter data ----
let encounterCache: Record<string, string[]> | null = null;
async function loadEncounters(): Promise<Record<string, string[]>> {
  if (encounterCache) return encounterCache;
  const base = import.meta.env.BASE_URL || '/';
  const res = await fetch(`${base}data/routeEncounters.json`);
  encounterCache = await res.json();
  return encounterCache!;
}
function getEncountersForRoute(routeId: string): string[] {
  return encounterCache?.[routeId] || [];
}

// ---- Starter Pokemon by game prefix ----
const STARTER_POKEMON: Record<string, string[]> = {
  re: ['Bulbasaur', 'Charmander', 'Squirtle'],
  bu: ['Bulbasaur', 'Charmander', 'Squirtle'],
  ye: ['Bulbasaur', 'Charmander', 'Squirtle', 'Pikachu'],
  fr: ['Bulbasaur', 'Charmander', 'Squirtle'],
  lg: ['Bulbasaur', 'Charmander', 'Squirtle'],
  go: ['Chikorita', 'Cyndaquil', 'Totodile'],
  si: ['Chikorita', 'Cyndaquil', 'Totodile'],
  cr: ['Chikorita', 'Cyndaquil', 'Totodile'],
  hg: ['Chikorita', 'Cyndaquil', 'Totodile'],
  ss: ['Chikorita', 'Cyndaquil', 'Totodile'],
  ru: ['Treecko', 'Torchic', 'Mudkip'],
  sa: ['Treecko', 'Torchic', 'Mudkip'],
  em: ['Treecko', 'Torchic', 'Mudkip'],
  or: ['Treecko', 'Torchic', 'Mudkip'],
  as: ['Treecko', 'Torchic', 'Mudkip'],
  di: ['Turtwig', 'Chimchar', 'Piplup'],
  pe: ['Turtwig', 'Chimchar', 'Piplup'],
  pl: ['Turtwig', 'Chimchar', 'Piplup'],
  bd: ['Turtwig', 'Chimchar', 'Piplup'],
  sp: ['Turtwig', 'Chimchar', 'Piplup'],
  bl: ['Snivy', 'Tepig', 'Oshawott'],
  wh: ['Snivy', 'Tepig', 'Oshawott'],
  b2: ['Snivy', 'Tepig', 'Oshawott'],
  w2: ['Snivy', 'Tepig', 'Oshawott'],
  px: ['Chespin', 'Fennekin', 'Froakie'],
  py: ['Chespin', 'Fennekin', 'Froakie'],
  mo: ['Rowlet', 'Litten', 'Popplio'],
  su: ['Rowlet', 'Litten', 'Popplio'],
  us: ['Rowlet', 'Litten', 'Popplio'],
  um: ['Rowlet', 'Litten', 'Popplio'],
  sw: ['Grookey', 'Scorbunny', 'Sobble'],
  sh: ['Grookey', 'Scorbunny', 'Sobble'],
  sv: ['Sprigatito', 'Fuecoco', 'Quaxly'],
  vi: ['Sprigatito', 'Fuecoco', 'Quaxly'],
  rr: ['Bulbasaur', 'Charmander', 'Squirtle'],
  rp: ['Turtwig', 'Chimchar', 'Piplup'],
  stss: ['Chikorita', 'Cyndaquil', 'Totodile'],
  ie: ['Treecko', 'Torchic', 'Mudkip'],
};
function getStartersForRoute(routeId: string): string[] {
  const prefix = routeId.split('_')[0];
  return routeId.endsWith('_starter') ? (STARTER_POKEMON[prefix] || []) : [];
}

// ---- Natures ----
const NATURES = ['Adamant', 'Bashful', 'Bold', 'Brave', 'Calm', 'Careful', 'Docile', 'Gentle', 'Hardy', 'Hasty', 'Impish', 'Jolly', 'Lax', 'Lonely', 'Mild', 'Modest', 'Naive', 'Naughty', 'Quiet', 'Quirky', 'Rash', 'Relaxed', 'Sassy', 'Serious', 'Timid'];

// ---- Stat Card for Run List ----
function RunCard({ run, isActive, onSelect, onDelete }: { run: any; isActive: boolean; onSelect: () => void; onDelete: () => void }) {
  const game = getGameById(run.gameId);
  const alive = run.encounters.filter((e: any) => e.status === 'caught').length;
  const dead = run.encounters.filter((e: any) => e.status === 'dead').length;
  return (
    <motion.button whileTap={{ scale: 0.98 }} onClick={onSelect}
      className={`w-full text-left p-4 rounded-2xl border transition-colors ${isActive ? 'bg-accent-primary/10 border-accent-primary/30' : 'bg-bg-secondary border-border-subtle'}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-body font-semibold text-text-primary truncate">{run.name}</p>
          <p className="text-caption text-text-secondary">{game?.name}</p>
          <div className="flex gap-3 mt-1">
            <span className="text-caption flex items-center gap-1" style={{ color: '#22C55E' }}><Heart size={12} /> {alive}</span>
            <span className="text-caption flex items-center gap-1" style={{ color: '#EF4444' }}><Skull size={12} /> {dead}</span>
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="w-9 h-9 flex items-center justify-center rounded-lg touch-target shrink-0">
          <Trash2 size={16} className="text-text-tertiary" />
        </button>
      </div>
    </motion.button>
  );
}

// ---- Route Row ----
function RouteRow({ route, encounter, teraRaid, onUpdate, onTeraRoll, onTeraUpdate }: {
  route: any;
  encounter?: any;
  teraRaid?: TeraRaidDen;
  onUpdate: (s: string, n: string, st: string, nat: string, ev: string) => void;
  onTeraRoll: () => void;
  onTeraUpdate: (species: string, status: TeraRaidDen['status']) => void;
}) {
  const [open, setOpen] = useState(false);
  const [species, setSpecies] = useState(encounter?.species || '');
  const [nickname, setNickname] = useState(encounter?.nickname || '');
  const [status, setStatus] = useState(encounter?.status || 'caught');
  const [nature, setNature] = useState(encounter?.nature || '');
  const [evolvedSpecies, setEvolvedSpecies] = useState(encounter?.evolvedSpecies || '');
  const [teraSpecies, setTeraSpecies] = useState(teraRaid?.species || '');
  const [teraStatus, setTeraStatus] = useState<TeraRaidDen['status']>(teraRaid?.status || 'caught');
  const isPaldea = route.id.startsWith('sv_') || route.id.startsWith('vi_');
  const isStarter = route.id.endsWith('_starter');
  const sc: Record<string, string> = { caught: '#22C55E', dead: '#EF4444', boxed: '#3B82F6', missed: '#64748B' };
  const routeEncounters: string[] = getEncountersForRoute(route.id);
  const starterPokemon: string[] = getStartersForRoute(route.id);
  const displaySpecies = evolvedSpecies || species;

  return (
    <div className={`rounded-xl border overflow-hidden ${isStarter ? 'bg-amber-500/5 border-amber-500/20' : 'bg-bg-secondary border-border-subtle'}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-3 text-left">
        <div className="flex items-center gap-3 min-w-0">
          {isStarter ? <Star size={16} className="text-amber-500 shrink-0" /> : <MapPin size={16} className="text-text-tertiary shrink-0" />}
          <span className={`text-body truncate ${isStarter ? 'font-bold text-amber-600' : 'text-text-primary'}`}>{route.name}</span>
          {encounter && <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: sc[encounter.status] || '#64748B' }} />}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {encounter?.species && (
            <div className="flex items-center gap-1.5">
              {encounter?.evolvedSpecies && <span className="text-caption text-text-tertiary italic">{encounter.species} &rarr;</span>}
              <PokemonSprite name={displaySpecies} size={28} />
              {encounter?.nature && <span className="text-caption px-1.5 py-0.5 rounded bg-bg-tertiary text-text-secondary">{encounter.nature}</span>}
            </div>
          )}
          {open ? <ChevronUp size={16} className="text-text-tertiary" /> : <ChevronDown size={16} className="text-text-tertiary" />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-3 pb-3 space-y-2">
              {(routeEncounters.length > 0 || starterPokemon.length > 0) && (
                <div>
                  <p className={`text-caption mb-1.5 ${isStarter ? 'text-amber-500 font-medium' : 'text-text-tertiary'}`}>{isStarter ? 'Choose Your Starter' : 'Available Encounters'}</p>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {(starterPokemon.length > 0 ? starterPokemon : routeEncounters).map((sp) => (
                      <button key={sp} onClick={() => setSpecies(sp)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${species === sp ? (isStarter ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30' : 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30') : 'bg-bg-tertiary text-text-secondary border border-border-subtle'}`}>
                        <PokemonSprite name={sp} size={20} />
                        <span className="truncate max-w-[80px]">{sp}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tera Raid Den — Paldea only */}
              {isPaldea && routeEncounters.length > 0 && (
                <div className="border-t border-border-subtle pt-2 mt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-caption font-medium" style={{ color: '#B91CFC' }}>Tera Raid Den</p>
                    {teraRaid && <span className="text-caption text-text-tertiary">{new Date(teraRaid.rolledAt).toLocaleDateString()}</span>}
                  </div>

                  {!teraRaid ? (
                    <button onClick={onTeraRoll}
                      className="w-full h-10 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                      style={{ borderColor: '#B91CFC33', color: '#B91CFC', backgroundColor: '#B91CFC08' }}>
                      <Dices size={16} /> Roll Raid Den
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input type="text" value={teraSpecies} onChange={(e) => setTeraSpecies(e.target.value)} placeholder="Raid Pokemon"
                          className="flex-1 h-10 px-3 rounded-lg bg-bg-tertiary border border-border-subtle text-text-primary text-sm placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none" />
                        {teraSpecies && <PokemonSprite name={teraSpecies} size={32} />}
                      </div>
                      <div className="flex gap-2">
                        {(['caught', 'fled', 'failed'] as const).map((s) => (
                          <button key={s} onClick={() => { setTeraStatus(s); onTeraUpdate(teraSpecies, s); }}
                            className={`flex-1 h-8 rounded-lg text-xs font-medium capitalize transition-colors ${teraStatus === s ? 'text-white' : 'bg-bg-tertiary text-text-secondary border border-border-subtle'}`}
                            style={teraStatus === s ? { backgroundColor: s === 'caught' ? '#22C55E' : s === 'fled' ? '#F59E0B' : '#EF4444' } : {}}>{s}</button>
                        ))}
                      </div>
                      <button onClick={() => onTeraUpdate(teraSpecies, teraStatus)} className="w-full h-9 rounded-lg text-white text-sm font-medium active:scale-[0.98] transition-transform" style={{ backgroundColor: '#B91CFC' }}>Save Raid</button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <input type="text" value={species} onChange={(e) => setSpecies(e.target.value)} placeholder="Species" className="flex-1 h-10 px-3 rounded-lg bg-bg-tertiary border border-border-subtle text-text-primary text-sm placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none" />
                <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Nickname" className="flex-1 h-10 px-3 rounded-lg bg-bg-tertiary border border-border-subtle text-text-primary text-sm placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none" />
              </div>
              <div className="flex gap-2">
                {(['caught', 'dead', 'boxed', 'missed'] as const).map((s) => (
                  <button key={s} onClick={() => setStatus(s)}
                    className={`flex-1 h-8 rounded-lg text-xs font-medium capitalize transition-colors ${status === s ? 'text-white' : 'bg-bg-tertiary text-text-secondary border border-border-subtle'}`}
                    style={status === s ? { backgroundColor: sc[s] } : {}}>{s}</button>
                ))}
              </div>

              {/* Nature */}
              <select value={nature} onChange={(e) => setNature(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-bg-tertiary border border-border-subtle text-text-primary text-sm focus:border-accent-primary focus:outline-none">
                <option value="">Nature (optional)</option>
                {NATURES.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>

              {/* Evolution */}
              {species && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 h-10 rounded-lg bg-bg-tertiary border border-border-subtle">
                    <span className="text-caption text-text-tertiary">Evolved:</span>
                    <input type="text" value={evolvedSpecies} onChange={(e) => setEvolvedSpecies(e.target.value)} placeholder={species}
                      className="flex-1 bg-transparent text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none" />
                  </div>
                  {evolvedSpecies && <PokemonSprite name={evolvedSpecies} size={32} />}
                </div>
              )}

              <button onClick={() => onUpdate(species, nickname, status, nature, evolvedSpecies)} className="w-full h-10 rounded-lg bg-accent-primary text-white text-sm font-medium active:scale-[0.98] transition-transform">Save</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- Boss Card ----
function BossCard({ boss, teamTypes }: { boss: any; teamTypes: string[] }) {
  const [open, setOpen] = useState(false);
  const eff = useMemo(() => { if (!teamTypes.length) return null; return getEffectiveness(boss.type.toLowerCase(), teamTypes); }, [boss.type, teamTypes]);
  return (
    <div className="bg-bg-secondary rounded-xl border border-border-subtle overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-3 text-left">
        <div className="flex items-center gap-3 min-w-0">
          <Swords size={16} className="text-text-tertiary shrink-0" />
          <div className="min-w-0">
            <p className="text-body font-medium text-text-primary truncate">{boss.name}</p>
            <p className="text-caption text-text-secondary">{boss.location}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <TypeBadge type={boss.type.toLowerCase()} />
          <span className="text-caption font-bold" style={{ color: '#EAB308' }}>Lv.{boss.levelCap}</span>
          {open ? <ChevronUp size={16} className="text-text-tertiary" /> : <ChevronDown size={16} className="text-text-tertiary" />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-3 pb-3 space-y-2">
              {eff !== null && (
                <div className={`p-2 rounded-lg text-xs ${eff > 1 ? 'bg-danger/10 text-danger' : eff < 1 ? 'bg-success/10 text-success' : 'bg-bg-tertiary text-text-secondary'}`}>
                  {eff > 1 ? `⚠️ Your team is weak to ${boss.type}!` : eff < 1 ? `✅ Your team resists ${boss.type}` : `Neutral matchup vs ${boss.type}`}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {boss.team.map((p: any, i: number) => (
                  <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-bg-tertiary">
                    <PokemonSprite name={p.species} size={24} />
                    <span className="text-xs text-text-secondary">{p.species}</span>
                    <span className="text-xs text-text-tertiary">Lv.{p.level}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- Main Page ----
export default function Nuzlocke() {
  const runs = useNuzlockeStore((s) => s.runs);
  const currentRunId = useNuzlockeStore((s) => s.currentRunId);
  const createRun = useNuzlockeStore((s) => s.createRun);
  const deleteRun = useNuzlockeStore((s) => s.deleteRun);
  const setCurrentRun = useNuzlockeStore((s) => s.setCurrentRun);
  const addEncounter = useNuzlockeStore((s) => s.addEncounter);
  const updateEncounter = useNuzlockeStore((s) => s.updateEncounter);
  const removeEncounter = useNuzlockeStore((s) => s.removeEncounter);
  const addTeraRaid = useNuzlockeStore((s) => s.addTeraRaid);
  const updateTeraRaid = useNuzlockeStore((s) => s.updateTeraRaid);

  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [selGame, setSelGame] = useState('scarlet');
  const [tab, setTab] = useState<'routes' | 'bosses'>('routes');
  const [, setEncLoaded] = useState(false);
  useEffect(() => { loadEncounters().then(() => setEncLoaded(true)); }, []);

  const currentRun = runs.find((r) => r.id === currentRunId);
  const game = currentRun ? getGameById(currentRun.gameId) : null;
  const teamTypes = useMemo(() => currentRun ? currentRun.encounters.filter((e) => e.status === 'caught' && e.species).map((e) => e.evolvedSpecies || e.species) : [], [currentRun]);

  const handleUpdate = (routeId: string, sp: string, nick: string, st: string, nat: string, ev: string) => {
    if (!currentRunId) return;
    const status = st as NuzlockeEncounter['status'];
    if (!sp.trim()) { removeEncounter(currentRunId, routeId); return; }
    const ex = currentRun?.encounters.find((e) => e.routeId === routeId);
    const updates: Partial<NuzlockeEncounter> = { species: sp, nickname: nick, status, nature: nat || undefined, evolvedSpecies: ev || undefined };
    if (ex) updateEncounter(currentRunId, routeId, updates);
    else addEncounter(currentRunId, { routeId, species: sp, nickname: nick, status, nature: nat || undefined, evolvedSpecies: ev || undefined });
  };

  const handleTeraRoll = (routeId: string) => {
    if (!currentRunId) return;
    const encounters = getEncountersForRoute(routeId);
    if (encounters.length === 0) return;
    const randomSpecies = encounters[Math.floor(Math.random() * encounters.length)];
    addTeraRaid(currentRunId, { routeId, species: randomSpecies, status: 'caught', rolledAt: new Date().toISOString() });
  };

  const handleTeraUpdate = (routeId: string, species: string, status: TeraRaidDen['status']) => {
    if (!currentRunId) return;
    const ex = currentRun?.teraRaids.find((t) => t.routeId === routeId);
    if (ex) updateTeraRaid(currentRunId, routeId, { species, status });
    else addTeraRaid(currentRunId, { routeId, species, status, rolledAt: new Date().toISOString() });
  };

  // ---- Run Selection View ----
  if (!currentRun) {
    return (
      <div className="min-h-full flex flex-col">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div>
            <h1 className="text-headline font-bold text-text-primary">Nuzlocke</h1>
            <p className="text-caption text-text-secondary">Track your challenge runs</p>
          </div>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent-primary text-white text-sm font-medium active:scale-95 transition-transform">
            <Plus size={16} /> New Run
          </button>
        </div>
        <div className="flex-1 px-5 pb-24">
          {runs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Crosshair size={64} className="text-text-tertiary mb-4" />
              <p className="text-title font-semibold text-text-primary mb-2">No Nuzlocke Runs</p>
              <p className="text-body text-text-secondary mb-4 max-w-xs">Start a new Nuzlocke challenge. Track encounters across 10 games with boss previews and type matchups.</p>
              <button onClick={() => setShowNew(true)} className="px-4 py-2 rounded-lg bg-accent-primary text-white font-medium">+ Start New Run</button>
            </div>
          ) : (
            <div className="space-y-3">
              {runs.map((r) => <RunCard key={r.id} run={r} isActive={r.id === currentRunId} onSelect={() => setCurrentRun(r.id)} onDelete={() => deleteRun(r.id)} />)}
            </div>
          )}
        </div>
        {/* New Run Modal */}
        <AnimatePresence>
          {showNew && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50" onClick={() => setShowNew(false)}>
              <motion.div initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }} className="bg-bg-secondary rounded-t-3xl p-6 pb-24 space-y-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="w-10 h-1 rounded-full bg-text-tertiary/30 mx-auto" />
                <h2 className="text-headline font-semibold text-text-primary text-center">New Nuzlocke Run</h2>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Run name" className="w-full h-12 px-4 rounded-xl bg-bg-tertiary border border-border-subtle text-text-primary placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none" />
                <div className="space-y-1.5">
                  <label className="text-caption font-medium text-text-secondary">Select Game</label>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pb-2">
                    {NUZLOCKE_GAMES.map((g) => (
                      <button key={g.id} onClick={() => setSelGame(g.id)} className={`h-10 px-3 rounded-lg text-sm font-medium transition-colors text-left ${selGame === g.id ? 'bg-accent-primary text-white' : 'bg-bg-tertiary text-text-secondary border border-border-subtle'}`}>
                        {g.name}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => { if (newName.trim()) { createRun(newName, selGame); setShowNew(false); setNewName(''); } }} disabled={!newName.trim()} className="w-full h-12 rounded-xl bg-accent-primary text-white font-medium disabled:opacity-50 active:scale-[0.98] transition-transform">Start Run</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ---- Active Run View ----
  const alive = currentRun.encounters.filter((e) => e.status === 'caught').length;
  const dead = currentRun.encounters.filter((e) => e.status === 'dead').length;
  const boxed = currentRun.encounters.filter((e) => e.status === 'boxed').length;

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentRun(null)} className="text-text-secondary"><ChevronLeft size={20} /></button>
              <h1 className="text-headline font-bold text-text-primary truncate">{currentRun.name}</h1>
            </div>
            <p className="text-caption text-text-secondary ml-7">{game?.name}</p>
          </div>
        </div>
        <div className="flex gap-4 mt-2 ml-7">
          <span className="text-caption flex items-center gap-1" style={{ color: '#22C55E' }}><Heart size={14} /> {alive}</span>
          <span className="text-caption flex items-center gap-1" style={{ color: '#EF4444' }}><Skull size={14} /> {dead}</span>
          <span className="text-caption flex items-center gap-1" style={{ color: '#3B82F6' }}><Archive size={14} /> {boxed}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-5 gap-2 mb-3">
        <button onClick={() => setTab('routes')} className={`flex-1 h-10 rounded-lg text-sm font-medium transition-colors ${tab === 'routes' ? 'bg-accent-primary text-white' : 'bg-bg-secondary text-text-secondary border border-border-subtle'}`}><MapPin size={14} className="inline mr-1" /> Routes</button>
        <button onClick={() => setTab('bosses')} className={`flex-1 h-10 rounded-lg text-sm font-medium transition-colors ${tab === 'bosses' ? 'bg-accent-primary text-white' : 'bg-bg-secondary text-text-secondary border border-border-subtle'}`}><Swords size={14} className="inline mr-1" /> Bosses</button>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-24 space-y-2">
        <AnimatePresence mode="wait">
          {tab === 'routes' ? (
            <motion.div key="routes" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-2">
              {game?.routes.map((r) => {
                const enc = currentRun.encounters.find((e) => e.routeId === r.id);
                const teraRaid = currentRun.teraRaids.find((t) => t.routeId === r.id);
                return <RouteRow key={r.id} route={r} encounter={enc} teraRaid={teraRaid} onUpdate={(sp, nick, st, nat, ev) => handleUpdate(r.id, sp, nick, st, nat, ev)} onTeraRoll={() => handleTeraRoll(r.id)} onTeraUpdate={(sp, st) => handleTeraUpdate(r.id, sp, st)} />;
              })}
            </motion.div>
          ) : (
            <motion.div key="bosses" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-2">
              {game?.bosses.map((b) => <BossCard key={b.id} boss={b} teamTypes={teamTypes} />)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
