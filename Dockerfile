# syntax=docker/dockerfile:1.7

# ─── build stage ────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Install deps with cache mount + reproducible install
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# Copy source and build
COPY . .
RUN npm run build

# ─── runtime stage ──────────────────────────────────────────────────────────
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

# Drop default nginx config + bring in our SPA-aware one
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static assets
COPY --from=build /app/dist /usr/share/nginx/html

# Embed a tiny build metadata file for health/version checks
ARG GIT_SHA=unknown
ARG BUILD_TIME=unknown
LABEL org.opencontainers.image.title="VeltaCore ITSM" \
      org.opencontainers.image.description="VeltaCore ITSM Incident Platform — multi-tenant ITSM, AI RCA, CMDB graph, runbook automation." \
      org.opencontainers.image.source="https://github.com/finspot/veltacore-itsm" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.created="${BUILD_TIME}"

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- --tries=1 --timeout=2 http://127.0.0.1:8080/healthz || exit 1
