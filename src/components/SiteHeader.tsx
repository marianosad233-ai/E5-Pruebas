import { useState } from "react"
import { ChevronDown, Check } from "lucide-react"
import {
  E4_STRATEGIES,
  GYM_RERUN_STRATEGIES,
  RED_BATTLE_STRATEGIES,
  type StrategyId,
  type GymRerunStrategyId,
  type RedBattleStrategyId,
} from "../config/strategies"

interface SiteHeaderProps {
  activeStrategy: StrategyId
  onStrategyChange: (strategy: StrategyId) => void
  activeGymRerunStrategy: GymRerunStrategyId
  onGymRerunStrategyChange: (strategy: GymRerunStrategyId) => void
  activeRedBattleStrategy: RedBattleStrategyId
  onRedBattleStrategyChange: (strategy: RedBattleStrategyId) => void
}

export const SiteHeader = ({
  activeStrategy,
  onStrategyChange,
  activeGymRerunStrategy,
  onGymRerunStrategyChange,
  activeRedBattleStrategy,
  onRedBattleStrategyChange,
}: SiteHeaderProps) => {
  const [openMenu, setOpenMenu] = useState<"gym" | "red" | "e4" | null>(null)

  const selectStrategy = (strategyId: StrategyId) => {
    onStrategyChange(strategyId)
    setOpenMenu(null)
  }

  const selectGymRerunStrategy = (strategyId: GymRerunStrategyId) => {
    onGymRerunStrategyChange(strategyId)
    setOpenMenu(null)
  }

  const selectRedBattleStrategy = (strategyId: RedBattleStrategyId) => {
    onRedBattleStrategyChange(strategyId)
    setOpenMenu(null)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-ink-700/80 bg-ink-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#top" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 font-display text-sm font-bold text-white">
            FL
          </span>
          <span className="font-display text-base font-semibold text-mist-100 sm:text-lg">
            Farm Liga
          </span>
        </a>

        <nav className="hidden items-center gap-4 text-sm font-medium text-mist-400 sm:flex">
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu((value) => (value === "gym" ? null : "gym"))}
              aria-haspopup="menu"
              aria-expanded={openMenu === "gym"}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 transition-colors ${
                openMenu === "gym" ? "bg-violet-600/15 text-violet-300" : "hover:text-mist-100"
              }`}
            >
              <span>Gym Rerun</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openMenu === "gym" ? "rotate-180" : ""}`} />
            </button>

            {openMenu === "gym" && (
              <div
                role="menu"
                className="absolute left-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border border-ink-700 bg-ink-950/95 p-1.5 shadow-2xl shadow-black/30 backdrop-blur"
              >
                <div className="px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mist-500">
                    Estrategias Gym Rerun
                  </p>
                  <p className="mt-1 text-xs text-mist-500">Selecciona una estrategia</p>
                </div>

                {GYM_RERUN_STRATEGIES.map((strategy) => {
                  const selected = strategy.id === activeGymRerunStrategy
                  return (
                    <button
                      key={strategy.id}
                      type="button"
                      role="menuitem"
                      onClick={() => selectGymRerunStrategy(strategy.id)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${
                        selected ? "bg-violet-600/15 text-violet-200" : "text-mist-300 hover:bg-ink-800 hover:text-mist-100"
                      }`}
                    >
                      <span>
                        <span className="block text-sm font-semibold">{strategy.name}</span>
                        <span className="mt-0.5 block text-[11px] text-mist-500">{strategy.description}</span>
                      </span>
                      {selected && <Check className="h-4 w-4 flex-shrink-0 text-violet-400" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu((value) => (value === "red" ? null : "red"))}
              aria-haspopup="menu"
              aria-expanded={openMenu === "red"}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 transition-colors ${
                openMenu === "red" ? "bg-violet-600/15 text-violet-300" : "hover:text-mist-100"
              }`}
            >
              <span>Red Battle</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openMenu === "red" ? "rotate-180" : ""}`} />
            </button>

            {openMenu === "red" && (
              <div
                role="menu"
                className="absolute left-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border border-ink-700 bg-ink-950/95 p-1.5 shadow-2xl shadow-black/30 backdrop-blur"
              >
                <div className="px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mist-500">
                    Estrategias Red Battle
                  </p>
                  <p className="mt-1 text-xs text-mist-500">Selecciona una estrategia</p>
                </div>

                {RED_BATTLE_STRATEGIES.map((strategy) => {
                  const selected = strategy.id === activeRedBattleStrategy
                  return (
                    <button
                      key={strategy.id}
                      type="button"
                      role="menuitem"
                      onClick={() => selectRedBattleStrategy(strategy.id)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${
                        selected ? "bg-violet-600/15 text-violet-200" : "text-mist-300 hover:bg-ink-800 hover:text-mist-100"
                      }`}
                    >
                      <span>
                        <span className="block text-sm font-semibold">{strategy.name}</span>
                        <span className="mt-0.5 block text-[11px] text-mist-500">{strategy.description}</span>
                      </span>
                      {selected && <Check className="h-4 w-4 flex-shrink-0 text-violet-400" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu((value) => (value === "e4" ? null : "e4"))}
              aria-haspopup="menu"
              aria-expanded={openMenu === "e4"}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 transition-colors ${
                openMenu === "e4" ? "bg-violet-600/15 text-violet-300" : "hover:text-mist-100"
              }`}
            >
              <span>E4</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openMenu === "e4" ? "rotate-180" : ""}`} />
            </button>

            {openMenu === "e4" && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border border-ink-700 bg-ink-950/95 p-1.5 shadow-2xl shadow-black/30 backdrop-blur"
              >
                <div className="px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mist-500">
                    Estrategia E4
                  </p>
                  <p className="mt-1 text-xs text-mist-500">Selecciona la estrategia de farmeo</p>
                </div>

                {E4_STRATEGIES.map((strategy) => {
                  const selected = strategy.id === activeStrategy
                  return (
                    <button
                      key={strategy.id}
                      type="button"
                      role="menuitem"
                      onClick={() => selectStrategy(strategy.id)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${
                        selected ? "bg-violet-600/15 text-violet-200" : "text-mist-300 hover:bg-ink-800 hover:text-mist-100"
                      }`}
                    >
                      <span>
                        <span className="block text-sm font-semibold">{strategy.name}</span>
                        <span className="mt-0.5 block text-[11px] text-mist-500">{strategy.description}</span>
                      </span>
                      {selected && <Check className="h-4 w-4 flex-shrink-0 text-violet-400" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://discord.gg/pKPxjAFNmA"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full border border-ink-700 px-3 py-1.5 text-xs font-medium text-mist-300 transition-colors hover:border-violet-500 hover:text-violet-300 sm:block"
          >
            Discord
          </a>
          <a
            href="https://youtu.be/LidSI0vJYKs?si=JRz1Vgg_1OzLFPDI"
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-violet-500 sm:text-sm"
          >
            Ver tutorial
          </a>
        </div>
      </div>
    </header>
  );
};
