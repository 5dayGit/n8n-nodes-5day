########################################################################
# n8n + 5day.io Custom Node – Production Docker Image
#
# Build:
#   docker build -t your-registry/n8n-5day:1.122.1-0.1.0 .
#
# Run locally:
#   docker run -it --rm -p 5678:5678 \
#     -e N8N_ENCRYPTION_KEY=<secret> \
#     your-registry/n8n-5day:1.122.1-0.1.0
########################################################################

##################################################################
# Stage 1 – Builder
# Compiles TypeScript sources and packs a redistributable tarball
##################################################################
FROM node:20-alpine AS builder

WORKDIR /build

# Copy dependency manifests first – maximises Docker layer cache reuse.
COPY package.json ./

# Install ALL dependencies (devDeps needed for the build toolchain).
# Use `npm install` (not `npm ci`) so npm resolves the correct platform-specific
# native binaries for Alpine/Linux instead of using a Windows-generated lock file.
# Do NOT use --ignore-scripts: napi-postinstall must run to select the right binary
# for the @unrs/resolver native module used by @n8n/node-cli.
RUN npm install

# Copy remaining source files
COPY tsconfig.json       ./
COPY nodes/              ./nodes/
COPY credentials/        ./credentials/
COPY icons/              ./icons/

# 1. Compile TypeScript → dist/
# 2. Pack into a portable .tgz artefact for clean npm installation
RUN npm run build \
 && npm pack

##################################################################
# Stage 2 – Production image
# Extends the official n8n image; adds only the built custom node
##################################################################
FROM n8nio/n8n:1.122.1

# ── OCI / Docker Hub labels ────────────────────────────────────
LABEL org.opencontainers.image.title="n8n with 5day.io Custom Node"
LABEL org.opencontainers.image.description="n8n workflow automation extended with the 5day.io project-management node"
LABEL org.opencontainers.image.version="1.122.1-5day-0.1.0"
LABEL org.opencontainers.image.vendor="5day.io"
LABEL org.opencontainers.image.base.name="docker.io/n8nio/n8n:1.122.1"

# ── Enable community/custom nodes ──────────────────────────────
# N8N_CUSTOM_EXTENSIONS: n8n always scans this directory on startup and
# loads any packages found there, regardless of the internal packages database.
# This is the reliable approach for nodes pre-baked into a Docker image.
# N8N_COMMUNITY_PACKAGES_ENABLED also set so the UI feature works too.
ENV N8N_CUSTOM_EXTENSIONS=/home/node/.n8n/custom \
    N8N_COMMUNITY_PACKAGES_ENABLED=true

# ── Install the custom package ─────────────────────────────────
USER root

RUN mkdir -p /home/node/.n8n/custom \
 && chown -R node:node /home/node/.n8n

# Bring the packed artefact from the builder stage
COPY --from=builder /build/n8n-nodes-5day-*.tgz /tmp/n8n-nodes-5day.tgz

USER node
WORKDIR /home/node/.n8n/custom

# Install into the custom extensions directory.
# n8n scans N8N_CUSTOM_EXTENSIONS/node_modules/ unconditionally on every start.
RUN npm install /tmp/n8n-nodes-5day.tgz \
 && npm cache clean --force

# ── Cleanup ────────────────────────────────────────────────────
USER root
RUN rm -f /tmp/n8n-nodes-5day.tgz
USER node

# ── Runtime ────────────────────────────────────────────────────
WORKDIR /home/node

# n8n web / webhook port
EXPOSE 43040

# ── Health check ───────────────────────────────────────────────
# Used by Kubernetes liveness and readiness probes.
# n8n exposes GET /healthz (added in n8n 0.211+) which returns 200
# when the server is ready to handle traffic.
HEALTHCHECK --interval=30s \
            --timeout=10s \
            --start-period=60s \
            --retries=3 \
            CMD wget --no-verbose --tries=1 --spider \
                http://localhost:43040/healthz || exit 1

# ── Entrypoint / Command ────────────────────────────────────────
# Keep the parent image's ENTRYPOINT (tini → /docker-entrypoint.sh)
# so that tini acts as PID 1 and forwards SIGTERM to n8n correctly.
# This guarantees graceful shutdown when Kubernetes terminates the pod.
#
# Override only CMD so that extra flags can still be injected via
# the Kubernetes pod spec `args:` field without touching ENTRYPOINT.
CMD ["start"]
