import type { RaidGuide } from "../../interfaces/Raid"

// Carga automáticamente todos los .json de esta carpeta (menos los que empiezan por "_").
// Para añadir una raid: copia _plantilla.json, ponle un nombre nuevo (ej. meloetta.json) y rellénala.
const modules = import.meta.glob<RaidGuide>(["./*.json", "!./_*.json"], { eager: true, import: "default" })

const ID_PATTERN = /^[a-z0-9-]+$/

function isValid(file: string, raid: RaidGuide): boolean {
  const problems: string[] = []
  if (!raid || typeof raid !== "object") problems.push("no es un objeto")
  else {
    if (typeof raid.id !== "string" || !ID_PATTERN.test(raid.id)) problems.push('"id" debe ser texto en minúsculas, números y guiones')
    if (typeof raid.name !== "string" || !raid.name.trim()) problems.push('falta "name"')
    if (!Array.isArray(raid.turns)) problems.push('"turns" debe ser una lista')
    else if (raid.turns.some((t) => !t || typeof t.turn !== "string" || !Array.isArray(t.players)))
      problems.push('cada elemento de "turns" necesita "turn" (texto) y "players" (lista)')
  }
  if (problems.length) console.warn(`[raids] ${file} se ignora: ${problems.join("; ")}`)
  return problems.length === 0
}

export const RAIDS: RaidGuide[] = (() => {
  const seen = new Set<string>()
  return Object.entries(modules)
    .filter(([file, raid]) => isValid(file, raid))
    .map(([, raid]) => raid)
    .filter((raid) => {
      if (seen.has(raid.id)) {
        console.warn(`[raids] id repetido "${raid.id}": solo se usa la primera`)
        return false
      }
      seen.add(raid.id)
      return true
    })
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.name.localeCompare(b.name, "es"))
})()
