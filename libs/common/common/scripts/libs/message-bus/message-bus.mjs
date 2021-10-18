const API_PATH = "/api/bus" 

const API_PATH_CLIENTS = `${API_PATH}/clients`
const API_PATH_EVENTS  = `${API_PATH}/events`
const API_PATH_MESSAGE = `${API_PATH}/message`

const DEFAULT_SERVER = window.location.origin

const ADMIN_GROUP = "admin"
const UNKNOWN_GROUP = "unknown"


export class MessageBus extends EventSource {
  static AdminGroup = ADMIN_GROUP
  static UnknownGroup = UNKNOWN_GROUP

  #id = ""
  #group = ""
  
  #messageAPI = ""
  #clientsAPI = ""

  get isAdmin() {
    return this.#group === MessageBus.AdminGroup
  }

  constructor({
    id = crypto.randomUUID(),
    group = UNKNOWN_GROUP,
    server = DEFAULT_SERVER
  } = {}) {
    if (typeof id !== "string") {
      throw TypeError(`Incorrect MessageBus id "${id}"`)
    } 

    if (typeof group !== "string") {
      throw TypeError(`Incorrect MessageBus group "${group}"`)
    } 

    if (typeof server !== "string") {
      throw TypeError(`Incorrect MessageBus server "${server}"`)
    }

    const connStr = `${server}${API_PATH_EVENTS}/${group}/${id}`
    super(connStr)
    
    this.#id = id
    this.#group = group

    this.#messageAPI = `${server}${API_PATH_MESSAGE}`
    this.#clientsAPI = `${server}${API_PATH_CLIENTS}`
    
    this.addEventListener("message", this.#onMessage, { passive: true })
  }

  #onMessage = ({data}) => {
    let message 
    try {
      message = JSON.parse(data)
      if (typeof message !== "object") throw new TypeError("Message data is not Object")
    } catch (error) {
      console.error(error)
      return
    }

    const { client, group, command: { type, data: detail } = {} } = message
    if (type === "heartbeet") { return }
    if (!type) {
      console.error(new TypeError(`Incorrect command type "${type}"`))
      return
    }

    if (this.isAdmin) {
      const event = new CustomEvent(`log`, { detail: message })
      this.dispatchEvent(event)
    }

    // Broadcast
    if (client === null && group === null) {
      const event = new CustomEvent(`command-${type}`, { detail })
      this.dispatchEvent(event)
    }

    // Group broadcast
    if (client === null && group === this.#group) {
      const event = new CustomEvent(`command-${type}`, { detail })
      this.dispatchEvent(event)
    }

    // Personal
    if (client === this.#id && group === null) {
      const event = new CustomEvent(`command-${type}`, { detail })
      this.dispatchEvent(event)
    }

    // Personal in group
    if (client === this.#id && group === this.#group) {
      const event = new CustomEvent(`command-${type}`, { detail })
      this.dispatchEvent(event)
    }
  }

  close = () => {
    this.removeEventListener("message", this.#onMessage)
    super.close()
  }

  command = async ({
    client = null,
    group = null,
    type = undefined,
  } = {}, data = null) => {
    if (typeof client !== "string" && client !== null) {
      throw TypeError(`Incorrect Message clien id "${client}"`)
    } 

    if (typeof client !== "string" && client !== null) {
      throw TypeError(`Incorrect Message group id "${group}"`)
    }

    const msg = { client, group, command: { type, data } }
    
    await fetch(this.#messageAPI, {
      method: "POST",
      headers: {
        "Accept": "application/json; charset=utf-8",
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify(msg)
    })
  }

  getClients = async () => {
    try {
      const response = await fetch(this.#clientsAPI)
      return await response.json()
    } catch (error) {
      console.error(error)
      return []
    }
  }

}