import { useMemo, useState } from "react"
import { Search, ChevronRight } from "lucide-react"
import { PokeSprite } from "./PokeSprite"
import pokemonData from "../data/eggMovesPokemon.json"
import moveNames from "../data/eggMovesNames.json"
import eggMoveChain from "../data/egg-move-chain.json"
import evolutions from "../data/evolutions.json"

interface PokemonEntry { id: number; name: string; evolutions: number[] }
interface EggPathItem { level: number; move_id: number; monster_id: number }
type EggPath = EggPathItem[]

const pokemon = pokemonData as PokemonEntry[]
const chains = eggMoveChain as EggPath[]
const moves = moveNames as Record<string, string>

const baseForm = (id: number) => {
  const group = (evolutions as number[][]).find((line) => line.includes(id))
  return group?.[0] ?? id
}

const getPokemonName = (id: number) => pokemon.find((item) => item.id === id)?.name ?? `#${id}`

const getMoveName = (id: number) => moves[String(id)] ?? `Move #${id}`

const prettyLevel = (level: number) => {
  if (level === 106) return "Evolve"
  if (level === 108) return "Breed"
  if (level === 101) return "Special"
  return `lv. ${level}`
}

export default function EggMovesCalculator() {
  const [selectedPokemon, setSelectedPokemon] = useState(0)
  const [activeMove, setActiveMove] = useState<number | null>(null)
  const [search, setSearch] = useState("")

  const pokemonOptions = useMemo(() => {
    const term = search.trim().toLowerCase()
    return pokemon
      .filter((item) => item.id < 650)
      .filter((item) => !term || item.name.toLowerCase().includes(term))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [search])

  const targetId = selectedPokemon ? baseForm(selectedPokemon) : 0

  const movePaths = useMemo(() => {
    if (!targetId) return new Map<number, EggPath[]>()
    const map = new Map<number, EggPath[]>()
    chains.forEach((path) => {
      if (path[0]?.monster_id !== targetId) return
      const moveId = path[0].move_id
      const current = map.get(moveId) ?? []
      current.push(path)
      map.set(moveId, current)
    })
    return map
  }, [targetId])

  const selectedName = selectedPokemon ? getPokemonName(selectedPokemon) : ""
  const paths = activeMove ? movePaths.get(activeMove) ?? [] : []

  const choosePokemon = (id: number) => {
    setSelectedPokemon(id)
    setActiveMove(null)
    setSearch("")
  }

  return (
    <section className="mx-auto w-full max-w-[1168px] px-4 pb-16 pt-4 sm:px-6 lg:px-8">
      <div className="border-b border-white/15 pb-3 text-sm text-mist-400">
        <span className="text-mist-300">Home</span><span className="mx-2">/</span><span className="text-mist-300">Tools</span><span className="mx-2">/</span><span className="text-mist-500">Egg Moves Calculator</span>
      </div>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-[38px]">Egg Moves Calculator</h1>
      <p className="mt-1 text-sm text-mist-400">Select the Pokemon and the Egg move you want to get.</p>

      <div className="mt-6 rounded-md border border-white/10 bg-[#20252b] p-5">
        <p className="mb-2 text-sm text-mist-300">Choose your Pokemon</p>
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Pokemon..." className="w-full rounded-md border border-white/15 bg-[#59616a] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-mist-400 focus:border-violet-400" />
        </div>
        <div className="mt-3 max-h-56 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-6">
            {pokemonOptions.map((item) => (
              <button key={item.id} type="button" onClick={() => choosePokemon(item.id)} className={`rounded-md px-2 py-2 text-left text-xs transition-colors ${selectedPokemon === item.id ? "bg-violet-600/25 text-violet-200" : "text-mist-300 hover:bg-white/5 hover:text-white"}`}>
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedPokemon > 0 && (
        <div className="mt-4 rounded-md border border-white/10 bg-[#20252b] p-5">
          <div className="flex items-center gap-4">
            <PokeSprite name={selectedName} className="h-20 w-20" />
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-mist-500">Selected Pokemon</p>
              <h2 className="mt-1 text-2xl font-bold text-white">{selectedName}</h2>
              {targetId !== selectedPokemon && <p className="mt-1 text-xs text-mist-500">Breeding data uses the base form: {getPokemonName(targetId)}</p>}
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm text-mist-300">Egg Moves</p>
            {movePaths.size === 0 ? (
              <p className="text-sm text-mist-500">None</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {[...movePaths.keys()].map((moveId) => (
                  <button key={moveId} type="button" onClick={() => setActiveMove(moveId)} className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${activeMove === moveId ? "bg-amber-400 text-slate-950" : "bg-[#68727d] text-white hover:bg-[#77838f]"}`}>
                    {getMoveName(moveId)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeMove && paths.length > 0 && (
        <div className="mt-4 rounded-md border border-white/10 bg-[#20252b] p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">{getMoveName(activeMove)}</h2>
            <span className="text-xs text-mist-500">{paths.length} path{paths.length === 1 ? "" : "s"}</span>
          </div>
          {paths.map((path, pathIndex) => (
            <div key={pathIndex} className="mb-5 overflow-x-auto last:mb-0">
              <div className="flex min-w-max items-center gap-2">
                {[...path].reverse().map((item, index, reversed) => (
                  <div key={`${item.monster_id}-${index}`} className="flex items-center gap-2">
                    <div className="flex min-w-[92px] flex-col items-center justify-center rounded-md border border-white/10 bg-[#171a1f] px-2 py-2">
                      <PokeSprite name={getPokemonName(item.monster_id)} className="h-16 w-16" />
                      <span className="text-center text-xs text-mist-200">{getPokemonName(item.monster_id)}</span>
                      <span className="mt-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-mist-400">{prettyLevel(item.level)}</span>
                    </div>
                    {index < reversed.length - 1 && <ChevronRight className="h-5 w-5 flex-shrink-0 text-amber-400" />}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
