
import CSS from "./info.css" assert { type: "css" }

const API_PATH = "/api" 
const API_PATH_ID = `${API_PATH}/id`

const DEFAULT_SERVER = window.location.origin

export class InfoComponent extends HTMLElement {

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
    const { availLeft, availTop, availWidth, availHeight } = window.screen
    const mId = window.location.hash.replace(/^#/, "")
    const html = `<span class="info-id">${id}</span><span>Mapping: ${mId}</span><span>${availWidth}×${availHeight}</span><span>x: ${availLeft}  y: ${availTop}</span>`
    requestAnimationFrame(() => this.#infoNode.innerHTML = html)
  } 

  connectedCallback() {
    this.#renderInfoNode().then()
    if (window.location.hash === "#ID") { return }
  }
}

customElements.define("ss-info", InfoComponent)
