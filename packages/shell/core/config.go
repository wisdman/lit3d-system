package core

// import (
// 	"bufio"
// 	"log"
// 	"os"
// 	"path/filepath"
// )

// const configPath = "./content/config.json"
// var configAbs string

// func init() {
// 	var err error
// 	configAbs, err = filepath.Abs(configPath)
// 	if err != nil {
// 		log.Fatalf("Incorrect content config file path: %v\n", err)
// 	}
// }

// func GetConfig() (string, error) {
// 	file, err := os.OpenFile(configAbs, os.O_RDONLY|os.O_CREATE, 0644)
// 	if err != nil {
// 		return "", err
//   }
//   defer file.Close()

//   var id string
//   scanner := bufio.NewScanner(file)
//  	if scanner.Scan() == true {
//  		id = scanner.Text()
//  	}

//  	if err := scanner.Err(); err != nil {
//     return "", err
//   }

//   return id, nil
// }

// func SetConfig(id string) error {
// 	// file, err := os.OpenFile(idAbs, os.O_WRONLY|os.O_CREATE, 0644)
// 	// if err != nil {
// 	// 	return err
//  //  }
//  //  defer file.Close()

//  //  writer := bufio.NewWriter(file)
//  //  _, err = writer.WriteString(id)
//  //  if err != nil {
// 	// 	return err
//  //  }
  
//  //  return nil
// }
