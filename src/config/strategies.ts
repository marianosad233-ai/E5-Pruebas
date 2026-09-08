export const STRATEGIES = [
  { id: "dingxianyou", name: "Dingxianyou", description: "Estrategia actual · Politoed" },
  { id: "dingxianyou-2", name: "Dingxianyou 2.0", description: "Nueva estrategia" },
] as const

export type StrategyId = (typeof STRATEGIES)[number]["id"]
