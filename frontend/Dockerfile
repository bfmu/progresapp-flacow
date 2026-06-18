FROM node:lts AS builder
WORKDIR /app

# Copy workspace manifest files
COPY package.json package-lock.json ./
# Copy shared package (workspace dependency)
COPY packages/shared/ ./packages/shared/
# Copy frontend source
COPY frontend/ ./frontend/

# Install all workspace deps from root (resolves @progresapp/shared locally)
RUN npm ci

ARG PUBLIC_API_BASE_URL
ENV PUBLIC_API_BASE_URL=${PUBLIC_API_BASE_URL}

WORKDIR /app/frontend
RUN npm run build

FROM node:lts-slim AS runtime
WORKDIR /app

# Copy built output
COPY --from=builder /app/frontend/dist ./frontend/dist
# Copy workspace node_modules (includes @progresapp/shared symlink target)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/frontend/package.json ./frontend/

WORKDIR /app/frontend
ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321
CMD node ./dist/server/entry.mjs
