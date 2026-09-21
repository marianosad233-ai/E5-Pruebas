import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type PlantedBerry = { _id: number; id: number; tsPlant: number; tsLastWater: number }
type BerryContextValue = { planted: PlantedBerry[]; favorites: number[]; addBerry: (id:number)=>void; removeBerry:(id:number)=>void; waterBerry:(id:number)=>void; toggleFavorite:(id:number)=>void }
const Context = createContext<BerryContextValue | null>(null)
const STORAGE = "berriesAccount"
const FAVORITES = "berriesFavorites"

export function BerriesProvider({children}:{children:ReactNode}) {
  const [planted,setPlanted] = useState<PlantedBerry[]>([])
  const [favorites,setFavorites] = useState<number[]>([])
  useEffect(()=>{try{const p=localStorage.getItem(STORAGE);const f=localStorage.getItem(FAVORITES);if(p)setPlanted(JSON.parse(p));if(f)setFavorites(JSON.parse(f))}catch{/* localStorage vacío o corrupto: se ignora y se arranca de cero */}}
  ,[])
  useEffect(()=>{localStorage.setItem(STORAGE,JSON.stringify(planted))},[planted])
  useEffect(()=>{localStorage.setItem(FAVORITES,JSON.stringify(favorites))},[favorites])
  return <Context.Provider value={{
    planted,
    favorites,
    addBerry:(id)=>{const now=Date.now();setPlanted(p=>[...p,{_id:now+Math.random(),id,tsPlant:now,tsLastWater:now}])},
    removeBerry:(id)=>setPlanted(p=>p.filter(x=>x._id!==id)),
    waterBerry:(id)=>setPlanted(p=>p.map(x=>x._id===id?{...x,tsLastWater:Date.now()}:x)),
    toggleFavorite:(id)=>setFavorites(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]),
  }}>{children}</Context.Provider>
}
export function useBerries(){const value=useContext(Context);if(!value)throw new Error("useBerries must be used inside BerriesProvider");return value}
