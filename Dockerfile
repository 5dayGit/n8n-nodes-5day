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
# The heavy npm ci layer is only invalidated when package(-lock).json changes.
COPY package.json package-lock.json ./

# Install ALL dependencies (devDeps needed for the build toolchain).
# --ignore-scripts prevents postinstall scripts from running in CI.
RUN npm ci --ignore-scripts

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

# ── Install the custom package ─────────────────────────────────
# IMPORTANT: We install to /n8n-custom-nodes (NOT /home/node/.n8n)
# because /home/node/.n8n is overwritten by the Kubernetes PVC volume.
# N8N_CUSTOM_EXTENSIONS must be set to /n8n-custom-nodes at runtime.
USER root

RUN mkdir -p /n8n-custom-nodes \
 && chown -R node:node /n8n-custom-nodes

# Bring the packed artefact from the builder stage
COPY --from=builder /build/n8n-nodes-5day-*.tgz /tmp/n8n-nodes-5day.tgz

USER node
WORKDIR /n8n-custom-nodes

# Install the tarball outside the volume-mounted path so it is never shadowed.
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
