package messageBus

type CommandType string

const(
  DataChannel CommandType = "datachannel"
  Heartbeet = "heartbeet"
  Mapping = "mapping"
  Reload = "reload"
  Restart = "restart"
  Shutdown = "shutdown"
  Stop = "stop"
)

type Command struct {
	Type 	CommandType `json:"type"`
  Data  interface{} `json:"data"`
}