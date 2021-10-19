
const FIXED = 7
const PAD_START = 13
const LENGTH = PAD_START * 4 + 8

export function IncpectMatrix(name, m = name, consoleLog = m) {
  let out = ""
  for (let i = 0; i < 4; i++) {
    out += "|"
    for (let j = 0; j < 4; j++) {
      out += m[i * 4 + j].toFixed(FIXED).padStart(PAD_START, " ")
      if (j < 3) out += ", "
    }
    out += "|\n"
  }

  name = ` ${name} = Matrix<4,4> `
  out = name.padStart(Math.round((LENGTH + name.length) / 2), "=").padEnd(LENGTH,"=") + "\n" + out
  if (consoleLog) console.log(out)
  return out
}

export function IncpectVector(name, v = name, consoleLog = v) {
  name = ` ${name} = Vector<4> `
  const pad = "".padStart(name.length, " ")

  let out = ""
  for (let i = 0; i < 4; i++) {
    out += i === 1 ? name : pad
    out += `|${v[i].toFixed(7).padStart(13, " ")}|\n`
  }
  if (consoleLog) console.log(out)
  return out
}