package api

import (
	"net/http"

	"github.com/wisdman/lit3d-system/libs/service"

	"github.com/wisdman/lit3d-system/packages/shell/core"
)

func (api *API) Shutdown(w http.ResponseWriter, r *http.Request) {
	core.Shutdown()
	service.ResponseNoContent(w)
}

func (api *API) Restart(w http.ResponseWriter, r *http.Request) {
	core.Restart()
	service.ResponseNoContent(w)
}

func (api *API) Reload(w http.ResponseWriter, r *http.Request) {
	core.Reload()
	service.ResponseNoContent(w)
}

func (api *API) Stop(w http.ResponseWriter, r *http.Request) {
	core.Stop()
	service.ResponseNoContent(w)
}

