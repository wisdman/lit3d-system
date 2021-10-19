package api

import (
	"encoding/json"
	"net/http"

	"github.com/wisdman/lit3d-system/packages/shell/core"
)

func (api *API) GetConfig(w http.ResponseWriter, r *http.Request) {
	config := core.GetConfig()
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	json.NewEncoder(w).Encode(config)
}
