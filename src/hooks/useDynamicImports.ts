import { useCallback } from "react"
import type { Pokemon } from "../interfaces/Pokemon"
import type { StrategyId } from "../config/strategies"

// Todos los Pokémon del E4 se cargan una sola vez:
//   src/data/<región>/<líder>/*.json                    → estrategia Dingxianyou
//   src/data/dingxianyou-2/<región>/<líder>/*.json      → estrategia Dingxianyou 2.0
const modules = import.meta.glob<{ default?: Pokemon } & Partial<Pokemon>>(
  ["../data/*/*/*.json", "../data/dingxianyou-2/*/*/*.json"],
  { eager: true }
)

// Carpeta de datos propia de cada estrategia (las que no aparecen usan la carpeta base).
const STRATEGY_FOLDER: Partial<Record<StrategyId, string>> = {
  "dingxianyou-2": "dingxianyou-2/",
}

/**
 * Custom hook to read the Pokemon data files of the E4
 */
export const useDynamicImports = () => {
  /**
   * Gets the Pokemon of one leader for the given strategy, in file-name order.
   * @param regionId - The ID of the region
   * @param leaderId - The ID of the leader
   * @param strategy - The E4 strategy (each one can have its own roster)
   */
  const getLeaderPokemons = useCallback(
    (regionId: string, leaderId: string, strategy: StrategyId): Pokemon[] => {
      const prefix = `../data/${STRATEGY_FOLDER[strategy] ?? ""}${regionId}/${leaderId}/`

      return Object.keys(modules)
        .filter((key) => key.startsWith(prefix))
        .sort()
        .map((key) => {
          const mod = modules[key]
          const data = (mod.default ?? mod) as Pokemon
          const file = (key.split("/").pop() || "").replace(".json", "")
          return { ...data, id: data.id || data.name?.toLowerCase() || file }
        })
    },
    []
  )

  return { getLeaderPokemons }
}
