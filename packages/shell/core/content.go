package core

import (
  "encoding/json"
  "log"
  "fmt"
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
  Textures []FrameTexture `json:"textures"`
}

type Mapping struct {
  Id          string    `json:"id"`
  Location    [2]int16  `json:"location"`
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

func SetConfig(config *Config) error {
  file, err := os.OpenFile(configAbs, os.O_WRONLY|os.O_CREATE, 0644)
  if err != nil {
    return fmt.Errorf("Incorrect config file: %v\n", err)
  }
  defer file.Close()

  err = json.NewEncoder(file).Encode(config)
  if err != nil {
    return fmt.Errorf("Incorrect config write: %v\n", err)
  }
  return nil
} 

func NewConfig(id string) *Config {
  log.Printf("Generate new config...")

  var err error
  if (id == "") {
    id, err = GetID()
    if err != nil {
      log.Printf("Incorrect new config get id: %v\n", err)
      id = "Undefined"
    }

    id = id + "_Mapping"
  }

  config := &Config{
    Id: id,
  }

  locations := GetLocations()
  log.Printf("Locations: %v\n", locations)

  var mapping []Mapping
  for i, l := range locations {
    mapping = append(mapping, Mapping{
      Id: fmt.Sprintf("%d", i+1),
      Location: l,
    })
  }

  if len(mapping) > 0 {
    config.Mapping = &mapping
  }

  err = SetConfig(config)
  if err != nil {
    log.Printf("Set config error: %v\n", err)
  }

  return config
}

func Run()  {
  config := GetConfig()

  if (config.VVVV == nil && config.Mapping == nil) {
    config = NewConfig(config.Id)
  }
  
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
    log.Printf("Clear Chrome data directory")

    err = os.RemoveAll(ChromeDataAbs)
    if err != nil {
      log.Printf("Clear Chrome data directory error: %v\n", err)
    }

    err = os.MkdirAll(ChromeDataAbs, 0666)
    if err != nil {
      log.Printf("Make Chrome data directory error: %v\n", err)
    }

    log.Printf("Run Chrome with url %s\n", "https://localhost")
    for num, value := range *config.Mapping {
      Chrome(
        fmt.Sprintf("https://localhost#%s", value.Id),
        uint8(num),
        value.Location[0],
        value.Location[1],
      )
    }
  }
}