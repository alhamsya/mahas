# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set API base URL to /api so requests go through Caddy's proxy
# This ensures it works regardless of the domain
ENV VITE_API_BASE_URL=/api

# Build the application
RUN npm run build

# Runtime stage
FROM caddy:alpine

# Install Node.js and NPM (required for Mockoon)
RUN apk add --no-cache nodejs npm

# Install mockoon-cli globally
RUN npm install -g @mockoon/cli

WORKDIR /app

# Copy build artifacts from builder stage
COPY --from=builder /app/dist ./dist

# Copy Mockoon environment file
COPY mockoon-mahas.json ./mockoon-mahas.json

# Copy Caddy configuration
COPY Caddyfile ./Caddyfile

# Copy startup script
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# Use start.sh to run both Mockoon and Caddy
CMD ["./start.sh"]
