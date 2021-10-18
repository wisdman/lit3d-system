
import CSS from "./app.css" assert { type: "css" }

const API_PATH = "/api" 
const API_PATH_ID = `${API_PATH}/id`

const DEFAULT_SERVER = window.location.origin

export class AppComponent extends HTMLElement {

  #infoNode = document.createElement("div")
  #idAPI = `${DEFAULT_SERVER}${API_PATH_ID}`

  constructor() {
    super()

    const root = this.attachShadow({mode: "open"})
    root.adoptedStyleSheets = [CSS]

    this.#infoNode.classList.add("info")
    root.appendChild(this.#infoNode)
  }

  #getID = async () => {
    try {
      const response = await fetch(this.#idAPI)
      return await response.text()
    } catch (error) {
      console.error(error)
      return "BAD ID!"
    }
  }

  #renderInfoNode = async () => {
    const id = await this.#getID()
    const height = window.outerHeight
    const width = window.outerWidth
    const x = 0
    const y = 0

    const html = `<span class="info-id">${id}</span><span>${width}×${height}</span><span>x: ${x}  y: ${y}</span>`
    requestAnimationFrame(() => this.#infoNode.innerHTML = html)
    
  } 

  connectedCallback() {
    this.#renderInfoNode().then()
    if (window.location.hash === "#ID") { return }
  }
}

customElements.define("ss-app", AppComponent)
