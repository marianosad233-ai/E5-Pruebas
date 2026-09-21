import { useMemo, useState } from "react"
import { ArrowLeft, RotateCcw, FlaskConical } from "lucide-react"
import type { Pokemon, Tricks } from "../interfaces/Pokemon"
import { PokeSprite } from "./PokeSprite"
import garchomp from "../data/hoenn/sixto/garchomp.json"

type LabPokemon = Pokemon

const REGION = { id: "hoenn", name: "Hoenn" }
const LEADER = { id: "sixto", name: "Sixto" }
const POKEMON = garchomp as LabPokemon

function VariantButtons({
  tricks,
  onSelect,
}: {
  tricks: Tricks[]
  onSelect: (trick: Tricks) => void
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {tricks.map((trick, index) => (
        <button
          key={`${trick.detail}-${index}`}
          type="button"
          onClick={() => onSelect(trick)}
          className="rounded-xl border border-ink-700 bg-ink-900/70 px-4 py-3 text-left text-sm font-semibold text-mist-200 transition-colors hover:border-violet-500 hover:bg-violet-600/10 hover:text-violet-200"
        >
          {trick.detail}
        </button>
      ))}
    </div>
  )
}

export default function E4Lab() {
  const [selectedPokemon, setSelectedPokemon] = useState<LabPokemon | null>(null)
  const [selectedTrick, setSelectedTrick] = useState<Tricks | null>(null)

  const reset = () => {
    setSelectedPokemon(null)
    setSelectedTrick(null)
  }

  const visibleTricks = useMemo(() => {
    if (!selectedTrick) return selectedPokemon?.tricks ?? []
    return selectedTrick.variant
  }, [selectedPokemon, selectedTrick])

  const currentTitle = selectedTrick ? "¿Qué ocurrió después?" : "¿Qué Pokémon salió?"

  return (
    <section className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6">
      <div className="mb-6 rounded-3xl border border-violet-500/20 bg-ink-900/70 p-5 shadow-xl shadow-black/10 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-violet-600/15 text-violet-300">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300">E4 LAB · Prueba</p>
            <h1 className="mt-1 font-display text-2xl font-bold text-mist-100">Asistente de estrategia</h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-mist-400">Probamos el nuevo flujo sin modificar el E4 original: Región → Líder → Pokémon rival → situación → estrategia.</p>
          </div>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-ink-700 bg-ink-900/60 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mist-500">Región</p>
          <p className="mt-1 text-lg font-bold text-mist-100">{REGION.name}</p>
        </div>
        <div className="rounded-2xl border border-ink-700 bg-ink-900/60 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mist-500">Líder</p>
          <p className="mt-1 text-lg font-bold text-mist-100">{LEADER.name}</p>
        </div>
      </div>

      {!selectedPokemon ? (
        <div className="rounded-3xl border border-ink-700 bg-ink-900/60 p-5 sm:p-6">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">Paso 3</p>
            <h2 className="mt-1 text-xl font-bold text-mist-100">¿Qué Pokémon salió?</h2>
            <p className="mt-1 text-sm text-mist-500">Para esta primera prueba usamos Garchomp y sus datos reales.</p>
          </div>

          <button
            type="button"
            onClick={() => setSelectedPokemon(POKEMON)}
            className="flex w-full items-center gap-4 rounded-2xl border border-ink-700 bg-ink-950/60 p-4 text-left transition-colors hover:border-violet-500 hover:bg-violet-600/5"
          >
            <PokeSprite name={POKEMON.name} className="h-16 w-16" />
            <span>
              <span className="block text-lg font-bold text-mist-100">{POKEMON.name}</span>
              <span className="mt-1 block text-sm text-mist-500">Hoenn · Sixto</span>
            </span>
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-3xl border border-ink-700 bg-ink-900/60 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <PokeSprite name={selectedPokemon.name} className="h-14 w-14" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mist-500">Hoenn · {LEADER.name}</p>
                  <h2 className="text-xl font-bold text-mist-100">{selectedPokemon.name}</h2>
                </div>
              </div>
              <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-ink-700 px-3 py-2 text-xs font-semibold text-mist-300 hover:border-violet-500 hover:text-mist-100">
                <RotateCcw className="h-3.5 w-3.5" /> Reiniciar
              </button>
            </div>

            {!selectedTrick && (
              <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300">Inicio de la estrategia</p>
                <p className="mt-2 text-base font-bold text-amber-100">{selectedPokemon.initialMove}</p>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-ink-700 bg-ink-900/60 p-5 sm:p-6">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">Situación</p>
              <h2 className="mt-1 text-xl font-bold text-mist-100">{currentTitle}</h2>
            </div>

            <VariantButtons tricks={visibleTricks} onSelect={setSelectedTrick} />

            {selectedTrick && selectedTrick.variant.length === 0 && (
              <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">Estrategia a seguir</p>
                <p className="mt-2 text-base font-semibold leading-relaxed text-emerald-100">{selectedTrick.detail}</p>
              </div>
            )}

            {selectedTrick && selectedTrick.variant.length > 0 && (
              <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Nueva decisión</p>
                <p className="mt-2 text-sm text-cyan-100">Selecciona la opción que corresponda a lo que ocurrió en combate.</p>
              </div>
            )}

            {selectedTrick && (
              <button type="button" onClick={() => setSelectedTrick(null)} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-ink-700 px-3 py-2 text-sm font-semibold text-mist-300 hover:border-violet-500 hover:text-mist-100">
                <ArrowLeft className="h-4 w-4" /> Volver a la situación anterior
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
