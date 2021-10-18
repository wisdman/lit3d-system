package api

import (
	"github.com/wisdman/lit3d-system/libs/service"
	"github.com/wisdman/lit3d-system/libs/message-bus"
)

type API struct{
	*service.API
	MessageBus *messageBus.Broker
}