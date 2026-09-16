import { useEffect, useMemo, useState } from "react"
import { ChevronRight, ExternalLink, Loader2, Search, Sparkles } from "lucide-react"
import { PokeSprite } from "./PokeSprite"

const EGG_MOVES_URL = "https://raw.githubusercontent.com/PokeMMOZone/PokeMMO-Data/master/data/egg-moves-data.json"

type EggMoveData = Record<string, Record<string, string[][]>>

const prettyName = (value: string) =>
  value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")

export default function EggMovesCalculator() {
  const [data, setData] = useState<EggMoveData | null>(null)
  const [pokemon, setPokemon] = useState("")
  const [move, setMove] = useState("")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    fetch(EGG_MOVES_URL)
      .then((response) => {
        if (!response.ok) throw new Error("No se pudo cargar la base de movimientos huevo.")
        return response.json()
      })
      .then((json: EggMoveData) => {
        if (cancelled) return
        setData(json)
        const firstPokemon = Object.keys(json).sort()[0] || ""
        setPokemon(firstPokemon)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const pokemonList = useMemo(() => {
    if (!data) return []
    return Object.keys(data).sort((a, b) => prettyName(a).localeCompare(prettyName(b)))
  }, [data])

  const filteredPokemon = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return pokemonList
    return pokemonList.filter((name) => prettyName(name).toLowerCase().includes(term))
  }, [pokemonList, search])

  const moves = useMemo(() => {
    if (!data || !pokemon) return []
    return Object.keys(data[pokemon] || {}).sort((a, b) => a.localeCompare(b))
  }, [data, pokemon])

  const chains = useMemo(() => {
    if (!data || !pokemon || !move) return []
    return data[pokemon]?.[move] || []
  }, [data, pokemon, move])

  const choosePokemon = (value: string) => {
    setPokemon(value)
    setMove("")
    setSearch("")
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <div className="rounded-3xl border border-ink-700 bg-ink-950/80 p-5 shadow-2xl shadow-black/20 sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">PokeMMO Hub style</p>
            <h1 className="mt-1 font-display text-2xl font-bold text-mist-100 sm:text-3xl">Egg Moves Calculator</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mist-400">
              Selecciona un Pokémon, el movimiento huevo y consulta las cadenas de crianza disponibles para obtenerlo.
            </p>
          </div>
          <a
            href="https://github.com/PokeMMOZone/PokeMMO-Data/blob/master/data/egg-moves-data.json"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 self-start rounded-xl border border-ink-700 px-3 py-2 text-xs font-semibold text-mist-300 hover:border-violet-500/50 hover:text-mist-100"
          >
            Datos <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {loading ? (
          <div className="mt-8 flex items-center justify-center gap-2 rounded-2xl border border-ink-800 bg-ink-900/60 p-10 text-sm text-mist-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando movimientos huevo…
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-200">{error}</div>
        ) : (
          <div className="mt-7 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-2xl border border-ink-800 bg-ink-900/60 p-4">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-mist-500">Pokémon</label>
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar Pokémon…"
                  className="w-full rounded-xl border border-ink-700 bg-ink-950 px-9 py-2.5 text-sm text-mist-100 outline-none placeholder:text-mist-600 focus:border-violet-500/60"
                />
              </div>
              <div className="mt-3 max-h-72 overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-2">
                  {filteredPokemon.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => choosePokemon(name)}
                      className={`rounded-xl px-2.5 py-2 text-left text-xs font-semibold transition-colors ${
                        pokemon === name
                          ? "bg-violet-600/20 text-violet-200 ring-1 ring-violet-500/40"
                          : "text-mist-400 hover:bg-ink-800 hover:text-mist-100"
                      }`}
                    >
                      {prettyName(name)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-ink-800 bg-ink-900/60 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-950 ring-1 ring-ink-700">
                  {pokemon && <PokeSprite name={pokemon} className="h-12 w-12" />}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-mist-500">Seleccionado</p>
                  <h2 className="mt-0.5 text-xl font-bold text-mist-100">{prettyName(pokemon)}</h2>
                </div>
              </div>

              <label className="mt-6 block text-xs font-semibold uppercase tracking-[0.14em] text-mist-500">Egg Move</label>
              <select
                value={move}
                onChange={(event) => setMove(event.target.value)}
                className="mt-2 w-full rounded-xl border border-ink-700 bg-ink-950 px-3 py-2.5 text-sm text-mist-100 outline-none focus:border-violet-500/60"
              >
                <option value="">Selecciona un movimiento…</option>
                {moves.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>

              <div className="mt-5 flex items-center gap-2 text-xs text-mist-500">
                <Sparkles className="h-4 w-4 text-violet-400" />
                {moves.length} movimiento{moves.length === 1 ? "" : "s"} huevo disponible{moves.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>
        )}

        {move && (
          <div className="mt-7 rounded-2xl border border-ink-800 bg-ink-900/60 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-mist-500">Cadenas de crianza</p>
                <h2 className="mt-1 text-lg font-bold text-mist-100">{move}</h2>
              </div>
              <span className="rounded-full bg-violet-600/15 px-3 py-1 text-xs font-semibold text-violet-300">
                {chains.length} ruta{chains.length === 1 ? "" : "s"}
              </span>
            </div>

            {chains.length === 0 ? (
              <p className="mt-5 rounded-xl border border-ink-700 bg-ink-950 p-4 text-sm text-mist-500">No hay una cadena registrada para esta combinación.</p>
            ) : (
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {chains.map((chain, index) => (
                  <div key={`${chain.join("-")}-${index}`} className="rounded-2xl border border-ink-700 bg-ink-950 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mist-600">Ruta {index + 1}</span>
                      <span className="text-[10px] text-mist-600">{chain.length - 1} cruce{chain.length - 1 === 1 ? "" : "s"}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {chain.map((step, stepIndex) => (
                        <div key={`${step}-${stepIndex}`} className="flex items-center gap-2">
                          <div className="flex items-center gap-2 rounded-xl border border-ink-700 bg-ink-900 px-2.5 py-2">
                            <PokeSprite name={step} className="h-9 w-9" />
                            <span className="text-xs font-semibold text-mist-200">{prettyName(step)}</span>
                          </div>
                          {stepIndex < chain.length - 1 && <ChevronRight className="h-4 w-4 text-violet-400" />}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
