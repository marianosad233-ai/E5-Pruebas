import { useState, useEffect, useRef, useMemo } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

// Import interfaces
import type { Pokemon, Tricks } from "../interfaces/Pokemon"
import type { Region } from "../interfaces/Region"

// Import hooks
import { useDynamicImports } from "../hooks/useDynamicImports"

// Import components
import { SiteHeader } from "./SiteHeader"
import { HeroSection } from "./HeroSection"
import { RegionCard } from "./RegionCard"
import { LeaderCard } from "./LeaderCard"
import { PokemonCard } from "./PokemonCard"
import { PokemonDetails } from "./PokemonDetails"
import { SiteFooter } from "./SiteFooter"
import StrategyGuide from "./StrategyGuide"
import sixPillars from "../data/strategies/gym-rerun/6pillars_basic.json"
import sevenHells from "../data/strategies/gym-rerun/lucky_girl.json"
import jinxedBoon from "../data/strategies/red-battle/red.json"
import colored from "../data/strategies/red-battle/red_colored.json"
import type { StrategyData } from "./StrategyGuide"
import {
  type StrategyId,
  type GymRerunStrategyId,
  type RedBattleStrategyId,
} from "../config/strategies"

function countBranches(tricks: Tricks[] = []): number {
  return tricks.reduce((total, t) => total + 1 + countBranches(t.variant), 0)
}

export default function PokemonGuide() {
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null)
  const [expandedLeader, setExpandedLeader] = useState<string | null>(null)
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null)
  const [showTips, setShowTips] = useState(false)
  const [regions, setRegions] = useState<Region[]>([])
  const [regionsLoaded, setRegionsLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeStrategy, setActiveStrategy] = useState<StrategyId>("dingxianyou")
  const [activeGymRerunStrategy, setActiveGymRerunStrategy] = useState<GymRerunStrategyId>("six-pillars")
  const [activeRedBattleStrategy, setActiveRedBattleStrategy] = useState<RedBattleStrategyId>("jinxedboon")
  const [activeSection, setActiveSection] = useState<"e4" | "gym" | "red">("e4")

  const detailsRef = useRef<HTMLDivElement>(null)

  const { getPokemonFiles } = useDynamicImports()

  // Load region config
  useEffect(() => {
    const loadRegionConfig = async () => {
      try {
        const regionConfigModule = await import("../data/config-region.json")
        setRegions(regionConfigModule.regions || [])
      } catch (error) {
        console.error("Error loading region config:", error)
      }
    }

    loadRegionConfig()
  }, [])

  // Load pokemon data
  useEffect(() => {
    const loadPokemonData = async () => {
      if (regions.length === 0 || regionsLoaded) return

      const updatedRegions: Region[] = []

      for (const region of regions) {
        const updatedLeaders = []

        for (const leader of region.leaders) {
          try {
            const pokemonFiles = await getPokemonFiles(region.id, leader.id)

            const pokemons = await Promise.all(
              pokemonFiles.map(async (file) => {
                try {
                  const module = await import(
                    `../data/${region.id}/${leader.id}/${file.replace(".json", "")}.json`
                  )

                  const data = module.default || module

                  return {
                    ...data,
                    id:
                      data.id ||
                      data.name?.toLowerCase() ||
                      file.replace(".json", ""),
                  }
                } catch (error) {
                  console.error(`Error importing ${file}:`, error)
                  return null
                }
              })
            )

            updatedLeaders.push({
              ...leader,
              pokemons: pokemons.filter(Boolean),
            })
          } catch (error) {
            console.error(
              `Error loading pokemon data for ${leader.name}:`,
              error
            )

            updatedLeaders.push({
              ...leader,
              pokemons: [],
            })
          }
        }

        updatedRegions.push({
          ...region,
          leaders: updatedLeaders,
        })
      }

      setRegions(updatedRegions)
      setRegionsLoaded(true)
      setLoading(false)
    }

    loadPokemonData()
  }, [regions, regionsLoaded, getPokemonFiles])

  const handleRegionClick = (regionId: string) => {
    if (expandedRegion === regionId) {
      setExpandedRegion(null)
      setExpandedLeader(null)
      setSelectedPokemon(null)
    } else {
      setExpandedRegion(regionId)
      setExpandedLeader(null)
      setSelectedPokemon(null)
    }
  }

  const handleLeaderClick = (leaderId: string) => {
    if (expandedLeader === leaderId) {
      setExpandedLeader(null)
      setSelectedPokemon(null)
    } else {
      setExpandedLeader(leaderId)
      setSelectedPokemon(null)
    }
  }

  const handlePokemonClick = (pokemon: Pokemon) => {
    const isSame = selectedPokemon?.name === pokemon.name
    setSelectedPokemon(isSame ? null : pokemon)

    if (!isSame) {
      setTimeout(() => {
        detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 100)
    }
  }

  const currentRegion = regions.find((r) => r.id === expandedRegion)
  const currentLeader = currentRegion?.leaders.find((l) => l.id === expandedLeader)
  const currentLeaderPokemons = currentLeader?.pokemons || []

  const stats = useMemo(() => {
    let leaders = 0
    let pokemons = 0
    let branches = 0

    for (const region of regions) {
      leaders += region.leaders.length
      for (const leader of region.leaders) {
        const list = leader.pokemons || []
        pokemons += list.length
        for (const p of list) branches += countBranches(p.tricks)
      }
    }

    return { regions: regions.length, leaders, pokemons, branches }
  }, [regions])

  const selectedGymStrategy = (activeGymRerunStrategy === "six-pillars" ? sixPillars : sevenHells) as unknown as StrategyData
  const selectedRedStrategy = (activeRedBattleStrategy === "jinxedboon" ? jinxedBoon : colored) as unknown as StrategyData
  const isE4 = activeStrategy === "dingxianyou" || activeStrategy === "dingxianyou-2"

  return (
    <div className="min-h-screen bg-transparent text-mist-100">
      <SiteHeader
        activeStrategy={activeStrategy}
        onStrategyChange={(strategy) => {
          setActiveSection("e4")
          setActiveStrategy(strategy)
          setExpandedRegion(null)
          setExpandedLeader(null)
          setSelectedPokemon(null)
        }}
        activeGymRerunStrategy={activeGymRerunStrategy}
        onGymRerunStrategyChange={(strategy) => { setActiveSection("gym"); setActiveGymRerunStrategy(strategy) }}
        activeRedBattleStrategy={activeRedBattleStrategy}
        onRedBattleStrategyChange={(strategy) => { setActiveSection("red"); setActiveRedBattleStrategy(strategy) }}
      />

      {activeSection === "e4" && isE4 ? (
        <>
          <HeroSection stats={stats} activeStrategy={activeStrategy} />
          <main id="guia" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        {/* Tips */}
        <div className="mb-8 rounded-2xl border border-ink-700 bg-ink-900/60 p-4">
          <button
            onClick={() => setShowTips(!showTips)}
            className="flex w-full items-center gap-2 text-left"
          >
            {showTips ? (
              <ChevronUp className="h-4 w-4 flex-shrink-0 text-violet-400" />
            ) : (
              <ChevronDown className="h-4 w-4 flex-shrink-0 text-violet-400" />
            )}
            <span className="text-sm font-semibold text-mist-100">
              Recomendaciones antes de empezar
            </span>
          </button>

          {showTips && (
            <ul className="ml-6 mt-3 list-disc space-y-1.5 text-sm leading-relaxed text-mist-400">
              <li>
                Equipo necesario:{" "}
                <a
                  href="https://pokepast.es/e356ee22f26cf6dc"
                  target="_blank"
                  rel="noreferrer"
                  className="text-violet-300 hover:text-violet-200"
                >
                  ver en Pokepaste
                </a>
              </li>
              <li>
                Farmeo en directo:{" "}
                <a
                  href="https://www.twitch.tv/parzivalmmo"
                  target="_blank"
                  rel="noreferrer"
                  className="text-violet-300 hover:text-violet-200"
                >
                  twitch.tv/parzivalmmo
                </a>
              </li>
              <li>Completa cada liga 5 veces antes de intentar la ruta completa.</li>
              <li>"Otra Vez" sirve para bostezar dos veces cuando se acaba; úsalo de nuevo si hace falta.</li>
              <li>Desactiva Exp. Compartida / Reamplificador antes de empezar.</li>
              <li>En las notas, el primer número es Maquinación/Especial X y el segundo es Velocidad.</li>
              <li>Usa "Otra Vez" con Gengar salvo que se indique lo contrario.</li>
              <li>Reporta cualquier error en el Discord.</li>
            </ul>
          )}
        </div>

        {loading && (
          <p className="mb-6 text-sm font-medium text-amber-300">Cargando datos…</p>
        )}

        {/* Regions */}
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-mist-500">
            1. Elige región
          </p>
          <div className="flex flex-wrap gap-2">
            {regions.map((region, i) => (
              <RegionCard
                key={region.id}
                region={region}
                index={i}
                isExpanded={expandedRegion === region.id}
                onClick={handleRegionClick}
              />
            ))}
          </div>
        </div>

        {/* Leaders */}
        {expandedRegion && currentRegion && (
          <div className="mt-6 animate-in">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-mist-500">
              2. Elige entrenador
            </p>
            <div className="flex flex-wrap gap-3">
              {currentRegion.leaders.map((leader) => (
                <LeaderCard
                  key={leader.id}
                  leader={leader}
                  isExpanded={expandedLeader === leader.id}
                  onClick={handleLeaderClick}
                />
              ))}
            </div>
          </div>
        )}

        {/* Pokemon */}
        {expandedLeader && (
          <div className="mt-6 animate-in">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-mist-500">
              3. Elige el Pokémon rival
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {currentLeaderPokemons.map((pokemon) => (
                <PokemonCard
                  key={pokemon.id}
                  pokemon={pokemon}
                  isSelected={selectedPokemon?.id === pokemon.id}
                  onClick={handlePokemonClick}
                />
              ))}
            </div>
          </div>
        )}

        {/* Details */}
        {selectedPokemon && (
          <div ref={detailsRef} className="mt-6 scroll-mt-20">
            <PokemonDetails pokemon={selectedPokemon} />
          </div>
        )}
          </main>
        </>
      ) : activeSection === "gym" ? (
        <main id="guia" className="pt-8">
          <StrategyGuide key={selectedGymStrategy.id} strategy={selectedGymStrategy} category="Gym Rerun" />
        </main>
      ) : (
        <main id="guia" className="pt-8">
          <StrategyGuide key={selectedRedStrategy.id} strategy={selectedRedStrategy} category="Red Battle" />
        </main>
      )}

      <SiteFooter />
    </div>
  )
}
