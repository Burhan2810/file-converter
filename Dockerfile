# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Copy public + static into standalone (required by standalone server.js)
RUN cp -r public .next/standalone/public
RUN cp -r .next/static .next/standalone/.next/static

# ── Stage 2: Production ────────────────────────────────────────
FROM node:20-slim AS runner

WORKDIR /app

# Install ONLY the system deps we need, with aggressive cleanup
RUN apt-get update && apt-get install -y --no-install-recommends \
      libreoffice-writer \
      libreoffice-calc \
      libreoffice-impress \
      ghostscript \
      ffmpeg \
      fonts-dejavu \
      fonts-liberation \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
  && rm -rf /usr/share/doc /usr/share/man /usr/share/locale

# Create a writable tmp dir for conversions
RUN mkdir -p /tmp/conversions && chmod 777 /tmp/conversions

# Copy only the standalone build output (no node_modules bloat)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Environment
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

EXPOSE 3000

# Health check so Render knows the app is alive
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://localhost:3000').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]
