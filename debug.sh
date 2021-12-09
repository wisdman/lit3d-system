#!/bin/sh

ENV_DIR="$(dirname "$( cd "$(dirname "$0")" ; pwd -P )")"
PGDATABASE=oitp

case "$1" in
  admin)
    PORT=443
    eval 'go run -mod=vendor ./packages/admin -crt="./ssl/server.crt" -key="./ssl/server.key" -app="./packages/admin/app" -common="./libs/common"'
    ;;
  server)
    PORT=443
    eval 'go run -mod=vendor ./packages/server -crt="./ssl/server.crt" -key="./ssl/server.key" -app="./packages/admin/app" -common="./libs/common"'
    ;;
  shell)
    PORT=443
    eval 'go run -mod=vendor ./packages/shell -crt="./ssl/server.crt" -key="./ssl/server.key" -app="./packages/admin/app" -common="./libs/common"'
    ;;
  *)
    echo "Error first argument" >&2
    exit 1
    ;;
esac