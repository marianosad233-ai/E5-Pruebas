import { AlertTriangle, ArrowLeft, Search, Swords } from "lucide-react"
import { useMemo, useState } from "react"
import { hashFor } from "../config/routes"
import { RAIDS } from "../data/raids"
import type { RaidGuide } from "../interfaces/Raid"

const imageUrl = (file: string) => `${import.meta.env.BASE_URL}images/raids/${file}`

/** Quita tildes y mayúsculas para que "pokémon" encuentre "Pokemon". */
const normalize = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

function playerCount(raid: RaidGuide): number {
  return raid.players ?? Math.max(1, ...raid.turns.map((t) => t.players.length))
}

/* ------------------------------------------------------------------ */
/*  Imagen o emoji de la raid                                          */
/* ------------------------------------------------------------------ */

function RaidThumb({ raid, size }: { raid: RaidGuide; size: "sm" | "lg" }) {
  const [failed, setFailed] = useState(false)
  const box = size === "lg" ? "h-28 w-28 sm:h-36 sm:w-36 text-5xl" : "h-12 w-12 text-2xl"
  if (raid.image && !failed) {
    return (
      <img
        src={imageUrl(raid.image)}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className={`${box} shrink-0 object-contain`}
      />
    )
  }
  return (
    <span aria-hidden className={`${box} flex shrink-0 items-center justify-center rounded-xl bg-violet-600/15`}>
      {raid.emoji ?? "⚔️"}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Lista lateral                                                      */
/* ------------------------------------------------------------------ */

function RaidList({ selectedId, className = "" }: { selectedId?: string; className?: string }) {
  const [query, setQuery] = useState("")
  const results = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return RAIDS
    return RAIDS.filter((raid) => normalize(`${raid.name} ${raid.subtitle ?? ""}`).includes(q))
  }, [query])

  return (
    <aside className={`rounded-2xl border border-white/10 bg-[#161a24] p-4 ${className}`} aria-label="Lista de raids">
      <label className="relative block">
        <span className="sr-only">Buscar raid o estrategia</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar raid o estrategia..."
          className="w-full rounded-xl border border-white/10 bg-[#0f121a] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-mist-500 focus:border-violet-500 focus:outline-none"
        />
      </label>

      <p className="mb-2 mt-4 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-mist-500">
        <span>Guías disponibles</span>
        <span>
          {results.length}/{RAIDS.length}
        </span>
      </p>

      {results.length === 0 ? (
        <p className="px-1 py-4 text-sm text-mist-500">Ninguna raid coincide con "{query}".</p>
      ) : (
        <ul className="space-y-2">
          {results.map((raid) => {
            const selected = raid.id === selectedId
            return (
              <li key={raid.id}>
                <a
                  href={hashFor.raid(raid.id)}
                  aria-current={selected ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl border p-2.5 transition-colors ${
                    selected
                      ? "border-violet-500/60 bg-violet-600/15"
                      : "border-white/10 bg-[#0f121a] hover:border-violet-500/40"
                  }`}
                >
                  <RaidThumb raid={raid} size="sm" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-white">
                      {raid.emoji && raid.image ? `${raid.emoji} ` : ""}
                      {raid.name}
                    </span>
                    {raid.subtitle && <span className="block truncate text-xs text-mist-500">{raid.subtitle}</span>}
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      )}
    </aside>
  )
}

/* ------------------------------------------------------------------ */
/*  Ficha de una raid                                                  */
/* ------------------------------------------------------------------ */

function RaidDetail({ raid }: { raid: RaidGuide }) {
  const count = playerCount(raid)
  const labels = Array.from({ length: count }, (_, i) => raid.playerLabels?.[i] ?? `Jugador ${i + 1}`)
  const hasHp = raid.turns.some((t) => t.hp)
  // Última columna: "% PS" si algún turno lo trae; si no, "Notas" cuando hay avisos de RESET o notas.
  const hasExtra = raid.turns.some((t) => t.hp || t.reset || t.note)

  return (
    <article>
      <header className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-[#161a24] p-5 sm:flex-row sm:items-center sm:p-6">
        <RaidThumb raid={raid} size="lg" />
        <div className="min-w-0">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-white sm:text-4xl">
            {raid.name} <span className="text-violet-300">Raid</span>
          </h2>
          <p className="mt-2 text-sm text-mist-400">
            {raid.summary ??
              [raid.subtitle && `Estrategia ${raid.subtitle}`, `${count} ${count === 1 ? "jugador" : "jugadores"}`, "turno por turno"]
                .filter(Boolean)
                .join(" · ")}
          </p>
          {raid.warning && (
            <p className="mt-3 inline-flex items-start gap-2 rounded-full border border-rose-400/40 bg-rose-400/10 px-3 py-1.5 text-xs font-semibold text-rose-200">
              <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" /> {raid.warning}
            </p>
          )}
        </div>
      </header>

      <section className="mt-4 rounded-2xl border border-white/10 bg-[#161a24] p-5 sm:p-6" aria-labelledby="raid-route">
        <h3 id="raid-route" className="flex items-center gap-2 text-lg font-semibold text-white">
          <Swords className="h-5 w-5 text-violet-300" /> Ruta turno a turno
        </h3>
        <p className="mt-3 rounded-xl border-l-4 border-amber-300/70 bg-amber-300/5 px-4 py-3 text-sm text-mist-300">
          Sigue la secuencia tal como aparece en la guía. Los avisos de RESET están en el turno correspondiente.
          {hasHp && " El porcentaje es el PS aproximado del jefe al terminar el turno."}
        </p>

        {raid.turns.length === 0 ? (
          <p className="mt-4 text-sm text-mist-500">Esta guía todavía no tiene turnos.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#0f121a] text-xs font-semibold uppercase tracking-wide text-mist-400">
                  <th scope="col" className="px-3 py-3">Turno</th>
                  {labels.map((label) => (
                    <th key={label} scope="col" className="px-3 py-3">{label}</th>
                  ))}
                  {hasExtra && <th scope="col" className="px-3 py-3">{hasHp ? "% PS" : "Notas"}</th>}
                </tr>
              </thead>
              <tbody>
                {raid.turns.map((turn, index) => (
                  <tr key={`${turn.turn}-${index}`} className="border-t border-white/10 align-top">
                    <th scope="row" className="whitespace-nowrap px-3 py-3 font-bold text-amber-200">{turn.turn}</th>
                    {labels.map((label, i) => (
                      <td key={label} className="px-3 py-3 text-mist-200">{turn.players[i] ?? "—"}</td>
                    ))}
                    {hasExtra && (
                      <td className="px-3 py-3">
                        {turn.hp && <span className="block font-semibold text-emerald-300">{turn.hp}</span>}
                        {turn.reset && <span className="mt-1 block text-xs font-semibold text-rose-300">{turn.reset}</span>}
                        {turn.note && <span className="mt-1 block text-xs text-mist-400">{turn.note}</span>}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {raid.notes && raid.notes.length > 0 && (
        <section className="mt-4 rounded-2xl border border-white/10 bg-[#161a24] p-5 sm:p-6" aria-labelledby="raid-notes">
          <h3 id="raid-notes" className="text-lg font-semibold text-white">Notas</h3>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-mist-300">
            {raid.notes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </section>
      )}

      {raid.credits && <p className="mt-4 text-xs text-mist-500">{raid.credits}</p>}
    </article>
  )
}

/* ------------------------------------------------------------------ */
/*  Pantalla                                                           */
/* ------------------------------------------------------------------ */

export default function Raids({ raidId }: { raidId?: string }) {
  const raid = RAIDS.find((r) => r.id === raidId)
  const unknown = Boolean(raidId) && !raid

  return (
    <section className="mx-auto w-full max-w-[1168px] px-4 pb-16 pt-4 sm:px-6 lg:px-8">
      <div className="border-b border-white/15 pb-3 text-sm text-mist-400">
        <span className="text-mist-300">Herramientas</span>
        <span className="mx-2">/</span>
        {raid ? (
          <>
            <a href={hashFor.tool("raids")} className="text-mist-300 hover:text-violet-300">Raids</a>
            <span className="mx-2">/</span>
            <span>{raid.name}</span>
          </>
        ) : (
          <span>Raids</span>
        )}
      </div>

      <div className="mt-5">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-[40px]">Raids</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-mist-400">
          Estrategias de raids pokémon por pokémon y turno por turno. Elige una raid de la lista.
        </p>
      </div>

      {RAIDS.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-[#161a24] p-8 text-center">
          <Swords className="mx-auto h-8 w-8 text-mist-500" />
          <p className="mt-3 text-base font-semibold text-white">Aún no hay raids cargadas</p>
          <p className="mt-1 text-sm text-mist-400">Las guías se irán añadiendo pronto.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-[300px_1fr] lg:items-start">
          {/* En móvil, con una raid abierta se oculta la lista y se ofrece volver a ella. */}
          <RaidList selectedId={raid?.id} className={`${raid ? "hidden lg:block" : ""} lg:sticky lg:top-20`} />

          <div className="min-w-0">
            {raid && (
              <a
                href={hashFor.tool("raids")}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-mist-300 hover:border-violet-500 hover:text-violet-200 lg:hidden"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Todas las raids
              </a>
            )}

            {raid ? (
              <RaidDetail raid={raid} />
            ) : (
              <div className="hidden rounded-2xl border border-dashed border-white/15 bg-[#161a24] p-10 text-center lg:block">
                <Swords className="mx-auto h-8 w-8 text-mist-500" />
                <p className="mt-3 text-base font-semibold text-white">
                  {unknown ? "No encontramos esa raid" : "Elige una raid"}
                </p>
                <p className="mt-1 text-sm text-mist-400">
                  {unknown ? "Puede que el enlace esté mal escrito. Escoge otra de la lista." : "Su ficha y la ruta turno a turno aparecerán aquí."}
                </p>
              </div>
            )}
            {unknown && (
              <p role="status" className="rounded-xl border border-amber-300/40 bg-amber-300/5 px-4 py-3 text-sm text-amber-200 lg:hidden">
                No encontramos esa raid. Escoge otra de la lista.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
