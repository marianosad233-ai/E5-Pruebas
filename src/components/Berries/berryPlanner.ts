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
  /** Lo que cuesta replantar una parcela de esta baya, con la receta "oficial" del juego. */
  replant: RecipeSeed
  /**
   * Formas válidas de replantar una parcela de esta baya: la receta oficial, y una
   * combinación equivalente en "puntos" (1 Muy = 2 normales) que usa menos normales a
   * cambio de una Muy. Con receta oficial de 3 normales, la combinación es 1 normal + 1 Muy.
   */
  replantOptions: RecipeSeed[][]
}

const seedPoints = (variant: SeedVariant) => (variant === "very" ? 2 : 1)

/** Formas de expresar el mismo costo de replantado en semillas normales/Muy. */
function replantOptionsFor(recipe: RecipeSeed): RecipeSeed[][] {
  const totalPoints = recipe.amount * seedPoints(recipe.variant)
  const veryCount = Math.floor(totalPoints / 2)
  const plainCount = totalPoints - veryCount * 2
  const alt: RecipeSeed[] = []
  if (plainCount > 0) alt.push({ flavor: recipe.flavor, variant: "plain", amount: plainCount })
  if (veryCount > 0) alt.push({ flavor: recipe.flavor, variant: "very", amount: veryCount })

  const original = [recipe]
  const sameAsOriginal = alt.length === 1 && alt[0].variant === recipe.variant && alt[0].amount === recipe.amount
  return sameAsOriginal ? [original] : [original, alt]
}

const PURE_SOURCES: Record<Flavor, SourceBerry | undefined> = (() => {
  const map: Partial<Record<Flavor, SourceBerry>> = {}
  for (const berry of berryData) {
    if (berry.recipe.length === 1) {
      const [replant] = berry.recipe
      map[replant.flavor] = { berry, flavor: replant.flavor, replant, replantOptions: replantOptionsFor(replant) }
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

export interface ReplantStrategy {
  recipe: RecipeSeed[]
  plots: number
  tools: number
  netPlain: number
  netVery: number
}

export interface FlavorPlan {
  flavor: Flavor
  needPlain: number
  needVery: number
  source?: SourceBerry
  feasible: boolean
  plots: number
  tools: number
  /** Cómo se reparten esas parcelas entre las recetas de replantado disponibles. */
  strategies: ReplantStrategy[]
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

const EPS = 1e-9
const MAX_SEARCH = 20_000

interface SolvedFlavor {
  feasible: boolean
  plots: number
  tools: number
  strategies: ReplantStrategy[]
}

const infeasible: SolvedFlavor = { feasible: false, plots: 0, tools: 0, strategies: [] }

/**
 * Reparte las parcelas de la baya fuente de un sabor entre sus recetas de replantado
 * (normal×3, o normal+Muy) para cubrir needPlain/needVery con el mínimo de parcelas.
 * Cada receta rinde distinto neto de normales/Muy, así que suele convenir usar solo
 * una de las dos según lo que haga falta — pero el buscador prueba las combinaciones.
 */
function solveFlavor(
  source: SourceBerry | undefined,
  needPlain: number,
  needVery: number,
  plainChance: number,
  overrides: Record<number, number>,
): SolvedFlavor {
  if (needPlain <= EPS && needVery <= EPS) return { feasible: true, plots: 0, tools: 0, strategies: [] }
  if (!source) return infeasible

  const yieldPerPlot = sourceYield(source, overrides)
  const rawPlain = yieldPerPlot * plainChance
  const rawVery = yieldPerPlot * (1 - plainChance)

  const nets = source.replantOptions.map((recipe) => {
    const plainCost = recipe.find((s) => s.variant === "plain")?.amount ?? 0
    const veryCost = recipe.find((s) => s.variant === "very")?.amount ?? 0
    return { recipe, netPlain: rawPlain - plainCost, netVery: rawVery - veryCost }
  })

  // Con una sola receta disponible, es una simple división.
  if (nets.length === 1) {
    const [A] = nets
    const needed: number[] = []
    if (needPlain > 0) {
      if (A.netPlain <= EPS) return infeasible
      needed.push(needPlain / A.netPlain)
    }
    if (needVery > 0) {
      if (A.netVery <= EPS) return infeasible
      needed.push(needVery / A.netVery)
    }
    const plots = Math.ceil(Math.max(...needed) - EPS)
    return {
      feasible: true,
      plots,
      tools: plots * yieldPerPlot,
      strategies: [{ recipe: A.recipe, plots, tools: plots * yieldPerPlot, netPlain: A.netPlain, netVery: A.netVery }],
    }
  }

  // Con dos recetas, se prueba cuántas parcelas usar de la primera y se completa con la segunda.
  const [A, B] = nets
  if (needPlain > 0 && A.netPlain <= EPS && B.netPlain <= EPS) return infeasible
  if (needVery > 0 && A.netVery <= EPS && B.netVery <= EPS) return infeasible

  let best: { a: number; b: number; plots: number } | null = null

  for (let a = 0; a <= MAX_SEARCH; a++) {
    if (best && a >= best.plots) break

    let lo = 0
    let ok = true
    for (const [need, netA, netB] of [
      [needPlain, A.netPlain, B.netPlain],
      [needVery, A.netVery, B.netVery],
    ] as const) {
      const remaining = need - a * netA
      if (remaining <= EPS) continue
      if (netB <= EPS) {
        ok = false
        break
      }
      lo = Math.max(lo, Math.ceil(remaining / netB - EPS))
    }

    if (!ok) {
      // Puede que A por sí sola ya no pueda mejorar más allá de este punto para ninguna semilla.
      if (A.netPlain <= EPS && A.netVery <= EPS) break
      continue
    }

    const plots = a + lo
    if (!best || plots < best.plots) best = { a, b: lo, plots }
  }

  if (!best) return infeasible

  const strategies: ReplantStrategy[] = []
  if (best.a > 0) strategies.push({ recipe: A.recipe, plots: best.a, tools: best.a * yieldPerPlot, netPlain: A.netPlain, netVery: A.netVery })
  if (best.b > 0) strategies.push({ recipe: B.recipe, plots: best.b, tools: best.b * yieldPerPlot, netPlain: B.netPlain, netVery: B.netVery })

  return { feasible: true, plots: best.plots, tools: best.plots * yieldPerPlot, strategies }
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
    const producedPlain = solved.strategies.reduce((sum, s) => sum + s.plots * Math.max(0, s.netPlain), 0)
    const producedVery = solved.strategies.reduce((sum, s) => sum + s.plots * Math.max(0, s.netVery), 0)
    return {
      flavor,
      needPlain: need.plain,
      needVery: need.very,
      source,
      feasible: solved.feasible,
      plots: solved.plots,
      tools: solved.tools,
      strategies: solved.strategies,
      surplusPlain: solved.feasible ? Math.max(0, producedPlain - need.plain) : 0,
      surplusVery: solved.feasible ? Math.max(0, producedVery - need.very) : 0,
    }
  })

  const sourcePlots = flavors.reduce((sum, item) => sum + item.plots, 0)
  const tools = flavors.reduce((sum, item) => sum + item.tools, 0)
  const plotsUsed = targetPlots + sourcePlots
  const plotsShortfall = plotsUsed - totalPlots
  const feasible = flavors.every((item) => item.feasible)

  // Semillas para arrancar: cada receta usada aporta su propio costo de replantado.
  const startMap = new Map<string, { flavor: Flavor; variant: SeedVariant; needed: number }>()
  for (const item of flavors) {
    for (const strategy of item.strategies) {
      for (const seed of strategy.recipe) {
        const key = `${seed.flavor}-${seed.variant}`
        const current = startMap.get(key) ?? { flavor: seed.flavor, variant: seed.variant, needed: 0 }
        current.needed += seed.amount * strategy.plots
        startMap.set(key, current)
      }
    }
  }
  const start: StartRow[] = Array.from(startMap.values()).map((row) => {
    const inStock = input.stock[`${row.flavor}-${row.variant}`] ?? 0
    const missing = Math.max(0, row.needed - inStock)
    return { ...row, inStock, missing, cost: missing * prices.seeds[row.flavor][row.variant] }
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
