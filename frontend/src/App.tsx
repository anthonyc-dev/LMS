import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { Toaster } from "sonner";
import api from "./lib/axios";
import PublicRoute from "./components/commons/PublicRoute";
import ProtectedRoute from "./components/commons/ProtectedRoute";
import LoadingSpinner from "./components/commons/GlobalLoading";

// Lazy load all pages
const LoginPage = lazy(() =>
  import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import("./pages/RegisterPage").then((m) => ({ default: m.RegisterPage })),
);
const ForgotPassword = lazy(() =>
  import("./pages/ForgotPassword").then((m) => ({ default: m.ForgotPassword })),
);
const ResetPassword = lazy(() =>
  import("./pages/ResetPassword").then((m) => ({ default: m.ResetPassword })),
);
const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);
const UnauthorizedPage = lazy(() =>
  import("./pages/UnauthorizedPage").then((m) => ({
    default: m.UnauthorizedPage,
  })),
);
const AdminLayout = lazy(() =>
  import("./layouts/AdminLayout").then((m) => ({ default: m.AdminLayout })),
);
const BrowseBooksPage = lazy(() =>
  import("./pages/student/BrowseBooksPage").then((m) => ({
    default: m.BrowseBooksPage,
  })),
);
const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const BorrowBooksPage = lazy(() =>
  import("./pages/student/BorrowBooksPage").then((m) => ({
    default: m.BorrowBooksPage,
  })),
);
const BorrowingHistoryPage = lazy(() =>
  import("./pages/student/BorrowingHistoryPage").then((m) => ({
    default: m.BorrowingHistoryPage,
  })),
);
const MyBooksPage = lazy(() =>
  import("./pages/student/MyBooksPage").then((m) => ({
    default: m.MyBooksPage,
  })),
);
const ProfilePage = lazy(() =>
  import("./pages/student/ProfilePage").then((m) => ({
    default: m.ProfilePage,
  })),
);
const SettingsPage = lazy(() =>
  import("./pages/student/SettingsPage").then((m) => ({
    default: m.SettingsPage,
  })),
);
const SchedulePage = lazy(() =>
  import("./pages/student/SchedulePage").then((m) => ({
    default: m.SchedulePage,
  })),
);

// Admin pages
const AdminBooksPage = lazy(() =>
  import("./pages/admin/BooksPage").then((m) => ({ default: m.BooksPage })),
);
const AdminAddBookPage = lazy(() =>
  import("./pages/admin/AddBookPage").then((m) => ({ default: m.AddBookPage })),
);
const AdminInventoryPage = lazy(() =>
  import("./pages/admin/InventoryPage").then((m) => ({
    default: m.InventoryPage,
  })),
);
const AdminCategoryPage = lazy(() =>
  import("./pages/admin/CategoryPage").then((m) => ({
    default: m.CategoryPage,
  })),
);
const AdminShelfPage = lazy(() =>
  import("./pages/admin/ShelfPage").then((m) => ({ default: m.ShelfPage })),
);
const AdminUserManagementPage = lazy(() =>
  import("./pages/admin/UserManagement").then((m) => ({
    default: m.UserManagement,
  })),
);
const AdminBorrowingHistoryPage = lazy(() =>
  import("./pages/admin/AdminBorrowingHistory").then((m) => ({
    default: m.AdminBorrowingHistory,
  })),
);

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Fetch CSRF token first so all subsequent POST requests include it
        await api.get("/auth/csrf");

        // 1. Try to refresh token on app mount using HttpOnly cookie
        const refreshResponse = await api.post("/auth/refresh");
        const token = refreshResponse.data.accessToken || refreshResponse.data.result?.accessToken;

        console.log("Datas", token);

        // 2. Set the token in memory first
        useAuthStore.getState().setToken(token);

        // 3. Fetch user profile using the new access token
        const meResponse = await api.get("/auth/me");
        const user = meResponse.data.user;

        // 4. Hydrate the store
        setAuth(user, token);
      } catch {
        console.log("No active session found or session expired");
        useAuthStore.getState().logout();
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [setAuth]);

  if (isInitializing) {
    return <LoadingSpinner />;
  }

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        theme="dark"
        toastOptions={{
          style: {
            background: "#000000",
            color: "#ffffff",
            border: "1px solid #27272a",
          },
          classNames: {
            success: "!text-[#22c55e] !border-[#22c55e] !bg-[#000000]",
            error: "!text-[#ef4444] !border-[#ef4444] !bg-[#000000]",
          },
        }}
      />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
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
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["admin", "student", "faculty"]} />
            }
          >
            <Route path="/student" element={<AdminLayout />}>
              <Route
                index
                element={<Navigate to="/student/dashboard" replace />}
              />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="books">
                <Route index element={<MyBooksPage />} />
                <Route path="browse" element={<BrowseBooksPage />} />
                <Route path="borrow" element={<BorrowBooksPage />} />
                <Route path="history" element={<BorrowingHistoryPage />} />
              </Route>
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="schedule" element={<SchedulePage />} />
            </Route>
          </Route>

          {/* Protected Admin Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="books" element={<AdminBooksPage />} />
              <Route path="books/add" element={<AdminAddBookPage />} />
              <Route path="inventory" element={<AdminInventoryPage />} />
              <Route path="categories" element={<AdminCategoryPage />} />
              <Route path="shelves" element={<AdminShelfPage />} />
              <Route path="users" element={<AdminUserManagementPage />} />
              <Route
                path="borrowing-history"
                element={<AdminBorrowingHistoryPage />}
              />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
