package core

import (
	"fmt"
	"log"
	"os/exec"
	"path/filepath"
	"time"
)

const chromePath = "./chromium/chrome.exe"
var chromeAbs string

const chromeDataPath = "./chromium-data"
var chromeDataAbs string

func init() {
	var err error
	
	chromeAbs, err = filepath.Abs(chromePath)
	if err != nil {
		log.Fatalf("Incorrect Chrome path: %v\n", err)
	}

	chromeDataAbs, err = filepath.Abs(chromeDataPath)
	if err != nil {
		log.Fatalf("Incorrect Chrome data path: %v\n", err)
	}
}

func Chrome() {
	cmd := exec.Command(
		chromeAbs,
		fmt.Sprintf("--user-data-dir=%s", chromeDataAbs),
		"--profile-directory=Default",
		"https://localhost",
	)

	if err := cmd.Start(); err != nil {
		log.Fatalf("Chrome init error: %v\n", err)
	}

	time.Sleep(5 * time.Second)

	if err := cmd.Process.Kill(); err != nil {
		log.Printf("Chrome shutdown error: %v\n", err)
	}
}