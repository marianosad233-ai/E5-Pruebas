import { useMemo, useState, type ReactNode } from "react"
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
  "Cheri Berry": "Cereza",
  "Pecha Berry": "Meloc",
  "Rawst Berry": "Safre",
  "Chesto Berry": "Atania",
  "Aspear Berry": "Perasi",
  "Oran Berry": "Orán",
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

export default function BerryCalculator() {
  const [targetId, setTargetId] = useState(612)
  const [plots, setPlots] = useState(156)
  const [yieldOverride, setYieldOverride] = useState(0)
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

  const target = berries.find((berry) => berry.item_id === targetId) ?? berries[0]
  const targetName = spanishBerryNames[itemName(target.item_id)] ?? itemName(target.item_id)
  const recipe = useMemo(() => buildRecipe(target), [target])
  const averageYield = yieldOverride > 0 ? yieldOverride : (target.min_harvest + target.max_harvest) / 2

  const calculations = useMemo(() => {
    const targetBerries = plots * averageYield
    const requiredSeeds = recipe.map((seed) => ({ ...seed, total: seed.amount * targetBerries }))

    const byFlavor = new Map<Flavor, { plain: number; very: number }>()
    for (const seed of requiredSeeds) {
      const current = byFlavor.get(seed.flavor) ?? { plain: 0, very: 0 }
      current[seed.variant] += seed.total
      byFlavor.set(seed.flavor, current)
    }

    const seedPlan = Array.from(byFlavor.entries()).map(([flavor, amounts]) => {
      const source = sourceByFlavor[flavor]
      const plainRate = plainChance / 100
      const veryRate = 1 - plainRate
      const requiredPlain = amounts.plain * safetyCycles
      const requiredVery = amounts.very * safetyCycles
      const remainingPlain = Math.max(0, requiredPlain - (seedStock[`${flavor}-plain`] ?? 0))
      const remainingVery = Math.max(0, requiredVery - (seedStock[`${flavor}-very`] ?? 0))
      const sourceForPlain = remainingPlain > 0 ? remainingPlain / plainRate : 0
      const sourceForVery = remainingVery > 0 ? remainingVery / veryRate : 0
      const sourceBerries = Math.ceil(Math.max(sourceForPlain, sourceForVery))
      const sourcePlants = Math.ceil(sourceBerries / 4.5)
      const tools = sourceBerries
      const expectedPlain = sourceBerries * plainRate
      const expectedVery = sourceBerries * veryRate
      const requiredStock = (amounts.plain + amounts.very) * safetyCycles
      const currentPlain = seedStock[`${flavor}-plain`] ?? 0
      const currentVery = seedStock[`${flavor}-very`] ?? 0
      const stockCoverage = Math.min(
        amounts.plain > 0 ? currentPlain / amounts.plain : Number.POSITIVE_INFINITY,
        amounts.very > 0 ? currentVery / amounts.very : Number.POSITIVE_INFINITY,
      )
      return {
        flavor,
        source,
        amounts,
        remainingPlain,
        remainingVery,
        sourceBerries,
        sourcePlants,
        tools,
        expectedPlain,
        expectedVery,
        requiredPlain,
        requiredVery,
        requiredStock,
        currentPlain,
        currentVery,
        stockCoverage,
      }
    })

    const sourceTools = seedPlan.reduce((sum, row) => sum + row.tools, 0)
    const totalTools = sourceTools
    const sourceSeedRevenue = seedPlan.reduce((sum, row) => {
      const surplusPlain = Math.max(0, row.expectedPlain - row.remainingPlain)
      const surplusVery = Math.max(0, row.expectedVery - row.remainingVery)
      return sum + surplusPlain * seedPrices[row.flavor].plain + surplusVery * seedPrices[row.flavor].very
    }, 0)
    const targetRevenue = targetBerries * targetPrice
    const toolCost = totalTools * harvestToolPrice
    const effectiveCost = Math.max(0, toolCost - sourceSeedRevenue)
    const profit = targetRevenue + sourceSeedRevenue - toolCost
    const costPerTarget = targetBerries > 0 ? effectiveCost / targetBerries : 0

    return {
      targetBerries,
      requiredSeeds,
      seedPlan,
      sourceTools,
      totalTools,
      sourceSeedRevenue,
      targetRevenue,
      toolCost,
      effectiveCost,
      profit,
      costPerTarget,
    }
  }, [averageYield, harvestToolPrice, plainChance, plots, recipe, safetyCycles, seedPrices, seedStock, targetPrice])

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
              <label className="block text-xs font-medium text-mist-400">Parcelas por ciclo
                <input type="number" min={1} max={5000} value={plots} onChange={(event) => setPlots(Math.max(1, Number(event.target.value) || 1))} className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#20252f] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500" />
              </label>
              <label className="block text-xs font-medium text-mist-400">Rendimiento medio por planta
                <input type="number" min={0} step={0.1} placeholder={`${((target.min_harvest + target.max_harvest) / 2).toFixed(1)}`} value={yieldOverride || ""} onChange={(event) => setYieldOverride(Math.max(0, Number(event.target.value) || 0))} className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#20252f] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500" />
                <span className="mt-1 block text-[11px] text-mist-500">Por defecto usa {target.min_harvest}–{target.max_harvest} bayas.</span>
              </label>
              <label className="block text-xs font-medium text-mist-400">Ciclos de seguridad
                <select value={safetyCycles} onChange={(event) => setSafetyCycles(Number(event.target.value))} className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#20252f] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500">
                  <option value={1}>1 ciclo</option><option value={2}>2 ciclos</option><option value={3}>3 ciclos</option>
                </select>
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#161a24] p-4">
            <h2 className="flex items-center gap-2 text-base font-semibold text-white"><CircleDollarSign className="h-4 w-4 text-amber-300" /> Precios del GTL</h2>
            <div className="mt-4 space-y-3">
              <label className="flex items-center justify-between gap-3 text-xs text-mist-400"><span>Harvest Tool</span><input type="number" min={0} value={harvestToolPrice} onChange={(event) => setHarvestToolPrice(Math.max(0, Number(event.target.value) || 0))} className="w-28 rounded-lg border border-white/10 bg-[#20252f] px-2.5 py-2 text-right text-sm text-white outline-none focus:border-violet-500" /></label>
              <label className="flex items-center justify-between gap-3 text-xs text-mist-400"><span>{targetName}</span><input type="number" min={0} value={targetPrice} onChange={(event) => setTargetPrice(Math.max(0, Number(event.target.value) || 0))} className="w-28 rounded-lg border border-white/10 bg-[#20252f] px-2.5 py-2 text-right text-sm text-white outline-none focus:border-violet-500" /></label>
              <div className="space-y-2 border-t border-white/10 pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-mist-500">Semillas por sabor</p>
                {(Object.keys(flavorLabels) as Flavor[]).map((flavor) => <div key={flavor} className="grid grid-cols-[1fr_76px_76px] items-center gap-2"><span className="text-xs text-mist-400">{flavorLabels[flavor]}</span><input aria-label={`${flavorLabels[flavor]} normal`} type="number" min={0} value={seedPrices[flavor].plain} onChange={(event) => setSeedPrices((current) => ({ ...current, [flavor]: { ...current[flavor], plain: Math.max(0, Number(event.target.value) || 0) } }))} className="rounded-lg border border-white/10 bg-[#20252f] px-2 py-1.5 text-right text-xs text-white outline-none focus:border-violet-500" /><input aria-label={`${flavorLabels[flavor]} muy`} type="number" min={0} value={seedPrices[flavor].very} onChange={(event) => setSeedPrices((current) => ({ ...current, [flavor]: { ...current[flavor], very: Math.max(0, Number(event.target.value) || 0) } }))} className="rounded-lg border border-white/10 bg-[#20252f] px-2 py-1.5 text-right text-xs text-white outline-none focus:border-violet-500" /></div>)}
                <div className="grid grid-cols-[1fr_76px_76px] gap-2 text-[10px] text-mist-600"><span></span><span className="text-right">Normal</span><span className="text-right">Muy</span></div>
              </div>
              <label className="block border-t border-white/10 pt-3 text-xs text-mist-400">Probabilidad de semilla Plain: <span className="font-semibold text-white">{plainChance}%</span>
                <input type="range" min={50} max={90} value={plainChance} onChange={(event) => setPlainChance(Number(event.target.value))} className="mt-2 w-full accent-violet-500" />
                <span className="mt-1 block text-[11px] text-mist-500">El resto se considera Very.</span>
              </label>
            </div>
          </div>
        </aside>

        <main className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric icon={<Package />} label="Producción" value={formatNumber(calculations.targetBerries, 1)} suffix={targetName} />
            <Metric icon={<RefreshCcw />} label="Harvest Tools" value={formatNumber(calculations.totalTools)} suffix="por ciclo" />
            <Metric icon={<CircleDollarSign />} label="Costo bruto" value={formatMoney(calculations.toolCost)} suffix="herramientas" />
            <Metric icon={<TrendingUp />} label="Beneficio estimado" value={formatMoney(calculations.profit)} suffix="por ciclo" positive={calculations.profit >= 0} />
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#161a24] p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-semibold text-white">Receta de {targetName}</h2><p className="text-xs text-mist-500">La combinación se obtiene a partir de los niveles de sabor de la baya seleccionada.</p></div><div className="rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1 text-xs text-emerald-300">{target.grow_time} h · {target.min_harvest}–{target.max_harvest} bayas</div></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {recipe.map((seed) => <SeedRecipeCard key={`${seed.flavor}-${seed.variant}`} seed={seed} targetName={targetName} total={seed.amount * calculations.targetBerries} />)}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#161a24] p-5">
            <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-white">Producción de semillas</h2><p className="text-xs text-mist-500">Estimación para reponer las semillas necesarias sin comprar todo en el GTL.</p></div><Leaf className="h-5 w-5 text-emerald-300" /></div>
            <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead><tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-mist-500"><th className="px-3 py-2">Sabor</th><th className="px-3 py-2">Fuente</th><th className="px-3 py-2">Semillas requeridas</th><th className="px-3 py-2">Bayas fuente</th><th className="px-3 py-2">Parcelas fuente</th><th className="px-3 py-2">Valor excedente</th></tr></thead><tbody>{calculations.seedPlan.map((row) => { const surplusPlain = Math.max(0, row.expectedPlain - row.remainingPlain); const surplusVery = Math.max(0, row.expectedVery - row.remainingVery); const surplusValue = surplusPlain * seedPrices[row.flavor].plain + surplusVery * seedPrices[row.flavor].very; return <tr key={row.flavor} className="border-b border-white/5"><td className="px-3 py-3 font-semibold text-white">{flavorLabels[row.flavor]}</td><td className="px-3 py-3 text-mist-300">{row.source.name}</td><td className="px-3 py-3 text-mist-300">{formatNumber(row.remainingPlain)} {flavorLabels[row.flavor]} + {formatNumber(row.remainingVery)} Muy {flavorLabels[row.flavor]}</td><td className="px-3 py-3 text-mist-300">{formatNumber(row.sourceBerries)}</td><td className="px-3 py-3 text-mist-300">{formatNumber(row.sourcePlants)}</td><td className="px-3 py-3 font-semibold text-emerald-300">{formatMoney(surplusValue)}</td></tr> })}</tbody></table></div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3"><SummaryCard label="Herramientas para semillas" value={formatNumber(calculations.sourceTools)} /><SummaryCard label="Venta estimada de excedentes" value={formatMoney(calculations.sourceSeedRevenue)} positive /><SummaryCard label="Costo efectivo por baya" value={formatMoney(calculations.costPerTarget)} /></div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#161a24] p-5">
            <div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold text-white">Tu inventario de semillas</h2><p className="text-xs text-mist-500">Introduce tus existencias para saber cuánto necesitas realmente producir.</p></div></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{calculations.seedPlan.flatMap((row) => (['plain', 'very'] as SeedVariant[]).map((variant) => <label key={`${row.flavor}-${variant}`} className="rounded-xl border border-white/10 bg-[#20252f] p-3 text-xs text-mist-400"><span className="flex items-center justify-between"><span>{variant === 'plain' ? '' : 'Muy'} {flavorLabels[row.flavor]}</span><span className="text-mist-600">Objetivo {formatNumber(row[variant === "plain" ? "requiredPlain" : "requiredVery"])}</span></span><input type="number" min={0} value={seedStock[`${row.flavor}-${variant}`] ?? ""} onChange={(event) => updateStock(`${row.flavor}-${variant}`, event.target.value)} placeholder="0" className="mt-2 w-full rounded-lg border border-white/10 bg-[#161a24] px-3 py-2 text-white outline-none focus:border-violet-500" /></label>))}</div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <ResultCard title="Ingreso por {targetName}" value={formatMoney(calculations.targetRevenue)} subtitle={`${formatNumber(calculations.targetBerries, 1)} × ${formatMoney(targetPrice)}`} />
            <ResultCard title="Ingreso por semillas" value={formatMoney(calculations.sourceSeedRevenue)} subtitle="Solo excedentes después de cubrir el ciclo." />
            <ResultCard title="Costo efectivo" value={formatMoney(calculations.effectiveCost)} subtitle={`${formatMoney(calculations.toolCost)} − semillas vendidas`} />
          </div>
        </main>
      </div>
    </section>
  )
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
