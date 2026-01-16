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
import QADashboardPage from '@/pages/QADashboardPage';
import QALayout from '@/components/qa/QALayout';
import QAOverviewPage from '@/pages/qa/QAOverviewPage';
import TestCasesPage from '@/pages/qa/TestCasesPage';
import TestCaseFormPage from '@/pages/qa/TestCaseFormPage';
import TestCaseDetailPage from '@/pages/qa/TestCaseDetailPage';
import BugsPage from '@/pages/qa/BugsPage';
import BugFormPage from '@/pages/qa/BugFormPage';
import ExecutionsPage from '@/pages/qa/ExecutionsPage';
import QAReportsPage from '@/pages/qa/ReportsPage';
import ExecutionReportPage from '@/pages/qa/ExecutionReportPage';
import BugReportPage from '@/pages/qa/BugReportPage';

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

function QCRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const canAccessQA = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER' || user?.role === 'QC';

  if (!canAccessQA) {
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
            {/* QA Module Routes */}
            <Route path="qa" element={<QCRoute><QALayout /></QCRoute>}>
              <Route index element={<QAOverviewPage />} />
              <Route path="test-cases" element={<TestCasesPage />} />
              <Route path="test-cases/new" element={<TestCaseFormPage />} />
              <Route path="test-cases/:id" element={<TestCaseDetailPage />} />
              <Route path="test-cases/:id/edit" element={<TestCaseFormPage />} />
              {/* Executions */}
              <Route path="executions" element={<ExecutionsPage />} />
              {/* Bug Management */}
              <Route path="bugs" element={<BugsPage />} />
              <Route path="bugs/new" element={<BugFormPage />} />
              <Route path="bugs/:id/edit" element={<BugFormPage />} />
              {/* Reports */}
              <Route path="reports" element={<QAReportsPage />} />
              <Route path="reports/executions" element={<ExecutionReportPage />} />
              <Route path="reports/bugs" element={<BugReportPage />} />
            </Route>
            {/* Legacy QA Dashboard (Task Review) */}
            <Route path="qa-review" element={<QCRoute><QADashboardPage /></QCRoute>} />
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
