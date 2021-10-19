
import { FullScreenComponent } from "../fullscreen/fullscreen.mjs"
import { MapperComponent } from "../mapper/mapper.mjs"

import CSS from "./app.css" assert { type: "css" }

const API_PATH = "/api" 
const API_PATH_CONFIG = `${API_PATH}/config`

const DEFAULT_SERVER = window.location.origin

const ID = window.location.hash.replace(/^#/,"")

export class AppComponent extends HTMLElement {
  
  #configAPI = `${DEFAULT_SERVER}${API_PATH_CONFIG}`

  constructor() {
    super()

    const root = this.attachShadow({mode: "open"})
    root.adoptedStyleSheets = [CSS]
  }

  #getFullConfig = async () => {
    try {
      const response = await fetch(this.#configAPI)
      return await response.json()
    } catch (error) {
      console.error(error)
      return {}
    }
  }

  #getConfig = async () => {
    const { mapping = [] } = await this.#getFullConfig() ?? {}
    const config = mapping.find(item => item.id === ID)
    return config ?? {}
  }

  #init = async () => {
    const { id, location, url, frameList = [], textureList = [] } = await this.#getConfig()
    if (url) {
      this.shadowRoot.appendChild(new FullScreenComponent(url))
      return
    }

    const mapper = this.shadowRoot.appendChild(new MapperComponent({ frameList, textureList }))
    mapper.addEventListener("save", this.#save)
  }

  #save = async ({ detail:{ frameList, textureList } }) => {
    const fullConfig = await this.#getFullConfig()
    const mapping = fullConfig?.mapping?.find(item => item.id === ID)
    if (!mapping) { return }
    mapping.frameList = frameList ?? null
    mapping.textureList = textureList ?? null

    const a = document.createElement("a")
    const file = new Blob([JSON.stringify(fullConfig)], { type: "application/json" })
    a.href = URL.createObjectURL(file)
    a.download = "content.json"
    a.click()
    setTimeout(() => a.remove(), 0)
  }

  async connectedCallback() {
    await this.#init()
  }
}

customElements.define("ss-app", AppComponent)
