package core

import (
	// "fmt"
	"log"
	"os/exec"
	"path/filepath"
	"time"
)

const vvvvPath = "./vvvv/vvvv.exe"
var vvvvAbs string

const contentPath = "./content"
var contentAbs string

func init() {
	var err error
	
	vvvvAbs, err = filepath.Abs(vvvvPath)
	if err != nil {
		log.Fatalf("Incorrect VVVV path: %v\n", err)
	}

	contentAbs, err = filepath.Abs(contentPath)
	if err != nil {
		log.Fatalf("Incorrect Content data path: %v\n", err)
	}
}

func VVVV() {
	slaveAbs, err := filepath.Abs(filepath.Join(contentAbs, "./0_SS_Деловая_среда/_slave_content.v4p"))
	if err != nil {
		log.Fatalf("Incorrect VVVV slave file path: %v\n", err)
	}

	cmd := exec.Command(
		vvvvAbs,
		slaveAbs,
	)

	if err := cmd.Start(); err != nil {
		log.Fatalf("VVVV init error: %v\n", err)
	}

	time.Sleep(15 * time.Second)

	if err := cmd.Process.Kill(); err != nil {
		log.Printf("VVVV shutdown error: %v\n", err)
	}
}