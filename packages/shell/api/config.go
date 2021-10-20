package api

import (
	"encoding/json"
	"net/http"

	"github.com/wisdman/lit3d-system/packages/shell/core"
	"github.com/wisdman/lit3d-system/libs/service"
)

func (api *API) GetConfig(w http.ResponseWriter, r *http.Request) {
	config := core.GetConfig()
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	json.NewEncoder(w).Encode(config)
}

func (api *API) SaveConfig(w http.ResponseWriter, r *http.Request) {
	config := &core.Config{}
	err := json.NewDecoder(r.Body).Decode(config)
	if err != nil {
		service.Fatal(w, err)
		return
	}

	err = core.SetConfig(config)
	if err != nil {
		service.Fatal(w, err)
		return
	}

	service.ResponseNoContent(w)
}