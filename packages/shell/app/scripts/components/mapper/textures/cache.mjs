
export class Cache {
  static instance = new Cache()

  #map = new Map()

  async fetch(url) {
    if (!this.#map.has(url)) {
      const blob = await (await fetch(url, { method: "GET", cache: "no-cache" })).blob()
      const data = URL.createObjectURL(blob)
      this.#map.set(url, data)
    }
    return this.#map.get(url)
  }

  clear() { this.#map.clear() }

  constructor(){
    return Cache.instance ?? this
  }
}
