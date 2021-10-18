package api

import (
	"net/http"

	"github.com/wisdman/lit3d-system/libs/service"

	"github.com/wisdman/lit3d-system/packages/shell/core"
)

func (api *API) GetID(w http.ResponseWriter, r *http.Request) {
	id, err := core.GetID()
	if err != nil {
		service.Fatal(w, err)
		return
	}

	service.ResponseText(w, id)
}

func (api *API) SetID(w http.ResponseWriter, r *http.Request) {
	
}
