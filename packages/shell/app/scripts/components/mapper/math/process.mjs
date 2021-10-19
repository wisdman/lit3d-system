
export function ProcessVector(m, v) {
  const m00 = m[0 * 4 + 0]
  const m01 = m[0 * 4 + 1]
  const m02 = m[0 * 4 + 2]
  const m03 = m[0 * 4 + 3]
  const m10 = m[1 * 4 + 0]
  const m11 = m[1 * 4 + 1]
  const m12 = m[1 * 4 + 2]
  const m13 = m[1 * 4 + 3]
  const m20 = m[2 * 4 + 0]
  const m21 = m[2 * 4 + 1]
  const m22 = m[2 * 4 + 2]
  const m23 = m[2 * 4 + 3]
  const m30 = m[3 * 4 + 0]
  const m31 = m[3 * 4 + 1]
  const m32 = m[3 * 4 + 2]
  const m33 = m[3 * 4 + 3]

  const x = v[0]
  const y = v[1]
  const z = v[2]
  const w = v[3]

  return  new Float32Array([
    x * m00 + y * m10 + z * m20 + w * m30,
    x * m01 + y * m11 + z * m21 + w * m31,
    x * m02 + y * m12 + z * m22 + w * m32,
    x * m03 + y * m13 + z * m23 + w * m33,
  ])
}

export function ProcessVectorArray(m, arr) {
  const length = arr.length
  const out = new Float32Array(length)
  for (let i = 0; i < length; i += 4) {
    const vIn = [
      arr[i + 0],
      arr[i + 1],
      arr[i + 2],
      arr[i + 3],
    ]
    const vOut = ProcessVector(m, vIn)
    out[i + 0] = vOut[0]
    out[i + 1] = vOut[1]
    out[i + 2] = vOut[2]
    out[i + 3] = vOut[3]
  }
  return out
}
