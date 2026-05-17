import { hasRole } from "@/lib/roles";
import { useAuthStore } from "@/store/authStore";


type Props = {
    roles: string[];
    children: React.ReactNode;
};

export const Can = ({ roles, children }: Props) => {
    const user = useAuthStore((s) => s.user);

    if (!user) return null;

    if (!hasRole([user.role!], roles)) return null;

    return <>{children}</>;
};