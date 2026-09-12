import { ChevronRight, MapPin, Users } from "lucide-react"

interface QuickNavBarProps {
  hasLeader: boolean
  onGoToRegions: () => void
  onGoToLeaders: () => void
  onNextLeader: () => void
}

export const QuickNavBar = ({ hasLeader, onGoToRegions, onGoToLeaders, onNextLeader }: QuickNavBarProps) => {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-700 bg-ink-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl gap-2 px-3 py-2.5 sm:px-6">
        <button
          type="button"
          onClick={onGoToRegions}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-sky-500 sm:text-sm"
        >
          <MapPin className="h-4 w-4" />
          Elegir región
        </button>
        <button
          type="button"
          onClick={onGoToLeaders}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2.5 text-xs font-semibold text-ink-950 transition-colors hover:bg-amber-400 sm:text-sm"
        >
          <Users className="h-4 w-4" />
          Elegir entrenador
        </button>
        <button
          type="button"
          onClick={onNextLeader}
          disabled={!hasLeader}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
        >
          Siguiente entrenador
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
