package api

import (
  "encoding/json"
  "log"
  "net/http"
  "os"
  "path/filepath"

  "github.com/wisdman/lit3d-system/libs/service"
)

type Node struct {
  Id    string `json:"id"`
  Group string `json:"group"`
}

type Config struct {
  Nodes []Node `json:"nodes"`
}

const configPath = "./config.json"
var configAbs string

func init() {
	var err error
	configAbs, err = filepath.Abs(configPath)
	if err != nil {
		log.Fatalf("Incorrect config file path: %v\n", err)
	}
}

func (api *API) GetConfig(w http.ResponseWriter, r *http.Request) {
  file, err := os.OpenFile(configAbs, os.O_RDONLY|os.O_CREATE, 0644)
  if err != nil {
    log.Printf("Incorrect config file: %v\n", err)
    service.ResponseJSON(w, &Config{})
    return
  }
  defer file.Close()

  var config Config
  jsonParser := json.NewDecoder(file)
  if err = jsonParser.Decode(&config); err != nil {
    log.Printf("Incorrect config json: %v\n", err)
    service.ResponseJSON(w, &Config{})
    return
  }

  service.ResponseJSON(w, &config)
  return
}
