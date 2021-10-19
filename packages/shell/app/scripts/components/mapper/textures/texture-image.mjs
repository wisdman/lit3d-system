
import { Texture } from "./texture.mjs"

export class ImageTexture extends Texture {
  #image = new Image()
  get source() { return this.#image }

  #url = undefined
  get url() { return this.#url }

  constructor(gl, id, url) {
    super(gl, id)
    this.#url = url

    return new Promise(async resolve => {
      this.#image.addEventListener("load", () => resolve(this))
      this.#image.src = this.#url
    })
  }

  toJSON = () => ({ id: this.id, url: this.#url })
}