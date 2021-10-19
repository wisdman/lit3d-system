
import { Cache } from "./cache.mjs"
import { Texture } from "./texture.mjs"

export class VideoTexture extends Texture {
  #cache = new Cache()
  #video = document.createElement("video")
  get source() { return this.#video }

  #url = undefined
  get url() { return this.#url }

  get volume() {
    return Math.floor(this.#video.volume * 100)
  }
  set volume(volume) {
    this.#video.volume = volume / 100
    this.#video.muted = volume <= 0
  }

  play() {
    this.#video.currentTime = 0;
    this.#video.play()
  }

  pause() {
    this.#video.pause()
  }

  constructor(gl, id, url, {
    volume = 0,
  } = {}) {
    super(gl, id)
    this.#url = url

    this.#video.loop = true
    this.#video.controls = false
    this.#video.autoplay = false

    this.volume = volume

    return new Promise(async resolve => {
      this.#video.addEventListener("canplaythrough", () => {
        this.#video.play()
        resolve(this)
      })
      this.#video.src = await this.#cache.fetch(this.#url)
    })
  }

   toJSON = () => ({ id: this.id, url: this.#url })
}