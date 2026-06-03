import { useAuthStore } from "@/app/store/authStore";
import { AdminDashboardPage } from "./AdminDashboardPage";
import { FacultyDashboardPage } from "./FacultyDashboardPage";
import { StudentDashboardPage } from "./StudentDashboardPage";

export function DashboardPage() {
  const { user } = useAuthStore();

  if (user?.role === "admin") {
    return <AdminDashboardPage />;
  }

  if (user?.role === "faculty") {
    return <FacultyDashboardPage />;
  }

  // Default to student dashboard
  return <StudentDashboardPage />;
}
