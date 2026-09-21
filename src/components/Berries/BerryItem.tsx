import { Heart } from "lucide-react"
import { useBerries } from "./BerriesContext"
import type { BerryData, SeedData } from "./berries.types"

export function BerryItem({berry,seeds,itemName}:{berry:BerryData;seeds:SeedData[];itemName:(id:number)=>string}){
 const {favorites,toggleFavorite,addBerry}=useBerries(); const favorite=favorites.includes(berry.item_id)
 const degrees=[['bitter_degree','Bitter'],['dry_degree','Dry'],['sour_degree','Sour'],['spicy_degree','Spicy'],['sweet_degree','Sweet']] as const
 return <article className="flex min-w-[280px] flex-[1_1_300px] flex-col rounded-md border border-white/10 bg-[#20252b] p-4">
  <div className="mb-3 flex items-center gap-2"><img src={`/item/${berry.item_id}.png`} alt="" className="h-10 w-10 object-contain"/><h2 className="text-base font-semibold text-white">{itemName(berry.item_id)}</h2><button type="button" onClick={()=>toggleFavorite(berry.item_id)} className="ml-auto rounded p-1 text-mist-500 hover:text-red-400" title="Favorite"><Heart size={23} fill={favorite?"currentColor":"none"} className={favorite?"text-red-400":""}/></button></div>
  <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-mist-300"><strong>Seeds required:</strong>{degrees.map(([key,label])=>{const amount=berry[key];if(!amount)return null;const seed=seeds.find(s=>s.type===label.toLowerCase());return <span key={key} className="inline-flex items-center gap-1"><img src={`/item/${seed?.id??0}.png`} alt={label} className="h-6 w-6"/>{amount}</span>})}</div>
  <div className="space-y-1 text-sm text-mist-300"><div>Grow time: {berry.grow_time}h</div><div>Return: {berry.min_harvest} to {berry.max_harvest} berries.</div></div>
  <button type="button" onClick={()=>addBerry(berry.item_id)} className="mt-4 self-start rounded-md bg-amber-400 px-3 py-1.5 text-sm font-semibold text-slate-950 hover:bg-amber-300">Plant</button>
 </article>
}
