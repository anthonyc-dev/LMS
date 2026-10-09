const ROLE_BASE_PATHS = {
  admin: "/admin",
  faculty: "/faculty",
  student: "/student",
} as const;

export type AppRole = keyof typeof ROLE_BASE_PATHS;

export const hasRole = (userRoles: string[], allowedRoles: string[]) =>
  allowedRoles.some((role) => userRoles.includes(role));

export function getRoleBasePath(role?: string): string {
  return role && role in ROLE_BASE_PATHS
    ? ROLE_BASE_PATHS[role as AppRole]
    : ROLE_BASE_PATHS.student;
}

export function getRoleDashboardPath(role?: string): string {
  return `${getRoleBasePath(role)}/dashboard`;
}
