package core

import (
  "encoding/json"
  "log"
  "os"
  "path/filepath"
)

type Texture struct {
  Id  uint8  `json:"id"`
  Url string `json:"url"`
}

type FrameTexture struct {
  Id    uint8      `json:"id"`
  Cords [4]float32 `json:"cords"`
}

type Frame struct {
  Id       uint8          `json:"id"`
  Corners  [8]uint16      `json:"corners"`
  Size     [2]uint16      `json:"size"`
  Textures []FrameTexture `json:"social"`
}

type Mapping struct {
  Id          string    `json:"id"`
  Location    [2]uint16 `json:"location"`
  FrameList   []Frame   `json:"frameList"`
  TextureList []Texture `json:"textureList"`
  Url         string    `json:"url"`
}

type Config struct {
  Id      string     `json:"id"`
  Mapping *[]Mapping `json:"mapping"`
  VVVV    *string    `json:"vvvv"`
}

const configPath = "./content/content.json"
var configAbs string

func init() {
	var err error
	configAbs, err = filepath.Abs(configPath)
	if err != nil {
		log.Fatalf("Incorrect content config file path: %v\n", err)
	}
}

func GetConfig() *Config {
	file, err := os.OpenFile(configAbs, os.O_RDONLY|os.O_CREATE, 0644)
	if err != nil {
    log.Printf("Incorrect config file: %v\n", err)
		return &Config{}
  }
  defer file.Close()

  var config Config
  jsonParser := json.NewDecoder(file)
  if err = jsonParser.Decode(&config); err != nil {
    log.Printf("Incorrect config json: %v\n", err)
    return &Config{}
  }

  return &config
}

// func SetConfig(config Config) error {

// }

func Run()  {
  config := GetConfig()
  
  b, err := json.Marshal(config)
  if err != nil {
    log.Println(err)
  } else {
    log.Printf("Run config: %+v\n", string(b))
  }

  if config.VVVV != nil {
    log.Printf("Run VVVV with %s\n", *config.VVVV)
    VVVV(*config.VVVV)
  }

  if config.Mapping != nil && len(*config.Mapping) > 0 {
    log.Printf("Run Chrome with url %s\n", "https://localhost")
    Chrome("https://localhost")
  }
}