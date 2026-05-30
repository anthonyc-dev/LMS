import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import { usePageTitle } from "@/hooks/usePageTitle";

export function UnauthorizedPage() {
  usePageTitle("Unauthorized");
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleGoBack = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Error during unauthorized logout:", error);
    } finally {
      logout();
      navigate("/login");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f172a] p-4 text-center">
      <div className="flex flex-col items-center space-y-6 rounded-2xl bg-[#1e293b] p-10 border border-white/10 shadow-2xl">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-500/20">
          <ShieldAlert className="h-12 w-12 text-red-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl">Access Denied</h1>
          <p className="text-gray-400 max-w-[300px] mx-auto">
            You don't have permission to view this page. Please log out and log in with an authorized account.
          </p>
        </div>

        <button
          onClick={handleGoBack}
          className="mt-8 rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 transition-all hover:bg-blue-500 hover:scale-105 active:scale-95"
        >
          Log Out & Go to Login
        </button>
      </div>
    </div>
  );
}
