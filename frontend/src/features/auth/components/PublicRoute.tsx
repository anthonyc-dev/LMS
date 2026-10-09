import { useAuthStore } from "@/app/store/authStore";
import { Navigate } from "react-router-dom";
import { getRoleDashboardPath } from "@/shared/utils/roles";

export default function PublicRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to={getRoleDashboardPath(user?.role)} replace />;
  }

  return <>{children}</>;
}
