// ============================================================================
// PocketForge — App Router
// ============================================================================

import { Routes, Route, Navigate } from 'react-router';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import Teams from './pages/Teams';
import Builder from './pages/Builder';
import Calculator from './pages/Calculator';
import Analysis from './pages/Analysis';
import SettingsPage from './pages/SettingsPage';
import ImportExport from './pages/ImportExport';
import CustomFormatsPage from './pages/CustomFormatsPage';
import SpeedTierList from './pages/SpeedTierList';
import MovePoolExplorer from './pages/MovePoolExplorer';
import WeaknessAnalyzer from './pages/WeaknessAnalyzer';
import { useStore } from './store/useStore';

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const hasCompletedOnboarding = useStore((s) => s.settings.hasCompletedOnboarding);

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Layout>
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
    </Layout>
  );
}
