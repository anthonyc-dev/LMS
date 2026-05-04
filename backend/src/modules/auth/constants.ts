export const jwtConstants = {
  secret:
    process.env.JWT_SECRET ||
    'your-super-secret-access-token-key-change-in-production',
  refreshSecret:
    process.env.JWT_REFRESH_SECRET ||
    'your-super-secret-refresh-token-key-change-in-production',
  refreshExpiresIn: '7d' as const,
};
