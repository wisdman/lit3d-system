package sseclient

import (
  "bufio"
  "log"
  "net/http"
  "bytes"
  "encoding/json"
  "time"

  "github.com/wisdman/lit3d-system/libs/message-bus"
)

type Client struct {
  id string
  group string

	url string
	pipe chan []byte

  Bus chan *messageBus.Command
}

func New(url string) (client *Client) {
	client = &Client{
		url: url,
		pipe: make(chan []byte, 1),
    Bus: make(chan *messageBus.Command),
	}

  go client.process()
	go client.listen()
	return
}

func (client *Client) listen() {
  log.Printf("Client listening: %s\n", client.url)
  LISTEN:
	for {
		r, err := http.Get(client.url)
		if err != nil {
			log.Printf("HTTP Request error: %v\n", err)
			time.Sleep(60 * time.Second)
			continue
		}

    if r.StatusCode != 200 {
      log.Printf("HTTP Response status code %d\n", r.StatusCode)
      time.Sleep(60 * time.Second)
      continue
    }

    reader := bufio.NewReader(r.Body)

    for {
      data, err := reader.ReadBytes('\n')
      if err != nil {
        log.Printf("HTTP Body read error: %v\n", err)
        time.Sleep(60 * time.Second)
        continue LISTEN
      }

      switch {
        case hasPrefix(data, "data: "):
          // buf.Write(data[6:])
          client.pipe <- data[6:]
        case hasPrefix(data, "data:"):
          // buf.Write(data[5:])
          client.pipe <- data[5:]
      }
    }
	}
}

func (client *Client) process() {
  for {
    select {
    case data := <-client.pipe:
      var message messageBus.Message
      err := json.Unmarshal(data, &message)
      if err != nil {
        log.Printf("Message parse error: %v\n", err)
        continue
      }

      if message.Command.Type == messageBus.Heartbeet {
        continue
      }

      client.Bus <- &message.Command
    }
  }
}

func hasPrefix(s []byte, prefix string) bool {
  return bytes.HasPrefix(s, []byte(prefix))
}
