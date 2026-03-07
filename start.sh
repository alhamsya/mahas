#!/bin/sh

echo "Starting Mockoon on port 3001..."
# Start Mockoon in background
mockoon-cli start --data ./mockoon-mahas.json --port 3001 &

# Wait for Mockoon to initialize
sleep 5

echo "Starting Caddy on port ${PORT:-8080}..."
# Start Caddy in foreground
caddy run --config Caddyfile --adapter caddyfile
