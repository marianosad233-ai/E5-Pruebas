import type { BerryData } from "./berries.types"

/* ------------------------------------------------------------------ */
/*  Tipos y constantes                                                 */
/* ------------------------------------------------------------------ */

export type Flavor = "spicy" | "bitter" | "dry" | "sweet" | "sour"
export type SeedVariant = "plain" | "very"
export type Objective = "plots" | "tools"
export type PlanMode = "fixed" | "max"

export interface RecipeSeed {
  flavor: Flavor
  variant: SeedVariant
  amount: number
}

export const FLAVORS: Flavor[] = ["spicy", "bitter", "dry", "sweet", "sour"]

const DEGREE_KEY: Record<Flavor, keyof BerryData> = {
  spicy: "spicy_degree",
  bitter: "bitter_degree",
  dry: "dry_degree",
  sweet: "sweet_degree",
  sour: "sour_degree",
}

/** Semillas que entrega un Harvest Tool al usarlo sobre una baya. */
export const SEEDS_PER_TOOL = 1

/**
 * Rendimientos promedio medidos en el juego. Tienen prioridad sobre el promedio
 * min/max del JSON (Mago y Aguav: 4–7 en el JSON, pero el promedio real es 6).
 */
export const MEASURED_YIELDS: Record<number, number> = { 615: 6, 616: 6 }

const EPS = 1e-9
const MAX_SEARCH = 100_000

/* ------------------------------------------------------------------ */
/*  Recetas y rendimientos                                             */
/* ------------------------------------------------------------------ */

/** Semillas que hay que plantar por parcela para obtener la baya. */
export function buildRecipe(berry: BerryData): RecipeSeed[] {
  const recipe: RecipeSeed[] = []
  for (const flavor of FLAVORS) {
    const degree = berry[DEGREE_KEY[flavor]] as number
    if (degree === 1) recipe.push({ flavor, variant: "plain", amount: 1 })
    if (degree === 2) recipe.push({ flavor, variant: "very", amount: 1 })
    if (degree === 3) recipe.push({ flavor, variant: "plain", amount: 3 })
    if (degree === 4) recipe.push({ flavor, variant: "very", amount: 2 })
  }
  return recipe
}

export function jsonAverageYield(berry: BerryData): number {
  return (berry.min_harvest + berry.max_harvest) / 2
}

export function defaultYield(berry: BerryData): number {
  return MEASURED_YIELDS[berry.item_id] ?? jsonAverageYield(berry)
}

/* ------------------------------------------------------------------ */
/*  Bayas fuente (las que se cultivan solo para sacar semillas)        */
/* ------------------------------------------------------------------ */

export interface SourceCandidate {
  berry: BerryData
  flavor: Flavor
  yieldPerPlot: number
  /** Lo que consume replantar UNA parcela de esta baya. */
  replant: RecipeSeed
  /** Semillas normales netas por parcela (producidas − replantado). */
  netPlain: number
  /** Semillas Muy netas por parcela (producidas − replantado). */
  netVery: number
}

/**
 * Solo se consideran bayas de un único sabor: sus semillas son de ese sabor,
 * sin ambigüedad. Ej.: Cereza y Figy para Picante.
 */
export function buildCandidates(
  berries: BerryData[],
  plainChance: number,
  yields: Record<number, number>,
): Record<Flavor, SourceCandidate[]> {
  const result: Record<Flavor, SourceCandidate[]> = { spicy: [], bitter: [], dry: [], sweet: [], sour: [] }
  for (const berry of berries) {
    const recipe = buildRecipe(berry)
    if (recipe.length !== 1) continue
    const replant = recipe[0]
    const yieldPerPlot = yields[berry.item_id] ?? defaultYield(berry)
    const seeds = yieldPerPlot * SEEDS_PER_TOOL
    result[replant.flavor].push({
      berry,
      flavor: replant.flavor,
      yieldPerPlot,
      replant,
      netPlain: seeds * plainChance - (replant.variant === "plain" ? replant.amount : 0),
      netVery: seeds * (1 - plainChance) - (replant.variant === "very" ? replant.amount : 0),
    })
  }
  return result
}

/* ------------------------------------------------------------------ */
/*  Solver de un sabor                                                 */
/* ------------------------------------------------------------------ */

export interface Allocation {
  candidate: SourceCandidate
  plots: number
}

export interface FlavorSolution {
  feasible: boolean
  allocations: Allocation[]
  plots: number
  tools: number
}

const emptySolution = (feasible: boolean): FlavorSolution => ({ feasible, allocations: [], plots: 0, tools: 0 })

function isBetter(a: { plots: number; tools: number }, b: { plots: number; tools: number }, objective: Objective) {
  const [a1, a2, b1, b2] =
    objective === "plots" ? [a.plots, a.tools, b.plots, b.tools] : [a.tools, a.plots, b.tools, b.plots]
  return a1 < b1 - EPS || (Math.abs(a1 - b1) <= EPS && a2 < b2 - EPS)
}

/**
 * Encuentra cuántas parcelas de cada baya fuente hacen falta para producir
 * `needPlain` semillas normales y `needVery` semillas Muy de UN sabor, dejando
 * cubierto además el replantado de las propias parcelas fuente.
 *
 * Hay como máximo dos candidatas por sabor (grado 3 y grado 4), así que se
 * recorren las parcelas de la primera y se calcula el mínimo de la segunda.
 */
export function solveFlavor(
  candidates: SourceCandidate[],
  needPlain: number,
  needVery: number,
  objective: Objective,
): FlavorSolution {
  if (needPlain <= EPS && needVery <= EPS) return emptySolution(true)
  if (candidates.length === 0) return emptySolution(false)

  const [A, B] = candidates
  const needs = [needPlain, needVery]
  const netA = [A.netPlain, A.netVery]
  const netB = B ? [B.netPlain, B.netVery] : [0, 0]

  let best: { a: number; b: number; plots: number; tools: number } | null = null

  for (let a = 0; a <= MAX_SEARCH; a++) {
    if (best) {
      if (objective === "plots" && a >= best.plots) break
      if (objective === "tools" && a * A.yieldPerPlot >= best.tools) break
    }

    let lo = 0
    let hi = B ? Number.POSITIVE_INFINITY : 0
    let ok = true

    for (let c = 0; c < 2; c++) {
      const remaining = needs[c] - a * netA[c]
      if (remaining <= EPS) {
        // Ya cubierto con A. Si B resta en esta semilla, limita cuántas parcelas de B caben.
        if (B && netB[c] < -EPS) hi = Math.min(hi, Math.floor((-remaining) / -netB[c] + EPS))
        continue
      }
      if (!B || netB[c] <= EPS) {
        ok = false
        break
      }
      lo = Math.max(lo, Math.ceil(remaining / netB[c] - EPS))
    }

    if (!ok || lo > hi) continue

    const b = lo
    const plots = a + b
    const tools = a * A.yieldPerPlot + (B ? b * B.yieldPerPlot : 0)
    const candidate = { a, b, plots, tools }
    if (!best || isBetter(candidate, best, objective)) best = candidate
  }

  if (!best) return emptySolution(false)

  const allocations: Allocation[] = []
  if (best.a > 0) allocations.push({ candidate: A, plots: best.a })
  if (B && best.b > 0) allocations.push({ candidate: B, plots: best.b })
  return { feasible: true, allocations, plots: best.plots, tools: best.tools }
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
  berries: BerryData[]
  target: BerryData
  targetYield: number
  /** Probabilidad de semilla normal, de 0 a 1. */
  plainChance: number
  /** Rendimiento promedio por baya fuente (item_id → bayas por parcela). */
  yields: Record<number, number>
  accounts: number
  plotsPerAccount: number
  /** Si se pueden pasar semillas entre cuentas, todas las parcelas forman un solo terreno. */
  canTransfer: boolean
  mode: PlanMode
  /** Parcelas objetivo totales (modo "fixed"). */
  targetPlots: number
  /** Margen de seguridad en % que se descuenta del máximo (modo "max"). */
  marginPct: number
  objective: Objective
  prices: Prices
  /** Inventario de semillas para el arranque, con clave `${flavor}-${variant}`. */
  stock: Record<string, number>
}

export interface SourcePlan {
  candidate: SourceCandidate
  plots: number
  tools: number
  netPlain: number
  netVery: number
}

export interface FlavorPlan {
  flavor: Flavor
  needPlain: number
  needVery: number
  feasible: boolean
  sources: SourcePlan[]
  plots: number
  tools: number
  surplusPlain: number
  surplusVery: number
}

export interface SeedNeed extends RecipeSeed {
  /** Semillas totales por ciclo. */
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
  groups: number
  plotsPerGroup: number
  totalPlots: number
  maxTargetPlots: number
  targetPlots: number
  recipe: RecipeSeed[]
  needs: SeedNeed[]
  flavors: FlavorPlan[]
  feasible: boolean
  sourcePlots: number
  plotsUsed: number
  /** Positivo = faltan parcelas; negativo = sobran. */
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

interface GroupSolution {
  flavors: Array<{ flavor: Flavor; needPlain: number; needVery: number; solution: FlavorSolution }>
  sourcePlots: number
  tools: number
  feasible: boolean
}

function solveGroup(
  recipe: RecipeSeed[],
  candidates: Record<Flavor, SourceCandidate[]>,
  targetPlots: number,
  objective: Objective,
): GroupSolution {
  const needByFlavor = new Map<Flavor, { plain: number; very: number }>()
  for (const seed of recipe) {
    const current = needByFlavor.get(seed.flavor) ?? { plain: 0, very: 0 }
    current[seed.variant] += seed.amount * targetPlots
    needByFlavor.set(seed.flavor, current)
  }

  const flavors = Array.from(needByFlavor.entries()).map(([flavor, need]) => ({
    flavor,
    needPlain: need.plain,
    needVery: need.very,
    solution: solveFlavor(candidates[flavor], need.plain, need.very, objective),
  }))

  return {
    flavors,
    sourcePlots: flavors.reduce((sum, item) => sum + item.solution.plots, 0),
    tools: flavors.reduce((sum, item) => sum + item.solution.tools, 0),
    feasible: flavors.every((item) => item.solution.feasible),
  }
}

/** Máximo de parcelas objetivo que un grupo puede sostener sin comprar semillas. */
function maxTargetForGroup(
  recipe: RecipeSeed[],
  candidates: Record<Flavor, SourceCandidate[]>,
  plotsPerGroup: number,
  objective: Objective,
): number {
  const fits = (targetPlots: number) => {
    if (targetPlots === 0) return true
    const group = solveGroup(recipe, candidates, targetPlots, objective)
    return group.feasible && targetPlots + group.sourcePlots <= plotsPerGroup
  }

  let lo = 0
  let hi = plotsPerGroup
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2)
    if (fits(mid)) lo = mid
    else hi = mid - 1
  }
  while (lo > 0 && !fits(lo)) lo--
  return lo
}

/** Reparte las parcelas entre cuentas: objetivo desde la primera, fuentes desde la última. */
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
  const { target, plainChance, prices } = input
  const accounts = Math.max(1, Math.floor(input.accounts))
  const groups = input.canTransfer ? 1 : accounts
  const plotsPerGroup = input.canTransfer ? input.plotsPerAccount * accounts : input.plotsPerAccount
  const totalPlots = input.plotsPerAccount * accounts

  const recipe = buildRecipe(target)
  const candidates = buildCandidates(input.berries, plainChance, input.yields)

  const maxPerGroup = maxTargetForGroup(recipe, candidates, plotsPerGroup, input.objective)
  const targetPerGroup =
    input.mode === "max"
      ? Math.floor(maxPerGroup * (1 - input.marginPct / 100))
      : Math.max(0, Math.ceil(input.targetPlots / groups))

  const group = solveGroup(recipe, candidates, targetPerGroup, input.objective)
  const net = 1 - prices.taxPct / 100

  const targetPlots = targetPerGroup * groups

  const needs: SeedNeed[] = recipe.map((seed) => ({ ...seed, total: seed.amount * targetPlots }))

  const flavors: FlavorPlan[] = group.flavors.map(({ flavor, needPlain, needVery, solution }) => {
    const sources: SourcePlan[] = solution.allocations.map(({ candidate, plots }) => ({
      candidate,
      plots: plots * groups,
      tools: plots * groups * candidate.yieldPerPlot,
      netPlain: plots * groups * candidate.netPlain,
      netVery: plots * groups * candidate.netVery,
    }))
    const producedNetPlain = sources.reduce((sum, item) => sum + item.netPlain, 0)
    const producedNetVery = sources.reduce((sum, item) => sum + item.netVery, 0)
    return {
      flavor,
      needPlain: needPlain * groups,
      needVery: needVery * groups,
      feasible: solution.feasible,
      sources,
      plots: solution.plots * groups,
      tools: solution.tools * groups,
      surplusPlain: solution.feasible ? Math.max(0, producedNetPlain - needPlain * groups) : 0,
      surplusVery: solution.feasible ? Math.max(0, producedNetVery - needVery * groups) : 0,
    }
  })

  const sourcePlots = flavors.reduce((sum, item) => sum + item.plots, 0)
  const tools = flavors.reduce((sum, item) => sum + item.tools, 0)
  const plotsUsed = targetPlots + sourcePlots
  const plotsShortfall = plotsUsed - totalPlots
  const feasible = group.feasible

  // Semillas para arrancar: lo que cuesta plantar por primera vez las parcelas fuente.
  const startMap = new Map<string, { flavor: Flavor; variant: SeedVariant; needed: number }>()
  for (const flavorPlan of flavors) {
    for (const source of flavorPlan.sources) {
      const { flavor, variant, amount } = source.candidate.replant
      const key = `${flavor}-${variant}`
      const current = startMap.get(key) ?? { flavor, variant, needed: 0 }
      current.needed += amount * source.plots
      startMap.set(key, current)
    }
  }
  const start: StartRow[] = Array.from(startMap.values()).map((row) => {
    const inStock = input.stock[`${row.flavor}-${row.variant}`] ?? 0
    const missing = Math.max(0, row.needed - inStock)
    return { ...row, inStock, missing, cost: missing * prices.seeds[row.flavor][row.variant] }
  })

  // Economía
  const targetBerries = targetPlots * input.targetYield
  const targetRevenue = targetBerries * prices.target * net
  const toolCost = tools * prices.tool
  const surplusRevenue =
    flavors.reduce(
      (sum, item) =>
        sum + item.surplusPlain * prices.seeds[item.flavor].plain + item.surplusVery * prices.seeds[item.flavor].very,
      0,
    ) * net
  // Sabores sin solución posible: hay que comprar esas semillas.
  const unmetCost = flavors.reduce(
    (sum, item) =>
      item.feasible ? sum : sum + item.needPlain * prices.seeds[item.flavor].plain + item.needVery * prices.seeds[item.flavor].very,
    0,
  )
  const buyAllCost = needs.reduce((sum, seed) => sum + seed.total * prices.seeds[seed.flavor][seed.variant], 0)
  const profit = targetRevenue + surplusRevenue - toolCost - unmetCost
  const profitIfBuying = targetRevenue - buyAllCost

  return {
    groups,
    plotsPerGroup,
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
    distribution: distributePlots(accounts, input.plotsPerAccount, input.canTransfer, targetPlots, sourcePlots),
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
