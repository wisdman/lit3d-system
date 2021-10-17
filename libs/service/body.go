package service

import (
	"encoding/json"
	"net/http"
)

func JSONBody(r *http.Request, obj interface{}) error {
	return json.NewDecoder(r.Body).Decode(obj)
}