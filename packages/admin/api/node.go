package api

import (
	"net/http"

	"github.com/wisdman/lit3d-system/libs/service"
)

func (api *API) GetNode(w http.ResponseWriter, r *http.Request) {
	service.ResponseNoContent(w)
}