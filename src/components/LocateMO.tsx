import { Anchor, Droplets, Dumbbell, Feather, Hammer, MapPin, Scissors, Waves } from "lucide-react"
import type { ComponentType } from "react"
import { LOCATE_MO_REGIONS, LOCATE_MO_SOURCE, type LocateMoRegion } from "../data/locateMo"

const HM_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  Corte: Scissors,
  "Golpe Roca": Hammer,
  Fuerza: Dumbbell,
  Vuelo: Feather,
  Surf: Waves,
  Cascada: Droplets,
  Buceo: Anchor,
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[4.5rem_1fr] gap-x-3 text-sm">
      <dt className="text-xs font-medium uppercase tracking-wide text-mist-500">{label}</dt>
      <dd className="text-mist-200">{value}</dd>
    </div>
  )
}

function RegionGuide({ region }: { region: LocateMoRegion }) {
  return (
    <>
      <ol className="mt-6 grid gap-4 md:grid-cols-2">
        {region.hms.map((hm, index) => {
          const Icon = HM_ICONS[hm.name] ?? MapPin
          return (
            <li key={hm.name} className="rounded-2xl border border-white/10 bg-[#161a24] p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600/20 text-sm font-bold text-violet-200">
                  {index + 1}
                </span>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <Icon className="h-4 w-4 text-mist-400" /> MO {hm.name}
                </h2>
              </div>
              <dl className="mt-4 space-y-2.5">
                <Row label="Quién" value={hm.giver} />
                <Row label="Dónde" value={hm.place} />
                <Row label="Cómo" value={hm.how} />
                {hm.use && <Row label="Sirve" value={hm.use} />}
              </dl>
            </li>
          )
        })}
      </ol>

      {region.extra && (
        <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-5">
          <h2 className="text-base font-semibold text-amber-200">{region.extra.title}</h2>
          <dl className="mt-3 space-y-2.5">
            <Row label="Quién" value={region.extra.giver} />
            <Row label="Dónde" value={region.extra.place} />
            <Row label="Cómo" value={region.extra.how} />
          </dl>
        </div>
      )}
    </>
  )
}

export default function LocateMO() {
  // Hoy solo hay Teselia; cuando se agreguen más regiones, aquí se elige cuál mostrar.
  const region = LOCATE_MO_REGIONS[0]

  return (
    <section className="mx-auto w-full max-w-[1168px] px-4 pb-16 pt-4 sm:px-6 lg:px-8">
      <div className="border-b border-white/15 pb-3 text-sm text-mist-400">
        <span className="text-mist-300">Home</span>
        <span className="mx-2">/</span>
        <span className="text-mist-300">More</span>
        <span className="mx-2">/</span>
        <span>Locate MO</span>
      </div>

      <div className="mt-5">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-[40px]">Locate MO</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-mist-400">
          Dónde conseguir cada Máquina Oculta en {region.name}, en el orden en que la historia las va pidiendo.
        </p>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-violet-500/40 bg-violet-600/10 px-3 py-1 text-xs font-semibold text-violet-200">
          <MapPin className="h-3.5 w-3.5" /> {region.name}
        </span>
      </div>

      <RegionGuide region={region} />

      <p className="mt-6 text-xs text-mist-500">
        Información basada en la guía de{" "}
        <a
          href={LOCATE_MO_SOURCE.url}
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-violet-300"
        >
          {LOCATE_MO_SOURCE.label}
        </a>
        .
      </p>
    </section>
  )
}
