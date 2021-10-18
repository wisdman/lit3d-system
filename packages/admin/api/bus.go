package api

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/wisdman/lit3d-system/libs/service"
	"github.com/wisdman/lit3d-system/libs/message-bus"
)

func (api *API) SSE(w http.ResponseWriter, r *http.Request) {
	id := service.GetParam(r, "id")
	group := service.GetParam(r, "group")
	
	ip, err := service.GetIP(r)
	if err != nil {
		service.Fatal(w, err)
		return
	}

	api.MessageBus.ServeHTTP(id, group, ip, w, r)
}

func (api *API) Message(w http.ResponseWriter, r *http.Request) {
	msg := &messageBus.Message{}
	err := json.NewDecoder(r.Body).Decode(msg)
	if err != nil {
		log.Printf("Incorrect message: %v\n", err)
		service.Error(w, http.StatusBadRequest)
		return
	}
	api.MessageBus.Message(msg)
	service.ResponseNoContent(w)
}

func (api *API) GetClients(w http.ResponseWriter, r *http.Request) {
	clients := api.MessageBus.GetClients()
	out, err := json.Marshal(clients)
	if err != nil {
		service.Fatal(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Write(out)
}