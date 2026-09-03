FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache curl
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
RUN pnpm install --frozen-lockfile

COPY apps/backend ./apps/backend

WORKDIR /app/apps/backend
EXPOSE 4000
CMD ["sh", "-c", "node src/db/migrate.ts && node src/db/seed.ts && pnpm dev"]
