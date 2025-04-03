import React, { Suspense, lazy } from "react";
import { NotificationProvider } from './Profile/contexts/NotificationContext';
import { 
  Routes, 
  Route, 
  Navigate, 
  BrowserRouter as Router 
} from "react-router-dom";
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faUser, 
  faCog, 
  faShieldAlt, 
  faBell, 
  faChartLine,
  faCamera,
  faTimes,
  faArrowLeft,
  faChartPie
} from '@fortawesome/free-solid-svg-icons';
import { 
  faGoogle, 
  faApple 
} from '@fortawesome/free-brands-svg-icons';

// Add all icons to library
library.add(
  faUser, 
  faCog, 
  faShieldAlt, 
  faBell, 
  faChartLine,
  faCamera,
  faTimes,
  faArrowLeft,
  faChartPie,
  faGoogle,
  faApple
);

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
const ProfileSettings = lazy(() => import("./Profile/ProfileSettings"));

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

/**
 * Notification Service
 * Provides functions for showing loading states and notifications
 */
export const showNotification = (message: string) => {
  const event = new CustomEvent('show-notification', { detail: message });
  window.dispatchEvent(event);
};

export const simulateLoading = (callback: () => void, setIsLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
  setIsLoading(true);
  setTimeout(() => {
    setIsLoading(false);
    callback();
  }, 800);
};

function App() {

  const [notification, setNotification] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleNotification = (e: any) => {
      setNotification(e.detail);
      setTimeout(() => setNotification(null), 3000);
    };
  
    window.addEventListener('show-notification', handleNotification);
    return () => window.removeEventListener('show-notification', handleNotification);
  }, []);
  

  return (
    <Router>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          {/* Global notification container */}
          {notification && (
  <div className="save-notification show">
    {notification}
  </div>
)}

          
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
                  <AccountSettings onSave={() => {
                    // This would be handled by the component's internal loading state
                    // and the global notification service
                    showNotification('Account settings updated successfully!');
                  }} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/financial-goals"
              element={
                <ProtectedRoute>
                  <FinancialGoals onSave={() => {
                    showNotification('Financial goals updated successfully!');
                  }} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/notification-preferences"
              element={
                <ProtectedRoute>
                  <NotificationPreferences onSave={() => {
                    showNotification('Notification preferences updated successfully!');
                  }} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/personal-info"
              element={
                <ProtectedRoute>
                  <PersonalInfo onSave={() => {
                    showNotification('Personal information updated successfully!');
                  }} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/security-settings"
              element={
                <ProtectedRoute>
                  <SecuritySettings onSave={() => {
                    showNotification('Security settings updated successfully!');
                  }} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/profile-settings"
              element={
                <ProtectedRoute>
                  <ProfileSettings onSave={() => {
                    showNotification('Profile settings updated successfully!');
                  }} />
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