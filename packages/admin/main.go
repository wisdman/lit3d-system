package main

import (
	"embed"
	"flag"
	"io/fs"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"

	"github.com/wisdman/lit3d-system/libs/common"
	"github.com/wisdman/lit3d-system/libs/service"

	"github.com/wisdman/lit3d-system/packages/admin/api"
)

//go:embed app/*
var appEmbedFS embed.FS
var appFS, _ = fs.Sub(appEmbedFS, "app")

func main() {

	var certFile, keyFile string
  flag.StringVar(&certFile, "crt", "./ssl/server.crt", "TLS server certificate path")
  flag.StringVar(&keyFile, "key", "./ssl/server.key", "TLS server private key path")

  var appDir, commonDir string
  flag.StringVar(&appDir, "app", "", "App directory path")
  flag.StringVar(&commonDir, "common", "", "Common directory path")

  flag.Parse()

	srv := service.New(certFile, keyFile)
	
	if (appDir != "") {
		appDir, err := filepath.Abs(appDir)
		if err != nil {
			log.Fatalf("Incorrect App directory path: %v\n", err)
		}
		srv.FS("/", http.Dir(appDir))
	} else {
		srv.FS("/", http.FS(appFS))
	}

	if (commonDir != "") {
		commonDir, err := filepath.Abs(commonDir)
		if err != nil {
			log.Fatalf("Incorrect Common directory path: %v\n", err)
		}
		srv.FS("/common/", http.Dir(commonDir))
	} else {
		srv.FS("/common/", http.FS(common.FS))
	}

	api := &api.API{ srv.API("/api") }
	api.GET("/node/:id/:command", api.GetNode)
	
	srv.ListenAndServe()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	srv.Shutdown()
}
