// ============================================================================
// PocketForge — App Router with Comprehensive Lazy Loading
// ============================================================================

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import Teams from './pages/Teams';
import Builder from './pages/Builder';
import { useStore } from './store/useStore';

// Lazy loaded pages to optimize initial bundle size
const Calculator = lazy(() => import('./pages/Calculator'));
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
          <Route path="/" element={<Navigate to="/teams" replace />} />
          <Route path="*" element={<Navigate to="/teams" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
