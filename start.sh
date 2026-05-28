#!/bin/sh
# Robust process supervisor for Mockoon + Caddy on Railway.
# Exits non-zero if either process fails to start.

set -eu

# Railway sets PORT. Provide a default for local docker runs.
export PORT="${PORT:-8080}"
export MOCKOON_PORT="${MOCKOON_PORT:-3001}"
MOCKOON_FILE="${MOCKOON_FILE:-./mockoon-mahas.json}"

if [ ! -f "$MOCKOON_FILE" ]; then
  echo "[start.sh] FATAL: Mockoon data file not found at $MOCKOON_FILE" >&2
  exit 1
fi

cleanup() {
  echo "[start.sh] caught signal, shutting down..."
  if [ -n "${MOCKOON_PID:-}" ] && kill -0 "$MOCKOON_PID" 2>/dev/null; then
    kill -TERM "$MOCKOON_PID" 2>/dev/null || true
    wait "$MOCKOON_PID" 2>/dev/null || true
  fi
  if [ -n "${CADDY_PID:-}" ] && kill -0 "$CADDY_PID" 2>/dev/null; then
    kill -TERM "$CADDY_PID" 2>/dev/null || true
    wait "$CADDY_PID" 2>/dev/null || true
  fi
  exit 0
}
trap cleanup INT TERM

echo "[start.sh] launching Mockoon on 127.0.0.1:${MOCKOON_PORT}..."
# --disable-log-to-file (-X) prevents log writes to the home directory,
# which can fail in containerized read-only setups.
mockoon-cli start \
  --data "$MOCKOON_FILE" \
  --port "$MOCKOON_PORT" \
  --hostname 127.0.0.1 \
  --disable-log-to-file &
MOCKOON_PID=$!

# Wait for Mockoon to bind the port. A TCP connect is enough; we don't
# care about the HTTP status because Mockoon responds 404 on '/'.
echo "[start.sh] waiting for Mockoon to be ready..."
ATTEMPTS=60
i=0
while [ "$i" -lt "$ATTEMPTS" ]; do
  if ! kill -0 "$MOCKOON_PID" 2>/dev/null; then
    echo "[start.sh] FATAL: Mockoon process exited before becoming ready" >&2
    exit 1
  fi
  if wget -q -O /dev/null --tries=1 --timeout=1 \
       "http://127.0.0.1:${MOCKOON_PORT}/" 2>/dev/null \
     || [ "$?" = "8" ]; then
    # exit code 8 = server returned non-2xx (e.g. 404), which means the
    # HTTP server is up and responding.
    echo "[start.sh] Mockoon is responding"
    break
  fi
  i=$((i + 1))
  sleep 1
done

if [ "$i" -ge "$ATTEMPTS" ]; then
  echo "[start.sh] FATAL: Mockoon did not become ready within ${ATTEMPTS}s" >&2
  exit 1
fi

echo "[start.sh] launching Caddy on 0.0.0.0:${PORT}..."
caddy run --config Caddyfile --adapter caddyfile &
CADDY_PID=$!

# Poll both children. If either exits we tear down the other and propagate
# a non-zero status so Railway restarts the container.
EXIT_CODE=0
while :; do
  if ! kill -0 "$MOCKOON_PID" 2>/dev/null; then
    echo "[start.sh] Mockoon exited; shutting down" >&2
    EXIT_CODE=1
    break
  fi
  if ! kill -0 "$CADDY_PID" 2>/dev/null; then
    echo "[start.sh] Caddy exited; shutting down" >&2
    EXIT_CODE=1
    break
  fi
  sleep 2
done

cleanup
exit "$EXIT_CODE"
