
import { MessageBus } from "../../../common/scripts/libs/message-bus/message-bus.mjs"

import { NodeComponent } from "../node/node.mjs"

import CSS from "./admin.css" assert { type: "css" }

const API_PATH = "/api" 
const API_PATH_CONFIG = `${API_PATH}/config`

const DEFAULT_SERVER = window.location.origin

export class AdminComponent extends HTMLElement {
  #messageBus = new MessageBus({ group: MessageBus.AdminGroup })

  #nodeMap = new Map()

  #groupControl = document.createElement("div")
  #nodeList = document.createElement("div")

  #reloadBtn = document.createElement("button")
  #restartBtn = document.createElement("button")
  #shutdownBtn = document.createElement("button")

  constructor() {
    super()
    const root = this.attachShadow({mode: "open"})
    root.adoptedStyleSheets = [CSS]

    this.#groupControl.classList.add("group-control")
    root.appendChild(this.#groupControl)

    this.#reloadBtn.innerHTML = "Reload"
    this.#reloadBtn.classList.add("btn", "btn--reload")
    this.#groupControl.appendChild(this.#reloadBtn)

    this.#restartBtn.innerHTML = "Restart"
    this.#restartBtn.classList.add("btn", "btn--restart")
    this.#groupControl.appendChild(this.#restartBtn)

    this.#shutdownBtn.innerHTML = "Shutdown"
    this.#shutdownBtn.classList.add("btn", "btn--shutdown")
    this.#groupControl.appendChild(this.#shutdownBtn)

    this.#nodeList.classList.add("node-list")
    root.appendChild(this.#nodeList)
  }

  #onMessageLog = ({ detail }) => {
    console.log("Bus message:", JSON.stringify(detail))
  }

  #getConfig = async () => {
    try {
      const response = await fetch(API_PATH_CONFIG)
      const { nodes } = await response.json()
      if (Array.isArray(nodes)) return { nodes }
      return { nodes: [] } 
    } catch (error) {
      console.error(error)
    }
    return { nodes: [] } 
  }

  #update = async () => {
    const { nodes } = await this.#getConfig()
    this.#nodeList.innerHTML = ""
    for (const data of nodes) {
      const node = new NodeComponent({...data, messageBus: this.#messageBus })
      node.classList.add("node-list-item")
      this.#nodeList.appendChild(node)
      this.#nodeMap.set(data.id, node)
    }
  }

  #updateStatus = async () => {
    const clients = this.#messageBus.getClients()
    for (const [id, _, ip] of clients) {
      const node = this.#nodeMap.get(id)
      if (!node) { continue }
      node.status = "online"
      node.ip = ip
    }
  }

  #reload = async (event) => {
    event.preventDefault() 
    try {
      await this.#messageBus.command({
        client: null,
        group: null,
        type: "reload",
      })
    } catch (error) {
      console.error(error)
    }
  }

  #restart = async (event) => {
    event.preventDefault() 
    try {
      await this.#messageBus.command({
        client: null,
        group: null,
        type: "restart",
      })
    } catch (error) {
      console.error(error)
    }
  } 

  #shutdown = async (event) => {
    event.preventDefault() 
    try {
      await this.#messageBus.command({
        client: null,
        group: null,
        type: "shutdown",
      })
    } catch (error) {
      console.error(error)
    }
  }

  connectedCallback() {
    this.#update().then()
    this.#messageBus.addEventListener("log", this.#onMessageLog, { passive: true })
    this.#reloadBtn.addEventListener("click", this.#reload)
    this.#restartBtn.addEventListener("click", this.#restart)
    this.#shutdownBtn.addEventListener("click", this.#shutdown)
  }

  disconnectedCallback() {
    this.#messageBus.removeEventListener("log", this.#onMessageLog, { passive: true })
    this.#reloadBtn.removeEventListener("click", this.#reload)
    this.#restartBtn.removeEventListener("click", this.#restart)
    this.#shutdownBtn.removeEventListener("click", this.#shutdown)
  }

}

customElements.define("ss-admin", AdminComponent)