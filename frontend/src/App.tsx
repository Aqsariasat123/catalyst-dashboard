import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import TasksPage from '@/pages/TasksPage';
import TaskDetailPage from '@/pages/TaskDetailPage';
import TimeTrackingPage from '@/pages/TimeTrackingPage';
import ProjectsPage from '@/pages/ProjectsPage';
import ProjectDetailPage from '@/pages/ProjectDetailPage';
import ClientsPage from '@/pages/ClientsPage';
import ReportsPage from '@/pages/ReportsPage';
import TeamPage from '@/pages/TeamPage';
import AccountsPage from '@/pages/AccountsPage';
import PermissionsPage from '@/pages/PermissionsPage';
import HRDashboardPage from '@/pages/HRDashboardPage';
import RecruitmentPage from '@/pages/RecruitmentPage';
import EmployeePortalPage from '@/pages/EmployeePortalPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}


function ThemeInitializer() {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeInitializer />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="tasks/:id" element={<TaskDetailPage />} />
            <Route path="time-tracking" element={<TimeTrackingPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
            <Route path="clients" element={<AdminRoute><ClientsPage /></AdminRoute>} />
            <Route path="team" element={<AdminRoute><TeamPage /></AdminRoute>} />
            <Route path="accounts" element={<AdminRoute><AccountsPage /></AdminRoute>} />
            <Route path="permissions" element={<AdminRoute><PermissionsPage /></AdminRoute>} />
            <Route path="reports" element={<AdminRoute><ReportsPage /></AdminRoute>} />
            <Route path="my-portal" element={<EmployeePortalPage />} />
            <Route path="hr" element={<AdminRoute><HRDashboardPage /></AdminRoute>} />
            <Route path="recruitment" element={<AdminRoute><RecruitmentPage /></AdminRoute>} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--toast-bg)',
              color: 'var(--toast-color)',
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
