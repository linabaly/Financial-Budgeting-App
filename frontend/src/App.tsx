import React, { Suspense, lazy } from "react";
import { 
  Routes, 
  Route, 
  Navigate, 
  BrowserRouter as Router 
} from "react-router-dom";

// Lazy load components for improved performance
const LoginPage = lazy(() => import("./Login/LoginPage"));
const RegisterPage = lazy(() => import("./Register/RegisterPage"));
const DashboardPage = lazy(() => import("./Dashboard/Dashboard"));
const ResetPassPage = lazy(() => import("./ResetPassword/ResetPassPage"));
const BudgetInsights = lazy(() => import("./BudgetInsights/BudgetInsights"));
const Transactions = lazy(() => import("./Transactions/Transactions"));

// Profile-related components
const ProfilePage = lazy(() => import("./Profile/ProfilePage"));
const AccountSettings = lazy(() => import("./Profile/AccountSettings"));
const FinancialGoals = lazy(() => import("./Profile/FinancialGoals"));
const NotificationPreferences = lazy(() => import("./Profile/NotificationPreferences"));
const PersonalInfo = lazy(() => import("./Profile/PersonalInfo"));
const SecuritySettings = lazy(() => import("./Profile/SecuritySettings"));

/**
 * Loading Fallback Component
 * Displayed while lazy-loaded components are being loaded
 */
const LoadingFallback: React.FC = () => (
  <div className="loading-container">
    <div className="loading-spinner">
      <div className="spinner"></div>
    </div>
  </div>
);

/**
 * Error Boundary Component
 * Catches and handles errors in child components
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode }, 
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="error-page">
          <h1>Something went wrong</h1>
          <p>We're sorry, but an unexpected error occurred.</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Protected Route Component
 * Ensures only authenticated users can access certain routes
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // In a real app, you would check actual authentication status
  const isAuthenticated = true; // Replace with actual authentication check

  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/" replace />
  );
};

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset-password" element={<ResetPassPage />} />

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/insights" 
              element={
                <ProtectedRoute>
                  <BudgetInsights />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/transactions" 
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              } 
            />

            {/* Profile Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/account-settings"
              element={
                <ProtectedRoute>
                  <AccountSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/financial-goals"
              element={
                <ProtectedRoute>
                  <FinancialGoals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/notification-preferences"
              element={
                <ProtectedRoute>
                  <NotificationPreferences />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/personal-info"
              element={
                <ProtectedRoute>
                  <PersonalInfo />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/security-settings"
              element={
                <ProtectedRoute>
                  <SecuritySettings />
                </ProtectedRoute>
              }
            />

            {/* 404 Not Found Route */}
            <Route 
              path="*" 
              element={
                <div className="not-found-page">
                  <h1>404 - Page Not Found</h1>
                  <p>The page you are looking for does not exist.</p>
                  <button onClick={() => window.location.href = '/'}>
                    Go to Home
                  </button>
                </div>
              } 
            />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Router>
  );
}

export default App;