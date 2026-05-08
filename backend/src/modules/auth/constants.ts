function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const jwtConstants = {
  secret: getEnvOrThrow('JWT_SECRET'),
  refreshSecret: getEnvOrThrow('JWT_REFRESH_SECRET'),
  refreshExpiresIn: '7d' as const,
};
