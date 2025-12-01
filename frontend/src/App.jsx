import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Auth Pages
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Main Pages
import Dashboard from "./pages/Dashboard";
import EmployeeList from "./pages/EmployeeList";
import EmployeeView from "./pages/EmployeeView";
import EmployeeForm from "./pages/EmployeeForm";
import Permissions from "./pages/Permissions";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import SalaryCalculator from "./pages/SalaryCalculator";
import PersonalSalary from "./pages/PersonalSalary";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.vaiTro)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Component (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard - Admin only */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Profile - All authenticated users */}
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Employees - Admin & Manager */}
            <Route
              path="employees"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
                  <EmployeeList />
                </ProtectedRoute>
              }
            />
            <Route
              path="employees/add"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <EmployeeForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="employees/edit/:id"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
                  <EmployeeForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="employees/:id"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Manager", "Employee"]}>
                  <EmployeeView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/salary/calculator"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
                  <SalaryCalculator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/salary/personal"
              element={
                <ProtectedRoute allowedRoles={["Employee", "Admin", "Manager"]}>
                  <PersonalSalary />
                </ProtectedRoute>
              }
            />

            {/* Permissions - Admin only */}
            <Route
              path="permissions"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <Permissions />
                </ProtectedRoute>
              }
            />

            {/* Placeholder routes for other modules */}
            <Route
              path="attendance"
              element={
                <div className="p-8">
                  <h1 className="text-2xl font-bold">
                    Chấm công - Đang phát triển
                  </h1>
                </div>
              }
            />
            <Route
              path="leave"
              element={
                <div className="p-8">
                  <h1 className="text-2xl font-bold">
                    Nghỉ phép - Đang phát triển
                  </h1>
                </div>
              }
            />
            <Route
              path="recruitment"
              element={
                <div className="p-8">
                  <h1 className="text-2xl font-bold">
                    Tuyển dụng - Đang phát triển
                  </h1>
                </div>
              }
            />
            <Route
              path="reports"
              element={
                <div className="p-8">
                  <h1 className="text-2xl font-bold">
                    Báo cáo - Đang phát triển
                  </h1>
                </div>
              }
            />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
