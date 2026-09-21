import { IV_COLORS, IV_STATS, useBreeding } from "./BreedingContext"

export function BreedingLegend() {
  const { breedingConfig } = useBreeding()
  return <div className="flex flex-wrap justify-center gap-4">
    {Object.values(breedingConfig.iv).filter(Boolean).map(iv => {
      const stat = IV_STATS.find(item => item.id === iv)
      if (!stat) return null
      return <div key={stat.id} className="flex items-center gap-2 text-sm text-mist-300"><span className="h-4 w-4 rounded-full" style={{ backgroundColor: IV_COLORS[stat.id] }} />{stat.label}</div>
    })}
    {breedingConfig.nature && <div className="flex items-center gap-2 text-sm text-mist-300"><span className="h-4 w-4 rounded-full" style={{ backgroundColor: IV_COLORS.nat }} />Nature</div>}
  </div>
}
