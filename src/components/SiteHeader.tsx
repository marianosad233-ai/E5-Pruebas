import { useState } from "react"
import { ChevronDown, Check } from "lucide-react"
import { STRATEGIES, type StrategyId } from "../config/strategies"

interface SiteHeaderProps {
  activeStrategy: StrategyId
  onStrategyChange: (strategy: StrategyId) => void
}

export const SiteHeader = ({ activeStrategy, onStrategyChange }: SiteHeaderProps) => {
  const [open, setOpen] = useState(false)
  const currentStrategy = STRATEGIES.find((strategy) => strategy.id === activeStrategy) ?? STRATEGIES[0]

  const selectStrategy = (strategyId: StrategyId) => {
    onStrategyChange(strategyId)
    setOpen(false)
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

        <nav className="hidden items-center gap-6 text-sm font-medium text-mist-400 sm:flex">
          <a href="#rutas" className="transition-colors hover:text-mist-100">Ruta</a>
          <a href="#guia" className="transition-colors hover:text-mist-100">Guía</a>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-haspopup="menu"
              aria-expanded={open}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 transition-colors ${
                open ? "bg-violet-600/15 text-violet-300" : "hover:text-mist-100"
              }`}
            >
              <span>E4</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
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

                {STRATEGIES.map((strategy) => {
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

          <a href="#creditos" className="transition-colors hover:text-mist-100">Créditos</a>
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
