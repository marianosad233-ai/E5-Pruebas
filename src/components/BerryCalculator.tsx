import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Package,
  RotateCcw,
  Search,
  Settings2,
  Sprout,
  TrendingUp,
} from "lucide-react"
import {
  berries,
  computePlan,
  defaultYield,
  sourceForFlavor,
  type Flavor,
  type FlavorPlan,
  type PlanMode,
  type SeedVariant,
} from "./Berries/berryPlanner"
import type { RawBerry } from "./Berries/berryData"
import { BerryPlantingMaps } from "./Berries/BerryPlantingMaps"

/* ------------------------------------------------------------------ */
/*  Etiquetas y nombres                                                */
/* ------------------------------------------------------------------ */

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
  "Cheri Berry": "Zreza",
  "Pecha Berry": "Meloc",
  "Rawst Berry": "Safre",
  "Chesto Berry": "Atania",
  "Aspear Berry": "Perasi",
  "Oran Berry": "Orán",
  "Lum Berry": "Ziuela",
  "Persim Berry": "Caquic",
}

const seedIds: Record<Flavor, Record<SeedVariant, number>> = {
  sour: { plain: 701, very: 706 },
  sweet: { plain: 702, very: 707 },
  bitter: { plain: 703, very: 708 },
  spicy: { plain: 704, very: 709 },
  dry: { plain: 705, very: 710 },
}

const englishShort = (berry: RawBerry) => berry.name.replace(/ Berry$/, "")

function berryName(berry: RawBerry) {
  return spanishBerryNames[berry.name] ?? englishShort(berry)
}

function berryLabel(berry: RawBerry) {
  const es = spanishBerryNames[berry.name]
  const en = englishShort(berry)
  return es && es !== en ? `${es} (${en})` : en
}

const seedLabel = (flavor: Flavor, variant: SeedVariant) => (variant === "very" ? `Muy ${flavorLabels[flavor]}` : flavorLabels[flavor])
const icon = (itemId: number) => `${import.meta.env.BASE_URL}item/${itemId}.png`

const formatMoney = (value: number) => `${Math.round(value).toLocaleString("es-PE")} ₽`
const formatNumber = (value: number, digits = 0) => value.toLocaleString("es-PE", { maximumFractionDigits: digits })

const sortedBerries = [...berries].sort((a, b) => berryName(a).localeCompare(berryName(b)))

/* ------------------------------------------------------------------ */
/*  Ajustes guardados                                                  */
/* ------------------------------------------------------------------ */

interface Settings {
  accounts: number
  charactersPerAccount: number
  plotsPerCharacter: number
  targetId: string
  mode: PlanMode
  plotsToPlant: number
  marginPct: number
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
  targetId: "leppa",
  mode: "fixed",
  plotsToPlant: 960,
  marginPct: 10,
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

const STORAGE_KEY = "berryCalculator.v3"

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

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => setSettings((current) => ({ ...current, [key]: value }))

  const reset = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* se ignora */
    }
    setSettings(DEFAULT_SETTINGS)
  }

  const target = berries.find((berry) => berry.id === settings.targetId) ?? berries[0]
  const targetName = berryName(target)
  const targetYield = settings.targetYield ?? defaultYield(target)
  const plotsPerAccount = settings.charactersPerAccount * settings.plotsPerCharacter

  const plan = useMemo(
    () =>
      computePlan({
        target,
        targetYield,
        plainChance: settings.plainChance / 100,
        sourceYields: settings.yieldOverrides,
        accounts: settings.accounts,
        plotsPerAccount,
        canTransfer: true, // en PokeMMO siempre se pueden pasar semillas entre tus propias cuentas
        mode: settings.mode,
        targetPlots: settings.plotsToPlant,
        marginPct: settings.marginPct,
        prices: { tool: settings.toolPrice, target: settings.targetPrice, taxPct: settings.taxPct, seeds: settings.seedPrices },
        stock: settings.stock,
      }),
    [settings, target, targetYield, plotsPerAccount],
  )

  const recipeFlavors = useMemo(() => Array.from(new Set(target.recipe.map((seed) => seed.flavor))), [target])

  const setSeedPrice = (flavor: Flavor, variant: SeedVariant, value: number) =>
    update("seedPrices", { ...settings.seedPrices, [flavor]: { ...settings.seedPrices[flavor], [variant]: value } })

  const shortfall = Math.max(0, plan.plotsShortfall)

  return (
    <section className="mx-auto w-full max-w-[1100px] px-4 pb-20 sm:px-6 lg:px-8">
      <div className="border-b border-white/10 pb-4 text-sm text-mist-400">
        <span className="text-mist-300">Home</span>
        <span className="mx-2">/</span>
        <span className="text-mist-300">Herramientas</span>
        <span className="mx-2">/</span>
        <span>Calculadora de Bayas</span>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-[40px]">Calculadora de Bayas</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-mist-400">
            Elige qué baya quieres plantar y cuántas parcelas tienes. Te decimos cuántas puedes cultivar sin comprar semillas nunca
            más, y qué plantar para conseguirlas.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-2 self-start rounded-xl border border-white/10 bg-[#161a24] px-3 py-2 text-xs font-medium text-mist-300 transition-colors hover:border-violet-500/50 hover:text-white sm:self-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Restablecer
        </button>
      </div>

      {/* ------------------------------ Paso 1: baya y cantidad ------------------------------ */}
      <Panel padded className="mt-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel label="¿Qué baya quieres plantar?" />
            <BerryPicker selectedId={target.id} onSelect={(id) => setSettings((current) => ({ ...current, targetId: id, targetYield: null }))} />
          </div>
          <div>
            <FieldLabel label="¿Cuánto quieres plantar?" />
            <Segmented<PlanMode>
              ariaLabel="Modo de cálculo"
              value={settings.mode}
              onChange={(value) => update("mode", value)}
              options={[
                { value: "fixed", label: "Una cantidad exacta" },
                { value: "max", label: "Todas las que tenga" },
              ]}
            />
            {settings.mode === "fixed" ? (
              <div className="mt-2">
                <NumberField ariaLabel={`Parcelas de ${targetName}`} value={settings.plotsToPlant} min={1} max={50000} onChange={(v) => update("plotsToPlant", v)} />
              </div>
            ) : (
              <div className="mt-2 flex items-center gap-2 text-xs text-mist-400">
                <span>Margen de seguridad</span>
                <InfoTip text="Se resta al máximo para dejar parcelas libres por si una cosecha rinde menos de lo normal. 10% es razonable." />
                <div className="w-20">
                  <NumberField ariaLabel="Margen de seguridad" value={settings.marginPct} min={0} max={50} small onChange={(v) => update("marginPct", v)} />
                </div>
                <span>%</span>
              </div>
            )}
          </div>
        </div>

        {settings.mode === "max" && (
          <div className="mt-5 border-t border-white/10 pt-5">
            <p className="mb-3 text-xs text-mist-500">Para calcular el máximo necesitamos saber cuántas parcelas tienes en total.</p>
            <AccountsConfig
              accounts={settings.accounts}
              onAccounts={(v) => update("accounts", v)}
              charactersPerAccount={settings.charactersPerAccount}
              onCharacters={(v) => update("charactersPerAccount", v)}
              plotsPerCharacter={settings.plotsPerCharacter}
              onPlots={(v) => update("plotsPerCharacter", v)}
              totalPlots={plan.totalPlots}
            />
          </div>
        )}
      </Panel>

      {/* ------------------------------ Resultado principal ------------------------------ */}
      <div className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Metric icon={<Package />} label={`Parcelas de ${targetName}`} value={formatNumber(plan.targetPlots)} suffix={`≈ ${formatNumber(plan.economics.targetBerries)} bayas por ciclo`} />
          <Metric icon={<Sprout />} label="Parcelas para producir semillas" value={formatNumber(plan.sourcePlots)} suffix="las que salen de la receta" />
          <Metric icon={<TrendingUp />} label="Beneficio estimado" value={formatMoney(plan.economics.profit)} suffix="por ciclo, vendiendo a tus precios" positive={plan.economics.profit >= 0} />
        </div>

        {/* ------------------------------ Semillas necesarias ------------------------------ */}
        <Panel padded>
          <h2 className="text-lg font-semibold text-white">1. Semillas que necesitas por ciclo</h2>
          <p className="mt-1 text-xs text-mist-500">
            Para plantar {formatNumber(plan.targetPlots)} de {targetName}, multiplicando la receta por esa cantidad de parcelas.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {plan.needs.map((seed) => (
              <div key={`${seed.flavor}-${seed.variant}`} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#20252f] p-3">
                <img src={icon(seedIds[seed.flavor][seed.variant])} alt="" className="h-9 w-9 object-contain" />
                <div>
                  <p className="text-lg font-bold text-white">{formatNumber(seed.total)}</p>
                  <p className="text-[11px] text-mist-500">
                    {seedLabel(seed.flavor, seed.variant)} · {seed.amount} por parcela
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* ------------------------------ Cómo se logra ------------------------------ */}
        <Panel padded>
          <h2 className="text-lg font-semibold text-white">2. Qué plantar para conseguir esas semillas</h2>
          <p className="mt-1 text-xs leading-5 text-mist-500">
            {targetName} necesita {target.recipe.map((seed) => `${seed.amount} ${seedLabel(seed.flavor, seed.variant)}`).join(" + ")} por
            parcela. Cada sabor tiene una sola baya que lo produce en forma pura. Esa baya se puede replantar con 3 semillas normales, o
            con 1 normal + 1 Muy — la calculadora usa la que deje más de lo que necesitas.
          </p>
          <div className="mt-4 space-y-3">
            {plan.flavors.map((flavorPlan) => {
              const source = flavorPlan.source ?? sourceForFlavor(flavorPlan.flavor)
              return (
                <div key={flavorPlan.flavor} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#20252f] p-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3 sm:w-52 sm:shrink-0">
                    {source && <img src={icon(source.berry.itemId)} alt="" className="h-10 w-10 object-contain" />}
                    <div>
                      <p className="text-sm font-semibold text-white">{source ? berryLabel(source.berry) : "Sin baya fuente"}</p>
                      <p className="text-[11px] text-mist-500">
                        para {[flavorPlan.needPlain > 0 && `${formatNumber(flavorPlan.needPlain)} ${seedLabel(flavorPlan.flavor, "plain")}`, flavorPlan.needVery > 0 && `${formatNumber(flavorPlan.needVery)} ${seedLabel(flavorPlan.flavor, "very")}`]
                          .filter(Boolean)
                          .join(" + ")}
                      </p>
                    </div>
                  </div>
                  {flavorPlan.feasible ? (
                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-mist-400">
                        <span>
                          <span className="text-base font-bold text-white">{formatNumber(flavorPlan.plots)}</span> parcelas
                        </span>
                        <span>
                          <span className="font-semibold text-mist-300">{formatNumber(flavorPlan.tools)}</span> Harvest Tools
                        </span>
                        {(flavorPlan.surplusPlain > 0.5 || flavorPlan.surplusVery > 0.5) && (
                          <span className="text-emerald-300">
                            sobran {formatNumber(flavorPlan.surplusPlain, 1)} {seedLabel(flavorPlan.flavor, "plain")} y {formatNumber(flavorPlan.surplusVery, 1)}{" "}
                            {seedLabel(flavorPlan.flavor, "very")}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-mist-500">
                        {flavorPlan.strategies.map((strategy, index) => (
                          <span key={index}>
                            {formatNumber(strategy.plots)} parcelas replantadas con {strategy.recipe.map((s) => `${s.amount} ${seedLabel(s.flavor, s.variant)}`).join(" + ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="flex items-center gap-2 text-xs text-red-300">
                      <AlertTriangle className="h-4 w-4 shrink-0" /> No se produce sola: tendrías que comprar esta semilla.
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </Panel>

        {/* ------------------------------ ¿Te alcanzan tus parcelas? ------------------------------ */}
        <Panel padded>
          <h2 className="text-lg font-semibold text-white">
            3. ¿Te alcanzan tus parcelas? <span className="font-normal text-mist-500">(opcional)</span>
          </h2>
          <p className="mt-1 text-xs text-mist-500">
            Esto no cambia las semillas ni las bayas fuente de arriba: solo comprueba si te caben en el terreno que tienes y, si usas
            varias cuentas, cómo repartirlo. Si vas a llevar la cuenta tú mismo, puedes saltarte este paso.
          </p>

          {settings.mode === "fixed" && (
            <div className="mt-4">
              <AccountsConfig
                accounts={settings.accounts}
                onAccounts={(v) => update("accounts", v)}
                charactersPerAccount={settings.charactersPerAccount}
                onCharacters={(v) => update("charactersPerAccount", v)}
                plotsPerCharacter={settings.plotsPerCharacter}
                onPlots={(v) => update("plotsPerCharacter", v)}
                totalPlots={plan.totalPlots}
              />
            </div>
          )}

          <div className="mt-4">
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
          </div>

          {settings.accounts > 1 && (
            <div className="mt-5 space-y-3 border-t border-white/10 pt-5">
              <p className="text-xs font-medium text-mist-400">
                Reparto sugerido entre tus {settings.accounts} cuentas (una siembra semillas, la otra la baya objetivo; en PokeMMO puedes pasarlas entre tus cuentas):
              </p>
              {plan.distribution.map((row) => (
                <div key={row.account}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Cuenta {row.account}</span>
                    <span className="text-mist-500">
                      {formatNumber(row.target)} {targetName} · {formatNumber(row.sources)} semillas · {formatNumber(row.free)} libres
                    </span>
                  </div>
                  <div className="mt-1.5 flex h-2 overflow-hidden rounded-full bg-white/5">
                    <div className="bg-violet-500" style={{ width: `${(row.target / plotsPerAccount) * 100}%` }} />
                    <div className="bg-emerald-400" style={{ width: `${(row.sources / plotsPerAccount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {plan.fits && (
            <div className="mt-5 border-t border-white/10 pt-5">
              <p className="mb-3 text-xs font-medium text-mist-400">Qué le toca plantar a cada personaje:</p>
              <CharacterAllocationTable
                target={target}
                targetName={targetName}
                targetPlots={plan.targetPlots}
                flavors={plan.flavors}
                accounts={settings.accounts}
                charactersPerAccount={settings.charactersPerAccount}
                plotsPerCharacter={settings.plotsPerCharacter}
              />
            </div>
          )}
        </Panel>

        {/* ------------------------------ Arranque ------------------------------ */}
        {plan.start.length > 0 && (
          <Panel padded>
            <h2 className="text-lg font-semibold text-white">Para empezar el primer ciclo</h2>
            <p className="mt-1 text-xs text-mist-500">
              Solo hace falta una vez, para plantar por primera vez las parcelas de semillas. Después el sistema se mantiene solo.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs text-mist-500">
                    <th className="px-3 py-2 font-medium">Semilla</th>
                    <th className="px-3 py-2 font-medium">Necesarias</th>
                    <th className="px-3 py-2 font-medium">Ya tengo</th>
                    <th className="px-3 py-2 font-medium">Me faltan</th>
                    <th className="px-3 py-2 font-medium">Costo de comprarlas</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.start.map((row) => (
                    <tr key={`${row.flavor}-${row.variant}`} className="border-b border-white/5">
                      <td className="flex items-center gap-2 px-3 py-3 font-semibold text-white">
                        <img src={icon(seedIds[row.flavor][row.variant])} alt="" className="h-6 w-6 object-contain" />
                        {seedLabel(row.flavor, row.variant)}
                      </td>
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
          </Panel>
        )}

        {/* ------------------------------ Economía ------------------------------ */}
        <Panel padded>
          <h2 className="text-lg font-semibold text-white">Beneficio por ciclo</h2>
          <dl className="mt-4 divide-y divide-white/5 text-sm">
            <EconRow label={`Venta de ${formatNumber(plan.economics.targetBerries)} ${targetName}`} value={plan.economics.targetRevenue} />
            <EconRow label="Venta de semillas sobrantes" value={plan.economics.surplusRevenue} />
            <EconRow label={`Harvest Tools (${formatNumber(plan.tools)})`} value={-plan.economics.toolCost} />
            {plan.economics.unmetCost > 0 && <EconRow label="Semillas que no se pueden producir (comprarlas)" value={-plan.economics.unmetCost} />}
            <EconRow label="Beneficio" value={plan.economics.profit} bold />
          </dl>
          <p className="mt-4 border-t border-white/10 pt-3 text-xs leading-5 text-mist-500">
            Comprar todas las semillas en vez de producirlas costaría {formatMoney(plan.economics.buyAllCost)} y dejaría{" "}
            {formatMoney(plan.economics.profitIfBuying)} de beneficio: {plan.economics.savings >= 0 ? "producirlas te conviene" : "en este caso comprar sale mejor"}, por{" "}
            {formatMoney(Math.abs(plan.economics.savings))}.
          </p>
        </Panel>

        {/* ------------------------------ Ajustes avanzados ------------------------------ */}
        <AdvancedSettings
          plainChance={settings.plainChance}
          onPlainChance={(v) => update("plainChance", v)}
          targetName={targetName}
          targetYield={targetYield}
          onTargetYield={(v) => update("targetYield", v)}
          target={target}
          recipeFlavors={recipeFlavors}
          yieldOverrides={settings.yieldOverrides}
          onYieldOverride={(id, v) => update("yieldOverrides", { ...settings.yieldOverrides, [id]: v })}
          toolPrice={settings.toolPrice}
          onToolPrice={(v) => update("toolPrice", v)}
          targetPrice={settings.targetPrice}
          onTargetPrice={(v) => update("targetPrice", v)}
          taxPct={settings.taxPct}
          onTaxPct={(v) => update("taxPct", v)}
          seedPrices={settings.seedPrices}
          onSeedPrice={setSeedPrice}
        />

        {/* ------------------------------ Mapas de plantación ------------------------------ */}
        <BerryPlantingMaps />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Selector compacto de baya                                          */
/* ------------------------------------------------------------------ */

function BerryPicker({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const selected = sortedBerries.find((berry) => berry.id === selectedId) ?? sortedBerries[0]

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return sortedBerries
    return sortedBerries.filter((berry) => berryName(berry).toLowerCase().includes(query) || englishShort(berry).toLowerCase().includes(query))
  }, [search])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-[#20252f] px-3 py-2.5 text-left text-sm text-white outline-none transition-colors hover:border-violet-500/50 focus:border-violet-500"
      >
        <img src={icon(selected.itemId)} alt="" className="h-7 w-7 shrink-0 object-contain" />
        <span className="min-w-0 flex-1 truncate font-medium">{berryLabel(selected)}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-mist-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-white/10 bg-[#161a24] shadow-2xl">
          <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-mist-500" />
            <input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar baya…"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-mist-600"
            />
          </div>
          <div className="max-h-64 overflow-y-auto p-1.5">
            {filtered.length === 0 && <p className="px-3 py-3 text-xs text-mist-500">Sin resultados.</p>}
            {filtered.map((berry) => (
              <button
                key={berry.id}
                type="button"
                onClick={() => {
                  onSelect(berry.id)
                  setOpen(false)
                  setSearch("")
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                  berry.id === selectedId ? "bg-violet-500/15 text-white" : "text-mist-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <img src={icon(berry.itemId)} alt="" className="h-6 w-6 shrink-0 object-contain" />
                <span className="truncate">{berryLabel(berry)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Ajustes avanzados (colapsados)                                     */
/* ------------------------------------------------------------------ */

function AdvancedSettings(props: {
  plainChance: number
  onPlainChance: (v: number) => void
  targetName: string
  targetYield: number
  onTargetYield: (v: number) => void
  target: RawBerry
  recipeFlavors: Flavor[]
  yieldOverrides: Record<string, number>
  onYieldOverride: (id: string, v: number) => void
  toolPrice: number
  onToolPrice: (v: number) => void
  targetPrice: number
  onTargetPrice: (v: number) => void
  taxPct: number
  onTaxPct: (v: number) => void
  seedPrices: Record<Flavor, Record<SeedVariant, number>>
  onSeedPrice: (flavor: Flavor, variant: SeedVariant, value: number) => void
}) {
  const [open, setOpen] = useState(false)
  const sources = props.recipeFlavors.map((flavor) => sourceForFlavor(flavor)).filter((s): s is NonNullable<typeof s> => Boolean(s))

  return (
    <Panel>
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-2 text-left">
        <span className="flex items-center gap-2 text-sm font-semibold text-white">
          <Settings2 className="h-4 w-4 text-mist-400" /> Rendimientos y precios (opcional)
        </span>
        <ChevronDown className={`h-4 w-4 text-mist-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-4 space-y-5 border-t border-white/10 pt-4">
          <div>
            <div className="flex items-center justify-between text-xs text-mist-400">
              <span className="flex items-center gap-1.5">
                Probabilidad de semilla normal (frente a Muy)
                <InfoTip text="Cada Harvest Tool da 1 semilla: normal o Muy. Con 70%, una parcela de 4,5 bayas da en promedio 3,15 normales y 1,35 Muy." />
              </span>
              <span className="font-semibold text-white">{props.plainChance}%</span>
            </div>
            <input
              aria-label="Probabilidad de semilla normal"
              type="range"
              min={50}
              max={90}
              value={props.plainChance}
              onChange={(event) => props.onPlainChance(Number(event.target.value))}
              className="mt-2 w-full accent-violet-500"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel label={`Bayas por parcela de ${props.targetName}`} tip={`Rango registrado: ${props.target.minYield}–${props.target.maxYield}.`} />
              <NumberField ariaLabel="Bayas por parcela objetivo" value={props.targetYield} min={1} max={20} decimals onChange={props.onTargetYield} />
            </div>
            <div>
              <FieldLabel label="Comisión del GTL (%)" tip="Porcentaje que se descuenta de cada venta. 0 la ignora." />
              <NumberField ariaLabel="Comisión del GTL" value={props.taxPct} min={0} max={100} onChange={props.onTaxPct} />
            </div>
          </div>

          {sources.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium text-mist-400">Bayas por parcela de las bayas fuente</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {sources.map((source) => (
                  <label key={source.berry.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#20252f] px-3 py-2 text-xs text-mist-400">
                    <span className="flex items-center gap-2">
                      <img src={icon(source.berry.itemId)} alt="" className="h-5 w-5 object-contain" />
                      {berryName(source.berry)}
                    </span>
                    <span className="w-16">
                      <NumberField
                        ariaLabel={`Bayas por parcela de ${berryName(source.berry)}`}
                        value={props.yieldOverrides[String(source.berry.itemId)] ?? defaultYield(source.berry)}
                        min={1}
                        max={20}
                        decimals
                        small
                        onChange={(v) => props.onYieldOverride(String(source.berry.itemId), v)}
                      />
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel label="Precio del Harvest Tool" />
              <NumberField ariaLabel="Precio del Harvest Tool" value={props.toolPrice} min={0} onChange={props.onToolPrice} />
            </div>
            <div>
              <FieldLabel label={`Precio de venta de ${props.targetName}`} />
              <NumberField ariaLabel="Precio de la baya objetivo" value={props.targetPrice} min={0} onChange={props.onTargetPrice} />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-mist-400">Precio de las semillas de la receta</p>
            <div className="grid grid-cols-[1fr_84px_84px] gap-2 text-[10px] text-mist-600">
              <span />
              <span className="text-right">Normal</span>
              <span className="text-right">Muy</span>
            </div>
            {props.recipeFlavors.map((flavor) => (
              <div key={flavor} className="mt-1.5 grid grid-cols-[1fr_84px_84px] items-center gap-2">
                <span className="text-xs text-mist-400">{flavorLabels[flavor]}</span>
                <NumberField ariaLabel={`${flavorLabels[flavor]} normal`} value={props.seedPrices[flavor].plain} min={0} small onChange={(v) => props.onSeedPrice(flavor, "plain", v)} />
                <NumberField ariaLabel={`${flavorLabels[flavor]} muy`} value={props.seedPrices[flavor].very} min={0} small onChange={(v) => props.onSeedPrice(flavor, "very", v)} />
              </div>
            ))}
          </div>
        </div>
      )}
    </Panel>
  )
}

/* ------------------------------------------------------------------ */
/*  Componentes de apoyo                                               */
/* ------------------------------------------------------------------ */

function AccountsConfig(props: {
  accounts: number
  onAccounts: (value: number) => void
  charactersPerAccount: number
  onCharacters: (value: number) => void
  plotsPerCharacter: number
  onPlots: (value: number) => void
  totalPlots: number
}) {
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <FieldLabel label="Cuentas" />
          <NumberField ariaLabel="Cuentas" value={props.accounts} min={1} max={10} onChange={props.onAccounts} />
        </div>
        <div>
          <FieldLabel label="Personajes por cuenta" />
          <NumberField ariaLabel="Personajes por cuenta" value={props.charactersPerAccount} min={1} max={3} onChange={props.onCharacters} />
        </div>
        <div>
          <FieldLabel label="Parcelas por personaje" />
          <NumberField ariaLabel="Parcelas por personaje" value={props.plotsPerCharacter} min={1} max={2000} onChange={props.onPlots} />
        </div>
      </div>
      <p className="mt-3 text-xs text-mist-500">
        Total: <span className="font-semibold text-white">{formatNumber(props.totalPlots)}</span> parcelas
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Reparto por personaje                                              */
/* ------------------------------------------------------------------ */

interface CharacterSlot {
  account: number
  character: number
  entries: Array<{ berry: RawBerry; plots: number }>
  free: number
}

/**
 * Reparte la baya objetivo desde el primer personaje hacia adelante, y las bayas
 * fuente desde el último personaje hacia atrás (así se pueden pasar semillas entre
 * cuentas, empezando por la última). Cada personaje puede terminar con una sola
 * baya o con la cola de una y el principio de otra, si no encajan justo.
 */
function allocateCharacters(
  target: RawBerry,
  targetPlots: number,
  sourceItems: Array<{ berry: RawBerry; plots: number }>,
  accounts: number,
  charactersPerAccount: number,
  plotsPerCharacter: number,
): CharacterSlot[] {
  const slots: CharacterSlot[] = []
  for (let account = 1; account <= accounts; account++) {
    for (let character = 1; character <= charactersPerAccount; character++) {
      slots.push({ account, character, entries: [], free: plotsPerCharacter })
    }
  }

  let remainingTarget = targetPlots
  for (const slot of slots) {
    if (remainingTarget <= 0) break
    const take = Math.min(slot.free, remainingTarget)
    if (take > 0) {
      slot.entries.push({ berry: target, plots: take })
      slot.free -= take
      remainingTarget -= take
    }
  }

  let tailIndex = slots.length - 1
  for (const item of [...sourceItems].sort((a, b) => b.plots - a.plots)) {
    let remaining = item.plots
    while (remaining > 0 && tailIndex >= 0) {
      const slot = slots[tailIndex]
      if (slot.free <= 0) {
        tailIndex--
        continue
      }
      const take = Math.min(slot.free, remaining)
      slot.entries.push({ berry: item.berry, plots: take })
      slot.free -= take
      remaining -= take
    }
  }

  return slots
}

function CharacterAllocationTable(props: {
  target: RawBerry
  targetName: string
  targetPlots: number
  flavors: FlavorPlan[]
  accounts: number
  charactersPerAccount: number
  plotsPerCharacter: number
}) {
  const sourceItems = props.flavors
    .filter((flavorPlan) => flavorPlan.feasible && flavorPlan.source && flavorPlan.plots > 0)
    .map((flavorPlan) => ({ berry: flavorPlan.source!.berry, plots: flavorPlan.plots }))

  const slots = allocateCharacters(
    props.target,
    props.targetPlots,
    sourceItems,
    props.accounts,
    props.charactersPerAccount,
    props.plotsPerCharacter,
  )

  const byAccount = Array.from({ length: props.accounts }, (_, index) => slots.filter((slot) => slot.account === index + 1))

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {byAccount.map((accountSlots, accountIndex) => (
        <div key={accountIndex} className="rounded-xl border border-white/10 bg-[#20252f] p-3">
          <p className="mb-2 text-xs font-semibold text-white">Cuenta {accountIndex + 1}</p>
          <div className="space-y-2">
            {accountSlots.map((slot) => (
              <div key={slot.character} className="flex items-center gap-2 text-xs text-mist-400">
                <span className="w-14 shrink-0 text-mist-500">PJ {slot.character}</span>
                {slot.entries.length === 0 ? (
                  <span className="text-mist-600">sin usar</span>
                ) : (
                  <div className="flex flex-1 flex-wrap gap-x-3 gap-y-1">
                    {slot.entries.map((entry, index) => (
                      <span key={index} className="inline-flex items-center gap-1.5 text-mist-300">
                        <img src={icon(entry.berry.itemId)} alt="" className="h-4 w-4 object-contain" />
                        {formatNumber(entry.plots)} {berryName(entry.berry)}
                      </span>
                    ))}
                  </div>
                )}
                {slot.free > 0 && <span className="shrink-0 text-mist-600">+{formatNumber(slot.free)} libres</span>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

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
          Con {formatNumber(totalPlots)} parcelas puedes plantar <span className="font-semibold text-white">{formatNumber(targetPlots)} de {targetName}</span> por
          ciclo, para siempre, sin comprar semillas.
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
              Te faltan <span className="font-semibold text-white">{formatNumber(shortfall)} parcelas</span> para plantar {formatNumber(targetPlots)} de {targetName} sin
              comprar semillas. Con lo que tienes, el máximo es {formatNumber(maxTargetPlots)}.
            </>
          ) : (
            <>Con estos rendimientos, alguna semilla de la receta no se puede producir sola. Baja la cantidad o revisa los rendimientos.</>
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

function Panel({ children, padded = false, className = "" }: { children: ReactNode; padded?: boolean; className?: string }) {
  return <div className={`rounded-2xl border border-white/10 bg-[#161a24] ${padded ? "p-5" : "p-4"} ${className}`}>{children}</div>
}

function FieldLabel({ label, tip }: { label: string; tip?: string }) {
  return (
    <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-mist-400">
      <span>{label}</span>
      {tip && <InfoTip text={tip} />}
    </div>
  )
}

function InfoTip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex" tabIndex={0} aria-label="Más información">
      <span className="flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-mist-600/70 text-[10px] font-bold text-mist-500 transition-colors group-hover:border-violet-400 group-hover:text-violet-300 group-focus:border-violet-400 group-focus:text-violet-300">
        ?
      </span>
      <span
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-xl border border-white/10 bg-[#0f131c] px-3 py-2 text-left text-[11px] font-normal leading-5 text-mist-300 opacity-0 shadow-2xl transition-all group-hover:visible group-hover:opacity-100 group-focus:visible group-focus:opacity-100"
      >
        {text}
      </span>
    </span>
  )
}

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

function Segmented<T extends string>({ value, options, onChange, ariaLabel }: { value: T; options: Array<{ value: T; label: string }>; onChange: (value: T) => void; ariaLabel: string }) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="grid w-full grid-cols-2 gap-1 rounded-xl border border-white/10 bg-[#20252f] p-1">
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

function Metric({ icon: IconEl, label, value, suffix, positive }: { icon: ReactNode; label: string; value: string; suffix: string; positive?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#161a24] p-4">
      <div className="flex items-center gap-2 text-xs text-mist-500">
        <span className="h-4 w-4 [&>svg]:h-4 [&>svg]:w-4">{IconEl}</span>
        <span>{label}</span>
      </div>
      <div className={`mt-2 text-xl font-bold ${positive === false ? "text-red-300" : "text-white"}`}>{value}</div>
      <div className="mt-0.5 text-[11px] text-mist-500">{suffix}</div>
    </div>
  )
}

function EconRow({ label, value, bold = false }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className={`text-xs ${bold ? "font-semibold text-white" : "text-mist-400"}`}>{label}</dt>
      <dd className={`text-sm ${bold ? "font-bold text-white" : value < 0 ? "text-red-300" : "text-emerald-300"}`}>
        {value < 0 ? "−" : bold ? "" : "+"}
        {formatMoney(Math.abs(value))}
      </dd>
    </div>
  )
}
