import { useEffect, useMemo, useRef, useState } from "react"
import { Heart, Droplets, Droplet } from "lucide-react"

const BERRIES_URL = "https://raw.githubusercontent.com/PokeMMO-Tools/pokemmo-hub/main/src/data/pokemmo/item-berry.json"
const ITEMS_URL = "https://raw.githubusercontent.com/PokeMMO-Tools/pokemmo-hub/main/src/data/pokemmo/item.json"
const ICON_URL = "https://raw.githubusercontent.com/PokeMMO-Tools/pokemmo-hub/main/static/item/"

const BERRIES_DEGREES = [
  { key: "bitter_degree", label: "Bitter" },
  { key: "dry_degree", label: "Dry" },
  { key: "sour_degree", label: "Sour" },
  { key: "spicy_degree", label: "Spicy" },
  { key: "sweet_degree", label: "Sweet" },
] as const

interface BerryData {
  item_id: number
  bitter_degree: number
  dry_degree: number
  sour_degree: number
  spicy_degree: number
  sweet_degree: number
  first_water_time: number
  other_water_time: number
  grow_time: number
  wither_time: number
  min_harvest: number
  max_harvest: number
}
interface ItemData { id: number; key: string; en_name: string; category: number }
interface SeedData extends ItemData { type: string; value: number }
interface PlantedBerry { _id: number; id: number; tsPlant: number; tsLastWater: number }

const BERRIES_STORAGE = "berriesAccount"
const FAVORITES_STORAGE = "berriesFavorites"

const formatDiff = (ms: number) => {
  const totalMinutes = Math.max(0, Math.round(Math.abs(ms) / 60000))
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60
  const parts: string[] = []
  if (days) parts.push(`${days}d`)
  if (hours) parts.push(`${hours}h`)
  if (minutes || !parts.length) parts.push(`${minutes}m`)
  return parts.join(" ")
}


function dropletState(berry: BerryData, tsPlant: number, tsLastWater: number, now: number, index: number) {
  const firstWater = tsPlant === tsLastWater
  const elapsedHours = (now - tsLastWater) / 3600000
  const longGrowth = berry.grow_time === 42 || berry.grow_time === 44 || berry.grow_time === 67
  const hour = firstWater ? elapsedHours - 6 : (longGrowth ? elapsedHours : elapsedHours + 1)
  const redFloor = longGrowth ? -15 : -10
  const limit = longGrowth ? -15 + index * 3 : -10 + index * 2
  if (hour <= redFloor) return "red"
  if (hour <= limit) return "empty"
  return "filled"
}

export default function BerriesHelper() {
  const [berries, setBerries] = useState<BerryData[]>([])
  const [items, setItems] = useState<ItemData[]>([])
  const [plants, setPlants] = useState<PlantedBerry[]>([])
  const [favorites, setFavorites] = useState<number[]>([])
  const [now, setNow] = useState(Date.now())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [justWatered, setJustWatered] = useState<Record<number, boolean>>({})
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(BERRIES_STORAGE)
      const favs = localStorage.getItem(FAVORITES_STORAGE)
      if (saved) setPlants(JSON.parse(saved))
      if (favs) setFavorites(JSON.parse(favs))
    } catch { /* keep defaults */ }
  }, [])

  useEffect(() => localStorage.setItem(BERRIES_STORAGE, JSON.stringify(plants)), [plants])
  useEffect(() => localStorage.setItem(FAVORITES_STORAGE, JSON.stringify(favorites)), [favorites])
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    Promise.all([
      fetch(BERRIES_URL).then((r) => { if (!r.ok) throw new Error("Could not load berry data."); return r.json() }),
      fetch(ITEMS_URL).then((r) => { if (!r.ok) throw new Error("Could not load item data."); return r.json() }),
    ])
      .then(([berryData, itemData]: [BerryData[], ItemData[]]) => { setBerries(berryData); setItems(itemData) })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const itemById = (id: number) => items.find((item) => item.id === id)
  const berryById = (id: number) => berries.find((berry) => berry.item_id === id)
  const itemName = (id: number) => itemById(id)?.en_name || `Berry #${id}`

  const seeds = useMemo<SeedData[]>(() => items
    .filter((item) => item.category === 3)
    .map((item) => {
      const parts = item.key.split("-").slice(0, -1)
      return { ...item, value: parts[0]?.includes("plain") ? 1 : 2, type: parts[1] || "" }
    }), [items])

  const sortedBerries = useMemo(() => [...berries]
    .sort((a, b) => itemName(a.item_id).localeCompare(itemName(b.item_id)))
    .sort((a, b) => Number(favorites.includes(b.item_id)) - Number(favorites.includes(a.item_id))), [berries, favorites, items])

  const addBerry = (id: number) => setPlants((current) => [...current, { _id: Date.now(), id, tsPlant: Date.now(), tsLastWater: Date.now() }])
  const removeBerry = (_id: number) => setPlants((current) => current.filter((berry) => berry._id !== _id))
  const waterBerry = (_id: number) => {
    setPlants((current) => current.map((berry) => berry._id === _id ? { ...berry, tsLastWater: Date.now() } : berry))
    setJustWatered((current) => ({ ...current, [_id]: true }))
    window.setTimeout(() => setJustWatered((current) => ({ ...current, [_id]: false })), 700)
  }
  const toggleFavorite = (id: number) => setFavorites((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id])

  return (
    <section className="mx-auto w-full max-w-[1168px] px-4 pb-16 pt-4 sm:px-6 lg:px-8">
      <div className="border-b border-white/15 pb-3 text-sm text-mist-400"><span className="text-mist-300">Home</span><span className="mx-2">/</span><span className="text-mist-300">Tools</span><span className="mx-2">/</span><span className="text-mist-500">Berries Helper</span></div>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-[38px]">Berries Helper</h1>
      <p className="mt-1 text-sm text-mist-400">Choose your berry and see when you've to water it and harvest it.</p>

      {loading ? <div className="mt-6 rounded-md bg-[#20252b] p-8 text-center text-sm text-mist-400">Loading berries...</div> : error ? <div className="mt-6 rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div> : <>
        <div className="mt-6 rounded-md border border-white/10 bg-[#20252b] p-5">
          {plants.length === 0 ? <div><h2 className="text-lg font-semibold text-white">No berries planted.</h2><button type="button" onClick={() => listRef.current?.scrollIntoView({ behavior: "smooth" })} className="mt-3 rounded-md bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-300">Start now</button></div> : <>
            <h2 className="text-xl font-semibold text-white">Your berries</h2>
            <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[720px] text-sm"><thead><tr className="border-b border-white/10 text-left text-mist-400"><th className="px-3 py-2">Berry name</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Ready</th><th className="px-3 py-2">Actions</th></tr></thead><tbody>
              {plants.map((planted) => { const berry = berryById(planted.id); if (!berry) return null; const ready = planted.tsPlant + berry.grow_time * 3600000; const firstWater = planted.tsPlant === planted.tsLastWater; const wateredNow = justWatered[planted._id]; return <tr key={planted._id} className={`border-b border-white/5 ${wateredNow ? "animate-row-flash" : ""}`}><td className="px-3 py-3"><img src={`${ICON_URL}${planted.id}.png`} alt="" className="mr-2 inline-block h-7 w-7 align-middle" />{itemName(planted.id)}</td><td className="px-3 py-3"><span className={`inline-flex gap-1 ${wateredNow ? "animate-water-pulse" : ""}`}>{[0,1,2,3,4].map((i) => { const state = dropletState(berry, planted.tsPlant, planted.tsLastWater, now, i); return <Droplets key={i} className={`h-5 w-5 ${wateredNow ? "text-sky-400" : state === "filled" ? "text-mist-100" : state === "red" ? "text-red-400 animate-droplet-blink" : "text-mist-600"}`} /> })}</span><div className="mt-1 text-xs text-mist-500">{firstWater ? "Still not watered" : `Watered: ${formatDiff(now - planted.tsLastWater)} ago`}</div></td><td className="px-3 py-3 text-mist-200">{now >= ready ? "Ready" : formatDiff(ready - now)}</td><td className="px-3 py-3"><div className="flex gap-2"><button type="button" onClick={() => waterBerry(planted._id)} className="flex items-center gap-1.5 rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-500"><Droplet className="h-3.5 w-3.5" />Water</button><button type="button" onClick={() => removeBerry(planted._id)} className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500">Remove</button></div></td></tr> })}
            </tbody></table></div>
          </>}
        </div>

        <div ref={listRef} className="mt-4 flex flex-wrap items-stretch gap-4">
          {sortedBerries.map((berry) => {
            const favorite = favorites.includes(berry.item_id)
            return <article key={berry.item_id} className="flex min-w-[280px] flex-[1_1_300px] flex-col rounded-md border border-white/10 bg-[#20252b] p-4">
              <div className="mb-3 flex items-center gap-2"><img src={`${ICON_URL}${berry.item_id}.png`} alt="" className="h-10 w-10 object-contain" /><h2 className="mb-0 text-base font-semibold text-white">{itemName(berry.item_id)}</h2><button type="button" onClick={() => toggleFavorite(berry.item_id)} className="ml-auto rounded p-1 text-mist-500 hover:text-red-400" title="Favorite"><Heart size={23} fill={favorite ? "currentColor" : "none"} className={favorite ? "text-red-400" : ""} /></button></div>
              <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-mist-300"><strong>Seeds required:</strong>{BERRIES_DEGREES.map((degree) => { const amount = berry[degree.key]; if (!amount) return null; const seed = seeds.find((s) => s.type === degree.label.toLowerCase()); return <span key={degree.key} title={degree.label} className="inline-flex items-center gap-1">{seed && <img src={`${ICON_URL}${seed.id}.png`} alt={degree.label} className="h-6 w-6" />} {amount}</span> })}</div>
              <div className="space-y-1 text-sm text-mist-300"><div>Grow time: {berry.grow_time}h</div><div>Return: {berry.min_harvest} to {berry.max_harvest} berries.</div></div>
              <button type="button" onClick={() => addBerry(berry.item_id)} className="mt-4 self-start rounded-md bg-amber-400 px-3 py-1.5 text-sm font-semibold text-slate-950 hover:bg-amber-300">Plant</button>
            </article>
          })}
        </div>
      </>}
    </section>
  )
}
