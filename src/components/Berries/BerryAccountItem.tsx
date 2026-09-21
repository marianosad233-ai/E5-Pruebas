import { Droplet } from "lucide-react"
import { useEffect, useState } from "react"
import type { BerryData } from "./berries.types"
import { useBerries } from "./BerriesContext"
import { convertDiffToString, diffTimestamp, getMsFromHour } from "./BerryTime"

function getDropletState(hours:number,limit:number,long:boolean){if(!long&&hours<=-10)return "dry";if(hours<=-15)return "dry";if(hours<=limit)return "empty";return "filled"}

export function BerryAccountItem({planted,berry,itemName}:{planted:{_id:number;id:number;tsPlant:number;tsLastWater:number};berry:BerryData;itemName:(id:number)=>string}){
 const {waterBerry,removeBerry}=useBerries(); const [now,setNow]=useState(Date.now())
 useEffect(()=>{const id=window.setInterval(()=>setNow(Date.now()),60000);return()=>window.clearInterval(id)},[])
 const justPlanted=planted.tsPlant===planted.tsLastWater
 // En PokeMMO Hub, una baya recién plantada comienza siempre con 2 gotas.
 // No calculamos el nivel de agua por tiempo durante este estado inicial.
 const timeFromWater=justPlanted?diffTimestamp(planted.tsLastWater,now):diffTimestamp(planted.tsLastWater,now)
 const timeToReady=diffTimestamp(planted.tsPlant+getMsFromHour(berry.grow_time),now)
 const long=berry.grow_time===42||berry.grow_time===44||berry.grow_time===67
 const hours=long?timeFromWater.hour:timeFromWater.hour+1
 return <tr className="border-b border-white/5"><td className="px-3 py-3"><img className="mr-2 inline-block h-7 w-7 align-middle" src={`${import.meta.env.BASE_URL}item/${berry.item_id}.png`} alt=""/>{itemName(berry.item_id)}</td><td className="px-3 py-3"><span className="inline-flex gap-1">{Array.from({length:5},(_,index)=>{
 const state=justPlanted?(index<2?"filled":"empty"):getDropletState(hours,long?-15+index*3:-10+index*2,long)
 return <Droplet key={index} className={`h-5 w-5 ${state==="filled"?"text-mist-100":state==="dry"?"text-red-400 animate-pulse":"text-mist-600"}`} fill={state==="filled"?"currentColor":"none"}/>
})}</span><div className="mt-1 text-xs text-mist-500">{timeFromWater.isJustCalc?"Still not watered":`watered: ${convertDiffToString(timeFromWater)}`}</div></td><td className="px-3 py-3 text-mist-200">{convertDiffToString(timeToReady)}</td><td className="px-3 py-3"><div className="flex gap-2"><button type="button" onClick={()=>waterBerry(planted._id)} className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-500">Water</button><button type="button" onClick={()=>removeBerry(planted._id)} className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500">Remove</button></div></td></tr>
}
