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
	"github.com/wisdman/lit3d-system/packages/shell/client"
	"github.com/wisdman/lit3d-system/packages/shell/core"
)

//go:embed app/*
var appEmbedFS embed.FS
var appFS, _ = fs.Sub(appEmbedFS, "app")

func main() {
	var certFile, keyFile string
  flag.StringVar(&certFile, "crt", "./ssl/server.crt", "TLS localhost server certificate path")
  flag.StringVar(&keyFile, "key", "./ssl/server.key", "TLS localhost server private key path")

  var appDir, commonDir string
  flag.StringVar(&appDir, "app", "", "App directory path")
  flag.StringVar(&commonDir, "common", "", "Common directory path")

  verbose := flag.Bool("v", false, "Verbose log")
  server := flag.Bool("ds", false, "Debug server only")

  flag.Parse()

  if *verbose != true {
		logAbs, err := filepath.Abs("./shell.log")
		if err != nil {
			log.Fatalf("Incorrect log file path: %v\n", err)
		}

		logFile, err := os.OpenFile(logAbs, os.O_RDWR | os.O_CREATE | os.O_APPEND, 0666)
		if err != nil {
		  log.Fatalf("Error opening log file: %v\n", err)
		}
		defer logFile.Close()

		log.SetOutput(logFile)
	}

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
	api.GET("/reload", api.Reload)
	api.GET("/stop", api.Stop)
	api.GET("/id", api.GetID)
	api.POST("/id", api.SetID)
	api.GET("/screens", api.GetScreens)
	api.GET("/config", api.GetConfig)
	api.POST("/config", api.SaveConfig)
	
	srv.ListenAndServe()

	var id string
	id, err = core.GetID()
	if err != nil {
		id = core.RandomID()
	}

	if (*server == false) {
		client := sseclient.New("https://future.rmh.local/api/bus/events/ticket-to-the-future/" + id)
		go func(){
			for {
				select {
				case command := <- client.Bus:
					switch command.Type {
					case "show-id":
						core.ShowId()
					case "shutdown":
						core.Shutdown()
					case "restart":
						core.Restart()
					case "reload":
						core.Reload()
					case "stop":
						core.Stop()
					}
				}	
			}
		}()
	
		core.Reload()
		// core.Run()
	}

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	srv.Shutdown()
}


