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

	"github.com/wisdman/lit3d-system/packages/shell/api"
	"github.com/wisdman/lit3d-system/packages/shell/core"
)

//go:embed app/*
var appEmbedFS embed.FS
var appFS, _ = fs.Sub(appEmbedFS, "app")

func main() {

	var certFile, keyFile string
  flag.StringVar(&certFile, "crt", "./ssl/localhost.crt", "TLS localhost certificate path")
  flag.StringVar(&keyFile, "key", "./ssl/localhost.key", "TLS localhost private key path")

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

	dir, err := os.Getwd()
	if err != nil {
		log.Fatalf("Incorrect run directory: %v\n", err)
	}

	srv.FS("/content/", http.Dir(dir))

	api := &api.API{ srv.API("/api") }
	api.GET("/shutdown", api.Shutdown)
	api.GET("/restart", api.Restart)
	api.GET("/id", api.GetID)
	api.POST("/id", api.SetID)
	api.GET("/screens", api.GetScreens)
	
	srv.ListenAndServe()

	core.Run()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	srv.Shutdown()
}


