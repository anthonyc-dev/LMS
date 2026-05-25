import { useAuthStore } from "@/store/authStore";
import { AdminDashboardPage } from "./admin/AdminDashboardPage";
import { FacultyDashboardPage } from "./faculty/FacultyDashboardPage";
import { StudentDashboardPage } from "./student/StudentDashboardPage";

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
