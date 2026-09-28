import { useMemo, useState } from "react"
import { Calculator, Sprout } from "lucide-react"
import hubData from "../data/berriesHub.json"
import { BerriesProvider, useBerries } from "./Berries/BerriesContext"
import { BerryAccountItem } from "./Berries/BerryAccountItem"
import { BerryItem } from "./Berries/BerryItem"
import type { BerryData, ItemData, SeedData } from "./Berries/berries.types"
import BerryCalculator from "./BerryCalculator"

const berries=hubData.berries as BerryData[]
const items=hubData.items as ItemData[]
const seeds:SeedData[]=(hubData.seeds as {id:number;key:string;en_name:string}[]).map(seed=>{
 const parts=seed.key.split("-").slice(0,-1) // quita el "seed" final, deja ["plain","sour"] o ["very","spicy"]
 return {id:seed.id,en_name:seed.en_name,type:parts[1]??parts[0]??""}
})
const itemName=(id:number)=>items.find(item=>item.id===id)?.en_name??`Berry #${id}`

function BerriesContent(){
 const [view, setView] = useState<"helper" | "calculator">("helper")
 const {planted,favorites}=useBerries()
 const sorted=useMemo(()=>[...berries].map(berry=>({...berry,en_name:itemName(berry.item_id)})).sort((a,b)=>a.en_name.toLowerCase()>b.en_name.toLowerCase()?-1:1).sort((a,b)=>Number(favorites.includes(b.item_id))-Number(favorites.includes(a.item_id))),[favorites])
 return <section className="mx-auto w-full max-w-[1168px] px-4 pb-16 pt-4 sm:px-6 lg:px-8">
  <div className="border-b border-white/15 pb-3 text-sm text-mist-400"><span className="text-mist-300">Home</span><span className="mx-2">/</span><span className="text-mist-300">Tools</span><span className="mx-2">/</span><span>Berries Helper</span></div>
  <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-bold tracking-tight text-white sm:text-[38px]">Berries Helper</h1><p className="mt-1 text-sm text-mist-400">Controla tus cultivos y calcula cuánto te cuesta producir tus bayas.</p></div><div className="flex rounded-xl border border-white/10 bg-[#161a24] p-1"><button type="button" onClick={()=>setView("helper")} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${view==="helper"?"bg-violet-600 text-white":"text-mist-400 hover:text-white"}`}><Sprout className="h-4 w-4"/>Mis bayas</button><button type="button" onClick={()=>setView("calculator")} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${view==="calculator"?"bg-violet-600 text-white":"text-mist-400 hover:text-white"}`}><Calculator className="h-4 w-4"/>Calculadora</button></div></div>
  {view === "calculator" ? <BerryCalculator /> : <><div className="mt-6 rounded-md border border-white/10 bg-[#20252b] p-5"><h2 className="text-xl font-semibold text-white">Your berries</h2>{planted.length===0?<p className="mt-2 text-sm text-mist-400">No berries planted.</p>:<div className="mt-4 overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead><tr className="border-b border-white/10 text-left text-mist-400"><th className="px-3 py-2">Berry name</th><th className="px-3 py-2">Water</th><th className="px-3 py-2">Ready</th><th className="px-3 py-2">Actions</th></tr></thead><tbody>{planted.map(plant=>{const berry=berries.find(item=>item.item_id===plant.id);return berry?<BerryAccountItem key={plant._id} planted={plant} berry={berry} itemName={itemName}/>:null})}</tbody></table></div>}</div>
  <div className="mt-4 flex flex-wrap items-stretch gap-4">{sorted.map(berry=><BerryItem key={berry.item_id} berry={berry} seeds={seeds} itemName={itemName}/>)}</div></>}
 </section>
}
export default function BerriesHelper(){return <BerriesProvider><BerriesContent/></BerriesProvider>}
