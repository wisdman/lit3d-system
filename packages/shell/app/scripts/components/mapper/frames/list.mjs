
import { Frame } from "./frame.mjs"

const MAX_FRAMES = 100

export class FrameList extends EventTarget {
  #gl = undefined

  #frames = []
  
  get next() {
    for (let i = 0; i < MAX_FRAMES; i++) {
      if (!this.#frames.find(f => f.id === i)) return i
    }
    throw new Error("Too many frames")
  }

  get length() {
    return this.#frames.length
  }

  constructor(gl) {
    super()
    this.#gl = gl
  }

  #change = () => this.dispatchEvent(new Event("change"))

  add() {
    const frame = new Frame(this.#gl, this.next)
    frame.addEventListener("change", this.change)
    this.#frames = [...this.#frames, frame]
    this.#change()
    return frame
  }

  remove(frame) {
    this.#frames = this.#frames.filter(f => f !== frame)
    frame.removeEventListener("change", this.#change)
    frame.remove()
    this.#change()
  }

  clear = () => {
    this.#frames = this.#frames.filter(f => (f.remove(), false))
    this.#change()
  }

  load = list => {
    this.#frames = this.#frames.filter(f => (f.remove(), false))
    if (!Array.isArray(list)) { return }
    
    this.#frames = list.map(data => {
      const frame = new Frame(this.#gl, data.id ?? this.next, data)
      frame.addEventListener("change", this.#change)
      return frame
    })
    this.#change()
    return this.#frames[0]
  }

  get positions() { return this.#frames.reduce((acc, {dstPositions}) => [...acc, ...dstPositions], []) }

  get texcoords() { return this.#frames.reduce((acc, {dstTexcoords}) => [...acc, ...dstTexcoords], []) }

  get length() { return this.#frames.length }

  toJSON = () => this.#frames.map(f => f.toJSON())

  forEach = (callback) => this.#frames.forEach(callback)
  map = (callback) => this.#frames.map(callback)
  includes = (item) => this.#frames.includes(item)
}
