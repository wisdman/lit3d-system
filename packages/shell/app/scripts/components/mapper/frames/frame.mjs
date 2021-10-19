
import { FindHomography } from "../math/homography.mjs"
import { ProcessVectorArray } from "../math/process.mjs"

export const VERTEX_COUNT = 6
export const VERTEX_SIZE = 4
export const TEXTCORD_SIZE = 2

const DEFAULT_SIZE = 960
const DEFAULT_CORNERS = [
         0     ,        0     , // [0] left-top
  DEFAULT_SIZE ,        0     , // [1] right-top
  DEFAULT_SIZE , DEFAULT_SIZE , // [2] right-bottom
         0     , DEFAULT_SIZE , // [3] left- bottom
]

export class Frame extends EventTarget {
  #gl = undefined
  #id = undefined
  get id() { return this.#id }

  #size = [DEFAULT_SIZE, DEFAULT_SIZE]

  get size() { return [...this.#size] }
  set size([width, height = width]) {
    this.#size = [width, height]
    this.#change()
  }

  get width() { return this.size[0] }
  set width(width) { this.size = [width, this.height] }

  get height() { return this.size[1] }
  set height(height) { this.size = [this.width, height] }

  get srcCords() {
    const [width, height] = this.#size
    return [
        0   ,    0   , // [0] left-top
      width ,    0   , // [1] right-top
      width , height , // [2] right-bottom
        0   , height , // [3] left- bottom
    ]
  }

  #corners = [...DEFAULT_CORNERS]

  get corners() { return [...this.#corners] }
  set corners(arr) {
    this.#corners = [...arr]
    this.#change()
  }

  getCorner(i) {
    const x = this.#corners[i * 2 + 0]
    const y = this.#corners[i * 2 + 1]
    return [x, y]
  }

  setCorner(i, [x, y]) {
    this.#corners[i * 2 + 0] = x
    this.#corners[i * 2 + 1] = y
    this.#change()
  }

  get homographyMatrix() {
    return FindHomography(this.srcCords, this.corners)
  }

  get srcPositions() {
    const srcCords = this.srcCords
    return [
      srcCords[0 * 2 + 0], srcCords[0 * 2 + 1], 0, 1, // [0] left-top
      srcCords[1 * 2 + 0], srcCords[1 * 2 + 1], 0, 1, // [1] right-top
      srcCords[2 * 2 + 0], srcCords[2 * 2 + 1], 0, 1, // [2] right-bottom

      srcCords[0 * 2 + 0], srcCords[0 * 2 + 1], 0, 1, // [0] left-top
      srcCords[2 * 2 + 0], srcCords[2 * 2 + 1], 0, 1, // [2] right-bottom
      srcCords[3 * 2 + 0], srcCords[3 * 2 + 1], 0, 1, // [3] left- bottom
    ]
  }

  get dstPositions() {
    return ProcessVectorArray(this.homographyMatrix, this.srcPositions)
  }

  #textureId = 0
  get textureId() { this.#textureId }
  set textureId(id) { this.textureId = id }

  #texture = [
    0, // X
    0, // Y
    1, // width
    1, // height
  ]
  get texture() {
    return [...this.#texture]
  }
  set texture([tx = 0, ty = 0, tw = 1, th = 1] = []) {
    this.#texture = [tx, ty, tw, th]
    this.#change()
  }

  get texcoords() {
    const [x, y, w, h] = this.#texture
    return [
        x   ,   y   , // [0] left-top
      x + w ,   y   , // [1] right-top
      x + w , y + h , // [2] right-bottom
        x   , y + h , // [3] left- bottom
    ]
  }

  get dstTexcoords() {
    const texcoords = this.texcoords
    return [
      texcoords[0 * 2 + 0], texcoords[0 * 2 + 1], // [0] left-top
      texcoords[1 * 2 + 0], texcoords[1 * 2 + 1], // [1] right-top
      texcoords[2 * 2 + 0], texcoords[2 * 2 + 1], // [2] right-bottom

      texcoords[0 * 2 + 0], texcoords[0 * 2 + 1], // [0] left-top
      texcoords[2 * 2 + 0], texcoords[2 * 2 + 1], // [2] right-bottom
      texcoords[3 * 2 + 0], texcoords[3 * 2 + 1], // [3] left- bottom
    ]
  }

  #remove = () => this.dispatchEvent(new Event("remove"))
  #change = () => this.dispatchEvent(new Event("change"))

  toJSON() {
    return {
      id: this.#id,
      corners: this.corners,
      size: this.size,
      texture: { id: this.#textureId, cords: this.#texture },
    }
  }

  constructor(gl, id, {
    size: [width = DEFAULT_SIZE, height = width] = [],
    corners = DEFAULT_CORNERS,
    texture: { id:textureId = 0, cords: [tx = 0, ty = 0, tw = 1, th = 1] = [] } = {},
  } = {}) {
    super()
    this.#gl = gl
    this.#id = id

    this.#size = [width, height]
    this.#corners = [...corners]
    this.#textureId = textureId
    this.#texture = [tx, ty, tw, th]
  }

  move = (dx, dy) => {
    const [
      ltx, lty, // [0] left-top
      rtx, rty, // [1] right-top
      rbx, rby, // [2] right-bottom
      lbx, lby, // [3] left- bottom
    ] = this.#corners

    this.#corners = [
      ltx + dx, lty + dy, // [0] left-top
      rtx + dx, rty + dy, // [1] right-top
      rbx + dx, rby + dy, // [2] right-bottom
      lbx + dx, lby + dy, // [3] left- bottom
    ]

    this.#change()
  }

  moveCorner = (i, dx, dy) => {
    const x = this.#corners[i * 2 + 0]
    const y = this.#corners[i * 2 + 1]

    this.#corners[i * 2 + 0] = x + dx
    this.#corners[i * 2 + 1] = y + dy

    this.#change()
  }
}
