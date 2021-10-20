
import { Texture } from "./texture.mjs"
import { ImageTexture } from "./texture-image.mjs"
import { VideoTexture } from "./texture-video.mjs"

import { Keyboard } from "../keyboard.mjs"

const EXT_RX = /\.(?<ext>[^\.]+)$/

export class TextureList extends EventTarget {
  #gl = undefined

  #max = undefined
  get max() { return this.#max }

  #textures = []
  get next() {
    for (let i = 0, max = this.#max; i < max; i++) {
      if (!this.#textures.find(t => t.id === i)) return i
    }
    throw new Error("Too many textures")
  }

  #change = () => this.dispatchEvent(new Event("change"))

  #newTexture = async (url, id = undefined) => {
    const { groups:{ ext } } = EXT_RX.exec("." + url) ?? { groups: {} }
    switch(ext) {
      case "mp4":
      case "webm":
      case "mkv":
        return await new VideoTexture(this.#gl, id ?? this.next, url)

      case "png":
      case "webp":
      case "avif":
      case "jpg":
        return await new ImageTexture(this.#gl, id ?? this.next, url)
    }

    return await new Texture(this.#gl, id ?? this.next)
  }

  async add(url) {
    const texture = await this.#newTexture(url)
    this.#textures = [...this.#textures, texture]
    this.#change()
    return texture
  }

  remove(texture) {
    this.#textures = this.#textures.filter(t => t !== texture)
    texture.remove()
    this.#change()
  }

  clear = () => {
    this.#textures = this.#textures.filter(t => (t.remove(), false))
    this.#change()
  }

  constructor(gl) {
    super()
    this.#gl = gl
    this.#max = this.#gl.getParameter(this.#gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS)
  }

  update = () => this.#textures.forEach(t => t.update())

  load = async list => {
    this.#textures = this.#textures.filter(t => (t.remove(), false))
    if (!Array.isArray(list)) { return }

    const textures = list.map(async ({id, url}) => await this.#newTexture(url, id))
    this.#textures = await Promise.all(textures)
  }

  get length() { return this.#textures.length }

  toJSON = () => this.#textures.map(t => t.toJSON())

  forEach = (callback) => this.#textures.forEach(callback)
  map = (callback) => this.#textures.map(callback)
  includes = (item) => this.#textures.includes(item)
}