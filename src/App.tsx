// ============================================================================
// PocketForge — App Router with Comprehensive Lazy Loading
// ============================================================================

import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import Teams from './pages/Teams';
import Builder from './pages/Builder';
import { useStore } from './store/useStore';
import { Teams as ShowdownTeams } from '@pkmn/sets';
import { DEFAULT_FORMAT } from './data/formatsData';
import { getDefaultLevelForFormat } from './lib/showdown';
import { HOME_PATH } from './lib/routes';

// Lazy loaded pages to optimize initial bundle size
const Calculator = lazy(() => import('./pages/Calculator'));
const Nuzlocke = lazy(() => import('./pages/Nuzlocke'));
const SpeedTierList = lazy(() => import('./pages/SpeedTierList'));
const MovePoolExplorer = lazy(() => import('./pages/MovePoolExplorer'));
const ImportExport = lazy(() => import('./pages/ImportExport'));
const Analysis = lazy(() => import('./pages/Analysis'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const CustomFormatsPage = lazy(() => import('./pages/CustomFormatsPage'));
const WeaknessAnalyzer = lazy(() => import('./pages/WeaknessAnalyzer'));

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const hasCompletedOnboarding = useStore((s) => s.settings.hasCompletedOnboarding);

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

/**
 * Loading Spinner fallback for lazy loaded routes.
 */
function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60dvh] gap-3 animate-fade-in">
      <div className="w-10 h-10 rounded-full border-[3px] border-accent-primary/10 border-t-accent-primary animate-spin" />
      <span className="font-body-medium text-text-secondary text-xs tracking-wider uppercase">
        Loading Section...
      </span>
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const importTeam = useStore((s) => s.importTeam);

  useEffect(() => {
    const getPackedTeamFromUrl = () => {
      // Try search query first
      let params = new URLSearchParams(window.location.search);
      let team = params.get('team');
      if (team) return { team, source: 'search' };

      // Fallback to query inside hash (e.g. #/teams?team=...)
      const hash = window.location.hash;
      const questionMarkIndex = hash.indexOf('?');
      if (questionMarkIndex !== -1) {
        params = new URLSearchParams(hash.substring(questionMarkIndex));
        team = params.get('team');
        if (team) return { team, source: 'hash' };
      }

      return null;
    };

    const urlTeam = getPackedTeamFromUrl();
    if (urlTeam) {
      try {
        const unpackedSets = ShowdownTeams.unpackTeam(urlTeam.team);
        if (unpackedSets && unpackedSets.team && unpackedSets.team.length > 0) {
          const pokemon = unpackedSets.team.map((mon) => ({
            id: crypto.randomUUID(),
            species: mon.species || '',
            nickname: mon.name || undefined,
            level: mon.level || getDefaultLevelForFormat(DEFAULT_FORMAT),
            gender: (mon.gender === 'M' || mon.gender === 'F' ? mon.gender : '') as 'M' | 'F' | '',
            shiny: mon.shiny || false,
            ability: mon.ability || '',
            item: mon.item || undefined,
            teraType: mon.teraType || undefined,
            moves: mon.moves || [],
            evs: {
              hp: mon.evs?.hp ?? 0,
              atk: mon.evs?.atk ?? 0,
              def: mon.evs?.def ?? 0,
              spa: mon.evs?.spa ?? 0,
              spd: mon.evs?.spd ?? 0,
              spe: mon.evs?.spe ?? 0,
            },
            ivs: {
              hp: mon.ivs?.hp ?? 31,
              atk: mon.ivs?.atk ?? 31,
              def: mon.ivs?.def ?? 31,
              spa: mon.ivs?.spa ?? 31,
              spd: mon.ivs?.spd ?? 31,
              spe: mon.ivs?.spe ?? 31,
            },
            nature: mon.nature || 'Serious',
          }));

          const teamId = importTeam({
            name: 'Shared Team',
            format: DEFAULT_FORMAT,
            pokemon,
          });

          // Clean URL
          if (urlTeam.source === 'search') {
            const newUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, document.title, newUrl);
          } else {
            const cleanHash = window.location.hash.split('?')[0];
            navigate(cleanHash.substring(1), { replace: true });
          }

          // Go to builder
          navigate(`/builder/${teamId}`);
        }
      } catch (err) {
        console.error('Failed to unpack shared team from URL:', err);
      }
    }
  }, [importTeam, navigate]);

  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route
            path="/teams"
            element={
              <OnboardingGuard>
                <Teams />
              </OnboardingGuard>
            }
          />
          <Route
            path="/builder"
            element={
              <OnboardingGuard>
                <Builder />
              </OnboardingGuard>
            }
          />
          <Route
            path="/builder/:teamId"
            element={
              <OnboardingGuard>
                <Builder />
              </OnboardingGuard>
            }
          />
          <Route
            path="/calc"
            element={
              <OnboardingGuard>
                <Calculator />
              </OnboardingGuard>
            }
          />
          <Route
            path="/analysis"
            element={
              <OnboardingGuard>
                <Analysis />
              </OnboardingGuard>
            }
          />
          <Route
            path="/analysis/:teamId"
            element={
              <OnboardingGuard>
                <Analysis />
              </OnboardingGuard>
            }
          />
          <Route
            path="/settings"
            element={
              <OnboardingGuard>
                <SettingsPage />
              </OnboardingGuard>
            }
          />
          <Route
            path="/import-export"
            element={
              <OnboardingGuard>
                <ImportExport />
              </OnboardingGuard>
            }
          />
          <Route
            path="/custom-formats"
            element={
              <OnboardingGuard>
                <CustomFormatsPage />
              </OnboardingGuard>
            }
          />
          <Route
            path="/speed-tiers"
            element={
              <OnboardingGuard>
                <SpeedTierList />
              </OnboardingGuard>
            }
          />
          <Route
            path="/movepool"
            element={
              <OnboardingGuard>
                <MovePoolExplorer />
              </OnboardingGuard>
            }
          />
          <Route
            path="/weakness-analyzer"
            element={
              <OnboardingGuard>
                <WeaknessAnalyzer />
              </OnboardingGuard>
            }
          />
          <Route
            path="/nuzlocke"
            element={
              <OnboardingGuard>
                <Nuzlocke />
              </OnboardingGuard>
            }
          />
          <Route path="/home" element={<Navigate to={HOME_PATH} replace />} />
          <Route path="/" element={<Navigate to={HOME_PATH} replace />} />
          <Route path="*" element={<Navigate to={HOME_PATH} replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
