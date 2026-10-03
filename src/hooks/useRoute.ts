import { useMemo, useSyncExternalStore } from "react"
import { parseRoute, type Route } from "../config/routes"

// Lee la ruta actual del hash de la URL y se actualiza al navegar (incluido atrás/adelante).

let visits = 0
let lastRouteHash = ""
const listeners = new Set<() => void>()

function subscribe(callback: () => void) {
  window.addEventListener("hashchange", callback)
  listeners.add(callback)
  return () => {
    window.removeEventListener("hashchange", callback)
    listeners.delete(callback)
  }
}

// Solo cuentan los hashes con forma de ruta ("#/..."). Cualquier otro (un ancla suelta) se ignora
// y se mantiene la última ruta, para no cambiar de sección por accidente.
function getSnapshot() {
  const hash = window.location.hash
  if (hash.startsWith("#/")) lastRouteHash = hash
  return `${lastRouteHash}|${visits}`
}

/**
 * Avisa de que se volvió a pulsar el enlace de la ruta actual. Sin esto no cambiaría nada
 * (el hash es el mismo) y no se podría "reiniciar" la sección pulsando su opción del menú.
 */
export function revisitCurrentRoute() {
  visits += 1
  listeners.forEach((listener) => listener())
}

export function useRoute(): { route: Route; visit: number } {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => "|0")
  const separator = snapshot.lastIndexOf("|")
  const hash = snapshot.slice(0, separator)
  const visit = Number(snapshot.slice(separator + 1))
  const route = useMemo(() => parseRoute(hash), [hash])
  return { route, visit }
}
