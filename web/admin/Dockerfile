# Build stage
FROM node:22-alpine AS builder
RUN corepack enable pnpm

WORKDIR /app

# Copy monorepo files
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY tsconfig.base.json ./

# Copy packages
COPY packages ./packages

# Copy admin app
COPY web/admin ./web/admin

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Build packages first
WORKDIR /app/packages/domain
RUN pnpm run type-check || true

WORKDIR /app/packages/db
RUN pnpm run type-check || true

# Build admin app
WORKDIR /app/web/admin
RUN pnpm run build

# Production stage
FROM node:22-alpine AS runner
RUN corepack enable pnpm

WORKDIR /app

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

CMD ["node", "web/admin/server.js"]