import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { AppLayout } from '@/components/layout/AppLayout';

// Pages
import { DashboardPage }  from '@/pages/DashboardPage';
import { ComposePage }    from '@/pages/ComposePage';
import { CalendarPage }   from '@/pages/CalendarPage';
import { AnalyticsPage }  from '@/pages/AnalyticsPage';
import { MediaPage }      from '@/pages/MediaPage';
import { SettingsPage }   from '@/pages/SettingsPage';
import { BillingPage }    from '@/pages/BillingPage';
import { LoginPage }      from '@/pages/auth/LoginPage';
// import { RegisterPage }   from '@/pages/auth/RegisterPage';
// import { OnboardingPage } from '@/pages/auth/OnboardingPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"      element={<PublicRoute><LoginPage /></PublicRoute>} />
      {/* <Route path="/register"   element={<PublicRoute><RegisterPage /></PublicRoute>} /> */}
      {/* <Route path="/onboarding" element={<OnboardingPage />} /> */}

      {/* Protected — inside layout */}
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index             element={<DashboardPage />} />
        <Route path="compose"    element={<ComposePage />} />
        <Route path="calendar"   element={<CalendarPage />} />
        <Route path="analytics"  element={<AnalyticsPage />} />
        <Route path="media"      element={<MediaPage />} />
        <Route path="settings/*" element={<SettingsPage />} />
        <Route path="billing"    element={<BillingPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
