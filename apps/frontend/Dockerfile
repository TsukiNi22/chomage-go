FROM node:22-alpine
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/package.json ./apps/frontend/
RUN pnpm install --frozen-lockfile

COPY apps/frontend ./apps/frontend

WORKDIR /app/apps/frontend
EXPOSE 3000
CMD ["pnpm", "dev"]
