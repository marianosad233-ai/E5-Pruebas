import { useMemo, useState } from "react"
import type { Dispatch, ReactNode, SetStateAction } from "react"
import { ArrowLeft, ArrowRight, Check, Monitor, RotateCcw, Smartphone } from "lucide-react"
import type { Pokemon } from "../interfaces/Pokemon"
import type { Region, ConfigLeader } from "../interfaces/Region"
import { PokeSprite } from "./PokeSprite"
import { PokemonDetails } from "./PokemonDetails"
import { TrickItem } from "./TrickItem"

type LoadedLeader = Omit<ConfigLeader, "pokemons"> & { pokemons: Pokemon[] }
type LoadedRegion = Omit<Region, "leaders"> & { leaders: LoadedLeader[] }

type RunState = {
  regionId: string
  leaderId: string
  pokemonId: string
  finished: boolean
}

type FarmMode = "single" | "dual"

interface E4LabProps {
  strategyName: string
  regions: Region[]
}

const createRunState = (regions: LoadedRegion[]): RunState => ({
  regionId: regions[0]?.id ?? "",
  leaderId: regions[0]?.leaders[0]?.id ?? "",
  pokemonId: "",
  finished: false,
})

export default function E4Lab({ strategyName, regions: rawRegions }: E4LabProps) {
  const regions = rawRegions as LoadedRegion[]
  const [farmMode, setFarmMode] = useState<FarmMode>("single")
  const [singleRun, setSingleRun] = useState<RunState>(() => createRunState(regions))
  const [deviceOne, setDeviceOne] = useState<RunState>(() => createRunState(regions))
  const [deviceTwo, setDeviceTwo] = useState<RunState>(() => createRunState(regions))

  const getRunData = (run: RunState) => {
    const region = regions.find((item) => item.id === run.regionId)
    const leader = region?.leaders.find((item) => item.id === run.leaderId)
    const pokemon = leader?.pokemons.find((item) => item.id === run.pokemonId) ?? null
    return { region, leader, pokemon }
  }

  const singleData = useMemo(() => getRunData(singleRun), [regions, singleRun])
  const deviceOneData = useMemo(() => getRunData(deviceOne), [regions, deviceOne])
  const deviceTwoData = useMemo(() => getRunData(deviceTwo), [regions, deviceTwo])

  const resetRun = (setter: Dispatch<SetStateAction<RunState>>) => {
    setter(createRunState(regions))
  }

  const chooseRegion = (
    regionId: string,
    setter: Dispatch<SetStateAction<RunState>>
  ) => {
    const region = regions.find((item) => item.id === regionId)
    setter({
      regionId,
      leaderId: region?.leaders[0]?.id ?? "",
      pokemonId: "",
      finished: false,
    })
  }

  const chooseLeader = (
    leaderId: string,
    setter: Dispatch<SetStateAction<RunState>>,
    currentRegionId: string
  ) => {
    setter((current) => ({
      ...current,
      regionId: currentRegionId,
      leaderId,
      pokemonId: "",
      finished: false,
    }))
  }

  const choosePokemon = (
    pokemonId: string,
    setter: Dispatch<SetStateAction<RunState>>
  ) => {
    setter((current) => ({ ...current, pokemonId }))
  }

  const goToNextTrainer = (
    run: RunState,
    setter: Dispatch<SetStateAction<RunState>>
  ) => {
    const currentRegionIndex = regions.findIndex((region) => region.id === run.regionId)
    const currentRegion = regions[currentRegionIndex]
    if (!currentRegion) return

    const currentLeaderIndex = currentRegion.leaders.findIndex((leader) => leader.id === run.leaderId)
    const nextLeader = currentRegion.leaders[currentLeaderIndex + 1]

    if (nextLeader) {
      setter({
        ...run,
        leaderId: nextLeader.id,
        pokemonId: "",
        finished: false,
      })
      return
    }

    const nextRegion = regions[currentRegionIndex + 1]
    if (nextRegion) {
      setter({
        regionId: nextRegion.id,
        leaderId: nextRegion.leaders[0]?.id ?? "",
        pokemonId: "",
        finished: false,
      })
      return
    }

    setter({ ...run, pokemonId: "", finished: true })
  }

  const renderModeSwitch = () => (
    <div className="mb-5 rounded-2xl border border-ink-700 bg-ink-900/60 p-2">
      <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-mist-500">
        Modo de farmeo
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setFarmMode("single")}
          className={`rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${farmMode === "single" ? "bg-violet-600 text-white shadow-lg shadow-violet-950/20" : "bg-ink-850 text-mist-400 hover:text-mist-100"}`}
        >
          1 dispositivo
        </button>
        <button
          type="button"
          onClick={() => setFarmMode("dual")}
          className={`rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${farmMode === "dual" ? "bg-violet-600 text-white shadow-lg shadow-violet-950/20" : "bg-ink-850 text-mist-400 hover:text-mist-100"}`}
        >
          2 dispositivos
        </button>
      </div>
    </div>
  )

  const renderSingleMode = () => {
    const { region, leader, pokemon } = singleData
    const currentRegionIndex = regions.findIndex((item) => item.id === singleRun.regionId)
    const currentLeaderIndex = region?.leaders.findIndex((item) => item.id === singleRun.leaderId) ?? -1
    const isLastLeader = !!region && currentLeaderIndex === region.leaders.length - 1
    const isLastRegion = currentRegionIndex === regions.length - 1

    return (
      <>
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-mist-500">1. Elige región</p>
              <p className="mt-1 text-xs text-mist-600">Estrategia: {strategyName}</p>
            </div>
            {region && <span className="rounded-full border border-violet-500/30 bg-violet-600/10 px-3 py-1 text-xs font-semibold text-violet-200">{region.name}</span>}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {regions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => chooseRegion(item.id, setSingleRun)}
                className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-all ${singleRun.regionId === item.id ? "border-violet-500 bg-violet-600/15 text-violet-200 shadow-lg shadow-violet-950/20" : "border-ink-700 bg-ink-900/50 text-mist-300 hover:border-violet-500/50 hover:text-mist-100"}`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {region && (
          <div className="mt-6 border-t border-ink-700 pt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-mist-500">2. Elige líder</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {region.leaders.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => chooseLeader(item.id, setSingleRun, region.id)}
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-all ${singleRun.leaderId === item.id ? "border-amber-400/60 bg-amber-400/10 text-amber-200" : "border-ink-700 bg-ink-900/50 text-mist-300 hover:border-amber-400/40 hover:text-mist-100"}`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {leader && (
          <div className="mt-6 border-t border-ink-700 pt-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-mist-500">3. ¿Qué Pokémon salió?</p>
              <span className="text-xs text-mist-600">{region?.name} / {leader.name}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-7">
              {leader.pokemons.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => choosePokemon(item.id ?? item.name, setSingleRun)}
                  className={`group flex min-h-[86px] flex-col items-center justify-center rounded-2xl border px-2 py-2 transition-all ${singleRun.pokemonId === item.id ? "border-violet-500 bg-violet-600/10 shadow-lg shadow-violet-950/20" : "border-ink-700 bg-ink-900/45 hover:border-violet-500/50 hover:bg-ink-900"}`}
                >
                  <PokeSprite name={item.name} className="h-11 w-11" />
                  <span className="mt-1 text-[11px] font-semibold text-mist-200 group-hover:text-white">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {pokemon && (
          <div className="mt-6 border-t border-ink-700 pt-6">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-mist-500">
              <span className="h-px flex-1 bg-ink-700" />
              Estrategia según la situación
              <span className="h-px flex-1 bg-ink-700" />
            </div>
            <PokemonDetails pokemon={pokemon} />
            <div className="mt-4 flex flex-wrap justify-between gap-2">
              <button type="button" onClick={() => choosePokemon("", setSingleRun)} className="inline-flex items-center gap-2 rounded-xl border border-ink-700 px-3 py-2 text-xs font-semibold text-mist-300 hover:border-violet-500/50 hover:text-mist-100">
                <ArrowLeft className="h-3.5 w-3.5" /> Cambiar Pokémon
              </button>
              <button
                type="button"
                onClick={() => goToNextTrainer(singleRun, setSingleRun)}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-500"
              >
                {isLastLeader ? (isLastRegion ? "Finalizar E4" : "Siguiente región") : "Siguiente entrenador"}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {singleRun.finished && (
          <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5 text-center">
            <p className="text-sm font-semibold text-emerald-200">E4 completado</p>
            <button type="button" onClick={() => resetRun(setSingleRun)} className="mt-3 inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-400/10">
              <RotateCcw className="h-3.5 w-3.5" /> Nueva run
            </button>
          </div>
        )}
      </>
    )
  }

  const renderCompactRun = (
    label: string,
    icon: ReactNode,
    run: RunState,
    setter: Dispatch<SetStateAction<RunState>>,
    data: { region?: LoadedRegion; leader?: LoadedLeader; pokemon: Pokemon | null }
  ) => {
    const { region, leader, pokemon } = data
    const regionIndex = regions.findIndex((item) => item.id === run.regionId)
    const leaderIndex = region?.leaders.findIndex((item) => item.id === run.leaderId) ?? -1
    const isLastLeader = !!region && leaderIndex === region.leaders.length - 1
    const isLastRegion = regionIndex === regions.length - 1

    return (
      <section className="overflow-hidden rounded-2xl border border-ink-700 bg-ink-950/80 shadow-xl shadow-black/10">
        <div className="border-b border-ink-700 bg-ink-900/70 px-3 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-600/10 text-violet-300">{icon}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-mist-200">{label}</p>
                <button type="button" onClick={() => resetRun(setter)} className="rounded-lg p-1.5 text-mist-500 hover:bg-ink-800 hover:text-mist-100" title="Reiniciar dispositivo">
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-0.5 truncate text-[10px] text-mist-500">{strategyName}</p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <select
              value={run.regionId}
              onChange={(event) => chooseRegion(event.target.value, setter)}
              className="min-w-0 rounded-lg border border-ink-700 bg-ink-900 px-2.5 py-2 text-xs font-semibold text-mist-200 outline-none focus:border-violet-500"
            >
              {regions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <select
              value={run.leaderId}
              onChange={(event) => chooseLeader(event.target.value, setter, run.regionId)}
              className="min-w-0 rounded-lg border border-ink-700 bg-ink-900 px-2.5 py-2 text-xs font-semibold text-mist-200 outline-none focus:border-amber-400"
            >
              {region?.leaders.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
        </div>

        <div className="p-3">
          {run.finished ? (
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-center">
              <Check className="mx-auto h-5 w-5 text-emerald-300" />
              <p className="mt-1 text-xs font-semibold text-emerald-200">E4 completado</p>
              <button type="button" onClick={() => resetRun(setter)} className="mt-2 rounded-lg border border-emerald-400/30 px-3 py-1.5 text-[11px] font-semibold text-emerald-200">Nueva run</button>
            </div>
          ) : (
            <>
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-mist-500">Pokémon rival</p>
                {region && leader && <span className="text-[10px] text-mist-600">{region.name} · {leader.name}</span>}
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {leader?.pokemons.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => choosePokemon(item.id ?? item.name, setter)}
                    className={`flex min-w-[66px] flex-shrink-0 flex-col items-center rounded-xl border px-1.5 py-1.5 transition-all ${run.pokemonId === item.id ? "border-violet-500 bg-violet-600/15" : "border-ink-700 bg-ink-900/60 hover:border-violet-500/50"}`}
                  >
                    <PokeSprite name={item.name} className="h-9 w-9" />
                    <span className="mt-0.5 max-w-[60px] truncate text-[9px] font-semibold text-mist-200">{item.name}</span>
                  </button>
                ))}
              </div>

              {pokemon ? (
                <div className="mt-3 rounded-xl border border-ink-700 bg-ink-900/60 p-3">
                  <div className="flex items-center gap-2 border-b border-ink-700 pb-2.5">
                    <PokeSprite name={pokemon.name} className="h-10 w-10" />
                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-violet-400">Estrategia</p>
                      <p className="truncate text-sm font-bold text-mist-100">{pokemon.name}</p>
                    </div>
                  </div>
                  <div className="mt-2 rounded-lg border border-amber-400/20 bg-amber-400/10 px-2.5 py-2">
                    <p className="text-[11px] leading-relaxed text-amber-300">{pokemon.initialMove}</p>
                  </div>
                  <div className="mt-2">
                    {pokemon.tricks?.length ? pokemon.tricks.map((trick, index) => (
                      <TrickItem key={index} trick={trick} isLast={index === pokemon.tricks.length - 1} />
                    )) : (
                      <p className="py-2 text-center text-[10px] text-mist-500">Sin variantes registradas.</p>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <button type="button" onClick={() => choosePokemon("", setter)} className="inline-flex items-center gap-1.5 rounded-lg border border-ink-700 px-2.5 py-1.5 text-[10px] font-semibold text-mist-400 hover:text-mist-100">
                      <ArrowLeft className="h-3 w-3" /> Cambiar
                    </button>
                    <button type="button" onClick={() => goToNextTrainer(run, setter)} className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-2.5 py-1.5 text-[10px] font-semibold text-white hover:bg-violet-500">
                      {isLastLeader ? (isLastRegion ? "Finalizar" : "Siguiente región") : "Siguiente entrenador"}
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-dashed border-ink-700 px-3 py-4 text-center">
                  <p className="text-[11px] font-semibold text-mist-400">Selecciona el Pokémon que salió</p>
                  <p className="mt-1 text-[10px] text-mist-600">La estrategia aparecerá aquí.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-3 pb-24 pt-5 sm:px-6 sm:pt-8">
      <section className="overflow-hidden rounded-3xl border border-violet-500/20 bg-ink-950/65 shadow-2xl shadow-black/10">
        <div className="border-b border-ink-700 bg-gradient-to-br from-violet-600/10 via-transparent to-cyan-500/5 p-4 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-400">E4 LAB · Prueba</p>
              <h1 className="mt-1.5 font-display text-xl font-semibold text-mist-100 sm:text-3xl">Asistente de estrategia</h1>
              <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-mist-400 sm:text-sm">
                Sigue una run o dos runs independientes al mismo tiempo.
              </p>
            </div>
            {farmMode === "single" && (
              <button type="button" onClick={() => resetRun(setSingleRun)} className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl border border-ink-700 bg-ink-900/70 px-2.5 py-2 text-[10px] font-semibold text-mist-300 hover:text-mist-100 sm:px-3 sm:text-xs">
                <RotateCcw className="h-3.5 w-3.5" /> Reiniciar
              </button>
            )}
          </div>
        </div>

        <div className="p-3 sm:p-7">
          {renderModeSwitch()}
          {farmMode === "single" ? renderSingleMode() : (
            <div className="space-y-3">
              {renderCompactRun("Dispositivo 1", <Monitor className="h-4 w-4" />, deviceOne, setDeviceOne, deviceOneData)}
              {renderCompactRun("Dispositivo 2", <Smartphone className="h-4 w-4" />, deviceTwo, setDeviceTwo, deviceTwoData)}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
