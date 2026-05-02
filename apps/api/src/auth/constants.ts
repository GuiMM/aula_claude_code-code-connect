// TODO: mover para variável de ambiente em produção (ex.: process.env.JWT_SECRET).
export const jwtConstants = {
  secret: 'dev-secret-do-not-use-in-production',
  expiresIn: '1h',
} as const;
