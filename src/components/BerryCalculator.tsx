import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Calculator, CircleDollarSign, Info, Leaf, Package, RefreshCcw, Sprout, TrendingUp } from "lucide-react"
import hubData from "../data/berriesHub.json"
import type { BerryData, ItemData } from "./Berries/berries.types"

type Flavor = "spicy" | "bitter" | "dry" | "sweet" | "sour"
type SeedVariant = "plain" | "very"

type RecipeSeed = {
  flavor: Flavor
  variant: SeedVariant
  amount: number
}

const berries = hubData.berries as BerryData[]
const items = hubData.items as ItemData[]
const itemName = (id: number) => items.find((item) => item.id === id)?.en_name ?? `Berry #${id}`

const flavorLabels: Record<Flavor, string> = {
  spicy: "Picante",
  bitter: "Amarga",
  dry: "Seca",
  sweet: "Dulce",
  sour: "Ácida",
}

const flavorKeys: Array<[Flavor, keyof BerryData]> = [
  ["spicy", "spicy_degree"],
  ["bitter", "bitter_degree"],
  ["dry", "dry_degree"],
  ["sweet", "sweet_degree"],
  ["sour", "sour_degree"],
]

const spanishBerryNames: Record<string, string> = {
  "Leppa Berry": "Zanama",
  "Sitrus Berry": "Zidra",
  "Cheri Berry": "Zreza",
  "Pecha Berry": "Meloc",
  "Rawst Berry": "Safre",
  "Chesto Berry": "Atania",
  "Aspear Berry": "Perasi",
  "Oran Berry": "Aranja",
  "Lum Berry": "Ziuela",
  "Persim Berry": "Caquic",
}

const sourceByFlavor: Record<Flavor, { itemId: number; name: string }> = {
  spicy: { itemId: 600, name: "Cereza (Cheri)" },
  sweet: { itemId: 602, name: "Meloc (Pecha)" },
  bitter: { itemId: 604, name: "Safre (Rawst)" },
  dry: { itemId: 601, name: "Atania (Chesto)" },
  sour: { itemId: 603, name: "Perasi (Aspear)" },
}

const seedIds: Record<Flavor, Record<SeedVariant, number>> = {
  sour: { plain: 701, very: 706 },
  sweet: { plain: 702, very: 707 },
  bitter: { plain: 703, very: 708 },
  spicy: { plain: 704, very: 709 },
  dry: { plain: 705, very: 710 },
}

function buildRecipe(berry: BerryData): RecipeSeed[] {
  const recipe: RecipeSeed[] = []
  for (const [flavor, key] of flavorKeys) {
    const degree = berry[key] as number
    if (degree === 1) recipe.push({ flavor, variant: "plain", amount: 1 })
    if (degree === 2) recipe.push({ flavor, variant: "very", amount: 1 })
    if (degree === 3) recipe.push({ flavor, variant: "plain", amount: 3 })
    if (degree === 4) recipe.push({ flavor, variant: "very", amount: 2 })
  }
  return recipe
}

function formatMoney(value: number) {
  return `${Math.round(value).toLocaleString("es-PE")} ₽`
}

function formatNumber(value: number, digits = 0) {
  return value.toLocaleString("es-PE", { maximumFractionDigits: digits })
}

type SeedPriceMap = Record<Flavor, { plain: number; very: number }>
type SeedStock = Record<string, number>

type PlanInput = {
  target: BerryData
  targetPlants: number
  totalPlotsMode?: boolean
  totalPlots?: number
  harvestToolPrice: number
  targetPrice: number
  seedPrices: SeedPriceMap
  plainChance: number
  reserveCycles: number
  seedStock: SeedStock
  gtlFee: number
}

function calculatePlan(input: PlanInput) {
  const { target, harvestToolPrice, targetPrice, seedPrices, plainChance, reserveCycles, seedStock, gtlFee } = input
  const recipe = buildRecipe(target)
  const plainRate = Math.max(0.01, Math.min(0.99, plainChance / 100))
  const veryRate = 1 - plainRate
  let targetPlants = input.targetPlants
  if (input.totalPlotsMode && input.totalPlots) {
    const byFlavorForRatio = new Map<Flavor, { plain: number; very: number }>()
    for (const seed of recipe) {
      const current = byFlavorForRatio.get(seed.flavor) ?? { plain: 0, very: 0 }
      current[seed.variant] += seed.amount
      byFlavorForRatio.set(seed.flavor, current)
    }
    let sourceRatio = 0
    for (const [flavor, amounts] of byFlavorForRatio) {
      const source = sourceByFlavor[flavor]
      const sourceBerry = berries.find((berry) => berry.item_id === source.itemId) ?? berries[0]
      const sourceYield = (sourceBerry.min_harvest + sourceBerry.max_harvest) / 2
      const sourcePlainCost = flavor === "spicy" ? 3 : 1
      const sourceVeryCost = flavor === "spicy" ? 0 : 1
      const netPlain = Math.max(0.0001, sourceYield * plainRate - sourcePlainCost)
      const netVery = Math.max(0.0001, sourceYield * veryRate - sourceVeryCost)
      sourceRatio += Math.max(amounts.plain / netPlain, amounts.very / netVery)
    }
    targetPlants = Math.max(1, Math.floor(input.totalPlots / (1 + sourceRatio)))
  }
  const averageTargetYield = (target.min_harvest + target.max_harvest) / 2
  const targetBerries = targetPlants * averageTargetYield
  const requiredSeeds = recipe.map((seed) => ({ ...seed, total: seed.amount * targetPlants }))
  const byFlavor = new Map<Flavor, { plain: number; very: number }>()
  for (const seed of requiredSeeds) {
    const current = byFlavor.get(seed.flavor) ?? { plain: 0, very: 0 }
    current[seed.variant] += seed.total
    byFlavor.set(seed.flavor, current)
  }

  const seedPlan = Array.from(byFlavor.entries()).map(([flavor, amounts]) => {
    const source = sourceByFlavor[flavor]
    const sourceBerry = berries.find((berry) => berry.item_id === source.itemId) ?? berries[0]
    const sourceYield = (sourceBerry.min_harvest + sourceBerry.max_harvest) / 2
    const grossPlain = sourceYield * plainRate
    const grossVery = sourceYield * veryRate
    const sourcePlainCost = flavor === "spicy" ? 3 : 1
    const sourceVeryCost = flavor === "spicy" ? 0 : 1
    const netPlain = grossPlain - sourcePlainCost
    const netVery = grossVery - sourceVeryCost
    const currentPlain = seedStock[`${flavor}-plain`] ?? 0
    const currentVery = seedStock[`${flavor}-very`] ?? 0

    // Recurring cycle: produce only what the target cycle consumes. The source
    // crop's own planting cost is already deducted from its net seed yield.
    const toProducePlain = Math.max(0, amounts.plain - currentPlain)
    const toProduceVery = Math.max(0, amounts.very - currentVery)
    const sourcePlantsForPlain = toProducePlain > 0 ? Math.ceil(toProducePlain / Math.max(0.0001, netPlain)) : 0
    const sourcePlantsForVery = toProduceVery > 0 ? Math.ceil(toProduceVery / Math.max(0.0001, netVery)) : 0
    const sourcePlants = Math.max(sourcePlantsForPlain, sourcePlantsForVery)
    const sourceBerries = sourcePlants * sourceYield
    const generatedPlain = sourceBerries * plainRate
    const generatedVery = sourceBerries * veryRate
    const netGeneratedPlain = Math.max(0, generatedPlain - sourcePlants * sourcePlainCost)
    const netGeneratedVery = Math.max(0, generatedVery - sourcePlants * sourceVeryCost)
    const surplusPlain = Math.max(0, netGeneratedPlain - toProducePlain)
    const surplusVery = Math.max(0, netGeneratedVery - toProduceVery)

    // One-time reserve target. It is not multiplied into recurring cycle costs.
    const reserveNeedPlain = amounts.plain * reserveCycles
    const reserveNeedVery = amounts.very * reserveCycles
    const reserveMissingPlain = Math.max(0, reserveNeedPlain - currentPlain)
    const reserveMissingVery = Math.max(0, reserveNeedVery - currentVery)
    const reservePurchaseCost = reserveMissingPlain * seedPrices[flavor].plain + reserveMissingVery * seedPrices[flavor].very
    const initialSourceSeedPurchase = Math.max(0, sourcePlants * sourcePlainCost - currentPlain) * seedPrices[flavor].plain + Math.max(0, sourcePlants * sourceVeryCost - currentVery) * seedPrices[flavor].very

    return {
      flavor, source, amounts, sourcePlants, sourceBerries, tools: Math.ceil(sourceBerries),
      expectedPlain: netGeneratedPlain, expectedVery: netGeneratedVery,
      requiredPlain: amounts.plain, requiredVery: amounts.very,
      toProducePlain, toProduceVery, reserveMissingPlain, reserveMissingVery,
      surplusPlain, surplusVery, reservePurchaseCost, initialSourceSeedPurchase, sourceGrowTime: sourceBerry.grow_time,
    }
  })

  const sourceTools = seedPlan.reduce((sum, row) => sum + row.tools, 0)
  const totalTools = sourceTools
  const toolCost = totalTools * harvestToolPrice
  const grossSeedRevenue = seedPlan.reduce((sum, row) => sum + row.surplusPlain * seedPrices[row.flavor].plain + row.surplusVery * seedPrices[row.flavor].very, 0)
  const feeRate = Math.max(0, Math.min(1, gtlFee / 100))
  const sourceSeedRevenueNet = grossSeedRevenue * (1 - feeRate)
  const targetBerriesMin = targetPlants * target.min_harvest
  const targetBerriesMax = targetPlants * target.max_harvest
  const targetRevenue = targetBerries * targetPrice
  const targetRevenueNet = targetRevenue * (1 - feeRate)
  const reservePurchaseCost = seedPlan.reduce((sum, row) => sum + row.reservePurchaseCost, 0)
  const initialSourceSeedPurchase = seedPlan.reduce((sum, row) => sum + row.initialSourceSeedPurchase, 0)
  const effectiveCost = Math.max(0, toolCost - sourceSeedRevenueNet)
  const profit = targetRevenueNet + sourceSeedRevenueNet - toolCost
  const profitPerPlot = targetPlants > 0 ? profit / targetPlants : 0
  const totalCycleHours = target.grow_time + (seedPlan.length ? Math.max(...seedPlan.map((row) => row.sourceGrowTime)) : 0)
  const profitPerHour = totalCycleHours > 0 ? profit / totalCycleHours : 0
  const breakEvenPrice = targetBerries > 0 ? Math.max(0, (toolCost - sourceSeedRevenueNet) / (targetBerries * (1 - feeRate))) : 0
  return {
    targetPlants, sourcePlants: seedPlan.reduce((sum, row) => sum + row.sourcePlants, 0), targetBerries, requiredSeeds, seedPlan, sourceTools, totalTools, sourceSeedRevenue: grossSeedRevenue, sourceSeedRevenueNet,
    targetRevenue, targetRevenueNet, toolCost, reservePurchaseCost, initialSourceSeedPurchase, effectiveCost, profit, profitPerPlot, profitPerHour, totalCycleHours,
    breakEvenPrice,
  }
}

export default function BerryCalculator() {
  const [targetId, setTargetId] = useState(612)
  const [plots, setPlots] = useState(156)
  const [plotMode, setPlotMode] = useState<"target" | "total">("target")
  const [harvestToolPrice, setHarvestToolPrice] = useState(350)
  const [targetPrice, setTargetPrice] = useState(800)
  const [seedPrices, setSeedPrices] = useState<Record<Flavor, { plain: number; very: number }>>({
    spicy: { plain: 700, very: 1780 },
    bitter: { plain: 800, very: 1740 },
    sweet: { plain: 800, very: 1730 },
    dry: { plain: 800, very: 1730 },
    sour: { plain: 800, very: 1730 },
  })
  const [plainChance, setPlainChance] = useState(70)
  const [safetyCycles, setSafetyCycles] = useState(1)
  const [seedStock, setSeedStock] = useState<Record<string, number>>({})
  const settingsLoaded = useRef(false)
  const [gtlFee, setGtlFee] = useState(5)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("berry-helper-calculator") ?? "null")
      if (saved?.harvestToolPrice != null) setHarvestToolPrice(Number(saved.harvestToolPrice))
      if (saved?.targetPrice != null) setTargetPrice(Number(saved.targetPrice))
      if (saved?.plainChance != null) setPlainChance(Number(saved.plainChance))
      if (saved?.safetyCycles != null) setSafetyCycles(Number(saved.safetyCycles))
      if (saved?.seedPrices) setSeedPrices(saved.seedPrices)
      if (saved?.seedStock) setSeedStock(saved.seedStock)
      if (saved?.gtlFee != null) setGtlFee(Number(saved.gtlFee))
    } catch { /* ignore malformed local settings */ }
    settingsLoaded.current = true
  }, [])

  useEffect(() => {
    if (!settingsLoaded.current) return
    localStorage.setItem("berry-helper-calculator", JSON.stringify({ harvestToolPrice, targetPrice, plainChance, safetyCycles, seedPrices, seedStock, gtlFee }))
  }, [harvestToolPrice, targetPrice, plainChance, safetyCycles, seedPrices, seedStock, gtlFee])

  const resetSettings = () => {
    localStorage.removeItem("berry-helper-calculator")
    window.location.reload()
  }

  const target = berries.find((berry) => berry.item_id === targetId) ?? berries[0]
  const targetName = spanishBerryNames[itemName(target.item_id)] ?? itemName(target.item_id)
  const recipe = useMemo(() => buildRecipe(target), [target])
  const averageYield = (target.min_harvest + target.max_harvest) / 2

  const calculations = useMemo(() => calculatePlan({
    target,
    targetPlants: plots,
    totalPlotsMode: plotMode === "total",
    totalPlots: plots,
    harvestToolPrice,
    targetPrice,
    seedPrices,
    plainChance,
    reserveCycles: safetyCycles,
    seedStock,
    gtlFee,
  }), [target, plots, harvestToolPrice, targetPrice, seedPrices, plainChance, safetyCycles, seedStock])

  const updateStock = (key: string, value: string) => {
    const parsed = Math.max(0, Number(value) || 0)
    setSeedStock((current) => ({ ...current, [key]: parsed }))
  }

  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 pb-20 sm:px-6 lg:px-8">
      <div className="border-b border-white/10 pb-4 text-sm text-mist-400">
        <span className="text-mist-300">Home</span><span className="mx-2">/</span><span className="text-mist-300">Herramientas</span><span className="mx-2">/</span><span>Calculadora de Bayas</span>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-violet-300"><Calculator className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[0.18em]">Berrie Helper</span></div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-[40px]">Calculadora de Bayas</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-mist-400">Calcula producción, semillas, Harvest Tools, costo efectivo y rentabilidad. Cambia de Zanama a Zidra o cualquier otra baya disponible.</p>
        </div>
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 px-4 py-3 text-xs text-mist-300">
          <div className="flex items-center gap-2 font-semibold text-violet-200"><Info className="h-4 w-4" /> Los precios son editables</div>
          <p className="mt-1 text-mist-500">Así podrás adaptar la estrategia al GTL del momento.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#161a24] p-4 shadow-xl shadow-black/10">
            <h2 className="flex items-center gap-2 text-base font-semibold text-white"><Sprout className="h-4 w-4 text-emerald-300" /> Configuración</h2>
            <div className="mt-4 space-y-4">
              <label className="block text-xs font-medium text-mist-400">Baya objetivo
                <select value={targetId} onChange={(event) => setTargetId(Number(event.target.value))} className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#20252f] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500">
                  {berries.filter((berry) => buildRecipe(berry).length > 0).map((berry) => <option key={berry.item_id} value={berry.item_id}>{spanishBerryNames[itemName(berry.item_id)] ?? itemName(berry.item_id)}</option>)}
                </select>
              </label>
              <div>
                <FieldLabel label={plotMode === "target" ? "Parcelas para la baya objetivo" : "Parcelas totales disponibles"} tip={plotMode === "target" ? "Indica cuántas parcelas vas a dedicar a la baya que quieres producir. Las parcelas fuente para generar semillas se calculan aparte." : "Indica el total real de parcelas que tienes. La calculadora estima cuántas deben ir a la baya objetivo y cuántas a los cultivos fuente para mantener el ciclo."} />
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <select value={plotMode} onChange={(event) => setPlotMode(event.target.value as "target" | "total")} className="rounded-xl border border-white/10 bg-[#20252f] px-3 py-2.5 text-xs text-white outline-none focus:border-violet-500"><option value="target">Solo objetivo</option><option value="total">Total de la granja</option></select>
                  <input type="number" min={1} max={5000} value={plots} onChange={(event) => setPlots(Math.max(1, Number(event.target.value) || 1))} className="rounded-xl border border-white/10 bg-[#20252f] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500" />
                </div>
                {plotMode === "total" && <p className="mt-1.5 text-[10px] leading-4 text-mist-600">La cifra se reparte automáticamente entre objetivo y fuentes.</p>}
              </div>
              <div>
                <FieldLabel label="Rendimiento de la baya" tip="La calculadora usa automáticamente el promedio entre la cosecha mínima y máxima registrada para esta baya. No necesitas introducirlo manualmente." />
                <div className="mt-1.5 flex items-center justify-between rounded-xl border border-white/10 bg-[#20252f] px-3 py-2.5">
                  <span className="text-sm font-semibold text-white">{target.min_harvest}–{target.max_harvest} bayas</span>
                  <span className="text-xs text-mist-500">≈ {averageYield.toFixed(1)} por planta</span>
                </div>
              </div>
              <div>
                <FieldLabel label="Reserva de semillas" tip="Cantidad de ciclos que quieres mantener guardados antes de considerar una semilla como excedente vendible. Por ejemplo, 2 ciclos significa que la calculadora protege semillas suficientes para dos ciclos de producción." />
                <select value={safetyCycles} onChange={(event) => setSafetyCycles(Number(event.target.value))} className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#20252f] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500">
                  <option value={1}>1 ciclo · mínimo</option><option value={2}>2 ciclos · recomendado</option><option value={3}>3 ciclos · máxima seguridad</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#161a24] p-4">
            <h2 className="flex items-center gap-2 text-base font-semibold text-white"><CircleDollarSign className="h-4 w-4 text-amber-300" /> Precios del GTL</h2>
            <div className="mt-4 space-y-3">
              <FieldLabel label="Harvest Tool" tip="Precio de un extractor de semillas. La calculadora lo multiplica por cada baya fuente que necesitas procesar para obtener las semillas." compact />
              <label className="flex items-center justify-between gap-3 text-xs text-mist-400"><span className="sr-only">Harvest Tool</span><input type="number" min={0} value={harvestToolPrice} onChange={(event) => setHarvestToolPrice(Math.max(0, Number(event.target.value) || 0))} className="w-28 rounded-lg border border-white/10 bg-[#20252f] px-2.5 py-2 text-right text-sm text-white outline-none focus:border-violet-500" /></label>
              <label className="flex items-center justify-between gap-3 text-xs text-mist-400"><span className="flex items-center gap-1.5"><span>{targetName}</span><InfoTip text="Precio al que venderías una unidad de la baya objetivo en el GTL. Se usa para calcular los ingresos del ciclo." /></span><input type="number" min={0} value={targetPrice} onChange={(event) => setTargetPrice(Math.max(0, Number(event.target.value) || 0))} className="w-28 rounded-lg border border-white/10 bg-[#20252f] px-2.5 py-2 text-right text-sm text-white outline-none focus:border-violet-500" /></label>
              <div className="space-y-2 border-t border-white/10 pt-3">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-mist-500">Semillas necesarias para {targetName} <InfoTip text="Solo se muestran los sabores que intervienen en la receta de la baya seleccionada. El primer valor es la semilla normal y el segundo la semilla Muy." /></p>
                {Array.from(new Set(recipe.map((seed) => seed.flavor))).map((flavor) => <div key={flavor} className="grid grid-cols-[1fr_76px_76px] items-center gap-2"><span className="text-xs text-mist-400">{flavorLabels[flavor]}</span><input aria-label={`${flavorLabels[flavor]} normal`} type="number" min={0} value={seedPrices[flavor].plain} onChange={(event) => setSeedPrices((current) => ({ ...current, [flavor]: { ...current[flavor], plain: Math.max(0, Number(event.target.value) || 0) } }))} className="rounded-lg border border-white/10 bg-[#20252f] px-2 py-1.5 text-right text-xs text-white outline-none focus:border-violet-500" /><input aria-label={`${flavorLabels[flavor]} muy`} type="number" min={0} value={seedPrices[flavor].very} onChange={(event) => setSeedPrices((current) => ({ ...current, [flavor]: { ...current[flavor], very: Math.max(0, Number(event.target.value) || 0) } }))} className="rounded-lg border border-white/10 bg-[#20252f] px-2 py-1.5 text-right text-xs text-white outline-none focus:border-violet-500" /></div>)}
                <div className="grid grid-cols-[1fr_76px_76px] gap-2 text-[10px] text-mist-600"><span></span><span className="text-right">Normal</span><span className="text-right">Muy</span></div>
              </div>
              <div className="border-t border-white/10 pt-3">
                <label className="flex items-center justify-between gap-3 text-xs text-mist-400"><span className="flex items-center gap-1.5">Comisión GTL <InfoTip text="Coste aplicado a las ventas realizadas en el GTL. Se usa para descontar la comisión de tus ingresos por bayas y semillas. El valor habitual documentado por la comunidad es 5%." /></span><input type="number" min={0} max={100} value={gtlFee} onChange={(event) => setGtlFee(Math.min(100, Math.max(0, Number(event.target.value) || 0)))} className="w-20 rounded-lg border border-white/10 bg-[#20252f] px-2.5 py-2 text-right text-sm text-white outline-none focus:border-violet-500" /></label>
              </div>
              <div className="border-t border-white/10 pt-3">
                <div className="flex items-center justify-between text-xs text-mist-400"><span className="flex items-center gap-1.5">Probabilidad de semilla Normal <InfoTip text="Porcentaje estimado de semillas normales al usar un Harvest Tool. El resto se considera semilla Muy. Déjalo en el valor recomendado si no tienes datos propios." /></span><span className="font-semibold text-white">{plainChance}%</span></div>
                <input aria-label="Probabilidad de semilla Normal" type="range" min={50} max={90} value={plainChance} onChange={(event) => setPlainChance(Number(event.target.value))} className="mt-2 w-full accent-violet-500" />
              </div>
              <button type="button" onClick={resetSettings} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#20252f] px-3 py-2 text-xs font-semibold text-mist-300 transition hover:border-violet-500/40 hover:text-white"><RefreshCcw className="h-3.5 w-3.5" /> Restablecer configuración</button>
            </div>
          </div>
        </aside>

        <main className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <Metric icon={<Package />} label="Producción" value={formatNumber(calculations.targetBerries, 1)} suffix={`${targetName} · ${formatNumber(calculations.targetPlants)} parcelas`} />
            <Metric icon={<RefreshCcw />} label="Harvest Tools" value={formatNumber(calculations.totalTools)} suffix="por ciclo" />
            <Metric icon={<CircleDollarSign />} label="Costo bruto" value={formatMoney(calculations.toolCost)} suffix="herramientas" />
            <Metric icon={<TrendingUp />} label="Beneficio estimado" value={formatMoney(calculations.profit)} suffix="por ciclo" positive={calculations.profit >= 0} />
            <Metric icon={<Sprout />} label="Beneficio / parcela" value={formatMoney(calculations.profitPerPlot)} suffix="por ciclo" positive={calculations.profit >= 0} />
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#161a24] p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-semibold text-white">Receta de {targetName}</h2><p className="text-xs text-mist-500">La combinación se obtiene a partir de los niveles de sabor de la baya seleccionada.</p></div><div className="rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1 text-xs text-emerald-300">{target.grow_time} h · {target.min_harvest}–{target.max_harvest} bayas</div></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {recipe.map((seed) => <SeedRecipeCard key={`${seed.flavor}-${seed.variant}`} seed={seed} targetName={targetName} total={seed.amount * calculations.targetBerries} />)}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#161a24] p-5">
            <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-white">Producción de semillas</h2><p className="text-xs text-mist-500">Estimación para reponer las semillas necesarias sin comprar todo en el GTL.</p></div><Leaf className="h-5 w-5 text-emerald-300" /></div>
            <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead><tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-mist-500"><th className="px-3 py-2">Sabor</th><th className="px-3 py-2">Fuente</th><th className="px-3 py-2">Por producir</th><th className="px-3 py-2">Bayas fuente</th><th className="px-3 py-2">Parcelas fuente</th><th className="px-3 py-2">Valor excedente</th></tr></thead><tbody>{calculations.seedPlan.map((row) => { const surplusPlain = row.surplusPlain; const surplusVery = row.surplusVery; const surplusValue = surplusPlain * seedPrices[row.flavor].plain + surplusVery * seedPrices[row.flavor].very; return <tr key={row.flavor} className="border-b border-white/5"><td className="px-3 py-3 font-semibold text-white">{flavorLabels[row.flavor]}</td><td className="px-3 py-3 text-mist-300">{row.source.name}</td><td className="px-3 py-3 text-mist-300">{formatNumber(row.toProducePlain)} {flavorLabels[row.flavor]} + {formatNumber(row.toProduceVery)} Muy {flavorLabels[row.flavor]}</td><td className="px-3 py-3 text-mist-300">{formatNumber(row.sourceBerries)}</td><td className="px-3 py-3 text-mist-300">{formatNumber(row.sourcePlants)}</td><td className="px-3 py-3 font-semibold text-emerald-300">{formatMoney(surplusValue)}</td></tr> })}</tbody></table></div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><SummaryCard label="Herramientas para semillas" value={formatNumber(calculations.sourceTools)} /><SummaryCard label="Venta neta de excedentes" value={formatMoney(calculations.sourceSeedRevenueNet)} positive /><SummaryCard label="Reserva inicial faltante" value={formatMoney(calculations.reservePurchaseCost)} /><SummaryCard label="Costo efectivo por baya" value={formatMoney(calculations.effectiveCost / Math.max(1, calculations.targetBerries))} /></div>
            <div className="mt-3 rounded-xl border border-white/10 bg-[#20252f] px-3 py-2 text-xs text-mist-400"><span className="font-semibold text-white">Rango de cosecha:</span> {formatNumber(calculations.targetBerriesMin)}–{formatNumber(calculations.targetBerriesMax)} {targetName} por ciclo. El beneficio mostrado usa el rendimiento medio; el RNG de semillas usa la probabilidad configurada.</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#161a24] p-5">
            <div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold text-white">Tu inventario de semillas</h2><p className="text-xs text-mist-500">Introduce tus existencias para saber cuánto necesitas realmente producir.</p></div></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{calculations.seedPlan.flatMap((row) => (['plain', 'very'] as SeedVariant[]).map((variant) => <label key={`${row.flavor}-${variant}`} className="rounded-xl border border-white/10 bg-[#20252f] p-3 text-xs text-mist-400"><span className="flex items-center justify-between"><span>{variant === 'plain' ? '' : 'Muy'} {flavorLabels[row.flavor]}</span><span className="text-mist-600">Objetivo {formatNumber(row[variant === "plain" ? "requiredPlain" : "requiredVery"])}</span></span><input type="number" min={0} value={seedStock[`${row.flavor}-${variant}`] ?? ""} onChange={(event) => updateStock(`${row.flavor}-${variant}`, event.target.value)} placeholder="0" className="mt-2 w-full rounded-lg border border-white/10 bg-[#161a24] px-3 py-2 text-white outline-none focus:border-violet-500" /></label>))}</div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <ResultCard title={`Ingreso por ${targetName}`} value={formatMoney(calculations.targetRevenueNet)} subtitle={`${formatNumber(calculations.targetBerries, 1)} × ${formatMoney(targetPrice)}`} />
            <ResultCard title="Ingreso por semillas" value={formatMoney(calculations.sourceSeedRevenueNet)} subtitle="Excedentes vendidos después de cubrir el ciclo y la reserva." />
            <ResultCard title="Costo efectivo" value={formatMoney(calculations.effectiveCost)} subtitle={`${formatMoney(calculations.toolCost)} − excedentes netos`} />
          </div>
          {calculations.profit < 0 && <div className="rounded-2xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-200"><strong>⚠ Rentabilidad negativa.</strong> Con los precios actuales, el valor neto de venta no cubre los Harvest Tools del ciclo. Revisa el precio de la baya, semillas o comisión GTL.</div>}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <SummaryCard label="Tiempo del ciclo" value={`${formatNumber(calculations.totalCycleHours, 1)} h`} />
            <SummaryCard label="Beneficio / hora" value={formatMoney(calculations.profitPerHour)} positive={calculations.profit >= 0} />
            <SummaryCard label="Precio de equilibrio" value={formatMoney(calculations.breakEvenPrice)} />
            <SummaryCard label="Resultado" value={calculations.profit >= 0 ? "Rentable" : "Pérdida"} positive={calculations.profit >= 0} />
            <SummaryCard label="Semillas iniciales" value={formatMoney(calculations.initialSourceSeedPurchase + calculations.reservePurchaseCost)} />
          </div>
        </main>
      </div>
    </section>
  )
}

function FieldLabel({ label, tip, compact = false }: { label: string; tip: string; compact?: boolean }) {
  return <div className={`${compact ? "mb-1.5" : ""} flex items-center gap-1.5 text-xs font-medium text-mist-400`}><span>{label}</span><InfoTip text={tip} /></div>
}

function InfoTip({ text }: { text: string }) {
  return <span className="group relative inline-flex" tabIndex={0} aria-label="Más información">
    <span className="flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-mist-600/70 text-[10px] font-bold text-mist-500 transition-colors group-hover:border-violet-400 group-hover:text-violet-300 group-focus:border-violet-400 group-focus:text-violet-300">?</span>
    <span role="tooltip" className="pointer-events-none invisible absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-xl border border-white/10 bg-[#0f131c] px-3 py-2 text-left text-[11px] font-normal leading-5 text-mist-300 opacity-0 shadow-2xl transition-all group-hover:visible group-hover:opacity-100 group-focus:visible group-focus:opacity-100">{text}</span>
  </span>
}

function Metric({ icon, label, value, suffix, positive }: { icon: ReactNode; label: string; value: string; suffix: string; positive?: boolean }) {
  return <div className="rounded-2xl border border-white/10 bg-[#161a24] p-4"><div className="flex items-center gap-2 text-xs text-mist-500">{icon}<span>{label}</span></div><div className={`mt-2 text-xl font-bold ${positive === false ? 'text-red-300' : 'text-white'}`}>{value}</div><div className="mt-0.5 text-[11px] text-mist-500">{suffix}</div></div>
}

function SeedRecipeCard({ seed, targetName, total }: { seed: RecipeSeed; targetName: string; total: number }) {
  const id = seedIds[seed.flavor][seed.variant]
  return <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#20252f] p-3"><img src={`${import.meta.env.BASE_URL}item/${id}.png`} alt="" className="h-10 w-10 object-contain" /><div className="min-w-0"><p className="text-sm font-semibold text-white">{seed.amount}× {seed.variant === 'very' ? 'Muy' : ''} {flavorLabels[seed.flavor]}</p><p className="text-[11px] text-mist-500">{formatNumber(total)} para {formatNumber(total / seed.amount, 1)} {targetName}</p></div></div>
}

function SummaryCard({ label, value, positive = false }: { label: string; value: string; positive?: boolean }) {
  return <div className="rounded-xl border border-white/10 bg-[#20252f] p-3"><p className="text-[11px] text-mist-500">{label}</p><p className={`mt-1 text-lg font-bold ${positive ? 'text-emerald-300' : 'text-white'}`}>{value}</p></div>
}

function ResultCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return <div className="rounded-2xl border border-white/10 bg-[#161a24] p-5"><p className="text-xs font-medium uppercase tracking-wide text-mist-500">{title}</p><p className="mt-2 text-2xl font-bold text-white">{value}</p><p className="mt-1 text-xs text-mist-500">{subtitle}</p></div>
}
