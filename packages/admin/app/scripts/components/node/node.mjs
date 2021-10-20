
import { MessageBus } from "../../../common/scripts/libs/message-bus/message-bus.mjs"

import CSS from "./node.css" assert { type: "css" }

const STATUS_ONLINE  = "online"
const STATUS_WARNING = "warning"
const STATUS_ERROR   = "error"
const STATUS = [STATUS_ONLINE, STATUS_WARNING, STATUS_ERROR]

const isNotifyAllow = (await Notification.requestPermission()) === "granted"
console.log(isNotifyAllow)

export class NodeComponent extends HTMLElement {

  #id = ""
  #group = ""

  #messageBus = undefined

  #statusNode = document.createElement("div")

  #idNode = document.createElement("div")
  #groupNode = document.createElement("div")
  #ipNode = document.createElement("div")

  #showIdBtn = document.createElement("button")
  #reloadBtn = document.createElement("button")
  #restartBtn = document.createElement("button")
  #shutdownBtn = document.createElement("button")
  #stopBtn = document.createElement("button")

  #status = null
  #statusTimeout = undefined
  
  get status() {
    return this.#status
  }

  set status(value) {
    if (this.#statusTimeout) {
      clearTimeout(this.#statusTimeout)
      this.#statusTimeout = undefined
    }

    this.#statusTimeout = setTimeout(() => this.status = "error", 60 * 1000)

    if (this.#status === value) { return }

    if (STATUS.includes(value)) {
      this.#status = value
    } else {
      this.#status = value = null
    }

    this.#notifyStatus(this.#status)

    const statusNode = this.#statusNode
    requestAnimationFrame(() => {
      STATUS.forEach(status => statusNode.classList.remove(`status--${status}`))
      value && statusNode.classList.add(`status--${value}`)
    })
  }

  #ip = null

  get ip() {
    return this.#ip
  }

  set ip(value) {
    if (this.#ip === value) { return }
    this.#ipNode.innerHTML = `[${this.#ip = value}]`
  }

  constructor({
    id = undefined,
    group = undefined,
    messageBus = undefined
  }= {}) {
    super()

    if (typeof id !== "string" || !id) {
      throw TypeError(`Incorrect Node id "${id}"`)
    } 

    if (typeof group !== "string" || !group) {
      throw TypeError(`Incorrect Node group "${group}"`)
    }

    if (!(messageBus instanceof MessageBus)) {
      throw TypeError(`Incorrect Node messageBus type "${messageBus}"`)
    }

    this.#id = id
    this.#group = group

    this.#messageBus = messageBus

    const root = this.attachShadow({mode: "open"})
    root.adoptedStyleSheets = [CSS]

    this.#statusNode.classList.add("status")
    root.appendChild(this.#statusNode)

    this.#idNode.innerHTML = `${this.#id}`
    this.#idNode.classList.add("label", "label--id")
    root.appendChild(this.#idNode)

    this.#groupNode.innerHTML = `${this.#group}`
    this.#groupNode.classList.add("label", "label--group")
    root.appendChild(this.#groupNode)

    this.#ipNode.classList.add("label", "label--ip")
    root.appendChild(this.#ipNode)
    
    this.#showIdBtn.innerHTML = "Show ID"
    this.#showIdBtn.classList.add("btn", "btn--id")
    // root.appendChild(this.#showIdBtn)

    this.#stopBtn.innerHTML = "Stop"
    this.#stopBtn.classList.add("btn", "btn--stop")
    root.appendChild(this.#stopBtn)

    this.#reloadBtn.innerHTML = "Reload"
    this.#reloadBtn.classList.add("btn", "btn--reload")
    root.appendChild(this.#reloadBtn)

    this.#restartBtn.innerHTML = "Restart"
    this.#restartBtn.classList.add("btn", "btn--restart")
    root.appendChild(this.#restartBtn)

    this.#shutdownBtn.innerHTML = "Shutdown"
    this.#shutdownBtn.classList.add("btn", "btn--shutdown")
    root.appendChild(this.#shutdownBtn)
  }

  #showId = async (event) => {
    event.preventDefault() 
    try {
      await this.#messageBus.command({
        client: this.#id,
        group: this.#group,
        type: "show-id",
      })
    } catch (error) {
      console.error(error)
    }
  }

  #reload = async (event) => {
    event.preventDefault() 
    try {
      await this.#messageBus.command({
        client: this.#id,
        group: this.#group,
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
        client: this.#id,
        group: this.#group,
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
        client: this.#id,
        group: this.#group,
        type: "shutdown",
      })
    } catch (error) {
      console.error(error)
    }
  }

  #stop = async (event) => {
    event.preventDefault() 
    try {
      await this.#messageBus.command({
        client: this.#id,
        group: this.#group,
        type: "stop",
      })
    } catch (error) {
      console.error(error)
    }
  } 

  connectedCallback() {
    this.#showIdBtn.addEventListener("click", this.#showId)
    this.#reloadBtn.addEventListener("click", this.#reload)
    this.#restartBtn.addEventListener("click", this.#restart)
    this.#shutdownBtn.addEventListener("click", this.#shutdown)
    this.#stopBtn.addEventListener("click", this.#stop)

    this.#ipNode.addEventListener("click", this.#copyIP)
    this.#idNode.addEventListener("click", this.#copyID)
  }

  disconnectedCallback() {
    this.#showIdBtn.removeEventListener("click", this.#showId)
    this.#reloadBtn.removeEventListener("click", this.#reload)
    this.#restartBtn.removeEventListener("click", this.#restart)
    this.#shutdownBtn.removeEventListener("click", this.#shutdown)
    this.#stopBtn.removeEventListener("click", this.#stop)

    this.#ipNode.removeEventListener("click", this.#copyIP)
    this.#idNode.removeEventListener("click", this.#copyID)
  }

  #copyID = async () => {
    const id = this.#id
    console.log(id)
    await this.#copy(id)
    this.#notifyStatus(STATUS_ERROR)
  }

  #copyIP = async () => {
    const ip = this.ip
    console.log(ip)
    await this.#copy(ip)
  }

  #copy = async (text) => {
    const type = "text/plain";
    const blob = new Blob([text], { type });
    const data = [new ClipboardItem({ [type]: blob })]
    try {
      await navigator.clipboard.write(data)
    } catch (err) {
      console.error("Copy error: ", err)
    }
  }

  #notifyStatus = (status) => {
    if (status === STATUS_WARNING) {
      const text = `${this.#id} WARNING`
      new Notification(text)
      console.log(text)
      return
    } 

    if (status === STATUS_ERROR) {
      const text = `${this.#id} ERROR`
      new Notification(text)
      console.log(text)
      return
    }
  }
}

customElements.define("ss-node", NodeComponent)
