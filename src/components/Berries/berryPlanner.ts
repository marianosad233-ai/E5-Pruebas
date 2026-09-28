import { berryData, type RawBerry } from "./berryData"

/* ------------------------------------------------------------------ */
/*  Tipos                                                              */
/* ------------------------------------------------------------------ */

export type Flavor = "spicy" | "bitter" | "dry" | "sweet" | "sour"
export type SeedVariant = "plain" | "very"
export type PlanMode = "fixed" | "max"

export interface RecipeSeed {
  flavor: Flavor
  variant: SeedVariant
  amount: number
}

export const FLAVORS: Flavor[] = ["spicy", "bitter", "dry", "sweet", "sour"]

export const berries: RawBerry[] = berryData

/* ------------------------------------------------------------------ */
/*  Bayas fuente: una única baya "pura" (receta de 1 solo sabor) por    */
/*  sabor. Es un dato del juego, no una elección: no hay alternativa.   */
/* ------------------------------------------------------------------ */

export interface SourceBerry {
  berry: RawBerry
  flavor: Flavor
  /** Lo que cuesta replantar una parcela de esta baya (semillas de su propio sabor). */
  replant: RecipeSeed
}

const PURE_SOURCES: Record<Flavor, SourceBerry | undefined> = (() => {
  const map: Partial<Record<Flavor, SourceBerry>> = {}
  for (const berry of berryData) {
    if (berry.recipe.length === 1) {
      const [replant] = berry.recipe
      map[replant.flavor] = { berry, flavor: replant.flavor, replant }
    }
  }
  return map as Record<Flavor, SourceBerry | undefined>
})()

export function sourceForFlavor(flavor: Flavor): SourceBerry | undefined {
  return PURE_SOURCES[flavor]
}

export function defaultYield(berry: RawBerry): number {
  return (berry.minYield + berry.maxYield) / 2
}

/* ------------------------------------------------------------------ */
/*  Plan completo                                                      */
/* ------------------------------------------------------------------ */

export interface Prices {
  tool: number
  target: number
  /** Comisión del GTL en porcentaje (0–100). */
  taxPct: number
  seeds: Record<Flavor, Record<SeedVariant, number>>
}

export interface PlanInput {
  target: RawBerry
  targetYield: number
  /** Probabilidad de semilla normal, de 0 a 1. */
  plainChance: number
  /** Rendimiento promedio por baya fuente (item id → bayas por parcela). */
  sourceYields: Record<number, number>
  accounts: number
  plotsPerAccount: number
  /** Si se pueden pasar semillas entre cuentas, todas las parcelas forman un solo terreno. */
  canTransfer: boolean
  mode: PlanMode
  /** Parcelas objetivo totales (modo "fixed"). */
  targetPlots: number
  /** Margen de seguridad en % que se descuenta del máximo (modo "max"). */
  marginPct: number
  prices: Prices
  /** Inventario de semillas para el arranque, con clave `${flavor}-${variant}`. */
  stock: Record<string, number>
}

export interface FlavorPlan {
  flavor: Flavor
  needPlain: number
  needVery: number
  source?: SourceBerry
  feasible: boolean
  plots: number
  tools: number
  surplusPlain: number
  surplusVery: number
}

export interface SeedNeed extends RecipeSeed {
  total: number
}

export interface StartRow {
  flavor: Flavor
  variant: SeedVariant
  needed: number
  inStock: number
  missing: number
  cost: number
}

export interface AccountRow {
  account: number
  target: number
  sources: number
  free: number
}

export interface Plan {
  totalPlots: number
  maxTargetPlots: number
  targetPlots: number
  recipe: RecipeSeed[]
  needs: SeedNeed[]
  flavors: FlavorPlan[]
  feasible: boolean
  sourcePlots: number
  plotsUsed: number
  plotsShortfall: number
  fits: boolean
  tools: number
  start: StartRow[]
  distribution: AccountRow[]
  economics: {
    targetBerries: number
    targetRevenue: number
    toolCost: number
    surplusRevenue: number
    unmetCost: number
    profit: number
    buyAllCost: number
    profitIfBuying: number
    savings: number
    costPerBerry: number
  }
}

function sourceYield(source: SourceBerry, overrides: Record<number, number>): number {
  return overrides[source.berry.itemId] ?? defaultYield(source.berry)
}

/** Parcelas de la baya fuente de un sabor necesarias para cubrir needPlain/needVery de ese sabor. */
function solveFlavor(
  source: SourceBerry | undefined,
  needPlain: number,
  needVery: number,
  plainChance: number,
  overrides: Record<number, number>,
): { feasible: boolean; plots: number; tools: number; netPlain: number; netVery: number } {
  if (needPlain <= 1e-9 && needVery <= 1e-9) return { feasible: true, plots: 0, tools: 0, netPlain: 0, netVery: 0 }
  if (!source) return { feasible: false, plots: 0, tools: 0, netPlain: 0, netVery: 0 }

  const yieldPerPlot = sourceYield(source, overrides)
  const seedsPerPlot = yieldPerPlot // 1 semilla por Harvest Tool
  const plainPerPlot = seedsPerPlot * plainChance - (source.replant.variant === "plain" ? source.replant.amount : 0)
  const veryPerPlot = seedsPerPlot * (1 - plainChance) - (source.replant.variant === "very" ? source.replant.amount : 0)

  const needed: number[] = []
  if (needPlain > 0) {
    if (plainPerPlot <= 1e-9) return { feasible: false, plots: 0, tools: 0, netPlain: plainPerPlot, netVery: veryPerPlot }
    needed.push(needPlain / plainPerPlot)
  }
  if (needVery > 0) {
    if (veryPerPlot <= 1e-9) return { feasible: false, plots: 0, tools: 0, netPlain: plainPerPlot, netVery: veryPerPlot }
    needed.push(needVery / veryPerPlot)
  }

  const plots = Math.ceil(Math.max(...needed) - 1e-9)
  return { feasible: true, plots, tools: plots * yieldPerPlot, netPlain: plainPerPlot, netVery: veryPerPlot }
}

function sumNeeds(recipe: RecipeSeed[], targetPlots: number): Map<Flavor, { plain: number; very: number }> {
  const map = new Map<Flavor, { plain: number; very: number }>()
  for (const seed of recipe) {
    const current = map.get(seed.flavor) ?? { plain: 0, very: 0 }
    current[seed.variant] += seed.amount * targetPlots
    map.set(seed.flavor, current)
  }
  return map
}

/** Máximo de parcelas objetivo que caben en `availablePlots` (objetivo + fuentes) sin comprar semillas. */
function maxTarget(
  recipe: RecipeSeed[],
  availablePlots: number,
  plainChance: number,
  overrides: Record<number, number>,
): number {
  const fits = (targetPlots: number) => {
    if (targetPlots === 0) return true
    const needs = sumNeeds(recipe, targetPlots)
    let sourcePlots = 0
    for (const [flavor, need] of needs) {
      const solved = solveFlavor(sourceForFlavor(flavor), need.plain, need.very, plainChance, overrides)
      if (!solved.feasible) return false
      sourcePlots += solved.plots
    }
    return targetPlots + sourcePlots <= availablePlots
  }

  let lo = 0
  let hi = availablePlots
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2)
    if (fits(mid)) lo = mid
    else hi = mid - 1
  }
  return lo
}

export function distributePlots(
  accounts: number,
  plotsPerAccount: number,
  canTransfer: boolean,
  targetPlots: number,
  sourcePlots: number,
): AccountRow[] {
  if (!canTransfer) {
    const target = Math.round(targetPlots / accounts)
    const sources = Math.round(sourcePlots / accounts)
    return Array.from({ length: accounts }, (_, index) => ({
      account: index + 1,
      target,
      sources,
      free: plotsPerAccount - target - sources,
    }))
  }

  const rows: AccountRow[] = Array.from({ length: accounts }, (_, index) => ({
    account: index + 1,
    target: 0,
    sources: 0,
    free: plotsPerAccount,
  }))

  let pendingTarget = targetPlots
  for (let i = 0; i < accounts && pendingTarget > 0; i++) {
    const take = Math.min(pendingTarget, plotsPerAccount)
    rows[i].target = take
    pendingTarget -= take
  }

  let pendingSources = sourcePlots
  for (let i = accounts - 1; i >= 0 && pendingSources > 0; i--) {
    const take = Math.min(pendingSources, plotsPerAccount - rows[i].target)
    rows[i].sources = take
    pendingSources -= take
  }

  for (const row of rows) row.free = plotsPerAccount - row.target - row.sources
  return rows
}

export function computePlan(input: PlanInput): Plan {
  const { target, prices } = input
  const accounts = Math.max(1, Math.floor(input.accounts))
  const canTransfer = input.canTransfer || accounts === 1
  const groups = canTransfer ? 1 : accounts
  const plotsPerGroup = canTransfer ? input.plotsPerAccount * accounts : input.plotsPerAccount
  const totalPlots = input.plotsPerAccount * accounts

  const recipe = target.recipe
  const maxPerGroup = maxTarget(recipe, plotsPerGroup, input.plainChance, input.sourceYields)
  const targetPerGroup =
    input.mode === "max"
      ? Math.floor(maxPerGroup * (1 - input.marginPct / 100))
      : Math.max(0, Math.ceil(input.targetPlots / groups))

  const targetPlots = targetPerGroup * groups
  const needsMap = sumNeeds(recipe, targetPlots)
  const needs: SeedNeed[] = recipe.map((seed) => ({ ...seed, total: seed.amount * targetPlots }))

  const flavors: FlavorPlan[] = Array.from(needsMap.entries()).map(([flavor, need]) => {
    const source = sourceForFlavor(flavor)
    const solved = solveFlavor(source, need.plain, need.very, input.plainChance, input.sourceYields)
    const producedPlain = solved.plots * Math.max(0, solved.netPlain)
    const producedVery = solved.plots * Math.max(0, solved.netVery)
    return {
      flavor,
      needPlain: need.plain,
      needVery: need.very,
      source,
      feasible: solved.feasible,
      plots: solved.plots,
      tools: solved.tools,
      surplusPlain: solved.feasible ? Math.max(0, producedPlain - need.plain) : 0,
      surplusVery: solved.feasible ? Math.max(0, producedVery - need.very) : 0,
    }
  })

  const sourcePlots = flavors.reduce((sum, item) => sum + item.plots, 0)
  const tools = flavors.reduce((sum, item) => sum + item.tools, 0)
  const plotsUsed = targetPlots + sourcePlots
  const plotsShortfall = plotsUsed - totalPlots
  const feasible = flavors.every((item) => item.feasible)

  const start: StartRow[] = flavors
    .filter((item) => item.source && item.plots > 0)
    .map((item) => {
      const { flavor, variant, amount } = item.source!.replant
      const needed = amount * item.plots
      const inStock = input.stock[`${flavor}-${variant}`] ?? 0
      const missing = Math.max(0, needed - inStock)
      return { flavor, variant, needed, inStock, missing, cost: missing * prices.seeds[flavor][variant] }
    })

  const targetBerries = targetPlots * input.targetYield
  const net = 1 - prices.taxPct / 100
  const targetRevenue = targetBerries * prices.target * net
  const toolCost = tools * prices.tool
  const surplusRevenue =
    flavors.reduce(
      (sum, item) => sum + item.surplusPlain * prices.seeds[item.flavor].plain + item.surplusVery * prices.seeds[item.flavor].very,
      0,
    ) * net
  const unmetCost = flavors.reduce(
    (sum, item) =>
      item.feasible ? sum : sum + item.needPlain * prices.seeds[item.flavor].plain + item.needVery * prices.seeds[item.flavor].very,
    0,
  )
  const buyAllCost = needs.reduce((sum, seed) => sum + seed.total * prices.seeds[seed.flavor][seed.variant], 0)
  const profit = targetRevenue + surplusRevenue - toolCost - unmetCost
  const profitIfBuying = targetRevenue - buyAllCost

  return {
    totalPlots,
    maxTargetPlots: maxPerGroup * groups,
    targetPlots,
    recipe,
    needs,
    flavors,
    feasible,
    sourcePlots,
    plotsUsed,
    plotsShortfall,
    fits: feasible && plotsShortfall <= 0,
    tools,
    start,
    distribution: distributePlots(accounts, input.plotsPerAccount, canTransfer, targetPlots, sourcePlots),
    economics: {
      targetBerries,
      targetRevenue,
      toolCost,
      surplusRevenue,
      unmetCost,
      profit,
      buyAllCost,
      profitIfBuying,
      savings: profit - profitIfBuying,
      costPerBerry: targetBerries > 0 ? (toolCost + unmetCost - surplusRevenue) / targetBerries : 0,
    },
  }
}
