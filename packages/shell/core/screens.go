package core

import (
	"os/exec"
)

func GetScreens() ([]byte, error) {
	const args = "Add-Type -AssemblyName System.Windows.Forms;[System.Windows.Forms.Screen]::AllScreens | ConvertTo-Json"
	return exec.Command("powershell", args).Output() 
}