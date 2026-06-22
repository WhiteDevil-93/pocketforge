// ============================================================================
// PocketForge — Nuzlocke Tracker (All Games)
// ============================================================================

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Skull, Archive, Heart, ChevronLeft, ChevronDown, ChevronUp, Swords, MapPin, Crosshair, Dices, Star, Search, Zap, Target, ArrowRight } from 'lucide-react';
import { useNuzlockeStore } from '../store/useNuzlockeStore';
import { NUZLOCKE_GAMES, getGameById } from '../data/nuzlockeRoutes';
import PokemonSprite from '../components/PokemonSprite';
import TypeBadge from '../components/TypeBadge';
import { getEffectiveness } from '../data/typesData';
import { getAllPokemonNames, getPokemonByName } from '../data/pokemonData';
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

// ---- All Pokemon names for autocomplete ----
const ALL_POKEMON_NAMES = getAllPokemonNames();

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

// ---- Boss category detection ----
function getBossCategory(boss: any): 'gym' | 'elite4' | 'champion' | 'rival' | 'evil' | 'titan' | 'other' {
  const name = (boss.name || '').toLowerCase();
  const loc = (boss.location || '').toLowerCase();
  const id = (boss.id || '').toLowerCase();
  if (name.includes('titan') || id.includes('titan')) return 'titan';
  if (loc.includes('pokemon league') || id.includes('e4') || id.includes('elite')) return 'elite4';
  if (name.includes('champion') || loc.includes('champion')) return 'champion';
  if (id.includes('nemona') || id.includes('rival') || id.includes('arven') || id.includes('penny') || id.includes('clavell') || name.includes('rival')) return 'rival';
  if (id.includes('giacomo') || id.includes('mela') || id.includes('atticus') || id.includes('ortega') || id.includes('eri') || name.includes('giovanni') || name.includes('archie') || name.includes('maxie') || name.includes('cyrus') || name.includes('ghetsis') || name.includes('lysandre') || name.includes('lusamine') || name.includes('rose') || name.includes('team') || id.includes('rocket') || id.includes('galactic') || id.includes('plasma') || id.includes('flare') || id.includes('skull') || id.includes('yell') || id.includes('star')) return 'evil';
  if (loc.includes('gym') || name.includes('gym')) return 'gym';
  return 'other';
}

// ---- Pokemon Autocomplete Input ----
function PokemonAutocomplete({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    function handler(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return ALL_POKEMON_NAMES.filter((n) => n.toLowerCase().startsWith(q) || n.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  return (
    <div ref={ref} className="relative flex-1">
      <input
        type="text" value={query} placeholder={placeholder}
        onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        className="w-full h-10 px-3 rounded-lg bg-bg-tertiary border border-border-subtle text-text-primary text-sm placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none"
      />
      {open && matches.length > 0 && (
        <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-bg-secondary rounded-lg border border-border-subtle shadow-lg max-h-48 overflow-y-auto">
          {matches.map((m) => (
            <button key={m} onClick={() => { setQuery(m); onChange(m); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-text-primary hover:bg-bg-tertiary transition-colors">
              <PokemonSprite name={m} size={20} /> {m}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
                        <PokemonAutocomplete value={teraSpecies} onChange={setTeraSpecies} placeholder="Raid Pokemon" />
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
                <PokemonAutocomplete value={species} onChange={setSpecies} placeholder="Species" />
                <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Nickname" className="flex-1 h-10 px-3 rounded-lg bg-bg-tertiary border border-border-subtle text-text-primary text-sm placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none" />
              </div>
              <div className="flex gap-2">
                {(['caught', 'dead', 'boxed', 'missed'] as const).map((s) => (
                  <button key={s} onClick={() => setStatus(s)}
                    className={`flex-1 h-8 rounded-lg text-xs font-medium capitalize transition-colors ${status === s ? 'text-white' : 'bg-bg-tertiary text-text-secondary border border-border-subtle'}`}
                    style={status === s ? { backgroundColor: sc[s] } : {}}>{s}</button>
                ))}
              </div>

              <select value={nature} onChange={(e) => setNature(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-bg-tertiary border border-border-subtle text-text-primary text-sm focus:border-accent-primary focus:outline-none">
                <option value="">Nature (optional)</option>
                {NATURES.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>

              {species && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 h-10 rounded-lg bg-bg-tertiary border border-border-subtle">
                    <span className="text-caption text-text-tertiary">Evolved:</span>
                    <PokemonAutocomplete value={evolvedSpecies} onChange={setEvolvedSpecies} placeholder={species} />
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

// ---- VS Comparison Panel ----
function VSComparison({ boss, teamEncounters, onClose }: { boss: any; teamEncounters: NuzlockeEncounter[]; onClose: () => void }) {
  const aliveTeam = teamEncounters.filter((e) => e.status === 'caught');
  return (
    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed inset-0 z-[60] bg-black/50 flex flex-col justify-end" onClick={onClose}>
      <div className="bg-bg-secondary rounded-t-3xl max-h-[80vh] overflow-y-auto p-5 pb-28" onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-1 rounded-full bg-text-tertiary/30 mx-auto mb-4" />
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="text-center">
            <p className="text-caption text-text-secondary">YOUR TEAM</p>
            <p className="text-title font-bold text-accent-primary">{aliveTeam.length}</p>
          </div>
          <div className="px-3 py-1 rounded-lg bg-danger/10">
            <span className="text-headline font-black text-danger">VS</span>
          </div>
          <div className="text-center">
            <p className="text-caption text-text-secondary">{boss.name.toUpperCase()}</p>
            <TypeBadge type={boss.type.toLowerCase()} />
          </div>
        </div>

        <div className="mb-4">
          <p className="text-caption text-text-secondary mb-2">Boss Team (Lv.{boss.levelCap})</p>
          <div className="grid grid-cols-3 gap-2">
            {boss.team.map((p: any, i: number) => {
              const entry = getPokemonByName(p.species);
              return (
                <div key={i} className="bg-bg-tertiary rounded-xl p-2 flex flex-col items-center gap-1 border border-border-subtle">
                  <PokemonSprite name={p.species} size={48} />
                  <span className="text-xs font-medium text-text-primary text-center">{p.species}</span>
                  <span className="text-caption text-text-tertiary">Lv.{p.level}</span>
                  {entry?.types && (
                    <div className="flex gap-1">
                      {entry.types.map((t: string) => <TypeBadge key={t} type={t} />)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-caption text-text-secondary mb-2">Your Team Matchups</p>
          <div className="space-y-2">
            {aliveTeam.map((e, i) => {
              const entry = getPokemonByName(e.evolvedSpecies || e.species);
              const eff = entry?.types ? getEffectiveness(boss.type.toLowerCase(), entry.types) : null;
              return (
                <div key={i} className="flex items-center gap-3 bg-bg-tertiary rounded-xl p-2 border border-border-subtle">
                  <PokemonSprite name={e.evolvedSpecies || e.species} size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{e.nickname || (e.evolvedSpecies || e.species)}</p>
                    {entry?.types && <div className="flex gap-1">{entry.types.map((t: string) => <TypeBadge key={t} type={t} />)}</div>}
                  </div>
                  {eff !== null && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${eff > 1 ? 'bg-danger/10 text-danger' : eff < 1 ? 'bg-success/10 text-success' : 'bg-bg-secondary text-text-secondary'}`}>
                      {eff > 1 ? 'WEAK' : eff < 1 ? 'RESIST' : 'NEUTRAL'}
                    </span>
                  )}
                </div>
              );
            })}
            {aliveTeam.length === 0 && <p className="text-sm text-text-tertiary text-center py-4">No caught Pokemon yet</p>}
          </div>
        </div>

        <button onClick={onClose} className="w-full h-12 rounded-xl bg-accent-primary text-white font-medium mt-4">Close</button>
      </div>
    </motion.div>
  );
}

// ---- Boss Card ----
function BossCard({ boss, teamTypes, teamEncounters, onVS }: { boss: any; teamTypes: string[]; teamEncounters: NuzlockeEncounter[]; onVS: (b: any) => void }) {
  const [open, setOpen] = useState(false);
  const eff = useMemo(() => { if (!teamTypes.length) return null; return getEffectiveness(boss.type.toLowerCase(), teamTypes); }, [boss.type, teamTypes]);
  const category = getBossCategory(boss);
  const catColors: Record<string, string> = { gym: '#F59E0B', elite4: '#8B5CF6', champion: '#EAB308', rival: '#3B82F6', evil: '#EF4444', titan: '#10B981', other: '#64748B' };
  const catLabels: Record<string, string> = { gym: 'GYM', elite4: 'E4', champion: 'CHAMP', rival: 'RIVAL', evil: 'EVIL', titan: 'TITAN', other: 'BOSS' };

  return (
    <div className="bg-bg-secondary rounded-xl border border-border-subtle overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-3 text-left">
        <div className="flex items-center gap-3 min-w-0">
          <Swords size={16} className="text-text-tertiary shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-body font-medium text-text-primary truncate">{boss.name}</p>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: catColors[category] + '20', color: catColors[category] }}>{catLabels[category]}</span>
            </div>
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
              <button onClick={() => onVS(boss)} className="w-full h-9 rounded-lg text-sm font-medium text-danger bg-danger/10 active:scale-[0.98] transition-transform">
                <Zap size={14} className="inline mr-1" /> VS Comparison
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- Pokemon Card for Box/Graveyard ----
function PokemonCard({ encounter }: { encounter: NuzlockeEncounter }) {
  const game = useNuzlockeStore((s) => s.runs.find((r) => r.id === s.currentRunId));
  const route = game ? getGameById(game.gameId)?.routes.find((r) => r.id === encounter.routeId) : null;
  const display = encounter.evolvedSpecies || encounter.species;
  return (
    <div className="bg-bg-secondary rounded-xl border border-border-subtle p-3 flex items-center gap-3">
      <PokemonSprite name={display} size={48} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">{encounter.nickname || display}</p>
        {encounter.nickname && encounter.nickname !== display && <p className="text-caption text-text-secondary">{display}</p>}
        {encounter.nature && <span className="text-caption px-1.5 py-0.5 rounded bg-bg-tertiary text-text-secondary">{encounter.nature}</span>}
        {route && <p className="text-caption text-text-tertiary mt-0.5">{route.name}</p>}
      </div>
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
  const [tab, setTab] = useState<'routes' | 'bosses' | 'box' | 'graveyard' | 'upcoming'>('routes');
  const [, setEncLoaded] = useState(false);
  useEffect(() => { loadEncounters().then(() => setEncLoaded(true)); }, []);

  // Route filters
  const [routeSearch, setRouteSearch] = useState('');
  const [routeFilter, setRouteFilter] = useState<'all' | 'upcoming' | 'completed' | 'missed'>('all');

  // Boss filters
  const [bossFilter, setBossFilter] = useState<string>('all');
  const [vsBoss, setVsBoss] = useState<any>(null);

  // Custom locations
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');

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

  const addCustomLocation = () => {
    if (!currentRunId || !customName.trim() || !game) return;
    const prefix = game.routes[0]?.id.split('_')[0] || 'custom';
    const newId = `${prefix}_custom_${Date.now()}`;
    const newRoute = { id: newId, name: customName.trim(), order: game.routes.length + 1 };
    game.routes.push(newRoute);
    setCustomName('');
    setShowCustom(false);
  };

  // Filtered routes
  const filteredRoutes = useMemo(() => {
    if (!game) return [];
    let routes = game.routes;
    if (routeSearch.trim()) {
      const q = routeSearch.toLowerCase();
      routes = routes.filter((r) => r.name.toLowerCase().includes(q));
    }
    if (routeFilter === 'completed') {
      routes = routes.filter((r) => currentRun?.encounters.some((e) => e.routeId === r.id && e.status === 'caught'));
    } else if (routeFilter === 'missed') {
      routes = routes.filter((r) => currentRun?.encounters.some((e) => e.routeId === r.id && e.status === 'missed'));
    } else if (routeFilter === 'upcoming') {
      routes = routes.filter((r) => !currentRun?.encounters.some((e) => e.routeId === r.id));
    }
    return routes;
  }, [game, routeSearch, routeFilter, currentRun]);

  // Filtered bosses
  const filteredBosses = useMemo(() => {
    if (!game) return [];
    if (bossFilter === 'all') return game.bosses;
    return game.bosses.filter((b) => getBossCategory(b) === bossFilter);
  }, [game, bossFilter]);

  // Next upcoming route
  const nextRoute = useMemo(() => {
    if (!game || !currentRun) return null;
    return game.routes.find((r) => !currentRun.encounters.some((e) => e.routeId === r.id));
  }, [game, currentRun]);

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
              <p className="text-body text-text-secondary mb-4 max-w-xs">Start a new Nuzlocke challenge. Track encounters across 38 games with boss previews and type matchups.</p>
              <button onClick={() => setShowNew(true)} className="px-4 py-2 rounded-lg bg-accent-primary text-white font-medium">+ Start New Run</button>
            </div>
          ) : (
            <div className="space-y-3">
              {runs.map((r) => <RunCard key={r.id} run={r} isActive={r.id === currentRunId} onSelect={() => setCurrentRun(r.id)} onDelete={() => deleteRun(r.id)} />)}
            </div>
          )}
        </div>
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
  const boxMons = currentRun.encounters.filter((e) => e.status === 'boxed');
  const graveMons = currentRun.encounters.filter((e) => e.status === 'dead');

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
      <div className="flex px-5 gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: 'routes' as const, label: 'Routes', icon: MapPin },
          { key: 'bosses' as const, label: 'Bosses', icon: Swords },
          { key: 'box' as const, label: 'Box', icon: Archive },
          { key: 'graveyard' as const, label: 'Grave', icon: Skull },
          { key: 'upcoming' as const, label: 'Upcoming', icon: Target },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1 px-3 h-9 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${tab === t.key ? 'bg-accent-primary text-white' : 'bg-bg-secondary text-text-secondary border border-border-subtle'}`}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-24">
        <AnimatePresence mode="wait">
          {/* ---- Routes Tab ---- */}
          {tab === 'routes' && (
            <motion.div key="routes" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-2">
              {/* Route search + filters */}
              <div className="flex gap-2 mb-3">
                <div className="flex-1 relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <input type="text" value={routeSearch} onChange={(e) => setRouteSearch(e.target.value)} placeholder="Search routes..."
                    className="w-full h-9 pl-8 pr-3 rounded-lg bg-bg-tertiary border border-border-subtle text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none" />
                </div>
                <button onClick={() => setShowCustom(true)} className="h-9 px-2 rounded-lg bg-bg-tertiary border border-border-subtle text-text-secondary"><Plus size={16} /></button>
              </div>
              <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
                {[
                  { key: 'all' as const, label: 'All' },
                  { key: 'upcoming' as const, label: 'Upcoming' },
                  { key: 'completed' as const, label: 'Caught' },
                  { key: 'missed' as const, label: 'Missed' },
                ].map((f) => (
                  <button key={f.key} onClick={() => setRouteFilter(f.key)}
                    className={`px-3 h-7 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${routeFilter === f.key ? 'bg-accent-primary text-white' : 'bg-bg-tertiary text-text-secondary border border-border-subtle'}`}>{f.label}</button>
                ))}
              </div>

              {/* Continue at next route */}
              {nextRoute && routeFilter === 'all' && !routeSearch && (
                <button onClick={() => {
                  const el = document.getElementById(`route-${nextRoute.id}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }} className="w-full h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-sm font-medium flex items-center justify-center gap-2 mb-2">
                  <ArrowRight size={16} /> Continue at {nextRoute.name}
                </button>
              )}

              {filteredRoutes.map((r) => (
                <div key={r.id} id={`route-${r.id}`}>
                  <RouteRow route={r} encounter={currentRun.encounters.find((e) => e.routeId === r.id)} teraRaid={currentRun.teraRaids.find((t) => t.routeId === r.id)} onUpdate={(sp, nick, st, nat, ev) => handleUpdate(r.id, sp, nick, st, nat, ev)} onTeraRoll={() => handleTeraRoll(r.id)} onTeraUpdate={(sp, st) => handleTeraUpdate(r.id, sp, st)} />
                </div>
              ))}
              {filteredRoutes.length === 0 && <p className="text-sm text-text-tertiary text-center py-8">No routes match your search</p>}
            </motion.div>
          )}

          {/* ---- Bosses Tab ---- */}
          {tab === 'bosses' && (
            <motion.div key="bosses" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-2">
              {/* Boss category filters */}
              <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'gym', label: 'Gyms' },
                  { key: 'elite4', label: 'Elite 4' },
                  { key: 'champion', label: 'Champion' },
                  { key: 'rival', label: 'Rivals' },
                  { key: 'evil', label: 'Evil Team' },
                  { key: 'titan', label: 'Titans' },
                ].map((f) => (
                  <button key={f.key} onClick={() => setBossFilter(f.key)}
                    className={`px-3 h-7 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${bossFilter === f.key ? 'bg-accent-primary text-white' : 'bg-bg-tertiary text-text-secondary border border-border-subtle'}`}>{f.label}</button>
                ))}
              </div>
              {filteredBosses.map((b) => (
                <BossCard key={b.id} boss={b} teamTypes={teamTypes} teamEncounters={currentRun.encounters} onVS={setVsBoss} />
              ))}
              {filteredBosses.length === 0 && <p className="text-sm text-text-tertiary text-center py-8">No bosses in this category</p>}
            </motion.div>
          )}

          {/* ---- Box Tab ---- */}
          {tab === 'box' && (
            <motion.div key="box" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {boxMons.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {boxMons.map((e, i) => <PokemonCard key={i} encounter={e} />)}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Archive size={48} className="text-text-tertiary mb-3" />
                  <p className="text-body text-text-secondary">No boxed Pokemon</p>
                  <p className="text-caption text-text-tertiary">Box Pokemon from the Routes tab</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ---- Graveyard Tab ---- */}
          {tab === 'graveyard' && (
            <motion.div key="graveyard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {graveMons.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {graveMons.map((e, i) => (
                    <div key={i} className="bg-bg-secondary rounded-xl border border-red-500/20 p-3 flex items-center gap-3">
                      <div className="relative">
                        <PokemonSprite name={e.evolvedSpecies || e.species} size={48} />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                          <Skull size={12} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate">{e.nickname || (e.evolvedSpecies || e.species)}</p>
                        {e.nickname && e.nickname !== (e.evolvedSpecies || e.species) && <p className="text-caption text-text-secondary">{e.evolvedSpecies || e.species}</p>}
                        {e.nature && <span className="text-caption px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">{e.nature}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Skull size={48} className="text-text-tertiary mb-3" />
                  <p className="text-body text-text-secondary">No fallen Pokemon</p>
                  <p className="text-caption text-text-tertiary">Let's keep it that way!</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ---- Upcoming Tab ---- */}
          {tab === 'upcoming' && (
            <motion.div key="upcoming" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div>
                <p className="text-caption font-medium text-text-secondary mb-2 flex items-center gap-1"><Swords size={12} /> NEXT BOSSES</p>
                {game?.bosses.slice(0, 5).map((b) => {
                  const cat = getBossCategory(b);
                  const catColors: Record<string, string> = { gym: '#F59E0B', elite4: '#8B5CF6', champion: '#EAB308', rival: '#3B82F6', evil: '#EF4444', titan: '#10B981', other: '#64748B' };
                  return (
                    <div key={b.id} className="flex items-center gap-3 py-2 border-b border-border-subtle last:border-0">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: catColors[cat] + '20', color: catColors[cat] }}>{cat.toUpperCase()}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{b.name}</p>
                        <p className="text-caption text-text-secondary">{b.location}</p>
                      </div>
                      <TypeBadge type={b.type.toLowerCase()} />
                      <span className="text-caption font-bold" style={{ color: '#EAB308' }}>Lv.{b.levelCap}</span>
                    </div>
                  );
                }) || <p className="text-sm text-text-tertiary">No boss data</p>}
              </div>

              <div>
                <p className="text-caption font-medium text-text-secondary mb-2 flex items-center gap-1"><MapPin size={12} /> NEXT ROUTES</p>
                {game?.routes.filter((r) => !currentRun?.encounters.some((e) => e.routeId === r.id)).slice(0, 8).map((r) => (
                  <div key={r.id} className="flex items-center gap-3 py-2 border-b border-border-subtle last:border-0">
                    <MapPin size={14} className="text-text-tertiary shrink-0" />
                    <p className="text-sm text-text-primary flex-1">{r.name}</p>
                    {getEncountersForRoute(r.id).length > 0 && (
                      <span className="text-caption text-text-tertiary">{getEncountersForRoute(r.id).length} encounters</span>
                    )}
                  </div>
                )) || <p className="text-sm text-text-tertiary">All routes completed!</p>}
              </div>

              <div>
                <p className="text-caption font-medium text-text-secondary mb-2 flex items-center gap-1"><Heart size={12} /> ACTIVE TEAM</p>
                {currentRun?.encounters.filter((e) => e.status === 'caught').length ? (
                  <div className="flex flex-wrap gap-2">
                    {currentRun?.encounters.filter((e) => e.status === 'caught').map((e, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-bg-tertiary border border-border-subtle">
                        <PokemonSprite name={e.evolvedSpecies || e.species} size={24} />
                        <span className="text-xs text-text-secondary">{e.nickname || (e.evolvedSpecies || e.species)}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-text-tertiary">No caught Pokemon yet</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* VS Boss Comparison Modal */}
      <AnimatePresence>
        {vsBoss && <VSComparison boss={vsBoss} teamEncounters={currentRun?.encounters || []} onClose={() => setVsBoss(null)} />}
      </AnimatePresence>

      {/* Custom Location Modal */}
      <AnimatePresence>
        {showCustom && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50" onClick={() => setShowCustom(false)}>
            <motion.div initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }} className="bg-bg-secondary rounded-t-3xl p-6 pb-24 space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="w-10 h-1 rounded-full bg-text-tertiary/30 mx-auto" />
              <h2 className="text-headline font-semibold text-text-primary text-center">Add Custom Location</h2>
              <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Location name (e.g., Safari Zone)"
                className="w-full h-12 px-4 rounded-xl bg-bg-tertiary border border-border-subtle text-text-primary placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none" />
              <button onClick={addCustomLocation} disabled={!customName.trim()} className="w-full h-12 rounded-xl bg-accent-primary text-white font-medium disabled:opacity-50 active:scale-[0.98] transition-transform">Add Location</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
