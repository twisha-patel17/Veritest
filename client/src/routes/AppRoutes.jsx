
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import ProjectsPage from "../pages/ProjectsPage";
import NewProjectPage from "../pages/NewProjectPage";
import ProjectWorkspacePage from "../pages/ProjectWorkspacePage";
import TestRunsPage from "../pages/TestRunsPage";

import DashboardLayout from "../components/layouts/DashboardLayout";

function CheckingSession() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0d0f] text-[#80e8bf]">
      Checking your session...
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <CheckingSession />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <CheckingSession />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Temporary placeholder pages
function FailureAnalysisPage() {
  return (
    <div className="min-h-full bg-[#0b0d0f] p-5 text-[#f1f3f5]">
      <h1 className="text-2xl font-semibold">Failure analysis</h1>
      <p className="mt-2 text-sm text-[#8292aa]">
        Investigate reproducible failures and unexpected behavior.
      </p>
    </div>
  );
}

function MutationTestingPage() {
  return (
    <div className="min-h-full bg-[#0b0d0f] p-5 text-[#f1f3f5]">
      <h1 className="text-2xl font-semibold">Mutation testing</h1>
      <p className="mt-2 text-sm text-[#8292aa]">
        Measure whether your tests detect intentional code changes.
      </p>
    </div>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />

        {/* Protected dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard overview */}
          <Route index element={<DashboardPage />} />

          {/* Projects */}
          <Route
            path="projects"
            element={<ProjectsPage />}
          />

          {/* Create project */}
          <Route
            path="projects/new"
            element={<NewProjectPage />}
          />

          {/* Individual project workspace */}
          <Route
            path="projects/:projectId"
            element={<ProjectWorkspacePage />}
          />

          {/* Test runs */}
          <Route
            path="test-runs"
            element={<TestRunsPage />}
          />

          {/* Failure analysis */}
          <Route
            path="failures"
            element={<FailureAnalysisPage />}
          />

          {/* Mutation testing */}
          <Route
            path="mutation-testing"
            element={<MutationTestingPage />}
          />
        </Route>

        {/* Unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;

