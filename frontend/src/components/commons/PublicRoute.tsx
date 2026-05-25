import { useAuthStore } from "@/store/authStore";
import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/student/dashboard" replace />;
  }

  return <>{children}</>
}