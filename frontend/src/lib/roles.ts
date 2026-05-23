export const hasRole = (
    userRoles: string[],
    allowedRoles: string[]
) => {
    return allowedRoles.some((role) =>
        userRoles.includes(role)
    );
};