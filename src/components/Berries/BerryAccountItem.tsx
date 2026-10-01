import { Droplet } from "lucide-react"
import { useEffect, useState } from "react"
import type { BerryData } from "./berries.types"
import { useBerries } from "./BerriesContext"
import { MAX_DROPS, getDropletInfo } from "./berryDroplets"
import { BerryTimeChanger } from "./BerryTimeChanger"
import { convertDiffToString, diffTimestamp, getMsFromHour } from "./BerryTime"

export function BerryAccountItem({
  planted,
  berry,
  itemName,
}: {
  planted: { _id: number; id: number; tsPlant: number; tsLastWater: number }
  berry: BerryData
  itemName: (id: number) => string
}) {
  const { waterBerry, removeBerry, updateBerry } = useBerries()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60 * 1000)
    return () => window.clearInterval(interval)
  }, [])

  const { drops, neverWatered, dry } = getDropletInfo(planted, berry.grow_time, now)

  const timeToReady = diffTimestamp(planted.tsPlant + getMsFromHour(berry.grow_time), now)
  const wateredLabel = neverWatered
    ? "Aún no regada"
    : `Regada: ${convertDiffToString(diffTimestamp(planted.tsLastWater, now))}`

  // Si la baya nunca se ha regado, cambiar la fecha de siembra mueve también
  // el "último riego"; así sigue contando como "aún no regada".
  const changePlantTime = (ts: number) =>
    updateBerry(
      planted._id,
      neverWatered ? { tsPlant: ts, tsLastWater: ts } : { tsPlant: ts },
    )

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
        <span
          className="inline-flex items-center gap-1"
          role="img"
          aria-label={`${drops} de ${MAX_DROPS} gotas`}
        >
          {Array.from({ length: MAX_DROPS }, (_, index) => {
            const filled = index < drops
            return (
              <span key={index} title={wateredLabel}>
                <Droplet
                  className={`h-5 w-5 ${
                    dry ? "blinking-droplet" : filled ? "text-sky-300" : "text-mist-600"
                  }`}
                  fill={filled ? "currentColor" : "none"}
                  strokeWidth={2}
                />
              </span>
            )
          })}
        </span>
        <BerryTimeChanger
          label="Cambiar fecha y hora del riego"
          value={planted.tsLastWater}
          onSelectDate={(ts) => updateBerry(planted._id, { tsLastWater: ts })}
        />
        <div className="mt-1 text-xs text-mist-500">{wateredLabel}</div>
      </td>

      <td className="px-3 py-3 text-mist-200">
        {convertDiffToString(timeToReady)}
        <BerryTimeChanger
          label="Cambiar fecha y hora de siembra"
          value={planted.tsPlant}
          onSelectDate={changePlantTime}
        />
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
