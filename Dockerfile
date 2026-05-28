# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV VITE_API_BASE_URL=/api
RUN npm run build

# Runtime stage
FROM caddy:2-alpine

# Node + tini + Mockoon CLI for serving the mock API.
# tini gives us proper PID 1 signal handling on Railway.
RUN apk add --no-cache nodejs npm tini wget \
 && npm install -g @mockoon/cli@9.6.1 \
 && npm cache clean --force

WORKDIR /app

# Mockoon writes runtime/log data under $HOME. Make sure it points to a
# writable directory that exists in the image.
ENV HOME=/app
ENV XDG_CONFIG_HOME=/app/.config
ENV XDG_DATA_HOME=/app/.local/share
RUN mkdir -p /app/.config /app/.local/share /app/logs

COPY --from=builder /app/dist ./dist
COPY mockoon-mahas.json ./mockoon-mahas.json
COPY Caddyfile ./Caddyfile
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

EXPOSE 8080
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["./start.sh"]
