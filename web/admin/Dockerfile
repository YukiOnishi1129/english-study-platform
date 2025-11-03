# Build stage
FROM node:22-slim AS base

ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH="${PNPM_HOME}:${PATH}"

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable

WORKDIR /app

FROM base AS deps

WORKDIR /app

# Copy monorepo files
# root lockfiles / monorepo metadata
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json turbo.json ./
COPY packages/package.json packages/
COPY web/admin/package.json web/admin/
COPY web/client/package.json web/client/

RUN pnpm install --frozen-lockfile

FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /root/.local/share/pnpm /root/.local/share/pnpm
COPY . .

RUN pnpm install --frozen-lockfile --offline \
  && pnpm --filter admin... build

FROM base AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/web/admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/web/admin/.next/static ./web/admin/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/web/admin/public ./web/admin/public

USER nextjs

EXPOSE 3000

ENV PORT 3000

ENV HOSTNAME="0.0.0.0"
CMD ["node", "web/admin/server.js"]
