import { lazy, Suspense, useEffect, useState } from "react"
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "./store/authStore"
import { Toaster } from "sonner"
import api from "./lib/axios"
import Lottie from "lottie-react"
import booksAnimation from "./assets/animated/Books.json"

// Lazy load all pages
const LoginPage = lazy(() => import("./pages/LoginPage").then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import("./pages/RegisterPage").then(m => ({ default: m.RegisterPage })))
const ForgotPassword = lazy(() => import("./pages/ForgotPassword").then(m => ({ default: m.ForgotPassword })))
const ResetPassword = lazy(() => import("./pages/ResetPassword").then(m => ({ default: m.ResetPassword })))
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })))
const UnauthorizedPage = lazy(() => import("./pages/UnauthorizedPage").then(m => ({ default: m.UnauthorizedPage })))
const AdminLayout = lazy(() => import("./layouts/AdminLayout").then(m => ({ default: m.AdminLayout })))
const BrowseBooksPage = lazy(() => import("./pages/student/BrowseBooksPage").then(m => ({ default: m.BrowseBooksPage })))
const AdminDashboardPage = lazy(() => import("./pages/student/AdminDashboardPage").then(m => ({ default: m.AdminDashboardPage })))
const BorrowBooksPage = lazy(() => import("./pages/student/BorrowBooksPage").then(m => ({ default: m.BorrowBooksPage })))
const BorrowingHistoryPage = lazy(() => import("./pages/student/BorrowingHistoryPage").then(m => ({ default: m.BorrowingHistoryPage })))
const MyBooksPage = lazy(() => import("./pages/student/MyBooksPage").then(m => ({ default: m.MyBooksPage })))
const ProfilePage = lazy(() => import("./pages/student/ProfilePage").then(m => ({ default: m.ProfilePage })))
const SettingsPage = lazy(() => import("./pages/student/SettingsPage").then(m => ({ default: m.SettingsPage })))
const SchedulePage = lazy(() => import("./pages/student/SchedulePage").then(m => ({ default: m.SchedulePage })))

// Admin pages
const AdminBooksPage = lazy(() => import("./pages/admin/BooksPage").then(m => ({ default: m.BooksPage })))
const AdminAddBookPage = lazy(() => import("./pages/admin/AddBookPage").then(m => ({ default: m.AddBookPage })))



const LottieComponent = (Lottie as any).default || Lottie;

// Premium Loading Spinner
const LoadingSpinner = () => (
  <div className="flex flex-col h-svh w-full items-center justify-center bg-[#0f172a] gap-2">
    <div className="w-48 h-48 flex items-center justify-center">
      <LottieComponent animationData={booksAnimation} loop={true} />
    </div>
    <div className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1 select-none">
      <span>Loading</span>
      <span className="flex gap-0.5">
        <span className="animate-bounce inline-block" style={{ animationDelay: '0ms', animationDuration: '1s' }}>.</span>
        <span className="animate-bounce inline-block" style={{ animationDelay: '150ms', animationDuration: '1s' }}>.</span>
        <span className="animate-bounce inline-block" style={{ animationDelay: '300ms', animationDuration: '1s' }}>.</span>
      </span>
    </div>
  </div>
)

// Protected Route Component
const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    if (!user?.role || !allowedRoles.includes(user.role)) {
      // Redirect to unauthorized page if role doesn't match
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};

// Public Route Component (Redirects to dashboard if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/student/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 1. Try to refresh token on app mount using HttpOnly cookie
        const refreshResponse = await api.post("/auth/refresh");
        const token = refreshResponse.data.result.accessToken;

        // 2. Set the token in memory first
        useAuthStore.getState().setToken(token);

        // 3. Fetch user profile using the new access token
        const meResponse = await api.get("/auth/me");
        const user = meResponse.data.user;

        // 4. Hydrate the store
        setAuth(user, token);
      } catch (error) {
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
          {/* Protected Admin Routes */}
          {/* <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="books">
                <Route index element={<AdminBooksPage />} />
                <Route path="browse" element={<BrowseBooksPage />} />
                <Route path="borrow" element={<BorrowBooksPage />} />
                <Route path="history" element={<BorrowingHistoryPage />} />
              </Route>
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="schedule" element={<SchedulePage />} />
            </Route>
          </Route> */}

          {/* Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin", "student", "faculty"]} />}>
            <Route path="/student" element={<AdminLayout />}>
              <Route index element={<Navigate to="/student/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
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
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
