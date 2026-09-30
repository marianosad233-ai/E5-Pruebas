import { Droplet } from "lucide-react"
import { useEffect, useState } from "react"
import type { BerryData } from "./berries.types"
import { useBerries } from "./BerriesContext"
import { convertDiffToString, diffTimestamp, getMsFromHour } from "./BerryTime"

// Replica la lógica de PokeMMO Hub para las 5 gotas de riego.
// Hub utiliza dos escalas: bayas normales y bayas de crecimiento largo.
function getDropletState(hours: number, limit: number, isLongGrowth: boolean) {
  if (!isLongGrowth && hours <= -10) {
    return { color: "red", className: "blinking-droplet", fill: "none" as const }
  }
  if (hours <= -15) {
    return { color: "red", className: "blinking-droplet", fill: "none" as const }
  }
  if (hours <= limit) {
    return { fill: "" as const, className: "", color: "" }
  }
  if (limit === -9 && hours === -7) {
    return { fill: "" as const, className: "", color: "" }
  }
  return { fill: "currentColor" as const, className: "", color: "" }
}

export function BerryAccountItem({
  planted,
  berry,
  itemName,
}: {
  planted: { _id: number; id: number; tsPlant: number; tsLastWater: number }
  berry: BerryData
  itemName: (id: number) => string
}) {
  const { waterBerry, removeBerry } = useBerries()
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60 * 1000)
    return () => window.clearInterval(interval)
  }, [])

  // PokeMMO Hub considera una baya recién plantada como "aún no regada"
  // y calcula las gotas desde 6 horas antes de tsLastWater.
  const isJustPlanted = planted.tsPlant === planted.tsLastWater
  const timeFromWater = isJustPlanted
    ? diffTimestamp(planted.tsLastWater - getMsFromHour(6), now, true)
    : diffTimestamp(planted.tsLastWater, now)

  const timeToReady = diffTimestamp(
    planted.tsPlant + getMsFromHour(berry.grow_time),
    now,
  )

  const isLongGrowth =
    berry.grow_time === 42 || berry.grow_time === 44 || berry.grow_time === 67

  const hours = isLongGrowth ? timeFromWater.hour : timeFromWater.hour + 1

  return (
    <tr className="border-b border-white/5">
      <td className="px-3 py-3">
        <img
          className="mr-2 inline-block h-7 w-7 align-middle"
          src={`${import.meta.env.BASE_URL}item/${berry.item_id}.png`}
          alt=""
        />
        {itemName(berry.item_id)}
      </td>

      <td className="px-3 py-3">
        <span className="inline-flex items-center gap-1">
          {Array.from({ length: 5 }, (_, index) => {
            const limit = isLongGrowth
              ? -15 + index * 3
              : -10 + index * 2

            const state = getDropletState(hours, limit, isLongGrowth)
            const title = timeFromWater.isJustCalc
              ? "Aún no regada"
              : `Regada: ${convertDiffToString(timeFromWater)}`

            return (
              <span key={index} title={title} aria-label={title}>
                <Droplet
                  className={`h-5 w-5 ${
                    state.className ||
                    (state.fill === "currentColor"
                      ? "text-mist-100"
                      : "text-mist-600")
                  }`}
                  fill={state.fill}
                  strokeWidth={2}
                />
              </span>
            )
          })}
        </span>

        <div className="mt-1 text-xs text-mist-500">
          {timeFromWater.isJustCalc
            ? "Aún no regada"
            : `Regada: ${convertDiffToString(timeFromWater)}`}
        </div>
      </td>

      <td className="px-3 py-3 text-mist-200">
        {convertDiffToString(timeToReady)}
      </td>

      <td className="px-3 py-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => waterBerry(planted._id)}
            className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-500"
          >
            Regar
          </button>
          <button
            type="button"
            onClick={() => removeBerry(planted._id)}
            className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500"
          >
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  )
}
