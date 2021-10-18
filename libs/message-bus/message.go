package messageBus

import (
  "encoding/json"
  "log"
)

const AdminGroup = "admin"

type Message struct {
	Id      uint64  `json:"id"`
	Client  *string `json:"client"`
  Group   *string `json:"group"`
  Command Command `json:"command"`
}

func (message *Message) Marshal() []byte {
  out, err := json.Marshal(message)
  if err != nil {
    log.Fatalf("Incorrect Message structure: %v\n", err)
  }
  return out
}

func (message *Message) StrClient() string {
  if message.Client != nil {
   return *message.Client
  }
  return ""
}

func (message *Message) StrGroup() string {
  if message.Group != nil {
   return *message.Group
  }
  return ""
}