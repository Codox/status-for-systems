# -------- BUILD STAGE --------
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY app/package.json app/package-lock.json ./
RUN npm ci

# Build the Next.js app
COPY app/ ./
RUN npm run build


# -------- RUNNER STAGE --------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone server output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Correct location for static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./public/_next/static

# Public folder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
