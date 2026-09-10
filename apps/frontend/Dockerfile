FROM node:22-alpine
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/package.json ./apps/frontend/
RUN pnpm install --frozen-lockfile

COPY apps/frontend ./apps/frontend

WORKDIR /app/apps/frontend

# NEXT_PUBLIC_API_URL est fige dans le bundle client au moment du build : c'est
# l'URL que le NAVIGATEUR appellera, donc celle publiee sur l'hote et non le nom
# de service Docker.
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# `next build` directement plutot que `pnpm build` : le script prebuild
# regenere le changelog depuis git, absent de l'image (.dockerignore), et
# ecraserait lib/changelog.json par un fichier vide.
RUN pnpm exec next build

ENV NODE_ENV=production

EXPOSE 3000
CMD ["pnpm", "start"]
