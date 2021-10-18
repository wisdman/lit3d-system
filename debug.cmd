@echo off
set N=%~1
IF "%N%"=="admin" (
  go run -mod=vendor ".\packages\admin" -crt=".\ssl\ecdsa.crt" -key=".\ssl\ecdsa.key" -app=".\packages\admin\app" -common=".\libs\common"
) ELSE IF "%N%"=="server" (
  go run -mod=vendor ".\packages\server" -crt=".\ssl\ecdsa.crt" -key=".\ssl\ecdsa.key" -app=".\packages\admin\app" -common=".\libs\common"
) ELSE IF "%N%"=="shell" (
  go run -mod=vendor ".\packages\shell" -crt=".\ssl\ecdsa.crt" -key=".\ssl\ecdsa.key" -app=".\packages\admin\app" -common=".\libs\common"
) ELSE (
  echo "Error first argument"
) 