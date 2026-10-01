import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export type PlantedBerry = { _id: number; id: number; tsPlant: number; tsLastWater: number }

type BerryContextValue = {
  planted: PlantedBerry[]
  favorites: number[]
  addBerry: (id: number) => void
  removeBerry: (id: number) => void
  waterBerry: (id: number) => void
  updateBerry: (id: number, update: Partial<Pick<PlantedBerry, "tsPlant" | "tsLastWater">>) => void
  toggleFavorite: (id: number) => void
}

const Context = createContext<BerryContextValue | null>(null)
const STORAGE = "berriesAccount"
const FAVORITES = "berriesFavorites"

// Lee de localStorage de forma segura: si está vacío o corrupto, arranca de cero.
function load<T>(key: string, isValid: (v: unknown) => v is T, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed: unknown = JSON.parse(raw)
    return isValid(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

const isPlantedList = (v: unknown): v is PlantedBerry[] =>
  Array.isArray(v) &&
  v.every(
    (x) =>
      x &&
      typeof x._id === "number" &&
      typeof x.id === "number" &&
      typeof x.tsPlant === "number" &&
      typeof x.tsLastWater === "number",
  )
const isNumberList = (v: unknown): v is number[] =>
  Array.isArray(v) && v.every((x) => typeof x === "number")

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* almacenamiento lleno o bloqueado: la app sigue funcionando sin persistir */
  }
}

export function BerriesProvider({ children }: { children: ReactNode }) {
  // Estado inicial perezoso: se lee una sola vez, antes de que ningún efecto
  // pueda sobrescribir lo guardado con una lista vacía.
  const [planted, setPlanted] = useState<PlantedBerry[]>(() => load(STORAGE, isPlantedList, []))
  const [favorites, setFavorites] = useState<number[]>(() => load(FAVORITES, isNumberList, []))

  useEffect(() => save(STORAGE, planted), [planted])
  useEffect(() => save(FAVORITES, favorites), [favorites])

  return (
    <Context.Provider
      value={{
        planted,
        favorites,
        addBerry: (id) => {
          const now = Date.now()
          setPlanted((p) => [...p, { _id: now + Math.random(), id, tsPlant: now, tsLastWater: now }])
        },
        removeBerry: (id) => setPlanted((p) => p.filter((x) => x._id !== id)),
        waterBerry: (id) =>
          setPlanted((p) => p.map((x) => (x._id === id ? { ...x, tsLastWater: Date.now() } : x))),
        updateBerry: (id, update) =>
          setPlanted((p) => p.map((x) => (x._id === id ? { ...x, ...update } : x))),
        toggleFavorite: (id) =>
          setFavorites((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id])),
      }}
    >
      {children}
    </Context.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBerries() {
  const value = useContext(Context)
  if (!value) throw new Error("useBerries must be used inside BerriesProvider")
  return value
}
