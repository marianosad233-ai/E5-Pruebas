import { useEffect, useMemo, useState } from "react"
import { Clock3, Droplets, Heart, Loader2, Plus, Trash2 } from "lucide-react"

const BERRIES_URL = "https://raw.githubusercontent.com/PokeMMO-Tools/pokemmo-data/main/data/items-berry.json"
const ITEMS_URL = "https://raw.githubusercontent.com/PokeMMO-Tools/pokemmo-data/main/data/items.json"
const ICON_URL = "https://raw.githubusercontent.com/PokeMMO-Tools/pokemmo-data/main/assets/itemicons/"

interface BerryData {
  id: number
  first_water_time: number
  other_water_time: number
  grow_time: number
  wither_time: number
  reduce_time: number
  min_harvest: number
  max_harvest: number
  items: number[]
}

interface ItemData { id: number; name: string }
interface Plant { id: string; berryId: number; plantedAt: string; wateredAt: string[] }

const STORAGE_KEY = "e5-berries-helper"
const FAV_KEY = "e5-berries-favorites"

const formatHours = (hours: number) => {
  const whole = Math.floor(hours)
  const minutes = Math.round((hours - whole) * 60)
  if (!minutes) return `${whole} h`
  return `${whole} h ${minutes} min`
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-PE", { dateStyle: "short", timeStyle: "short" }).format(new Date(value))

const addHours = (date: Date, hours: number) => new Date(date.getTime() + hours * 3600000)

function calculateDrops(plant: Plant, berry: BerryData, now: number) {
  let drops = 2
  let cursor = new Date(plant.plantedAt).getTime()
  const waters = plant.wateredAt.map((item) => new Date(item).getTime()).filter(Number.isFinite).sort((a, b) => a - b)

  for (const watered of waters) {
    if (watered < cursor || watered > now) continue
    const interval = cursor === new Date(plant.plantedAt).getTime() ? berry.first_water_time : berry.other_water_time
    const elapsed = (watered - cursor) / 3600000
    const lost = Math.max(0, Math.floor(elapsed / interval))
    drops = Math.max(0, drops - lost)
    drops = Math.min(5, drops + 1)
    cursor = watered
  }

  const interval = cursor === new Date(plant.plantedAt).getTime() ? berry.first_water_time : berry.other_water_time
  const elapsed = Math.max(0, (now - cursor) / 3600000)
  drops = Math.max(0, drops - Math.floor(elapsed / interval))
  return Math.min(5, drops)
}

export default function BerriesHelper() {
  const [berries, setBerries] = useState<BerryData[]>([])
  const [items, setItems] = useState<ItemData[]>([])
  const [plants, setPlants] = useState<Plant[]>([])
  const [favorites, setFavorites] = useState<number[]>([])
  const [selectedBerry, setSelectedBerry] = useState(0)
  const [plantDate, setPlantDate] = useState(() => new Date().toISOString().slice(0, 16))
  const [now, setNow] = useState(Date.now())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    try {
      const savedPlants = localStorage.getItem(STORAGE_KEY)
      const savedFavorites = localStorage.getItem(FAV_KEY)
      if (savedPlants) setPlants(JSON.parse(savedPlants))
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites))
    } catch { /* ignore invalid local data */ }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plants))
  }, [plants])

  useEffect(() => {
    localStorage.setItem(FAV_KEY, JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    Promise.all([
      fetch(BERRIES_URL).then((r) => { if (!r.ok) throw new Error("No se pudieron cargar los datos de bayas."); return r.json() }),
      fetch(ITEMS_URL).then((r) => { if (!r.ok) throw new Error("No se pudieron cargar los nombres de objetos."); return r.json() }),
    ])
      .then(([berryData, itemData]: [BerryData[], ItemData[]]) => {
        setBerries(berryData)
        setItems(itemData)
        if (berryData.length) setSelectedBerry(berryData[0].id)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const itemName = (berry: BerryData) => items.find((item) => item.id === berry.items[0])?.name || `Berry #${berry.id}`
  const berryById = (id: number) => berries.find((berry) => berry.id === id)

  const sortedBerries = useMemo(() => [...berries].sort((a, b) => {
    const favA = favorites.includes(a.id) ? 0 : 1
    const favB = favorites.includes(b.id) ? 0 : 1
    if (favA !== favB) return favA - favB
    return itemName(a).localeCompare(itemName(b))
  }), [berries, favorites, items])

  const addPlant = () => {
    if (!selectedBerry) return
    setPlants((current) => [
      ...current,
      { id: crypto.randomUUID(), berryId: selectedBerry, plantedAt: new Date(plantDate).toISOString(), wateredAt: [] },
    ])
  }

  const waterPlant = (id: string) => {
    setPlants((current) => current.map((plant) => plant.id === id
      ? { ...plant, wateredAt: [...plant.wateredAt, new Date().toISOString()] }
      : plant
    ))
  }

  const removePlant = (id: string) => setPlants((current) => current.filter((plant) => plant.id !== id))
  const toggleFavorite = (id: number) => setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])

  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <div className="rounded-3xl border border-ink-700 bg-ink-950/80 p-5 shadow-2xl shadow-black/20 sm:p-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">PokeMMO Hub style</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-mist-100 sm:text-3xl">Berries Helper</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-mist-400">
            Registra cuándo plantaste cada baya, riega desde aquí y controla el estado de agua y la hora estimada de cosecha sin tener que volver al juego para comprobarlo.
          </p>
        </div>

        {loading ? (
          <div className="mt-8 flex items-center justify-center gap-2 rounded-2xl border border-ink-800 bg-ink-900/60 p-10 text-sm text-mist-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando bayas…
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-200">{error}</div>
        ) : (
          <>
            <div className="mt-7 rounded-2xl border border-ink-800 bg-ink-900/60 p-4 sm:p-5">
              <div className="grid gap-4 lg:grid-cols-[1.3fr_0.8fr_auto] lg:items-end">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-mist-500">Baya plantada</label>
                  <div className="mt-2 flex gap-2">
                    <select
                      value={selectedBerry}
                      onChange={(event) => setSelectedBerry(Number(event.target.value))}
                      className="min-w-0 flex-1 rounded-xl border border-ink-700 bg-ink-950 px-3 py-2.5 text-sm text-mist-100 outline-none focus:border-violet-500/60"
                    >
                      {sortedBerries.map((berry) => (
                        <option key={berry.id} value={berry.id}>{favorites.includes(berry.id) ? "★ " : ""}{itemName(berry)}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(selectedBerry)}
                      className="rounded-xl border border-ink-700 px-3 text-mist-400 hover:border-violet-500/50 hover:text-yellow-300"
                      title="Favorito"
                    >
                      <Heart className={`h-4 w-4 ${favorites.includes(selectedBerry) ? "fill-current text-yellow-300" : ""}`} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-mist-500">Hora de plantación</label>
                  <input
                    type="datetime-local"
                    value={plantDate}
                    onChange={(event) => setPlantDate(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-ink-700 bg-ink-950 px-3 py-2.5 text-sm text-mist-100 outline-none focus:border-violet-500/60"
                  />
                </div>
                <button
                  type="button"
                  onClick={addPlant}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
                >
                  <Plus className="h-4 w-4" /> Agregar plantación
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {plants.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-ink-700 bg-ink-900/40 p-10 text-center text-sm text-mist-500">
                  Todavía no tienes plantaciones registradas. Selecciona una baya y agrégala.
                </div>
              ) : plants.map((plant) => {
                const berry = berryById(plant.berryId)
                if (!berry) return null
                const drops = calculateDrops(plant, berry, now)
                const readyAt = addHours(new Date(plant.plantedAt), berry.grow_time)
                const witherAt = addHours(readyAt, berry.wither_time)
                const nextWaterHours = Math.max(0, berry.first_water_time - ((now - new Date(plant.plantedAt).getTime()) / 3600000))
                const ready = now >= readyAt.getTime()
                const withered = now >= witherAt.getTime()
                return (
                  <div key={plant.id} className="rounded-2xl border border-ink-800 bg-ink-900/60 p-4 sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-950 ring-1 ring-ink-700">
                          <img src={`${ICON_URL}${berry.items[0]}.png`} alt="" className="h-12 w-12 object-contain" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-mist-100">{itemName(berry)}</h2>
                          <p className="mt-1 text-xs text-mist-500">Plantada: {formatDate(plant.plantedAt)}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button type="button" onClick={() => waterPlant(plant.id)} className="inline-flex items-center gap-2 rounded-xl bg-sky-600/20 px-4 py-2 text-sm font-semibold text-sky-200 ring-1 ring-sky-500/30 hover:bg-sky-600/30">
                          <Droplets className="h-4 w-4" /> Regar
                        </button>
                        <button type="button" onClick={() => removePlant(plant.id)} className="rounded-xl border border-ink-700 p-2 text-mist-500 hover:border-red-500/40 hover:text-red-300" title="Eliminar plantación">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      <div className="rounded-xl border border-ink-700 bg-ink-950 p-3">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-mist-600">Agua</p>
                        <div className="mt-2 flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, index) => <Droplets key={index} className={`h-5 w-5 ${index < drops ? "text-sky-400" : "text-ink-700"}`} />)}
                        </div>
                        <p className="mt-2 text-xs text-mist-500">{drops}/5 gotas</p>
                      </div>
                      <div className="rounded-xl border border-ink-700 bg-ink-950 p-3">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-mist-600">Cosecha</p>
                        <p className={`mt-2 text-sm font-semibold ${ready ? "text-emerald-300" : "text-mist-200"}`}>
                          {withered ? "La baya se marchitó" : ready ? "Lista para cosechar" : formatDate(readyAt.toISOString())}
                        </p>
                        <p className="mt-1 text-xs text-mist-600">Crecimiento: {formatHours(berry.grow_time)}</p>
                      </div>
                      <div className="rounded-xl border border-ink-700 bg-ink-950 p-3">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-mist-600">Próximo riego</p>
                        <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-mist-200"><Clock3 className="h-4 w-4 text-violet-400" /> {drops === 0 ? "Necesita riego" : `en ${formatHours(nextWaterHours)}`}</p>
                        <p className="mt-1 text-xs text-mist-600">Primer riego: {berry.first_water_time} h · después: {berry.other_water_time} h</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
