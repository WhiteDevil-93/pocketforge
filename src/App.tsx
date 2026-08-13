// ============================================================================
// PocketForge — App Router with Comprehensive Lazy Loading
// ============================================================================

import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router';
import Layout from './components/Layout';
import { useStore } from './store/useStore';
import { DEFAULT_FORMAT } from './data/formatsData';
import { getDefaultLevelForFormat } from './lib/format';
import { HOME_PATH } from './lib/routes';
import { useNativeShell } from './hooks/use-native-shell';

// Every page is route-split so specialist data and calculators only load when used.
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Teams = lazy(() => import('./pages/Teams'));
const Builder = lazy(() => import('./pages/Builder'));
const Calculator = lazy(() => import('./pages/Calculator'));
const Nuzlocke = lazy(() => import('./pages/Nuzlocke'));
const SpeedTierList = lazy(() => import('./pages/SpeedTierList'));
const MovePoolExplorer = lazy(() => import('./pages/MovePoolExplorer'));
const ImportExport = lazy(() => import('./pages/ImportExport'));
const Analysis = lazy(() => import('./pages/Analysis'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const CustomFormatsPage = lazy(() => import('./pages/CustomFormatsPage'));
const WeaknessAnalyzer = lazy(() => import('./pages/WeaknessAnalyzer'));
const Assistant = lazy(() => import('./pages/Assistant'));

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
    <div
      className="flex min-h-[60dvh] flex-col items-center justify-center gap-3 animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-[3px] border-accent-primary/10 border-t-accent-primary"
        aria-hidden="true"
      />
      <span className="font-body-medium text-text-secondary text-xs tracking-wider uppercase">
        Loading section…
      </span>
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const importTeam = useStore((s) => s.importTeam);

  // Android status bar, splash screen, and hardware back button. No-ops in the browser.
  useNativeShell();

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
    if (!urlTeam) return;

    let cancelled = false;

    const loadSharedTeam = async () => {
      try {
        // This parser is several megabytes; only fetch it for an actual shared team.
        const { Teams: ShowdownTeams } = await import('@pkmn/sets');
        const unpackedSets = ShowdownTeams.unpackTeam(urlTeam.team);
        if (!cancelled && unpackedSets?.team?.length) {
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
    };

    void loadSharedTeam();

    return () => {
      cancelled = true;
    };
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
            path="/assistant"
            element={
              <OnboardingGuard>
                <Assistant />
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
