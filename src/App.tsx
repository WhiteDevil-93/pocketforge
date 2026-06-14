// ============================================================================
// PocketForge — App Router
// ============================================================================

import { Routes, Route, Navigate } from 'react-router';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import Teams from './pages/Teams';
import Builder from './pages/Builder';
import Analysis from './pages/Analysis';
import SettingsPage from './pages/SettingsPage';
import ImportExport from './pages/ImportExport';
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
        <Route path="/" element={<Navigate to="/teams" replace />} />
        <Route path="*" element={<Navigate to="/teams" replace />} />
      </Routes>
    </Layout>
  );
}
