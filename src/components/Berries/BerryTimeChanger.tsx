import { Clock } from "lucide-react"
import { useState } from "react"

// Convierte un timestamp a "YYYY-MM-DDTHH:mm" en hora local (formato de datetime-local).
function toLocalInput(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function BerryTimeChanger({
  label,
  value,
  onSelectDate,
}: {
  label: string
  value: number
  onSelectDate: (timestamp: number) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <span className="ml-2 inline-flex items-center gap-1 align-middle">
      <button
        type="button"
        title={label}
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded border border-white/10 p-1 text-mist-400 hover:text-white"
      >
        <Clock className="h-3.5 w-3.5" />
      </button>
      {open && (
        <input
          type="datetime-local"
          aria-label={label}
          value={toLocalInput(value)}
          max={toLocalInput(Date.now())}
          onChange={(e) => {
            const ts = new Date(e.target.value).getTime()
            // No se permiten fechas futuras ni valores vacíos/inválidos.
            if (!Number.isNaN(ts) && ts <= Date.now()) {
              onSelectDate(ts)
            }
          }}
          className="rounded border border-white/10 bg-[#161a24] px-2 py-1 text-xs text-mist-200"
        />
      )}
    </span>
  )
}
