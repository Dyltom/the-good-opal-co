FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat && corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
ARG PAYLOAD_SECRET
ARG QUOTE_LINK_SECRET
ARG CRON_SECRET
ARG NEXT_PUBLIC_APP_URL
ARG EMAIL_FROM
ARG CONTACT_EMAIL
ARG ADMIN_EMAIL
ARG RESEND_API_KEY
ARG DATABASE_URL
ARG UPLOAD_DIR
ARG STRIPE_SECRET_KEY
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ARG NEXT_PUBLIC_CLARITY_PROJECT_ID
ENV NEXT_OUTPUT=standalone NEXT_TELEMETRY_DISABLED=1 NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000 UPLOAD_DIR=/app/uploads
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs \
  && mkdir -p /app/uploads/media /app/uploads/ring-assets && chown -R nextjs:nodejs /app/uploads
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health >/dev/null || exit 1
CMD ["node", "server.js"]
