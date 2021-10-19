
const DEFAULT_COLOR = new Uint8Array([66, 66, 255, 255])

export class Texture extends EventTarget {
  #gl = undefined
  #texture = undefined

  #id = 0
  get id() { return this.#id }

  constructor(gl, id) {
    super()
    this.#gl = gl
    this.#id = id

    this.#texture = this.#gl.createTexture()

    this.#gl.activeTexture(this.#gl.TEXTURE0 + this.#id)
    this.#gl.bindTexture(this.#gl.TEXTURE_2D, this.#texture)
    this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_WRAP_S, this.#gl.CLAMP_TO_EDGE)
    this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_WRAP_T, this.#gl.CLAMP_TO_EDGE)
    this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_MIN_FILTER, this.#gl.LINEAR)
    this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_MAG_FILTER, this.#gl.LINEAR)

    this.#gl.texImage2D(
      this.#gl.TEXTURE_2D,    // target type
      0,                      // specifying the level of detail
      this.#gl.RGBA,          // internal texture format
      1,                      // texture width
      1,                      // texture height
      0,                      // texture border. Deprecated. Must be 0.
      this.#gl.RGBA,          // format of the texel data
      this.#gl.UNSIGNED_BYTE, // 8 bits per channel for gl.RGBA
      DEFAULT_COLOR,          // texture color without data
    );
  }

  update() {
    const source = this.source
    if (!source) return

    this.#gl.bindTexture(this.#gl.TEXTURE_2D, this.#texture)
    this.#gl.texImage2D(
      this.#gl.TEXTURE_2D,    // target type
      0,                      // specifying the level of detail
      this.#gl.RGBA,          // internal texture format
      this.#gl.RGBA,          // format of the texel data
      this.#gl.UNSIGNED_BYTE, // 8 bits per channel for gl.RGBA
      source,                 // texture data source
    )
  }

  remove() {
    this.#gl.deleteTexture(this.#texture)
    this.dispatchEvent(new Event("remove"))
  }

  toJSON = () => ({ id: this.#id, url: "" })
}
