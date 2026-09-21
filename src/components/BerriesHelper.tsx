import { useEffect, useMemo, useState } from "react"
import { Droplet, Heart } from "lucide-react"
import hubData from "../data/berriesHub.json"

interface BerryData { item_id:number; bitter_degree:number; dry_degree:number; sour_degree:number; spicy_degree:number; sweet_degree:number; first_water_time:number; other_water_time:number; grow_time:number; wither_time:number; min_harvest:number; max_harvest:number }
interface ItemData { id:number; en_name:string }
interface SeedData { id:number; key:string; en_name:string }
interface PlantedBerry { _id:number; id:number; tsPlant:number; tsLastWater:number }

const berries = hubData.berries as BerryData[]
const items = hubData.items as ItemData[]
const seeds = hubData.seeds as SeedData[]
const STORAGE = "berriesAccount"
const FAVORITES = "berriesFavorites"
const degrees = [
  { key:"bitter_degree", label:"Bitter" }, { key:"dry_degree", label:"Dry" }, { key:"sour_degree", label:"Sour" }, { key:"spicy_degree", label:"Spicy" }, { key:"sweet_degree", label:"Sweet" },
] as const

const itemName = (id:number) => items.find((item) => item.id === id)?.en_name ?? `Berry #${id}`
// PokeMMO Hub serves these exact icons from /item/<id>.png.
const icon = (id:number) => `/item/${id}.png`
const formatDiff = (ms:number) => {
  const minutes = Math.max(0, Math.round(Math.abs(ms) / 60000))
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  const mins = minutes % 60
  const parts:string[] = []
  if (days) parts.push(`${days}d`)
  if (hours) parts.push(`${hours}h`)
  if (mins || !parts.length) parts.push(`${mins}m`)
  return parts.join(" ")
}

function dropletState(berry:BerryData, plant:number, water:number, now:number, index:number) {
  // The Hub starts a newly planted berry with exactly two filled droplets.
  if (plant === water) return index < 2 ? "filled" : "empty"
  const elapsed = (now - water) / 3600000
  const long = berry.grow_time === 42 || berry.grow_time === 44 || berry.grow_time === 67
  const hour = long ? elapsed : elapsed + 1
  const floor = long ? -15 : -10
  const limit = long ? -15 + index * 3 : -10 + index * 2
  if (hour <= floor) return "red"
  if (hour <= limit) return "empty"
  return "filled"
}

export default function BerriesHelper() {
  const [plants,setPlants] = useState<PlantedBerry[]>([])
  const [favorites,setFavorites] = useState<number[]>([])
  const [now,setNow] = useState(Date.now())
  const [justWatered,setJustWatered] = useState<Record<number,boolean>>({})

  useEffect(() => { try { const p=localStorage.getItem(STORAGE); const f=localStorage.getItem(FAVORITES); if(p) setPlants(JSON.parse(p)); if(f) setFavorites(JSON.parse(f)) } catch {} },[])
  useEffect(() => { localStorage.setItem(STORAGE,JSON.stringify(plants)) },[plants])
  useEffect(() => { localStorage.setItem(FAVORITES,JSON.stringify(favorites)) },[favorites])
  useEffect(() => { const id=window.setInterval(()=>setNow(Date.now()),60000); return ()=>window.clearInterval(id) },[])

  const berryById = (id:number) => berries.find((berry)=>berry.item_id===id)
  const sorted = useMemo(() => [...berries].sort((a,b)=>itemName(b.item_id).toLowerCase().localeCompare(itemName(a.item_id).toLowerCase())).sort((a,b)=>Number(favorites.includes(b.item_id))-Number(favorites.includes(a.item_id))),[favorites])
  const addBerry=(id:number)=>{ const t=Date.now(); setPlants((p)=>[...p,{_id:t+Math.random(),id,tsPlant:t,tsLastWater:t}]) }
  const removeBerry=(id:number)=>setPlants((p)=>p.filter((x)=>x._id!==id))
  const waterBerry=(id:number)=>{setPlants((p)=>p.map((x)=>x._id===id?{...x,tsLastWater:Date.now()}:x));setJustWatered((p)=>({...p,[id]:true}));window.setTimeout(()=>setJustWatered((p)=>({...p,[id]:false})),700)}
  const toggleFavorite=(id:number)=>setFavorites((p)=>p.includes(id)?p.filter((x)=>x!==id):[...p,id])

  return <section className="mx-auto w-full max-w-[1168px] px-4 pb-16 pt-4 sm:px-6 lg:px-8">
    <div className="border-b border-white/15 pb-3 text-sm text-mist-400"><span className="text-mist-300">Home</span><span className="mx-2">/</span><span className="text-mist-300">Tools</span><span className="mx-2">/</span><span className="text-mist-500">Berries Helper</span></div>
    <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-[38px]">Berries Helper</h1>
    <p className="mt-1 text-sm text-mist-400">Choose your berry and see when you've to water it and harvest it.</p>

    <div className="mt-6 rounded-md border border-white/10 bg-[#20252b] p-5">
      {!plants.length ? <><h2 className="text-lg font-semibold text-white">No berries planted.</h2><button type="button" onClick={()=>document.getElementById("berry-list")?.scrollIntoView({behavior:"smooth"})} className="mt-3 rounded-md bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-300">Start now</button></> : <>
        <h2 className="text-xl font-semibold text-white">Your berries</h2>
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[720px] text-sm"><thead><tr className="border-b border-white/10 text-left text-mist-400"><th className="px-3 py-2">Berry name</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Ready</th><th className="px-3 py-2">Actions</th></tr></thead><tbody>
          {plants.map((plant)=>{const berry=berryById(plant.id);if(!berry)return null;const ready=plant.tsPlant+berry.grow_time*3600000;const first=plant.tsPlant===plant.tsLastWater;return <tr key={plant._id} className="border-b border-white/5"><td className="px-3 py-3"><img src={icon(plant.id)} alt="" className="mr-2 inline-block h-7 w-7 align-middle" />{itemName(plant.id)}</td><td className="px-3 py-3"><span className="inline-flex gap-1">{[0,1,2,3,4].map((i)=>{const state=dropletState(berry,plant.tsPlant,plant.tsLastWater,now,i);return <Droplet key={i} className={`h-5 w-5 ${justWatered[plant._id]||state==="filled"?"text-mist-100":state==="red"?"text-red-400 animate-pulse":"text-mist-600"}`} fill={justWatered[plant._id]||state==="filled"?"currentColor":"none"}/>})}</span><div className="mt-1 text-xs text-mist-500">{first?"Still not watered":`Watered: ${formatDiff(now-plant.tsLastWater)} ago`}</div></td><td className="px-3 py-3 text-mist-200">{now>=ready?"Ready":formatDiff(ready-now)}</td><td className="px-3 py-3"><div className="flex gap-2"><button type="button" onClick={()=>waterBerry(plant._id)} className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-500">Water</button><button type="button" onClick={()=>removeBerry(plant._id)} className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500">Remove</button></div></td></tr>})}
        </tbody></table></div>
      </>}
    </div>

    <div id="berry-list" className="mt-4 flex flex-wrap items-stretch gap-4">
      {sorted.map((berry)=>{const favorite=favorites.includes(berry.item_id);return <article key={berry.item_id} className="flex min-w-[280px] flex-[1_1_300px] flex-col rounded-md border border-white/10 bg-[#20252b] p-4"><div className="mb-3 flex items-center gap-2"><img src={icon(berry.item_id)} alt="" className="h-10 w-10 object-contain"/><h2 className="text-base font-semibold text-white">{itemName(berry.item_id)}</h2><button type="button" onClick={()=>toggleFavorite(berry.item_id)} className="ml-auto rounded p-1 text-mist-500 hover:text-red-400" title="Favorite"><Heart size={23} fill={favorite?"currentColor":"none"} className={favorite?"text-red-400":""}/></button></div><div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-mist-300"><strong>Seeds required:</strong>{degrees.map((degree)=>{const amount=berry[degree.key];if(!amount)return null;const type=degree.label.toLowerCase();const seed=seeds.find((s)=>s.key.startsWith(`plain-${type}-`) || s.key.startsWith(`very-${type}-`));return <span key={degree.key} className="inline-flex items-center gap-1"><img src={icon(seed?.id??0)} alt={degree.label} className="h-6 w-6"/>{amount}</span>})}</div><div className="space-y-1 text-sm text-mist-300"><div>Grow time: {berry.grow_time}h</div><div>Return: {berry.min_harvest} to {berry.max_harvest} berries.</div></div><button type="button" onClick={()=>addBerry(berry.item_id)} className="mt-4 self-start rounded-md bg-amber-400 px-3 py-1.5 text-sm font-semibold text-slate-950 hover:bg-amber-300">Plant</button></article>})}
    </div>
  </section>
}
