# ============================================================================
# LXD360 Ecosystem - Cloud Run Dockerfile
# ============================================================================
# This file tells Cloud Build how to build and run the Next.js app
# No Docker Desktop required - Cloud Build runs this on Google's servers
# ============================================================================

FROM node:22-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# ============================================================================
# Dependencies stage
# ============================================================================
FROM base AS deps
WORKDIR /app

# Copy workspace config
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy all package.json files for workspace resolution
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/
COPY packages/ml/package.json ./packages/ml/
COPY packages/xapi-client/package.json ./packages/xapi-client/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# ============================================================================
# Builder stage
# ============================================================================
FROM base AS builder
WORKDIR /app

# Increase Node.js memory for large builds (default is ~2GB, we need more)
ENV NODE_OPTIONS="--max-old-space-size=8192"

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=deps /app/packages/ml/node_modules ./packages/ml/node_modules
COPY --from=deps /app/packages/xapi-client/node_modules ./packages/xapi-client/node_modules

# Copy source code
COPY . .

# Build the packages first (types, ml, xapi-client)
RUN pnpm --filter @inspire/types build || true
RUN pnpm --filter @inspire/ml build || true
RUN pnpm --filter @inspire/xapi-client build || true

# Build the web app
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_PUBLIC_CLOUD_RUN=true

# Firebase Client SDK (must be set at build time for client-side JS)
ENV NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDhMXHC1OAZ_DEPsIJxqcuysUkP0_DTN-o
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=lxd-saas-dev.firebaseapp.com
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=lxd-saas-dev
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=lxd360-course-assets
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=203150315202
ENV NEXT_PUBLIC_FIREBASE_APP_ID=1:203150315202:web:e596c12d1b1b7100b2b55b

RUN pnpm --filter @lxd360/web build

# ============================================================================
# Runner stage
# ============================================================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
