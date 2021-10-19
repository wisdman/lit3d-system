
import { FullScreenComponent } from "../fullscreen/fullscreen.mjs"
import { MappingComponent } from "../mapping/mapping.mjs"

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

    this.shadowRoot.appendChild(new MappingComponent({ frameList, textureList }))
  }

  async connectedCallback() {
    await this.#init()
  }
}

customElements.define("ss-app", AppComponent)
