package messageBus

import (
  "fmt"
  "log"
  "net"
  "net/http"
  "time"
)

type Client struct {
  Id    string `json:"id"`
  Group string `json:"group"`
  Ip    net.IP `json:"ip"`
  
  pipe  chan []byte `json:"-"`
}

type Broker struct {
  counter uint64
  bus chan *Message
  
  newClient chan *Client
  delClient chan *Client

  clients map[*Client]bool
}

func New() (broker *Broker) {
  broker = &Broker{
    bus:       make(chan *Message, 1),
    newClient: make(chan *Client),
    delClient: make(chan *Client),
    clients:   make(map[*Client]bool),
  }
  go broker.listen()
  go broker.heartbeet()
  return
}

func (broker *Broker) ServeHTTP(id string, group string, ip net.IP, w http.ResponseWriter, r *http.Request) {

  // Make sure that the writer supports flushing.
  flusher, ok := w.(http.Flusher)
  if !ok {
    log.Println("Streaming unsupported!")
    http.Error(w, "Streaming unsupported", http.StatusInternalServerError)
    return
  }

  w.Header().Set("Content-Type", "text/event-stream")
  w.Header().Set("Cache-Control", "no-cache")
  w.Header().Set("Connection", "keep-alive")
  w.Header().Set("Access-Control-Allow-Origin", "*")

  client := &Client{
    Id:    id,
    Group: group,
    Ip:    ip,

    pipe: make(chan []byte),
  }

  broker.newClient <- client
  defer func() {
    broker.delClient <- client
  }()

  notify := r.Context().Done()
  go func() {
    <-notify
    broker.delClient <- client
  }()

  for {
    fmt.Fprintf(w, "data: %s\n\n", <-client.pipe)
    flusher.Flush()
  }
}

func (broker *Broker) listen() {
  for {
    select {
    case s := <-broker.newClient:
      broker.clients[s] = true
      // log.Printf("Client added. %d registered clients", len(broker.clients))
    case s := <-broker.delClient:
      delete(broker.clients, s)
      // log.Printf("Removed client. %d registered clients", len(broker.clients))
    case message := <-broker.bus:
      if broker.counter >= 18446744073709551615 {
        broker.counter = 0
      }
      
      broker.counter = broker.counter + 1
      message.Id = broker.counter
      
      data := message.Marshal()
      if message.Client == nil && message.Group == nil {
        for client, _ := range broker.clients {
          client.pipe <- data
        }
      } else {
        for client, _ := range broker.clients {
          if client.Group == AdminGroup {
            client.pipe <- data
            continue
          }

          // Group message
          if message.Client == nil && client.Group == message.StrGroup() {
            client.pipe <- data
            continue
          }

          // Client message
          if message.Group == nil && client.Id == message.StrClient() {
            client.pipe <- data
            continue
          }

          // Client in group message
          if client.Group == message.StrGroup() && client.Id == message.StrClient() {
            client.pipe <- data
            continue
          }
        }
      }
    }
  }
}

func (broker *Broker) heartbeet() {
  for {
    time.Sleep(time.Second * 5) // 5 sec heartbeet
    msg := &Message{
      Client: nil,
      Group: nil,
      Command: Command{
        Type: Heartbeet,
        Data: fmt.Sprintf("%s", time.Now()),
      },
    }
    broker.bus <- msg
  }
}

func (broker *Broker) GetClients() [][3]string {
  var data [][3]string
  for client, _ := range broker.clients {
    data = append(data, [3]string{client.Id,client.Group,client.Ip.String()})
  }
  return data
}

func (broker *Broker) Message(msg *Message) {
  broker.bus <- msg
}
