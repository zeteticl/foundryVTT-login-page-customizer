#!/usr/bin/env sh
ROOT="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
exec node "$ROOT/src/fvtt-login-patcher.mjs" "$@"
