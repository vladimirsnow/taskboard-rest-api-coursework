#!/usr/bin/env bash
# Переходит в папку курсовой и запускает сайт с локальной базой.
set -eu
cd -- "$(dirname -- "$0")"
if [[ ! -d node_modules ]]; then npm ci; fi
exec npm start
