import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import type { BredNode, BreedingConfig } from "./breeding.types"
import type { IvKey } from "./breeding.types"

const DEFAULT_CONFIG: BreedingConfig = { ivsCount: 5, nature: false, isBreeding: false, iv: {} }

type BreedingContextValue = {
  breds: BredNode[]
  breedingConfig: BreedingConfig
  setBreedingConfig: (data: Partial<BreedingConfig>) => void
  setAsBred: (node: BredNode) => void
  removeBred: (node: BredNode) => void
  clearBreeding: () => void
}

const BreedingContext = createContext<BreedingContextValue | null>(null)

export function BreedingProvider({ children }: { children: ReactNode }) {
  const [breds, setBreds] = useState<BredNode[]>([])
  const [breedingConfig, setConfig] = useState<BreedingConfig>(DEFAULT_CONFIG)

  const findTreeBreds = ({ row, col }: BredNode) => {
    const result: BredNode[] = [{ row, col }]
    let delta = 1
    for (let currentRow = row - 1; currentRow > 0; currentRow--) {
      delta *= 2
      const ending = (col + 1) * delta
      for (let j = 0; j < delta; j++) result.push({ row: currentRow, col: ending - 1 - j })
    }
    return result
  }

  const setAsBred = (node: BredNode) => {
    const chain = findTreeBreds(node)
    setBreds(current => {
      const next = [...current]
      for (const item of chain) {
        if (!next.some(x => x.row === item.row && x.col === item.col)) next.push(item)
      }
      return next
    })
  }

  const removeBred = (node: BredNode) => {
    const chain = findTreeBreds(node)
    setBreds(current => current.filter(item => !chain.some(x => x.row === item.row && x.col === item.col)))
  }

  const value = useMemo(() => ({
    breds,
    breedingConfig,
    setBreedingConfig: (data: Partial<BreedingConfig>) => setConfig(current => ({ ...current, ...data })),
    setAsBred,
    removeBred,
    clearBreeding: () => { setBreds([]); setConfig(DEFAULT_CONFIG) },
  }), [breds, breedingConfig])

  return <BreedingContext.Provider value={value}>{children}</BreedingContext.Provider>
}

export function useBreeding() {
  const value = useContext(BreedingContext)
  if (!value) throw new Error("useBreeding must be used inside BreedingProvider")
  return value
}

export const IV_STATS: Array<{ id: IvKey; label: string }> = [
  { id: "hp", label: "HP" },
  { id: "atk", label: "Attack" },
  { id: "def", label: "Defense" },
  { id: "spatk", label: "Sp. Attack" },
  { id: "spdef", label: "Sp. Defense" },
  { id: "spe", label: "Speed" },
]

export const IV_COLORS: Record<string, string> = {
  hp: "#66d9a6", atk: "#f26b6b", def: "#e8a95a", spatk: "#63a9f5", spdef: "#a78bfa", spe: "#f4d35e", nat: "#9ca3af",
}
