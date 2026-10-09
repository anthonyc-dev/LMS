import { useAuthStore } from "@/app/store/authStore";
import { getRoleBasePath } from "@/shared/utils/roles";

export function useRoleBasePath(): string {
  const role = useAuthStore((state) => state.user?.role);
  return getRoleBasePath(role);
}
