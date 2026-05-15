import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

// Lazy load all pages
const LoginPage = lazy(() => import("./pages/LoginPage").then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import("./pages/RegisterPage").then(m => ({ default: m.RegisterPage })))
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })))
const AdminLayout = lazy(() => import("./layouts/AdminLayout").then(m => ({ default: m.AdminLayout })))
const BrowseBooksPage = lazy(() => import("./pages/admin/BrowseBooksPage").then(m => ({ default: m.BrowseBooksPage })))
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage").then(m => ({ default: m.AdminDashboardPage })))
const BorrowBooksPage = lazy(() => import("./pages/admin/BorrowBooksPage").then(m => ({ default: m.BorrowBooksPage })))
const BorrowingHistoryPage = lazy(() => import("./pages/admin/BorrowingHistoryPage").then(m => ({ default: m.BorrowingHistoryPage })))
const MyBooksPage = lazy(() => import("./pages/admin/MyBooksPage").then(m => ({ default: m.MyBooksPage })))
const ProfilePage = lazy(() => import("./pages/admin/ProfilePage").then(m => ({ default: m.ProfilePage })))
const SettingsPage = lazy(() => import("./pages/admin/SettingsPage").then(m => ({ default: m.SettingsPage })))
const SchedulePage = lazy(() => import("./pages/admin/SchedulePage").then(m => ({ default: m.SchedulePage })))

// Premium Loading Spinner
const LoadingSpinner = () => (
  <div className="flex h-svh w-full items-center justify-center bg-[#0f172a]">
    <div className="relative flex h-20 w-20 items-center justify-center">
      <div className="absolute h-full w-full rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
      <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm animate-pulse" />
    </div>
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
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
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
