import { Anchor, ChevronLeft, ChevronRight, Droplets, Dumbbell, Feather, Hammer, MapPin, Scissors, Waves, X, ZoomIn } from "lucide-react"
import { useEffect, useRef, useState, type ComponentType } from "react"
import { LOCATE_MO_REGIONS, LOCATE_MO_SOURCE, SHOTS_BASE, type LocateMoRegion, type Shot } from "../data/locateMo"

const HM_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  Corte: Scissors,
  "Golpe Roca": Hammer,
  Fuerza: Dumbbell,
  Vuelo: Feather,
  Surf: Waves,
  Cascada: Droplets,
  Buceo: Anchor,
}

const shotUrl = (shot: Shot) => `${SHOTS_BASE}${shot.file}`

interface ViewerState {
  title: string
  shots: Shot[]
  index: number
}
type OpenViewer = (title: string, shots: Shot[], index?: number) => void

/* ------------------------------------------------------------------ */
/*  Visor ampliado de imágenes                                         */
/* ------------------------------------------------------------------ */

function Lightbox({ viewer, onClose, onIndex }: { viewer: ViewerState; onClose: () => void; onIndex: (index: number) => void }) {
  const { title, shots, index } = viewer
  const shot = shots[index]
  const closeRef = useRef<HTMLButtonElement>(null)
  const [broken, setBroken] = useState<string | null>(null)
  const many = shots.length > 1

  useEffect(() => {
    const step = (delta: number) => onIndex((index + delta + shots.length) % shots.length)
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
      else if (many && event.key === "ArrowRight") step(1)
      else if (many && event.key === "ArrowLeft") step(-1)
    }
    window.addEventListener("keydown", onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeRef.current?.focus()
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [index, shots.length, many, onClose, onIndex])

  const navButton = "absolute top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80"

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
    >
      <div className="relative w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between gap-3 text-white">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">{title}</p>
            {many && <p className="text-xs text-mist-400">{index + 1} de {shots.length}</p>}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative flex min-h-[200px] items-center justify-center rounded-xl bg-[#0f121a]">
          {broken === shot.file ? (
            <p className="p-8 text-center text-sm text-mist-400">
              No se pudo cargar la imagen. Puedes verla en{" "}
              <a href={LOCATE_MO_SOURCE.url} target="_blank" rel="noreferrer" className="underline hover:text-violet-300">
                la guía original
              </a>
              .
            </p>
          ) : (
            <img
              key={shot.file}
              src={shotUrl(shot)}
              alt={shot.alt}
              onError={() => setBroken(shot.file)}
              className="max-h-[75vh] w-auto max-w-full rounded-xl"
            />
          )}
          {many && (
            <>
              <button type="button" aria-label="Imagen anterior" onClick={() => onIndex((index - 1 + shots.length) % shots.length)} className={`${navButton} left-2`}>
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button type="button" aria-label="Imagen siguiente" onClick={() => onIndex((index + 1) % shots.length)} className={`${navButton} right-2`}>
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
        <p className="mt-3 text-center text-sm text-mist-300">{shot.alt}</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Miniatura dentro de la tarjeta                                     */
/* ------------------------------------------------------------------ */

function Thumb({ title, shots, onOpen }: { title: string; shots?: Shot[]; onOpen: OpenViewer }) {
  const [failed, setFailed] = useState(false)
  // Si la imagen no carga, la tarjeta queda solo con el texto.
  if (!shots?.length || failed) return null

  return (
    <button
      type="button"
      onClick={() => onOpen(title, shots, 0)}
      aria-label={`Ampliar imagen: ${title}`}
      className="group relative mb-4 block w-full overflow-hidden rounded-xl border border-white/10 bg-[#0f121a]"
    >
      <img
        src={shotUrl(shots[0])}
        alt={shots[0].alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[11px] font-medium text-white">
        <ZoomIn className="h-3 w-3" /> {shots.length > 1 ? `${shots.length} fotos` : "Ampliar"}
      </span>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Guía por región                                                    */
/* ------------------------------------------------------------------ */

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[4.5rem_1fr] gap-x-3 text-sm">
      <dt className="text-xs font-medium uppercase tracking-wide text-mist-500">{label}</dt>
      <dd className="text-mist-200">{value}</dd>
    </div>
  )
}

function RegionGuide({ region, onOpen }: { region: LocateMoRegion; onOpen: OpenViewer }) {
  return (
    <>
      <ol className="mt-6 grid gap-4 md:grid-cols-2">
        {region.hms.map((hm, index) => {
          const Icon = HM_ICONS[hm.name] ?? MapPin
          return (
            <li key={hm.name} className="rounded-2xl border border-white/10 bg-[#161a24] p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600/20 text-sm font-bold text-violet-200">
                  {index + 1}
                </span>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <Icon className="h-4 w-4 text-mist-400" /> MO {hm.name}
                </h2>
              </div>
              <Thumb title={`MO ${hm.name}`} shots={hm.shots} onOpen={onOpen} />
              <dl className="space-y-2.5">
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
          <h2 className="mb-4 text-base font-semibold text-amber-200">{region.extra.title}</h2>
          <Thumb title={region.extra.title} shots={region.extra.shots} onOpen={onOpen} />
          <dl className="space-y-2.5">
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
  const [viewer, setViewer] = useState<ViewerState | null>(null)

  const openViewer: OpenViewer = (title, shots, index = 0) => setViewer({ title, shots, index })
  const closeViewer = () => setViewer(null)
  const setIndex = (index: number) => setViewer((current) => (current ? { ...current, index } : current))

  return (
    <section className="mx-auto w-full max-w-[1168px] px-4 pb-16 pt-4 sm:px-6 lg:px-8">
      <div className="border-b border-white/15 pb-3 text-sm text-mist-400">
        <span className="text-mist-300">Herramientas</span>
        <span className="mx-2">/</span>
        <span>Locate MO</span>
      </div>

      <div className="mt-5">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-[40px]">Locate MO</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-mist-400">
          Dónde conseguir cada Máquina Oculta en {region.name}, en el orden en que la historia las va pidiendo. Toca una imagen para
          verla en grande.
        </p>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-violet-500/40 bg-violet-600/10 px-3 py-1 text-xs font-semibold text-violet-200">
          <MapPin className="h-3.5 w-3.5" /> {region.name}
        </span>
      </div>

      <RegionGuide region={region} onOpen={openViewer} />

      <p className="mt-6 text-xs text-mist-500">
        Información e imágenes de la guía de{" "}
        <a href={LOCATE_MO_SOURCE.url} target="_blank" rel="noreferrer" className="underline hover:text-violet-300">
          {LOCATE_MO_SOURCE.label}
        </a>
        .
      </p>

      {viewer && <Lightbox viewer={viewer} onClose={closeViewer} onIndex={setIndex} />}
    </section>
  )
}
