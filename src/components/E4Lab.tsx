import { useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react"
import type { Region } from "../interfaces/Region"
import { PokeSprite } from "./PokeSprite"
import { PokemonDetails } from "./PokemonDetails"

interface E4LabProps {
  strategyName: string
  regions: Region[]
}

export default function E4Lab({ strategyName, regions }: E4LabProps) {
  const [selectedRegionId, setSelectedRegionId] = useState<string>(regions[0]?.id ?? "")
  const [selectedLeaderId, setSelectedLeaderId] = useState<string>(regions[0]?.leaders[0]?.id ?? "")
  const [selectedPokemonId, setSelectedPokemonId] = useState<string>("")

  const selectedRegion = useMemo(
    () => regions.find((region) => region.id === selectedRegionId),
    [regions, selectedRegionId]
  )

  const selectedLeader = useMemo(
    () => selectedRegion?.leaders.find((leader) => leader.id === selectedLeaderId),
    [selectedRegion, selectedLeaderId]
  )

  const selectedPokemon = useMemo(
    () => selectedLeader?.pokemons?.find((pokemon) => pokemon.id === selectedPokemonId) ?? null,
    [selectedLeader, selectedPokemonId]
  )

  const leaderPokemons = selectedLeader?.pokemons ?? []

  const chooseRegion = (regionId: string) => {
    const region = regions.find((item) => item.id === regionId)
    setSelectedRegionId(regionId)
    setSelectedLeaderId(region?.leaders[0]?.id ?? "")
    setSelectedPokemonId("")
  }

  const chooseLeader = (leaderId: string) => {
    setSelectedLeaderId(leaderId)
    setSelectedPokemonId("")
  }

  const reset = () => {
    setSelectedRegionId(regions[0]?.id ?? "")
    setSelectedLeaderId(regions[0]?.leaders[0]?.id ?? "")
    setSelectedPokemonId("")
  }

  const step = selectedPokemon ? 3 : selectedLeader ? 2 : selectedRegion ? 1 : 0

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6">
      <section className="overflow-hidden rounded-3xl border border-violet-500/20 bg-ink-950/65 shadow-2xl shadow-black/10">
        <div className="border-b border-ink-700 bg-gradient-to-br from-violet-600/10 via-transparent to-cyan-500/5 p-5 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">E4 LAB · Prueba</p>
              <h1 className="mt-2 font-display text-2xl font-semibold text-mist-100 sm:text-3xl">Asistente de estrategia</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mist-400">
                Región → líder → Pokémon rival → estrategia. Esta sección usa los datos reales del E4 sin modificar la vista principal.
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink-700 bg-ink-900/70 px-3 py-2 text-xs font-semibold text-mist-300 transition-colors hover:border-violet-500/50 hover:text-mist-100"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reiniciar
            </button>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 sm:max-w-xl">
            {[
              [1, "Región"],
              [2, "Líder"],
              [3, "Pokémon"],
            ].map(([number, label]) => (
              <div
                key={number}
                className={`rounded-xl border px-3 py-2 ${step >= Number(number) ? "border-violet-500/40 bg-violet-600/10" : "border-ink-700 bg-ink-900/40"}`}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-mist-500">Paso {number}</p>
                <p className={`mt-0.5 text-xs font-semibold ${step >= Number(number) ? "text-violet-200" : "text-mist-500"}`}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-7">

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-mist-500">1. Elige región</p>
                    <p className="mt-1 text-xs text-mist-600">Estrategia: {strategyName}</p>
                  </div>
                  {selectedRegion && <span className="rounded-full border border-violet-500/30 bg-violet-600/10 px-3 py-1 text-xs font-semibold text-violet-200">{selectedRegion.name}</span>}
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {regions.map((region) => (
                    <button
                      key={region.id}
                      type="button"
                      onClick={() => chooseRegion(region.id)}
                      className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-all ${selectedRegionId === region.id ? "border-violet-500 bg-violet-600/15 text-violet-200 shadow-lg shadow-violet-950/20" : "border-ink-700 bg-ink-900/50 text-mist-300 hover:border-violet-500/50 hover:text-mist-100"}`}
                    >
                      {region.name}
                    </button>
                  ))}
                </div>
              </div>

              {selectedRegion && (
                <div className="mt-6 border-t border-ink-700 pt-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-mist-500">2. Elige líder</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {selectedRegion.leaders.map((leader) => (
                      <button
                        key={leader.id}
                        type="button"
                        onClick={() => chooseLeader(leader.id)}
                        className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-all ${selectedLeaderId === leader.id ? "border-amber-400/60 bg-amber-400/10 text-amber-200" : "border-ink-700 bg-ink-900/50 text-mist-300 hover:border-amber-400/40 hover:text-mist-100"}`}
                      >
                        {leader.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedLeader && (
                <div className="mt-6 border-t border-ink-700 pt-6">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-mist-500">3. ¿Qué Pokémon salió?</p>
                    <span className="text-xs text-mist-600">{selectedRegion?.name} / {selectedLeader.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-7">
                    {leaderPokemons.map((pokemon) => (
                      <button
                        key={pokemon.id}
                        type="button"
                        onClick={() => setSelectedPokemonId(pokemon.id ?? pokemon.name)}
                        className={`group flex min-h-[86px] flex-col items-center justify-center rounded-2xl border px-2 py-2 transition-all ${selectedPokemonId === pokemon.id ? "border-violet-500 bg-violet-600/10 shadow-lg shadow-violet-950/20" : "border-ink-700 bg-ink-900/45 hover:border-violet-500/50 hover:bg-ink-900"}`}
                      >
                        <PokeSprite name={pokemon.name} className="h-11 w-11" />
                        <span className="mt-1 text-[11px] font-semibold text-mist-200 group-hover:text-white">{pokemon.name}</span>
                      </button>
                    ))}
                  </div>
                  {leaderPokemons.length === 0 && <p className="rounded-xl border border-dashed border-ink-700 p-5 text-center text-sm text-mist-500">No hay datos de Pokémon para este líder.</p>}
                </div>
              )}

              {selectedPokemon && (
                <div className="mt-6 border-t border-ink-700 pt-6">
                  <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-mist-500">
                    <span className="h-px flex-1 bg-ink-700" />
                    Estrategia según la situación
                    <span className="h-px flex-1 bg-ink-700" />
                  </div>
                  <PokemonDetails pokemon={selectedPokemon} />
                  <div className="mt-4 flex flex-wrap justify-between gap-2">
                    <button type="button" onClick={() => setSelectedPokemonId("")} className="inline-flex items-center gap-2 rounded-xl border border-ink-700 px-3 py-2 text-xs font-semibold text-mist-300 hover:border-violet-500/50 hover:text-mist-100">
                      <ArrowLeft className="h-3.5 w-3.5" /> Cambiar Pokémon
                    </button>
                    <button type="button" onClick={() => setSelectedPokemonId("")} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-500">
                      Elegir otra situación <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

        </div>
      </section>
    </main>
  )
}
