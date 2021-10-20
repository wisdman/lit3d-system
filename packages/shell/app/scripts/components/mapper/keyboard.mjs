export class Keyboard {

  #isActive = false
  active() { this.#isActive = true }
  deactivate() { this.#isActive = false }
  toggle() { this.#isActive = !this.#isActive }

  #listeners = new Map()

  constructor() {
    window.addEventListener("keydown", this.#keydown, { passive: true })
  }

  #keydown = event => {
    console.dir(event)

    if (!this.#isActive) {
      return
    }
    const { altKey:alt, ctrlKey:ctrl, metaKey:meta, shiftKey:shift } = event
    const key = event.key.toUpperCase()
    console.log(key)
    ;(this.#listeners.get(key) ?? []).forEach(fn => fn({ alt,ctrl,meta,shift }))
  }

  on = (key, fn) => this.#listeners.set(key, [...(this.#listeners.get(key) ?? []), fn])

  off = (key, fn) => {
    if (!fn) { 
      this.#listeners.delete(key)
      return
    }

    this.#listeners.set(key, (this.#listeners.get(key) ?? []).filter(l => l === fn))
  }
}