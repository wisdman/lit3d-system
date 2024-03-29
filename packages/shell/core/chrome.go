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
var ChromeDataAbs string

func init() {
	var err error
	
	chromeAbs, err = filepath.Abs(chromePath)
	if err != nil {
		log.Fatalf("Incorrect Chrome path: %v\n", err)
	}

	ChromeDataAbs, err = filepath.Abs(chromeDataPath)
	if err != nil {
		log.Fatalf("Incorrect Chrome data path: %v\n", err)
	}
}

func Chrome(url string, num uint8, x, y int16) {
	dataAbs, err := filepath.Abs(filepath.Join(ChromeDataAbs, fmt.Sprintf("/%d", num)))
	if err != nil {
		log.Fatalf("Incorrect Chrome data path: %v\n", err)
	}

	cmd := exec.Command(
		chromeAbs,
		fmt.Sprintf("--user-data-dir=%s", dataAbs),
		"--profile-directory=Default",
		fmt.Sprintf("--window-position=%d,%d", x, y),
		"--kiosk",
		url,
	)

	if err := cmd.Start(); err != nil {
		log.Fatalf("Chrome init error: %v\n", err)
	}

	log.Printf("Chrome started with url %s\n", url)
}

func KillChrome() {
	const args = "TASKKILL /F /IM chrome.exe /T"
	err := exec.Command("powershell", args).Run()
	if err != nil {
		return
	}
	return
}