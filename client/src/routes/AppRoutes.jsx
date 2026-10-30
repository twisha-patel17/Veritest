
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

import FailureAnalysisPage from "../pages/FailureAnalysisPage";
import FailureDetailPage from "../pages/FailureDetailPage";

import MutationTestingPage from "../pages/MutationTestingPage";

import DashboardLayout from "../components/layouts/DashboardLayout";

// Session loading screen
function CheckingSession() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0d0f] text-[#80e8bf]">
      Checking your session...
    </div>
  );
}

// Protected routes
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

// Public routes
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

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<LandingPage />}
        />

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

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >

          {/* Dashboard overview */}
          <Route
            index
            element={<DashboardPage />}
          />

          <Route
            path="projects"
            element={<ProjectsPage />}
          />

          <Route
            path="projects/new"
            element={<NewProjectPage />}
          />

          <Route
            path="projects/:projectId"
            element={<ProjectWorkspacePage />}
          />

          <Route
            path="test-runs"
            element={<TestRunsPage />}
          />

          <Route
            path="failures"
            element={<FailureAnalysisPage />}
          />

          <Route
            path="failures/:failureId"
            element={<FailureDetailPage />}
          />

          <Route
            path="mutation-testing"
            element={<MutationTestingPage />}
          />

        </Route>
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
