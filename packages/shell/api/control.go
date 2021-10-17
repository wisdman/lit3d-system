package api

import (
	"net/http"

	"github.com/wisdman/lit3d-system/libs/service"
)

func (api *API) ControlShutdown(w http.ResponseWriter, r *http.Request) {
	service.ResponseNoContent(w)
}

func (api *API) ControlRestart(w http.ResponseWriter, r *http.Request) {
	service.ResponseNoContent(w)
}
