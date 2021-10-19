
import { DEG_TO_RAD, Cross, Subtract, Normalize, Dot, Multiply } from "./utils.mjs"
import { IncpectMatrix } from "./incpect.mjs"

export function Perspective(fov, aspect, near, far) {
  const rad = fov * DEG_TO_RAD
  const tanHalfFov = Math.tan(rad / 2)
  const m = new Float32Array(16)
  m[0 * 4 + 0] =   1 / (aspect * tanHalfFov)
  m[1 * 4 + 1] = - 1 / (tanHalfFov) // -1 -> Inverse Y Axe
  m[2 * 4 + 2] = - (far + near) / (far - near)
  m[2 * 4 + 3] = - 1
  m[3 * 4 + 2] = - (2 * far * near) / (far - near)
  return m
}

export function LookAt(cameraPosition, target, up) {
  const zAxis = Normalize(Subtract(target, cameraPosition))
  const xAxis = Normalize(Cross(zAxis, up))
  const yAxis = Cross(xAxis, zAxis)

  const m = new Float32Array(16)
  m[0 * 4 + 0] =   xAxis[0]
  m[0 * 4 + 1] =   xAxis[1]
  m[0 * 4 + 2] =   xAxis[2]
  m[1 * 4 + 0] =   yAxis[0]
  m[1 * 4 + 1] =   yAxis[1]
  m[1 * 4 + 2] =   yAxis[2]
  m[2 * 4 + 0] = - zAxis[0]
  m[2 * 4 + 1] = - zAxis[1]
  m[2 * 4 + 2] = - zAxis[2]
  m[3 * 4 + 0] = - Dot(xAxis, cameraPosition)
  m[3 * 4 + 1] = - Dot(yAxis, cameraPosition)
  m[3 * 4 + 2] =   Dot(zAxis, cameraPosition)
  m[3 * 4 + 3] =   1
  return m
}

export function ViewProjectionMatrix(width, height) {
  //console.log("width=", width, " height=",height)
  const fov = 60
  const eyeX = width / 2
  const eyeY = height / 2
  const halfFov = Math.PI * fov / 360
  const theTan = Math.tan(halfFov)
  const dist = eyeY / theTan
  const aspect = width / height
  const near = dist / 10
  const far = dist * 10

  const projectionMatrix = Perspective(60, aspect, near, far)
  //IncpectMatrix("Projection", projectionMatrix)

  const cameraPosition = [eyeX, eyeY, dist]
  const target = [eyeX, eyeY, 0]
  const up = [0, 1, 0]

  const viewMatrix = LookAt(cameraPosition, target, up)
  //IncpectMatrix("View", viewMatrix)

  const viewProjectionMatrix = Multiply(projectionMatrix, viewMatrix)
  //IncpectMatrix("ViewProjection", viewProjectionMatrix)

  return viewProjectionMatrix
}
