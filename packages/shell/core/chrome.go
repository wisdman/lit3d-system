package core

import (
	"fmt"
	"log"
	"os/exec"
	"path/filepath"
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

func Chrome(url string) {
	cmd := exec.Command(
		chromeAbs,
		fmt.Sprintf("--user-data-dir=%s", chromeDataAbs),
		"--profile-directory=Default",
		url,
	)

	if err := cmd.Start(); err != nil {
		log.Fatalf("Chrome init error: %v\n", err)
	}

	log.Printf("Chrome started with url %s\n", url)
}