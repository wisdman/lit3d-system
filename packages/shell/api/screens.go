package api

import (
	"net/http"

	"github.com/wisdman/lit3d-system/libs/service"

	"github.com/wisdman/lit3d-system/packages/shell/core"

)

func (api *API) GetScreens(w http.ResponseWriter, r *http.Request) {
	out, err := core.GetScreens()
	if err != nil {
		service.Fatal(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Write(out)
}