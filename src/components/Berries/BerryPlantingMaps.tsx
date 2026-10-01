import { ChevronDown, Map } from "lucide-react"
import { useState } from "react"

const REGIONS = [
  { id: "teselia", name: "Teselia", file: "teselia.png" },
  { id: "hoenn", name: "Hoenn", file: "hoenn.png" },
  { id: "sinnoh", name: "Sinnoh", file: "sinnoh.png" },
] as const

type RegionId = (typeof REGIONS)[number]["id"]

// Cuadro plegable con el mapa de cada región donde se pueden plantar bayas.
// Las imágenes solo se cargan al abrir el cuadro.
export function BerryPlantingMaps() {
  const [open, setOpen] = useState(false)
  const [regionId, setRegionId] = useState<RegionId>("teselia")
  const region = REGIONS.find((r) => r.id === regionId) ?? REGIONS[0]

  return (
    <div className="rounded-2xl border border-white/10 bg-[#161a24] p-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-white">
          <Map className="h-4 w-4 text-mist-400" /> Dónde plantar bayas (mapas)
        </span>
        <ChevronDown className={`h-4 w-4 text-mist-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-4">
          <div role="tablist" aria-label="Región" className="flex gap-1 rounded-xl border border-white/10 bg-[#0f121a] p-1 sm:w-fit">
            {REGIONS.map((r) => (
              <button
                key={r.id}
                type="button"
                role="tab"
                aria-selected={r.id === regionId}
                onClick={() => setRegionId(r.id)}
                className={`flex-1 rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors sm:flex-none ${
                  r.id === regionId ? "bg-violet-600 text-white" : "text-mist-400 hover:text-white"
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>

          <img
            key={region.id}
            src={`${import.meta.env.BASE_URL}images/berry-maps/${region.file}`}
            alt={`Mapa de ${region.name} con los puntos de plantación de bayas`}
            loading="lazy"
            className="mt-4 w-full max-w-3xl rounded-xl border border-white/10"
          />
        </div>
      )}
    </div>
  )
}
