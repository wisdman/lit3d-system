package core

import (
	"encoding/json"
	"log"
	"os/exec"
)

type Bounds struct {
  X 		 int16 `json:"X"`
  Y 		 int16 `json:"Y"`
  Width  int16 `json:"Width"`
  Height int16 `json:"Height"`
}

type Screen struct {
  DeviceName  string `json:"DeviceName"`
  Bounds      Bounds `json:"Bounds"`
}

func GetScreens() ([]byte, error) {
	const args = "Add-Type -AssemblyName System.Windows.Forms;[System.Windows.Forms.Screen]::AllScreens | ConvertTo-Json"
	return exec.Command("powershell", args).Output() 
}

func GetLocations() [][2]int16 {
	var out [][2]int16

	bytes, err := GetScreens()
	if err != nil {
		log.Printf("Incorrect screens:  %v\n", err)
		return out
	}

	var screens []Screen
  err = json.Unmarshal(bytes, &screens)
	if err != nil {
		log.Printf("Incorrect screens json:  %v\n", err)
		return out
	}

	for _, s := range screens {
		out = append(out, [2]int16{ s.Bounds.X, s.Bounds.Y })
	}
	return out
}