import { useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, BookOpen, ExternalLink, RotateCcw, SkipForward } from "lucide-react"
import { PokeSprite } from "./PokeSprite"

interface PaletteEntry {
  name: string
  color?: string
  moves?: string[]
}

interface LegendEntry {
  term: string
  meaning: string
}

interface EntryPoint {
  label: string
  nodeId: string
  portrait?: string
}

interface Group {
  name: string
  entries: EntryPoint[]
}

interface ConditionalRow {
  move: string
  targets: string[]
}

interface Step {
  id: string
  kind: "action" | "note" | "conditional" | "setup"
  text?: string
  table?: {
    title?: string
    rows: ConditionalRow[]
  }
}

interface Branch {
  kind: "goto" | "choice"
  nodeId?: string
  prompt?: string
  options?: EntryPoint[]
}

interface GymLead {
  pokemon: string
  item: string
}

interface StrategyNode {
  id: string
  title: string
  leadHint?: string
  steps: Step[]
  gymLead?: GymLead[]
  branch?: Branch | null
  skipTo?: string
}

export interface StrategyData {
  id: string
  title: string
  lead: string
  pokepaste: string
  doc: string
  homePrompt?: string
  legend?: LegendEntry[]
  palette?: PaletteEntry[]
  allowSkip?: boolean
  revealAll?: boolean
  groupPrompt?: string
  groups?: Group[]
  entryPoints?: EntryPoint[]
  nodes: Record<string, StrategyNode>
}

interface StrategyGuideProps {
  strategy: StrategyData
  category: "Gym Rerun" | "Red Battle"
}

const tokenizeColoredText = (text: string) => {
  const result: Array<{ text: string; pokemon?: string }> = []
  const regex = /\{([^|{}]+)\|([^{}]+)\}/g
  let last = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) result.push({ text: text.slice(last, match.index) })
    result.push({ text: match[1], pokemon: match[2] })
    last = regex.lastIndex
  }

  if (last < text.length) result.push({ text: text.slice(last) })
  return result.length ? result : [{ text }]
}

export default function StrategyGuide({ strategy, category }: StrategyGuideProps) {
  const firstEntry = strategy.groups?.[0]?.entries[0] ?? strategy.entryPoints?.[0]
  const [selectedGroup, setSelectedGroup] = useState(strategy.groups?.[0]?.name ?? "")
  const [currentNodeId, setCurrentNodeId] = useState(firstEntry?.nodeId ?? "")
  const [history, setHistory] = useState<string[]>([])
  const [legendOpen, setLegendOpen] = useState(false)

  const currentNode = strategy.nodes[currentNodeId]
  const paletteMap = useMemo(
    () => new Map((strategy.palette ?? []).map((entry) => [entry.name, entry])),
    [strategy.palette]
  )

  const groups = strategy.groups ?? []
  const currentGroup = groups.find((group) => group.name === selectedGroup)
  const rawEntries = currentGroup?.entries ?? strategy.entryPoints ?? []
  const seenLabels = new Set<string>()
  const entries = rawEntries.filter((entry) => {
    const key = `${entry.label}-${entry.nodeId}`
    if (seenLabels.has(key)) return false
    seenLabels.add(key)
    return true
  })

  const navigateTo = (nodeId: string) => {
    if (!strategy.nodes[nodeId]) return
    if (currentNodeId) setHistory((previous) => [...previous, currentNodeId])
    setCurrentNodeId(nodeId)
  }

  const reset = () => {
    const first = strategy.groups?.[0]?.entries[0] ?? strategy.entryPoints?.[0]
    setSelectedGroup(strategy.groups?.[0]?.name ?? "")
    setCurrentNodeId(first?.nodeId ?? "")
    setHistory([])
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0)
  }

  const back = () => {
    const previous = history[history.length - 1]
    if (!previous) return
    setHistory((items) => items.slice(0, -1))
    setCurrentNodeId(previous)
  }

  const chooseGroup = (name: string) => {
    setSelectedGroup(name)
    const group = groups.find((item) => item.name === name)
    const first = group?.entries[0]
    if (first) {
      setCurrentNodeId(first.nodeId)
      setHistory([])
    }
  }

  const renderText = (text: string) => (
    <>
      {tokenizeColoredText(text).map((part, index) => {
        const palette = part.pokemon ? paletteMap.get(part.pokemon) : undefined
        return (
          <span
            key={`${part.text}-${index}`}
            style={palette?.color ? { color: palette.color } : undefined}
            className={palette ? "font-semibold" : undefined}
          >
            {part.text}
          </span>
        )
      })}
    </>
  )

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <div className="rounded-3xl border border-ink-700 bg-ink-950/70 p-5 shadow-2xl shadow-black/10 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">{category}</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-mist-100 sm:text-4xl">{strategy.title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-mist-400">{strategy.lead}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={strategy.pokepaste} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500">
              Equipo / Poképaste <ExternalLink className="h-4 w-4" />
            </a>
            <a href={strategy.doc} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-ink-700 px-4 py-2 text-sm font-semibold text-mist-200 hover:border-violet-500 hover:text-violet-200">
              Documento <BookOpen className="h-4 w-4" />
            </a>
          </div>
        </div>

        {strategy.palette && strategy.palette.length > 0 && (
          <div className="mt-6 rounded-2xl border border-ink-700 bg-ink-900/60 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-mist-500">Equipo de la estrategia</p>
            <div className="flex flex-wrap gap-2">
              {strategy.palette.map((entry) => (
                <span key={entry.name} className="flex items-center gap-2 rounded-full border border-ink-700 bg-ink-850 py-1 pl-1.5 pr-3 text-xs font-semibold" style={{ color: entry.color }}>
                  <PokeSprite name={entry.name} className="h-7 w-7" />
                  {entry.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            {groups.length > 0 ? (
              <div className="mb-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-mist-500">{strategy.groupPrompt ?? "Elige una región"}</p>
                <div className="flex flex-wrap gap-2">
                  {groups.map((group) => (
                    <button key={group.name} onClick={() => chooseGroup(group.name)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${selectedGroup === group.name ? "border-violet-500 bg-violet-600/15 text-violet-200" : "border-ink-700 bg-ink-900/60 text-mist-300 hover:border-ink-500 hover:text-mist-100"}`}>
                      {group.name}
                    </button>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {entries.map((entry) => (
                    <button key={`${entry.nodeId}-${entry.label}`} onClick={() => { setHistory([]); setCurrentNodeId(entry.nodeId) }} className={`rounded-2xl border p-3 text-left transition-all ${currentNodeId === entry.nodeId ? "border-violet-500 bg-violet-600/10" : "border-ink-700 bg-ink-900/50 hover:border-violet-500/50 hover:bg-ink-900"}`}>
                      <span className="block text-sm font-semibold text-mist-100">{entry.label}</span>
                      {entry.portrait && <span className="mt-1 block text-[11px] text-mist-500">Entrenador: {entry.portrait}</span>}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-mist-500">{strategy.homePrompt ?? "Elige el Pokémon rival"}</p>
                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {entries.map((entry) => (
                    <button key={`${entry.nodeId}-${entry.label}`} onClick={() => { setHistory([]); setCurrentNodeId(entry.nodeId) }} className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-all ${currentNodeId === entry.nodeId ? "border-violet-500 bg-violet-600/10" : "border-ink-700 bg-ink-900/50 hover:border-violet-500/50"}`}>
                      <PokeSprite name={entry.label} className="h-9 w-9" />
                      <span className="text-sm font-semibold text-mist-100">{entry.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentNode ? (
              <div className="rounded-3xl border border-ink-700 bg-ink-900/70 p-5 sm:p-6">
                <div className="flex flex-col gap-3 border-b border-ink-700 pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-violet-400">Paso actual</p>
                    <h2 className="mt-1 font-display text-2xl font-semibold text-mist-100">{currentNode.title}</h2>
                    {currentNode.leadHint && <p className="mt-1 text-sm text-mist-400">Lead: {currentNode.leadHint}</p>}
                  </div>
                  {currentNode.gymLead && (
                    <div className="rounded-2xl border border-ink-700 bg-ink-950/70 p-3 text-sm">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-mist-500">Gym lead</p>
                      {currentNode.gymLead.map((lead) => (
                        <div key={`${lead.pokemon}-${lead.item}`} className="flex items-center justify-between gap-5 text-mist-200">
                          <span className="flex items-center gap-2">
                            <PokeSprite name={lead.pokemon} className="h-8 w-8" />
                            <span className="font-semibold" style={{ color: paletteMap.get(lead.pokemon)?.color }}>{lead.pokemon}</span>
                          </span>
                          <span className="text-xs text-mist-400">{lead.item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 space-y-3">
                  {currentNode.steps.map((step, index) => (
                    <div key={step.id} className={`rounded-2xl border p-4 ${step.kind === "note" ? "border-amber-400/20 bg-amber-400/5" : step.kind === "setup" ? "border-cyan-400/20 bg-cyan-400/5" : "border-ink-700 bg-ink-950/50"}`}>
                      <div className="flex gap-3">
                        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-ink-800 text-xs font-bold text-mist-300">{index + 1}</span>
                        <div className="min-w-0 flex-1">
                          {step.kind === "conditional" && step.table ? (
                            <>
                              <p className="mb-3 text-sm font-semibold text-mist-100">{step.table.title ?? "Condicional"}</p>
                              <div className="overflow-hidden rounded-xl border border-ink-700">
                                {step.table.rows.map((row) => (
                                  <div key={row.move} className="grid gap-2 border-b border-ink-700 p-3 last:border-b-0 sm:grid-cols-[160px_1fr]">
                                    <span className="font-semibold text-violet-300">{row.move}</span>
                                    <span className="text-sm text-mist-300">{row.targets.join(", ")}</span>
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <p className={`text-sm leading-relaxed ${step.kind === "note" ? "text-amber-200" : step.kind === "setup" ? "text-cyan-200" : "text-mist-200"}`}>{renderText(step.text ?? "")}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {currentNode.branch?.kind === "choice" && currentNode.branch.options && (
                  <div className="mt-6 rounded-2xl border border-violet-500/30 bg-violet-600/5 p-4">
                    <p className="mb-3 text-sm font-semibold text-violet-200">{currentNode.branch.prompt ?? "Elige una opción"}</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {currentNode.branch.options.map((option) => (
                        <button key={option.nodeId} onClick={() => navigateTo(option.nodeId)} className="group flex items-center justify-between rounded-xl border border-ink-700 bg-ink-900/70 px-4 py-3 text-left transition-colors hover:border-violet-500 hover:bg-violet-600/10">
                          <span className="text-sm font-semibold text-mist-200 group-hover:text-violet-200">{option.label}</span>
                          <ArrowRight className="h-4 w-4 text-mist-500 group-hover:text-violet-300" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentNode.branch?.kind === "goto" && currentNode.branch.nodeId && (
                  <button onClick={() => navigateTo(currentNode.branch?.nodeId ?? "")} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-500">
                    Siguiente paso <ArrowRight className="h-4 w-4" />
                  </button>
                )}

                <div className="mt-6 flex flex-wrap gap-2 border-t border-ink-700 pt-5">
                  <button onClick={back} disabled={history.length === 0} className="inline-flex items-center gap-2 rounded-xl border border-ink-700 px-3 py-2 text-sm font-semibold text-mist-300 disabled:cursor-not-allowed disabled:opacity-40 hover:border-violet-500 hover:text-mist-100">
                    <ArrowLeft className="h-4 w-4" /> Atrás
                  </button>
                  <button onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-ink-700 px-3 py-2 text-sm font-semibold text-mist-300 hover:border-violet-500 hover:text-mist-100">
                    <RotateCcw className="h-4 w-4" /> Reiniciar
                  </button>
                  {strategy.allowSkip && currentNode.skipTo && (
                    <button onClick={() => navigateTo(currentNode.skipTo ?? "")} className="inline-flex items-center gap-2 rounded-xl border border-amber-400/30 px-3 py-2 text-sm font-semibold text-amber-200 hover:bg-amber-400/10">
                      <SkipForward className="h-4 w-4" /> Skip this stop
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-ink-700 bg-ink-900/60 p-8 text-center text-sm text-mist-400">Selecciona una entrada para comenzar.</div>
            )}
          </div>

          <aside className="h-fit space-y-4 lg:sticky lg:top-24">
            {strategy.legend && strategy.legend.length > 0 && (
              <div className="rounded-2xl border border-ink-700 bg-ink-900/70 p-4">
                <button onClick={() => setLegendOpen(!legendOpen)} className="flex w-full items-center justify-between text-left">
                  <span className="text-sm font-semibold text-mist-100">Leyenda</span>
                  <span className="text-xs text-violet-300">{legendOpen ? "Ocultar" : "Mostrar"}</span>
                </button>
                {legendOpen && (
                  <div className="mt-4 space-y-3">
                    {strategy.legend.map((item) => (
                      <div key={item.term}>
                        <p className="text-xs font-semibold text-violet-300">{item.term}</p>
                        <p className="mt-1 text-xs leading-relaxed text-mist-400">{item.meaning}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="rounded-2xl border border-ink-700 bg-ink-900/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-mist-500">Navegación</p>
              <p className="mt-2 text-sm leading-relaxed text-mist-400">Las decisiones de la estrategia están conectadas. Cuando el juego te muestre una situación, selecciona exactamente la opción correspondiente.</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
