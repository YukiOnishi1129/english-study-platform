FROM node:22-slim AS base

ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH="${PNPM_HOME}:${PATH}"

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable

WORKDIR /app

FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json turbo.json ./
COPY packages/package.json packages/
COPY web/client/package.json web/client/
COPY web/admin/package.json web/admin/

RUN pnpm install --frozen-lockfile

FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /root/.local/share/pnpm /root/.local/share/pnpm
COPY . .

RUN pnpm --filter client... build

FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3000

RUN groupadd --system nextjs && useradd --system --create-home --gid nextjs nextjs

WORKDIR /app

COPY --from=builder /app/web/client/.next/standalone ./
COPY --from=builder /app/web/client/.next/static ./web/client/.next/static
COPY --from=builder /app/web/client/public ./public

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
