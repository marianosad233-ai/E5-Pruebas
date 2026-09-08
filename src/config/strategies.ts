export const E4_STRATEGIES = [
  { id: "dingxianyou", name: "Dingxianyou", description: "Estrategia actual · Politoed" },
  { id: "dingxianyou-2", name: "Dingxianyou 2.0", description: "Misma estrategia · Pokepaste diferente" },
] as const

export type StrategyId = (typeof E4_STRATEGIES)[number]["id"]

export const GYM_RERUN_STRATEGIES = [
  { id: "six-pillars", name: "Six Pillars", description: "Estrategia Gym Rerun" },
  { id: "seven-hells", name: "Seven Hells", description: "Estrategia Gym Rerun" },
] as const

export type GymRerunStrategyId = (typeof GYM_RERUN_STRATEGIES)[number]["id"]

export const RED_BATTLE_STRATEGIES = [
  { id: "jinxedboon", name: "JinxedBoon", description: "Estrategia Red Battle" },
  { id: "colored", name: "Colored", description: "Estrategia Red Battle" },
] as const

export type RedBattleStrategyId = (typeof RED_BATTLE_STRATEGIES)[number]["id"]
