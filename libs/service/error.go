package service

import (
	"log"
	"net/http"
)

func Error(w http.ResponseWriter, code int) {
	http.Error(w, http.StatusText(code), code)
}

func Fatal(w http.ResponseWriter, err interface{}) {
	log.Printf("FATAL: %+v\n", err)
	http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
}