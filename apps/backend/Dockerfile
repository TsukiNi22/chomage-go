FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache curl
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
RUN pnpm install --frozen-lockfile

COPY apps/backend ./apps/backend

WORKDIR /app/apps/backend

# Compilation TypeScript -> dist/. Sans elle, l'image servait les sources via
# `tsx`, qui recompile a l'execution : le profilage V8 montrait ~750 ms de
# chargement/compilation de modules pour 60 requetes.
RUN pnpm build

# Apres l'install et le build, sinon pnpm sauterait les devDependencies
# necessaires a tsc.
ENV NODE_ENV=production

EXPOSE 4000
CMD ["sh", "-c", "node dist/db/migrate.js && node dist/db/seed.js && node dist/server.js"]
