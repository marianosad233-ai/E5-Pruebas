import {
  E4_STRATEGIES,
  GYM_RERUN_STRATEGIES,
  RED_BATTLE_STRATEGIES,
  type GymRerunStrategyId,
  type RedBattleStrategyId,
  type StrategyId,
} from "./strategies"
import { RAIDS } from "../data/raids"

// Rutas de la página. Se guardan en el hash de la URL (#/...), que funciona en GitHub Pages
// sin configuración extra y permite compartir enlaces directos a cada sección:
//
//   #/e4/dingxianyou        #/e4-lab/dingxianyou      #/gym/six-pillars      #/red/jinxedboon
//   #/tools/breeding        #/tools/egg-moves         #/tools/berries        #/tools/locate-mo
//   #/tools/raids           #/tools/raids/<id-de-la-raid>

/** Herramientas del menú "Herramientas". Para añadir una, agrégala aquí y en PokemonGuide. */
export const TOOLS = [
  { id: "breeding", path: "breeding", label: "Crianza", description: "Breeding Simulator" },
  { id: "eggMoves", path: "egg-moves", label: "Egg Moves", description: "Egg Moves Calculator" },
  { id: "berries", path: "berries", label: "Berries", description: "Berries Helper" },
  { id: "locateMo", path: "locate-mo", label: "Locate MO", description: "Dónde conseguir cada MO" },
  { id: "raids", path: "raids", label: "Raids", description: "Guías de raids turno a turno" },
] as const

export type ToolId = (typeof TOOLS)[number]["id"]

export type Route =
  | { section: "e4"; strategy: StrategyId }
  | { section: "e4-lab"; strategy: StrategyId }
  | { section: "gym"; strategy: GymRerunStrategyId }
  | { section: "red"; strategy: RedBattleStrategyId }
  | { section: "raids"; raid?: string }
  | { section: Exclude<ToolId, "raids"> }

export const hashFor = {
  e4: (id: StrategyId) => `#/e4/${id}`,
  e4Lab: (id: StrategyId) => `#/e4-lab/${id}`,
  gym: (id: GymRerunStrategyId) => `#/gym/${id}`,
  red: (id: RedBattleStrategyId) => `#/red/${id}`,
  tool: (path: string) => `#/tools/${path}`,
  raid: (id: string) => `#/tools/raids/${id}`,
}

/** Clave que cambia cuando cambia la sección, la estrategia o la raid (no cuando se pulsa lo mismo). */
export function routeKey(route: Route): string {
  if ("strategy" in route) return `${route.section}/${route.strategy}`
  if (route.section === "raids") return `raids/${route.raid ?? ""}`
  return route.section
}

// Última estrategia elegida en cada categoría durante la sesión. Se usa cuando la URL no trae una
// (por ejemplo "#/e4-lab" a secas) para que el E4 Lab siga usando la estrategia que ya tenías.
const remembered: { e4: StrategyId; gym: GymRerunStrategyId; red: RedBattleStrategyId } = {
  e4: E4_STRATEGIES[0].id,
  gym: GYM_RERUN_STRATEGIES[0].id,
  red: RED_BATTLE_STRATEGIES[0].id,
}

export const getRememberedStrategies = () => ({ ...remembered })

function findId<T extends { id: string }>(list: readonly T[], id: string | undefined): T["id"] | undefined {
  return list.find((item) => item.id === id)?.id
}

/** Convierte un hash en una ruta. Cualquier hash desconocido lleva al inicio (E4). */
export function parseRoute(hash: string): Route {
  const [section, param, extra] = hash.replace(/^#\/?/, "").split("/")

  switch (section) {
    case "e4":
    case "e4-lab": {
      remembered.e4 = findId(E4_STRATEGIES, param) ?? remembered.e4
      return { section, strategy: remembered.e4 }
    }
    case "gym": {
      remembered.gym = findId(GYM_RERUN_STRATEGIES, param) ?? remembered.gym
      return { section: "gym", strategy: remembered.gym }
    }
    case "red": {
      remembered.red = findId(RED_BATTLE_STRATEGIES, param) ?? remembered.red
      return { section: "red", strategy: remembered.red }
    }
    case "tools": {
      const tool = TOOLS.find((t) => t.path === param)
      if (tool?.id === "raids") return { section: "raids", raid: extra || undefined }
      if (tool) return { section: tool.id }
      break
    }
  }
  return { section: "e4", strategy: remembered.e4 }
}

const strategyName = (list: readonly { id: string; name: string }[], id: string) =>
  list.find((item) => item.id === id)?.name ?? id

/** Título de la pestaña del navegador para cada ruta. */
export function routeTitle(route: Route): string {
  const site = "Farm Liga PokeMMO"
  switch (route.section) {
    case "e4":
      return `E4 · ${strategyName(E4_STRATEGIES, route.strategy)} · ${site}`
    case "e4-lab":
      return `E4 Lab · ${site}`
    case "gym":
      return `Gym Rerun · ${strategyName(GYM_RERUN_STRATEGIES, route.strategy)} · ${site}`
    case "red":
      return `Red Battle · ${strategyName(RED_BATTLE_STRATEGIES, route.strategy)} · ${site}`
    case "raids": {
      const raid = RAIDS.find((r) => r.id === route.raid)
      return raid ? `${raid.name} · Raids · ${site}` : `Raids · ${site}`
    }
    default: {
      const tool = TOOLS.find((t) => t.id === route.section)
      return `${tool?.label ?? "Herramientas"} · ${site}`
    }
  }
}
