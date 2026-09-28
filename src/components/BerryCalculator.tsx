import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  CircleDollarSign,
  Leaf,
  Package,
  RotateCcw,
  Sprout,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react"
import hubData from "../data/berriesHub.json"
import type { BerryData, ItemData } from "./Berries/berries.types"
import {
  buildCandidates,
  buildRecipe,
  computePlan,
  defaultYield,
  type Flavor,
  type Objective,
  type PlanMode,
  type SeedVariant,
} from "./Berries/berryPlanner"

/* ------------------------------------------------------------------ */
/*  Datos y etiquetas                                                  */
/* ------------------------------------------------------------------ */

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
  "Mago Berry": "Mago",
  "Aguav Berry": "Aguav",
}

const seedIds: Record<Flavor, Record<SeedVariant, number>> = {
  sour: { plain: 701, very: 706 },
  sweet: { plain: 702, very: 707 },
  bitter: { plain: 703, very: 708 },
  spicy: { plain: 704, very: 709 },
  dry: { plain: 705, very: 710 },
}

const englishShort = (id: number) => itemName(id).replace(/ Berry$/, "")

function berryName(id: number) {
  return spanishBerryNames[itemName(id)] ?? englishShort(id)
}

/** "Cereza (Cheri)"; si el nombre es igual en ambos idiomas, solo uno. */
function berryLabel(id: number) {
  const es = spanishBerryNames[itemName(id)]
  const en = englishShort(id)
  return es && es !== en ? `${es} (${en})` : en
}

const seedLabel = (flavor: Flavor, variant: SeedVariant) =>
  variant === "very" ? `Muy ${flavorLabels[flavor]}` : flavorLabels[flavor]

const formatMoney = (value: number) => `${Math.round(value).toLocaleString("es-PE")} ₽`
const formatNumber = (value: number, digits = 0) => value.toLocaleString("es-PE", { maximumFractionDigits: digits })
const formatSigned = (value: number) => `${value >= 0 ? "+" : "−"}${formatNumber(Math.abs(value))}`

/* ------------------------------------------------------------------ */
/*  Ajustes guardados                                                  */
/* ------------------------------------------------------------------ */

interface Settings {
  accounts: number
  charactersPerAccount: number
  plotsPerCharacter: number
  canTransfer: boolean
  targetId: number
  mode: PlanMode
  plotsToPlant: number
  marginPct: number
  objective: Objective
  targetYield: number | null
  plainChance: number
  yieldOverrides: Record<string, number>
  toolPrice: number
  targetPrice: number
  taxPct: number
  seedPrices: Record<Flavor, Record<SeedVariant, number>>
  stock: Record<string, number>
}

const DEFAULT_SETTINGS: Settings = {
  accounts: 2,
  charactersPerAccount: 3,
  plotsPerCharacter: 271,
  canTransfer: true,
  targetId: 612,
  mode: "max",
  plotsToPlant: 630,
  marginPct: 5,
  objective: "plots",
  targetYield: null,
  plainChance: 70,
  yieldOverrides: {},
  toolPrice: 350,
  targetPrice: 800,
  taxPct: 0,
  seedPrices: {
    spicy: { plain: 700, very: 1780 },
    bitter: { plain: 800, very: 1740 },
    sweet: { plain: 800, very: 1730 },
    dry: { plain: 800, very: 1730 },
    sour: { plain: 800, very: 1730 },
  },
  stock: {},
}

const STORAGE_KEY = "berryCalculator.v2"

function loadSettings(): Settings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const saved = JSON.parse(raw) as Partial<Settings>
    return {
      ...DEFAULT_SETTINGS,
      ...saved,
      seedPrices: { ...DEFAULT_SETTINGS.seedPrices, ...saved.seedPrices },
      yieldOverrides: { ...saved.yieldOverrides },
      stock: { ...saved.stock },
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

/* ------------------------------------------------------------------ */
/*  Componente principal                                               */
/* ------------------------------------------------------------------ */

export default function BerryCalculator() {
  const [settings, setSettings] = useState<Settings>(loadSettings)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      /* almacenamiento no disponible: se ignora */
    }
  }, [settings])

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setSettings((current) => ({ ...current, [key]: value }))

  const reset = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* se ignora */
    }
    setSettings(DEFAULT_SETTINGS)
  }

  const target = berries.find((berry) => berry.item_id === settings.targetId) ?? berries[0]
  const targetName = berryName(target.item_id)
  const targetYield = settings.targetYield ?? defaultYield(target)
  const plotsPerAccount = settings.charactersPerAccount * settings.plotsPerCharacter

  const plan = useMemo(
    () =>
      computePlan({
        berries,
        target,
        targetYield,
        plainChance: settings.plainChance / 100,
        yields: settings.yieldOverrides,
        accounts: settings.accounts,
        plotsPerAccount,
        canTransfer: settings.canTransfer,
        mode: settings.mode,
        targetPlots: settings.plotsToPlant,
        marginPct: settings.marginPct,
        objective: settings.objective,
        prices: {
          tool: settings.toolPrice,
          target: settings.targetPrice,
          taxPct: settings.taxPct,
          seeds: settings.seedPrices,
        },
        stock: settings.stock,
      }),
    [settings, target, targetYield, plotsPerAccount],
  )

  const recipeFlavors = useMemo(() => Array.from(new Set(buildRecipe(target).map((seed) => seed.flavor))), [target])
  const sourceCandidates = useMemo(
    () => buildCandidates(berries, settings.plainChance / 100, settings.yieldOverrides),
    [settings.plainChance, settings.yieldOverrides],
  )

  const setSeedPrice = (flavor: Flavor, variant: SeedVariant, value: number) =>
    update("seedPrices", {
      ...settings.seedPrices,
      [flavor]: { ...settings.seedPrices[flavor], [variant]: value },
    })

  const shortfall = Math.max(0, plan.plotsShortfall)

  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 pb-20 sm:px-6 lg:px-8">
      <div className="border-b border-white/10 pb-4 text-sm text-mist-400">
        <span className="text-mist-300">Home</span>
        <span className="mx-2">/</span>
        <span className="text-mist-300">Herramientas</span>
        <span className="mx-2">/</span>
        <span>Calculadora de Bayas</span>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-violet-300">
            <Calculator className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-[0.18em]">Berries Helper</span>
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-[40px]">Calculadora de Bayas</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-mist-400">
            Elige la baya y cuántas parcelas quieres plantar, indica tus cuentas y personajes, y la calculadora te dice
            cuántas semillas necesitas y cómo repartir las parcelas para producirlas sin comprarlas.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-2 self-start rounded-xl border border-white/10 bg-[#161a24] px-3 py-2 text-xs font-medium text-mist-300 transition-colors hover:border-violet-500/50 hover:text-white sm:self-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Restablecer valores
        </button>
      </div>

      <TargetPicker berries={berries} selectedId={settings.targetId} onSelect={(id) => setSettings((current) => ({ ...current, targetId: id, targetYield: null }))} />

      <div className="mt-6 grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* ---------------------------- Panel de ajustes ---------------------------- */}
        <aside className="space-y-4">
          <Panel>
            <PanelTitle icon={<Users className="h-4 w-4 text-sky-300" />}>Cuentas y parcelas</PanelTitle>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel label="Cuentas" tip="Cuántas cuentas de PokeMMO vas a usar para cultivar." />
                  <NumberField ariaLabel="Cuentas" value={settings.accounts} min={1} max={10} onChange={(v) => update("accounts", v)} />
                </div>
                <div>
                  <FieldLabel label="Personajes por cuenta" tip="Cada personaje tiene sus propias parcelas de bayas." />
                  <NumberField ariaLabel="Personajes por cuenta" value={settings.charactersPerAccount} min={1} max={3} onChange={(v) => update("charactersPerAccount", v)} />
                </div>
              </div>
              <div>
                <FieldLabel label="Parcelas por personaje" tip="Con 3 personajes y 813 parcelas por cuenta son 271 por personaje. Cámbialo si tu cuenta tiene otra cantidad." />
                <NumberField ariaLabel="Parcelas por personaje" value={settings.plotsPerCharacter} min={1} max={2000} onChange={(v) => update("plotsPerCharacter", v)} />
              </div>
              {settings.accounts > 1 && (
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-[#20252f] p-3 text-xs text-mist-300">
                  <input
                    type="checkbox"
                    checked={settings.canTransfer}
                    onChange={(event) => update("canTransfer", event.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-violet-500"
                  />
                  <span>
                    <span className="flex items-center gap-1.5 font-semibold text-white">
                      Puedo pasar semillas entre mis cuentas
                      <InfoTip text="Activado: todas las parcelas forman un solo terreno y una cuenta puede dedicarse a producir semillas para la otra. Desactivado: cada cuenta debe producir sus propias semillas." />
                    </span>
                  </span>
                </label>
              )}
              <p className="rounded-xl bg-violet-500/5 px-3 py-2 text-xs text-mist-300">
                Total: <span className="font-semibold text-white">{formatNumber(plan.totalPlots)}</span> parcelas ({formatNumber(plotsPerAccount)} por cuenta)
              </p>
            </div>
          </Panel>

          <Panel>
            <PanelTitle icon={<Sprout className="h-4 w-4 text-emerald-300" />}>Baya a plantar</PanelTitle>
            <div className="mt-4 space-y-4">
              <label className="block text-xs font-medium text-mist-400">
                Baya objetivo
                <select
                  value={settings.targetId}
                  onChange={(event) => setSettings((current) => ({ ...current, targetId: Number(event.target.value), targetYield: null }))}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#20252f] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500"
                >
                  {berries
                    .filter((berry) => buildRecipe(berry).length > 0)
                    .map((berry) => (
                      <option key={berry.item_id} value={berry.item_id}>
                        {berryName(berry.item_id)}
                      </option>
                    ))}
                </select>
              </label>

              <div>
                <FieldLabel label="Qué quieres calcular" tip="Cantidad fija: tú eliges cuántas parcelas de la baya plantar. Máximo posible: la calculadora busca cuántas puedes sostener con tus parcelas sin comprar semillas." />
                <Segmented<PlanMode>
                  ariaLabel="Modo de cálculo"
                  value={settings.mode}
                  onChange={(value) => update("mode", value)}
                  options={[
                    { value: "fixed", label: "Cantidad fija" },
                    { value: "max", label: "Máximo posible" },
                  ]}
                />
              </div>

              {settings.mode === "fixed" ? (
                <div>
                  <FieldLabel label={`Parcelas de ${targetName}`} tip="Total de parcelas que quieres plantar con la baya objetivo, sumando todas las cuentas. Las parcelas para producir semillas se calculan aparte." />
                  <NumberField ariaLabel="Parcelas de la baya objetivo" value={settings.plotsToPlant} min={1} max={20000} onChange={(v) => update("plotsToPlant", v)} />
                </div>
              ) : (
                <div>
                  <FieldLabel label="Margen de seguridad (%)" tip="Se descuenta del máximo sostenible para dejar parcelas libres por si una cosecha sale por debajo del promedio." />
                  <NumberField ariaLabel="Margen de seguridad" value={settings.marginPct} min={0} max={50} onChange={(v) => update("marginPct", v)} />
                </div>
              )}

              <div>
                <FieldLabel label="Optimizar para" tip="Menos parcelas: usa el mínimo de parcelas para producir semillas (lo mejor si tus parcelas son el límite). Menos Harvest Tools: gasta menos herramientas aunque uses más parcelas." />
                <Segmented<Objective>
                  ariaLabel="Objetivo de optimización"
                  value={settings.objective}
                  onChange={(value) => update("objective", value)}
                  options={[
                    { value: "plots", label: "Menos parcelas" },
                    { value: "tools", label: "Menos herramientas" },
                  ]}
                />
              </div>

              <div>
                <FieldLabel label="Bayas por parcela (promedio)" tip={`Rango registrado: ${target.min_harvest}–${target.max_harvest}. Cámbialo si mediste otro promedio.`} />
                <NumberField ariaLabel="Bayas por parcela" value={targetYield} min={1} max={20} decimals onChange={(v) => update("targetYield", v)} />
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelTitle icon={<Leaf className="h-4 w-4 text-lime-300" />}>Semillas</PanelTitle>
            <div className="mt-4 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-mist-400">
                  <span className="flex items-center gap-1.5">
                    Probabilidad de semilla normal
                    <InfoTip text="Cada Harvest Tool da 1 semilla: normal o Muy. Con 70 %, una parcela de 4,5 bayas da 3,15 normales y 1,35 Muy." />
                  </span>
                  <span className="font-semibold text-white">{settings.plainChance}%</span>
                </div>
                <input
                  aria-label="Probabilidad de semilla normal"
                  type="range"
                  min={50}
                  max={90}
                  value={settings.plainChance}
                  onChange={(event) => update("plainChance", Number(event.target.value))}
                  className="mt-2 w-full accent-violet-500"
                />
              </div>

              <details className="group rounded-xl border border-white/10 bg-[#20252f] p-3">
                <summary className="cursor-pointer text-xs font-medium text-mist-300">Bayas por parcela de las bayas fuente</summary>
                <div className="mt-3 space-y-2">
                  {recipeFlavors.flatMap((flavor) =>
                    sourceCandidates[flavor].map((candidate) => {
                      const id = candidate.berry.item_id
                      return (
                        <label key={id} className="flex items-center justify-between gap-3 text-xs text-mist-400">
                          <span>{berryName(id)}</span>
                          <span className="w-20">
                            <NumberField
                              ariaLabel={`Bayas por parcela de ${berryName(id)}`}
                              value={candidate.yieldPerPlot}
                              min={1}
                              max={20}
                              decimals
                              small
                              onChange={(v) => update("yieldOverrides", { ...settings.yieldOverrides, [String(id)]: v })}
                            />
                          </span>
                        </label>
                      )
                    }),
                  )}
                  <p className="pt-1 text-[11px] leading-4 text-mist-500">Mago y Aguav usan 6 (promedio medido en el juego); el resto, el promedio del rango registrado.</p>
                </div>
              </details>
            </div>
          </Panel>

          <Panel>
            <PanelTitle icon={<CircleDollarSign className="h-4 w-4 text-amber-300" />}>Precios del GTL</PanelTitle>
            <div className="mt-4 space-y-3">
              <PriceRow label="Harvest Tool" tip="Precio de un extractor de semillas. Se necesita uno por cada baya fuente que procesas." value={settings.toolPrice} onChange={(v) => update("toolPrice", v)} />
              <PriceRow label={targetName} tip="Precio al que venderías una unidad de la baya objetivo." value={settings.targetPrice} onChange={(v) => update("targetPrice", v)} />
              <PriceRow label="Comisión del GTL (%)" tip="Porcentaje que se descuenta de cada venta en el GTL. Compruébalo en el juego; 0 la ignora." value={settings.taxPct} max={100} onChange={(v) => update("taxPct", v)} />
              <div className="space-y-2 border-t border-white/10 pt-3">
                <p className="flex items-center gap-1.5 text-xs font-medium text-mist-400">
                  Semillas de la receta
                  <InfoTip text="Solo los sabores que usa la baya elegida. Sirven para valorar las semillas sobrantes y el costo de comprarlas." />
                </p>
                <div className="grid grid-cols-[1fr_76px_76px] gap-2 text-[10px] text-mist-600">
                  <span />
                  <span className="text-right">Normal</span>
                  <span className="text-right">Muy</span>
                </div>
                {recipeFlavors.map((flavor) => (
                  <div key={flavor} className="grid grid-cols-[1fr_76px_76px] items-center gap-2">
                    <span className="text-xs text-mist-400">{flavorLabels[flavor]}</span>
                    <NumberField ariaLabel={`${flavorLabels[flavor]} normal`} value={settings.seedPrices[flavor].plain} min={0} small onChange={(v) => setSeedPrice(flavor, "plain", v)} />
                    <NumberField ariaLabel={`${flavorLabels[flavor]} muy`} value={settings.seedPrices[flavor].very} min={0} small onChange={(v) => setSeedPrice(flavor, "very", v)} />
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </aside>

        {/* ------------------------------ Resultados ------------------------------ */}
        <main className="space-y-4">
          <StatusBanner
            fits={plan.fits}
            feasible={plan.feasible}
            targetName={targetName}
            targetPlots={plan.targetPlots}
            totalPlots={plan.totalPlots}
            maxTargetPlots={plan.maxTargetPlots}
            shortfall={shortfall}
            showUseMax={settings.mode === "fixed"}
            onUseMax={() => update("mode", "max")}
          />

          <PlotDistribution target={target} targetName={targetName} plan={plan} />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric icon={<Package />} label={`Parcelas de ${targetName}`} value={formatNumber(plan.targetPlots)} suffix={`≈ ${formatNumber(plan.economics.targetBerries)} bayas`} />
            <Metric icon={<Sprout />} label="Parcelas para semillas" value={formatNumber(plan.sourcePlots)} suffix={`de ${formatNumber(plan.totalPlots)} en total`} />
            <Metric icon={<Wrench />} label="Harvest Tools" value={formatNumber(plan.tools)} suffix={`${formatMoney(plan.economics.toolCost)} por ciclo`} />
            <Metric icon={<TrendingUp />} label="Beneficio estimado" value={formatMoney(plan.economics.profit)} suffix="por ciclo" positive={plan.economics.profit >= 0} />
          </div>

          <Panel padded>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Semillas que necesitas por ciclo</h2>
                <p className="text-xs text-mist-500">Receta de {targetName} por parcela, multiplicada por {formatNumber(plan.targetPlots)} parcelas.</p>
              </div>
              <div className="rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1 text-xs text-emerald-300">
                {target.grow_time} h · {target.min_harvest}–{target.max_harvest} bayas
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {plan.needs.map((seed) => (
                <SeedCard key={`${seed.flavor}-${seed.variant}`} flavor={seed.flavor} variant={seed.variant} total={seed.total} perPlot={seed.amount} />
              ))}
            </div>
          </Panel>

          <Panel padded>
            <h2 className="text-lg font-semibold text-white">Cómo producirlas</h2>
            <p className="text-xs text-mist-500">
              Parcelas de bayas de un solo sabor que se cosechan y se procesan con Harvest Tools. Ya se descuentan las semillas que consume replantarlas.
            </p>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {plan.flavors.map((flavorPlan) => (
                <div key={flavorPlan.flavor} className="rounded-xl border border-white/10 bg-[#20252f] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-white">{flavorLabels[flavorPlan.flavor]}</h3>
                    <p className="text-[11px] text-mist-500">
                      Necesitas {[flavorPlan.needPlain > 0 && `${formatNumber(flavorPlan.needPlain)} normales`, flavorPlan.needVery > 0 && `${formatNumber(flavorPlan.needVery)} Muy`].filter(Boolean).join(" + ")}
                    </p>
                  </div>
                  {flavorPlan.feasible ? (
                    <div className="mt-3 space-y-2">
                      {flavorPlan.sources.map((source) => {
                        const id = source.candidate.berry.item_id
                        const replant = source.candidate.replant
                        return (
                          <div key={id} className="flex items-center gap-3 rounded-lg bg-[#161a24] p-3">
                            <img src={`${import.meta.env.BASE_URL}item/${id}.png`} alt="" className="h-9 w-9 shrink-0 object-contain" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-white">
                                {formatNumber(source.plots)} parcelas de {berryLabel(id)}
                              </p>
                              <p className="text-[11px] text-mist-500">
                                {formatNumber(source.tools)} Harvest Tools · replantar {replant.amount}× {seedLabel(replant.flavor, replant.variant)} por parcela
                              </p>
                              <p className="text-[11px]">
                                <span className={source.netPlain >= 0 ? "text-emerald-300" : "text-red-300"}>{formatSigned(source.netPlain)} normales</span>
                                <span className="text-mist-600"> · </span>
                                <span className={source.netVery >= 0 ? "text-emerald-300" : "text-red-300"}>{formatSigned(source.netVery)} Muy</span>
                                <span className="text-mist-600"> netos</span>
                              </p>
                            </div>
                          </div>
                        )
                      })}
                      <p className="text-[11px] text-mist-500">
                        Sobran {formatNumber(flavorPlan.surplusPlain, 1)} normales y {formatNumber(flavorPlan.surplusVery, 1)} Muy que puedes vender.
                      </p>
                    </div>
                  ) : (
                    <p className="mt-3 flex items-start gap-2 rounded-lg bg-red-500/10 p-3 text-xs text-red-200">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      Con estos rendimientos ninguna baya de este sabor produce más semillas de las que consume. Tendrías que comprarlas.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Panel>

          <Panel padded>
            <h2 className="text-lg font-semibold text-white">Distribución de parcelas por cuenta</h2>
            <p className="text-xs text-mist-500">
              {settings.canTransfer || settings.accounts === 1
                ? "La cuenta 1 planta la baya objetivo y la última cultiva semillas; las semillas se pasan entre cuentas."
                : "Cada cuenta planta la baya objetivo y produce sus propias semillas."}
            </p>
            <div className="mt-4 space-y-3">
              {plan.distribution.map((row) => (
                <div key={row.account}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Cuenta {row.account}</span>
                    <span className="text-mist-500">
                      {formatNumber(row.target)} {targetName} · {formatNumber(row.sources)} semillas · {formatNumber(row.free)} libres
                    </span>
                  </div>
                  <div className="mt-1.5 flex h-2.5 overflow-hidden rounded-full bg-white/5" role="img" aria-label={`Cuenta ${row.account}: ${row.target} objetivo, ${row.sources} semillas, ${row.free} libres`}>
                    <div className="bg-violet-500" style={{ width: `${(row.target / plotsPerAccount) * 100}%` }} />
                    <div className="bg-emerald-400" style={{ width: `${(row.sources / plotsPerAccount) * 100}%` }} />
                  </div>
                </div>
              ))}
              <div className="flex gap-4 text-[11px] text-mist-500">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet-500" />{targetName}</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" />Semillas</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-white/10" />Libres</span>
              </div>
            </div>
          </Panel>

          <Panel padded>
            <h2 className="text-lg font-semibold text-white">Resumen por cuenta y personaje</h2>
            <p className="text-xs text-mist-500">Cifras por ciclo, repartidas entre {settings.charactersPerAccount} personaje(s) por cuenta.</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs text-mist-500">
                    <th className="px-3 py-2 font-medium">Métrica</th>
                    <th className="px-3 py-2 font-medium">Por personaje</th>
                    <th className="px-3 py-2 font-medium">Por cuenta</th>
                    <th className="px-3 py-2 font-medium">Total ({settings.accounts} cuentas)</th>
                  </tr>
                </thead>
                <tbody>
                  <SummaryRow
                    label={`Parcelas de ${targetName}`}
                    total={plan.targetPlots}
                    accounts={settings.accounts}
                    charactersPerAccount={settings.charactersPerAccount}
                  />
                  <SummaryRow
                    label={`Bayas de ${targetName}`}
                    total={plan.economics.targetBerries}
                    accounts={settings.accounts}
                    charactersPerAccount={settings.charactersPerAccount}
                  />
                  <SummaryRow
                    label="Ingreso por venta"
                    total={plan.economics.targetRevenue}
                    accounts={settings.accounts}
                    charactersPerAccount={settings.charactersPerAccount}
                    money
                  />
                  <SummaryRow
                    label="Beneficio neto"
                    total={plan.economics.profit}
                    accounts={settings.accounts}
                    charactersPerAccount={settings.charactersPerAccount}
                    money
                    highlight
                  />
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel padded>
            <h2 className="text-lg font-semibold text-white">Arranque del primer ciclo</h2>
            <p className="text-xs text-mist-500">
              Para plantar por primera vez las parcelas de semillas necesitas este stock inicial. Después el sistema se sostiene solo. Anota lo que ya tienes.
            </p>
            {plan.start.length === 0 ? (
              <p className="mt-4 text-sm text-mist-400">No hace falta stock inicial.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-xs text-mist-500">
                      <th className="px-3 py-2 font-medium">Semilla</th>
                      <th className="px-3 py-2 font-medium">Necesarias</th>
                      <th className="px-3 py-2 font-medium">Tengo</th>
                      <th className="px-3 py-2 font-medium">Faltan</th>
                      <th className="px-3 py-2 font-medium">Costo de comprarlas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.start.map((row) => (
                      <tr key={`${row.flavor}-${row.variant}`} className="border-b border-white/5">
                        <td className="px-3 py-3 font-semibold text-white">{seedLabel(row.flavor, row.variant)}</td>
                        <td className="px-3 py-3 text-mist-300">{formatNumber(row.needed)}</td>
                        <td className="px-3 py-2">
                          <div className="w-24">
                            <NumberField
                              ariaLabel={`Tengo ${seedLabel(row.flavor, row.variant)}`}
                              value={settings.stock[`${row.flavor}-${row.variant}`] ?? 0}
                              min={0}
                              small
                              onChange={(v) => update("stock", { ...settings.stock, [`${row.flavor}-${row.variant}`]: v })}
                            />
                          </div>
                        </td>
                        <td className={`px-3 py-3 ${row.missing > 0 ? "text-amber-300" : "text-emerald-300"}`}>{formatNumber(row.missing)}</td>
                        <td className="px-3 py-3 text-mist-300">{formatMoney(row.cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <div className="grid gap-4 lg:grid-cols-3">
            <ResultCard title={`Ingreso por ${targetName}`} value={formatMoney(plan.economics.targetRevenue)} subtitle={`${formatNumber(plan.economics.targetBerries)} × ${formatMoney(settings.targetPrice)}${settings.taxPct > 0 ? ` − ${settings.taxPct}% GTL` : ""}`} />
            <ResultCard title="Semillas sobrantes" value={formatMoney(plan.economics.surplusRevenue)} subtitle="Se venden después de cubrir el ciclo." />
            <ResultCard title="Costo de Harvest Tools" value={formatMoney(plan.economics.toolCost)} subtitle={`${formatMoney(plan.economics.costPerBerry)} por ${targetName} tras vender sobrantes`} />
          </div>

          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5 text-sm text-mist-300">
            <p className="font-semibold text-violet-200">Producir semillas frente a comprarlas</p>
            <p className="mt-1 text-xs leading-5 text-mist-400">
              Comprar todas las semillas costaría {formatMoney(plan.economics.buyAllCost)} por ciclo y dejaría un beneficio de {formatMoney(plan.economics.profitIfBuying)}. Produciéndolas ganas {formatMoney(plan.economics.profit)}:{" "}
              <span className={plan.economics.savings >= 0 ? "text-emerald-300" : "text-red-300"}>
                {plan.economics.savings >= 0 ? "ganas" : "pierdes"} {formatMoney(Math.abs(plan.economics.savings))} más
              </span>
              , a cambio de ocupar {formatNumber(plan.sourcePlots)} parcelas.
            </p>
          </div>
        </main>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Componentes de apoyo                                               */
/* ------------------------------------------------------------------ */

function StatusBanner(props: {
  fits: boolean
  feasible: boolean
  targetName: string
  targetPlots: number
  totalPlots: number
  maxTargetPlots: number
  shortfall: number
  showUseMax: boolean
  onUseMax: () => void
}) {
  const { fits, feasible, targetName, targetPlots, totalPlots, maxTargetPlots, shortfall, showUseMax, onUseMax } = props

  if (fits) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
        <p className="text-mist-300">
          Con tus {formatNumber(totalPlots)} parcelas puedes plantar <span className="font-semibold text-white">{formatNumber(targetPlots)} de {targetName}</span> sin comprar semillas. El máximo sostenible es {formatNumber(maxTargetPlots)}.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/5 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
        <p className="text-mist-300">
          {feasible ? (
            <>
              Faltan <span className="font-semibold text-white">{formatNumber(shortfall)} parcelas</span> para plantar {formatNumber(targetPlots)} de {targetName} sin comprar semillas. Con tus parcelas el máximo es {formatNumber(maxTargetPlots)}.
            </>
          ) : (
            <>Con estos rendimientos hay semillas que no se pueden producir en cantidad suficiente. Revisa los rendimientos o el porcentaje de semillas normales.</>
          )}
        </p>
      </div>
      {showUseMax && feasible && (
        <button type="button" onClick={onUseMax} className="shrink-0 rounded-xl border border-amber-400/30 px-3 py-2 text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-400/10">
          Usar el máximo posible
        </button>
      )}
    </div>
  )
}

function Panel({ children, padded = false }: { children: ReactNode; padded?: boolean }) {
  return <div className={`rounded-2xl border border-white/10 bg-[#161a24] ${padded ? "p-5" : "p-4"}`}>{children}</div>
}

function PanelTitle({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return <h2 className="flex items-center gap-2 text-base font-semibold text-white">{icon} {children}</h2>
}

function FieldLabel({ label, tip }: { label: string; tip: string }) {
  return (
    <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-mist-400">
      <span>{label}</span>
      <InfoTip text={tip} />
    </div>
  )
}

function InfoTip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex" tabIndex={0} aria-label="Más información">
      <span className="flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-mist-600/70 text-[10px] font-bold text-mist-500 transition-colors group-hover:border-violet-400 group-hover:text-violet-300 group-focus:border-violet-400 group-focus:text-violet-300">?</span>
      <span role="tooltip" className="pointer-events-none invisible absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-xl border border-white/10 bg-[#0f131c] px-3 py-2 text-left text-[11px] font-normal leading-5 text-mist-300 opacity-0 shadow-2xl transition-all group-hover:visible group-hover:opacity-100 group-focus:visible group-focus:opacity-100">
        {text}
      </span>
    </span>
  )
}

/**
 * Input numérico que deja borrar y reescribir: solo confirma el valor cuando es válido
 * y, al salir del campo, vuelve al último valor correcto.
 */
function NumberField({
  value,
  onChange,
  min = 0,
  max,
  decimals = false,
  small = false,
  ariaLabel,
}: {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  decimals?: boolean
  small?: boolean
  ariaLabel: string
}) {
  const [draft, setDraft] = useState(String(value))

  useEffect(() => {
    setDraft((current) => (Number(current) === value ? current : String(value)))
  }, [value])

  const handleChange = (text: string) => {
    setDraft(text)
    const parsed = Number(text)
    if (text.trim() === "" || !Number.isFinite(parsed) || parsed < min) return
    if (!decimals && !Number.isInteger(parsed)) return
    onChange(max !== undefined ? Math.min(parsed, max) : parsed)
  }

  return (
    <input
      aria-label={ariaLabel}
      type="number"
      inputMode={decimals ? "decimal" : "numeric"}
      min={min}
      max={max}
      step={decimals ? 0.1 : 1}
      value={draft}
      onChange={(event) => handleChange(event.target.value)}
      onBlur={() => setDraft(String(value))}
      className={`w-full rounded-xl border border-white/10 bg-[#20252f] text-white outline-none focus:border-violet-500 ${small ? "rounded-lg px-2 py-1.5 text-right text-xs" : "px-3 py-2.5 text-sm"}`}
    />
  )
}

function PriceRow({ label, tip, value, max, onChange }: { label: string; tip: string; value: number; max?: number; onChange: (value: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs text-mist-400">
      <span className="flex items-center gap-1.5">
        <span>{label}</span>
        <InfoTip text={tip} />
      </span>
      <div className="w-28">
        <NumberField ariaLabel={label} value={value} min={0} max={max} small onChange={onChange} />
      </div>
    </div>
  )
}

function Segmented<T extends string>({ value, options, onChange, ariaLabel }: { value: T; options: Array<{ value: T; label: string }>; onChange: (value: T) => void; ariaLabel: string }) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-[#20252f] p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-lg px-2 py-2 text-xs font-medium transition-colors ${value === option.value ? "bg-violet-500 text-white" : "text-mist-400 hover:text-white"}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function Metric({ icon, label, value, suffix, positive }: { icon: ReactNode; label: string; value: string; suffix: string; positive?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#161a24] p-4">
      <div className="flex items-center gap-2 text-xs text-mist-500">
        <span className="h-4 w-4 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
        <span>{label}</span>
      </div>
      <div className={`mt-2 text-xl font-bold ${positive === false ? "text-red-300" : "text-white"}`}>{value}</div>
      <div className="mt-0.5 text-[11px] text-mist-500">{suffix}</div>
    </div>
  )
}

function SeedCard({ flavor, variant, total, perPlot }: { flavor: Flavor; variant: SeedVariant; total: number; perPlot: number }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#20252f] p-3">
      <img src={`${import.meta.env.BASE_URL}item/${seedIds[flavor][variant]}.png`} alt="" className="h-10 w-10 object-contain" />
      <div className="min-w-0">
        <p className="text-lg font-bold text-white">{formatNumber(total)}</p>
        <p className="text-[11px] text-mist-500">
          {seedLabel(flavor, variant)} · {perPlot} por parcela
        </p>
      </div>
    </div>
  )
}

/** Fila de bayas con ícono para elegir la baya objetivo, como en la maqueta. */
function TargetPicker({ berries: allBerries, selectedId, onSelect }: { berries: BerryData[]; selectedId: number; onSelect: (id: number) => void }) {
  const options = useMemo(() => allBerries.filter((berry) => buildRecipe(berry).length > 0), [allBerries])
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {options.map((berry) => {
        const active = berry.item_id === selectedId
        return (
          <button
            key={berry.item_id}
            type="button"
            onClick={() => onSelect(berry.item_id)}
            className={`flex flex-col items-center gap-1 rounded-2xl border px-4 py-3 text-xs font-medium transition-colors ${
              active ? "border-violet-500 bg-violet-500/10 text-white" : "border-white/10 bg-[#161a24] text-mist-400 hover:border-white/20 hover:text-white"
            }`}
          >
            <img src={`${import.meta.env.BASE_URL}item/${berry.item_id}.png`} alt="" className="h-8 w-8 object-contain" />
            {berryName(berry.item_id)}
          </button>
        )
      })}
    </div>
  )
}

/** Tarjetas con la proporción de parcelas: la baya objetivo y cada baya fuente. */
function PlotDistribution({ target, targetName, plan }: { target: BerryData; targetName: string; plan: ReturnType<typeof computePlan> }) {
  const total = plan.totalPlots || 1
  const rows: Array<{ id: number; name: string; plots: number; role: "target" | "source" }> = [
    { id: target.item_id, name: targetName, plots: plan.targetPlots, role: "target" },
  ]
  for (const flavorPlan of plan.flavors) {
    for (const source of flavorPlan.sources) {
      const id = source.candidate.berry.item_id
      const existing = rows.find((row) => row.id === id && row.role === "source")
      if (existing) existing.plots += source.plots
      else rows.push({ id, name: berryName(id), plots: source.plots, role: "source" })
    }
  }

  return (
    <Panel padded>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Distribución de parcelas</h2>
        <span className="text-xs text-mist-500">{formatNumber(plan.plotsUsed)} de {formatNumber(plan.totalPlots)} parcelas</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {rows.map((row) => (
          <div key={`${row.role}-${row.id}`} className="rounded-xl border border-white/10 bg-[#20252f] p-4">
            <div className="flex items-center gap-2">
              <img src={`${import.meta.env.BASE_URL}item/${row.id}.png`} alt="" className="h-7 w-7 object-contain" />
              <span className={`text-xs font-medium ${row.role === "target" ? "text-violet-300" : "text-emerald-300"}`}>
                {row.role === "target" ? "Objetivo" : "Fuente"}
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold text-white">{row.name}</p>
            <p className="text-lg font-bold text-white">{formatNumber(row.plots)}</p>
            <p className="text-[11px] text-mist-500">{((row.plots / total) * 100).toFixed(1)}% de las parcelas</p>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function SummaryRow({
  label,
  total,
  accounts,
  charactersPerAccount,
  money = false,
  highlight = false,
}: {
  label: string
  total: number
  accounts: number
  charactersPerAccount: number
  money?: boolean
  highlight?: boolean
}) {
  const perAccount = total / accounts
  const perCharacter = perAccount / charactersPerAccount
  const fmt = money ? formatMoney : (v: number) => formatNumber(v, 1)
  return (
    <tr className="border-b border-white/5">
      <td className="px-3 py-3 text-mist-300">{label}</td>
      <td className="px-3 py-3 text-mist-300">{fmt(perCharacter)}</td>
      <td className="px-3 py-3 text-mist-300">{fmt(perAccount)}</td>
      <td className={`px-3 py-3 font-semibold ${highlight ? "text-emerald-300" : "text-white"}`}>{fmt(total)}</td>
    </tr>
  )
}

function ResultCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#161a24] p-5">
      <p className="text-xs font-medium text-mist-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-mist-500">{subtitle}</p>
    </div>
  )
}
