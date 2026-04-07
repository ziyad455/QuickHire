import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const JobDetailPage = lazy(() => import('./pages/JobDetailPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));

const RouteLoadingScreen = () => (
  <div className="min-h-screen bg-surface text-on_surface flex items-center justify-center font-body px-4">
    <div className="flex items-center gap-3 rounded-full border border-outline_variant/40 bg-surface_container_lowest px-5 py-3 shadow-ambient-sm">
      <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
      <span className="text-sm font-semibold text-on_surface_variant">
        Loading workspace...
      </span>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<RouteLoadingScreen />}>
          <Routes>
            {/* Public Routes - Auto Redirect if Logged In */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <LandingPage />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <AuthPage />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <AuthPage />
                </PublicRoute>
              }
            />

            {/* Pricing Page is accessible to both Public and Logged IN */}
            <Route path="/pricing" element={<PricingPage />} />

            {/* Protected Routes - Auto Redirect if Not Logged In */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/job/:id"
              element={
                <ProtectedRoute>
                  <JobDetailPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
