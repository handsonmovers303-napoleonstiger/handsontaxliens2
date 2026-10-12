#!/bin/sh
set -eu
cd /workspace/hotl
if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  exit 0
fi
npm run dev -- --host 0.0.0.0 --port 8080 >>/tmp/hotl-dev.log 2>&1 &
