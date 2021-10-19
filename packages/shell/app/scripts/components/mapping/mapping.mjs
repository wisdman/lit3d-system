
import CSS from "./mapping.css" assert { type: "css" }

export class MappingComponent extends HTMLElement {
  constructor() {
    super()

    const root = this.attachShadow({mode: "open"})
    root.adoptedStyleSheets = [CSS]
  }

  connectedCallback() {
    
  }
}

customElements.define("ss-mapping", MappingComponent)
