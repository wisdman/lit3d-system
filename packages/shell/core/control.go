package core

import (
	"log"
	"os/exec"
)

func Shutdown() {
	log.Println("Shutdown")
	
	const args = "shutdown /s /f /t 0"
	err := exec.Command("powershell", args).Run()
	if err != nil {
		return
	}
	return
}

func Restart() {
	log.Println("Restart command")

	const args = "shutdown /r /f /t 0"
	err := exec.Command("powershell", args).Run()
	if err != nil {
		return
	}
	return
}

func Reload() {
	log.Println("Reload command")
	KillChrome()
	KillVVVV()
	Run()
}


func Stop() {
	log.Println("Stop command")
	KillChrome()
	KillVVVV()
}
