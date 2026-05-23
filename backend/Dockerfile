# ==========================================
# Base
# ==========================================
FROM node:22-alpine AS base

RUN apk add --no-cache python3 make g++ gcc

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

# ==========================================
# Development
# ==========================================
FROM base AS development

ENV NODE_ENV=development

RUN pnpm install --dangerously-allow-all-builds

COPY . .

EXPOSE 3000

CMD ["pnpm", "run", "start:dev"]

# ==========================================
# Build
# ==========================================
FROM base AS build

RUN pnpm install --frozen-lockfile --dangerously-allow-all-builds

COPY . .

RUN pnpm run build

RUN pnpm prune --prod

# ==========================================
# Production
# ==========================================
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:3000/health || exit 1

EXPOSE 3000

CMD ["node", "dist/main"]