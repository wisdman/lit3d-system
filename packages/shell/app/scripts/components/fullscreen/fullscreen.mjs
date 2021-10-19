
import CSS from "./fullscreen.css" assert { type: "css" }

const EXT_RX = /\.(?<ext>[^\.]+)$/

export class FullScreenComponent extends HTMLElement {
  static CreateElement(url) {
    const { groups:{ ext } } = EXT_RX.exec("." + url) ?? { groups: {} }
    console.dir(ext)

    return (ext => {
      switch(ext) {
        case "mp4":
        case "webm":
        case "mkv":
          const videoNode = document.createElement("video")
          videoNode.loop = true
          videoNode.muted = true
          videoNode.src = url
          videoNode.play()
          return videoNode

        case "webp":
        case "avif":
        case "png":
        case "jpg":
          const imageNode = new Image()
          imageNode.src = url
          return imageNode
      }
    })(ext)
  }


  constructor(url) {
    super()

    const root = this.attachShadow({mode: "open"})
    root.adoptedStyleSheets = [CSS]

    const mediaNode = FullScreenComponent.CreateElement(url)
    mediaNode.classList.add("content")
    root.appendChild(mediaNode)
  }

  connectedCallback() {
    
  }
}

customElements.define("ss-fullscreen", FullScreenComponent)
