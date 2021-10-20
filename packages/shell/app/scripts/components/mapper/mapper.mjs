
import { Keyboard } from "./keyboard.mjs"
import { FrameList, VERTEX_COUNT, VERTEX_SIZE, TEXTCORD_SIZE } from "./frames/frames.mjs"
import { TextureList } from "./textures/textures.mjs"

import { ViewProjectionMatrix } from "./math/projection.mjs"
import { ProcessVectorArray } from "./math/process.mjs"

import CSS from "./mapper.css" assert { type: "css" }

const VERTEX_SHADER = await (await fetch(`${import.meta.url.replace(/[^\/]+$/, "")}shaders/vertex.glsl`)).text()
const FRAGMENT_SHADER = await (await fetch(`${import.meta.url.replace(/[^\/]+$/, "")}shaders/fragment.glsl`)).text()

const FPS = 25

export class MapperComponent extends HTMLElement {
  static CONTEXT_ATTRIBUTES = {
    alpha: false,
    antialias: true,
    depth: false,
    desynchronized: true,
    powerPreference: "high-performance",
  }

  #keyboard = new Keyboard()

  #devicePixelRatio = 1

  #gl = this.attachShadow({mode: "open"})
            .appendChild(document.createElement("canvas"))
            .getContext("webgl2", MapperComponent.CONTEXT_ATTRIBUTES)

  #program = this.#gl.createProgram()
  #positionAttributeLocation = undefined
  #texcoordAttributeLocation = undefined

  #vertexArray = this.#gl.createVertexArray()
  #positionBuffer = this.#gl.createBuffer()
  #texcoordBuffer = this.#gl.createBuffer()

  #resizeObserver = undefined

  #viewProjectionMatrix = ViewProjectionMatrix(1920, 1080)

  #frameList = new FrameList(this.#gl)
  #textureList = new TextureList(this.#gl)

  #activeFrame = undefined
  #activeCorner = 1

  constructor({ frameList, textureList } = {}) {
    super()
    this.shadowRoot.adoptedStyleSheets = [CSS]
    this.#initProgramm()
    this.#initGeometry()
    this.#activeFrame = this.#frameList.load(frameList)
    this.#textureList.load(textureList)
  }

  #createShader = (source, type) => {
    const shader = this.#gl.createShader(type)
    this.#gl.shaderSource(shader, source)
    this.#gl.compileShader(shader)

    const compileStatus = this.#gl.getShaderParameter(shader, this.#gl.COMPILE_STATUS)
    if (!compileStatus) {
      const lastError = this.#gl.getShaderInfoLog(shader)
      this.#gl.deleteShader(shader)
      throw new Error(`*** Error compiling shader ${shaderType}: ${lastError}`)
    }

    return shader
  }

  #initProgramm = () => {
    const vertexShader = this.#createShader(VERTEX_SHADER, this.#gl.VERTEX_SHADER)
    this.#gl.attachShader(this.#program, vertexShader)

    const fragmentShader = this.#createShader(FRAGMENT_SHADER, this.#gl.FRAGMENT_SHADER)
    this.#gl.attachShader(this.#program, fragmentShader)

    this.#gl.linkProgram(this.#program)
    const linkStatus = this.#gl.getProgramParameter(this.#program, this.#gl.LINK_STATUS)
    if (!linkStatus) {
      const lastError = this.#gl.getProgramInfoLog(this.#program)
      throw new Error(`MAPPER Error in program linking: ${lastError}`)
    }

    this.#positionAttributeLocation = this.#gl.getAttribLocation(this.#program, "a_position")
    this.#texcoordAttributeLocation = this.#gl.getAttribLocation(this.#program, "a_texcoord")
  }

  #initGeometry = () => {
    this.#gl.bindVertexArray(this.#vertexArray)

    this.#gl.enableVertexAttribArray(this.#positionAttributeLocation);
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#positionBuffer);
    this.#gl.bufferData(this.#gl.ARRAY_BUFFER, new Float32Array(), this.#gl.STATIC_DRAW)
    this.#gl.vertexAttribPointer(
      this.#positionAttributeLocation,
      VERTEX_SIZE,    // vertex vector size
      this.#gl.FLOAT, // 32bit floats
      false,          // normalize
      0,              // stride
      0,              // offset
    )

    this.#gl.enableVertexAttribArray(this.#texcoordAttributeLocation)
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#texcoordBuffer)
    this.#gl.bufferData(this.#gl.ARRAY_BUFFER, new Float32Array(), this.#gl.STATIC_DRAW)
    this.#gl.vertexAttribPointer(
      this.#texcoordAttributeLocation,
      TEXTCORD_SIZE,  // textore cord vector size
      this.#gl.FLOAT, // 32bit floats
      true,           // normalize
      0,              // stride
      0,              // offset
    )
  }

  #updateGeometry = () => {
    const { positions, texcoords } = this.#frameList
    const aPositions = ProcessVectorArray(this.#viewProjectionMatrix, positions)

    this.#gl.bindVertexArray(this.#vertexArray)

    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#positionBuffer)
    this.#gl.bufferData(this.#gl.ARRAY_BUFFER, aPositions, this.#gl.STATIC_DRAW)

    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#texcoordBuffer)
    this.#gl.bufferData(this.#gl.ARRAY_BUFFER, new Float32Array(texcoords), this.#gl.STATIC_DRAW)
  }

  #onFKey = async () => {
    this.#frameList.clear()
    this.#activeFrame = this.#frameList.add()
  }

  #onNKey = async () => {
    const name = prompt("Enter texture name", "")
    if (name === null) { return }
    this.#textureList.clear()
    await this.#textureList.add(name ? `/content/${name}` : name)
    this.#frameList.clear()
    this.#activeFrame = this.#frameList.add()
  }

  #onSKey = (data) => {
    const detail = {
      frameList: this.#frameList.length > 0 ? this.#frameList.toJSON() : null,
      textureList: this.#textureList.length > 0 ? this.#textureList.toJSON(): null,
    }
    this.dispatchEvent(new CustomEvent("save", { detail }))
  }

  #onUKey = async () => {
    const name = prompt("Enter texture name", "")
    if (name === null) { return }
    this.#textureList.clear()
    await this.#textureList.add(name)
  }

  #on1Key = () => this.activeCorner = 1
  #on2Key = () => this.activeCorner = 2
  #on3Key = () => this.activeCorner = 3
  #on4Key = () => this.activeCorner = 4

  #regKeys = () => {
    this.#keyboard.on("1", this.#on1Key)
    this.#keyboard.on("2", this.#on2Key)
    this.#keyboard.on("3", this.#on3Key)
    this.#keyboard.on("4", this.#on4Key)
    this.#keyboard.on("F", this.#onFKey)
    this.#keyboard.on("N", this.#onNKey)
    this.#keyboard.on("S", this.#onSKey)
    this.#keyboard.on("U", this.#onUKey)
  }

  #unregKeys = () => {
    this.#keyboard.off("1", this.#on1Key)
    this.#keyboard.off("2", this.#on2Key)
    this.#keyboard.off("3", this.#on3Key)
    this.#keyboard.off("4", this.#on4Key)
    this.#keyboard.off("F", this.#onFKey)
    this.#keyboard.off("N", this.#onNKey)
    this.#keyboard.off("S", this.#onSKey)
    this.#keyboard.off("U", this.#onUKey)
  }

  #onCanvasResize = ([{contentRect: {width, height}}]) => {
    width = Math.floor(width * this.#devicePixelRatio)
    height = Math.floor(height * this.#devicePixelRatio)
    this.#gl.canvas.width = width
    this.#gl.canvas.height = height
    this.#gl.viewport(0, 0, width, height)
    this.#viewProjectionMatrix = ViewProjectionMatrix(width, height)
    this.#updateGeometry()
  }

  get needRender() { return this.#textureList.length > 0 && this.#frameList.length > 0 }

  #render = () => {
    if (!this.needRender) {
      requestAnimationFrame(this.#render)
      return
    }

    this.#textureList.update()
    this.#gl.clearColor(0, 0, 0, 0)
    this.#gl.clear(this.#gl.COLOR_BUFFER_BIT | this.#gl.DEPTH_BUFFER_BIT)
    this.#gl.useProgram(this.#program)
    this.#gl.bindVertexArray(this.#vertexArray)
    this.#gl.drawArrays(this.#gl.TRIANGLES, 0, this.#frameList.length * VERTEX_COUNT)
    //requestAnimationFrame(this.#render)
    setTimeout(() => requestAnimationFrame(this.#render), 1000 / FPS - 16)
  }

  connectedCallback() {
    this.#resizeObserver = new ResizeObserver(this.#onCanvasResize)
    this.#resizeObserver.observe(this.#gl.canvas)

    this.#regKeys()
    this.#keyboard.active()

    this.#frameList.addEventListener("change", this.#updateGeometry)
    this.#updateGeometry()

    requestAnimationFrame(this.#render)
  }

  disconnectedCallback() {
    this.#frameList.removeEventListener("change", this.#updateGeometry)

    this.#resizeObserver.disconnect()
    this.#resizeObserver = undefined

    this.#unregKeys()
    this.#keyboard.deactivate()
  }
}

customElements.define("ss-mapper", MapperComponent)
