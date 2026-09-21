import { useMemo, useState } from "react"
import { HelpCircle } from "lucide-react"
import { BreedingProvider, useBreeding } from "./Breeding/BreedingContext"
import type { IvKey } from "./Breeding/breeding.types"
import { FormItemBreeding } from "./Breeding/FormItemBreeding"
import { BreedingList } from "./Breeding/BreedingList"

const FORM_VALUES = {
  nature: { 2: [2,1,0,0,0], 3: [4,2,1,0,0], 4: [6,5,3,1,0], 5: [2,11,10,6,2] },
  random: { 2: [1,1,0,0,0], 3: [2,1,1,0,0], 4: [2,3,2,1,0], 5: [2,5,5,3,1] },
} as const
const COSTS = { nature: {2:75000,3:170000,4:355000,5:715000}, random: {2:20000,3:65000,4:155000,5:340000} } as const
const DEFAULT: IvKey[] = ["hp","atk","def","spdef","spe"]

function BreedingContent() {
  const { breedingConfig, setBreedingConfig, clearBreeding } = useBreeding()
  const [showHelp, setShowHelp] = useState(false)
  const [error, setError] = useState(false)
  const groups = useMemo(() => (breedingConfig.nature ? FORM_VALUES.nature : FORM_VALUES.random)[breedingConfig.ivsCount], [breedingConfig.nature, breedingConfig.ivsCount])
  const totalPokemon = groups.reduce<number>((a,b) => a+b, 0)
  const expectedPrice = (breedingConfig.nature ? COSTS.nature : COSTS.random)[breedingConfig.ivsCount]
  const values = Array.from({length: 5}, (_,i) => (breedingConfig.iv[i+1] as IvKey | false) || DEFAULT[i])

  const updateCount = (count: 2|3|4|5) => { setBreedingConfig({ ivsCount: count, isBreeding: false, iv: {} }); setError(false) }
  const updateNature = () => { setBreedingConfig({ nature: !breedingConfig.nature, isBreeding: false }); setError(false) }
  const updateStat = (index: number, value: IvKey) => setBreedingConfig({ isBreeding: false, iv: { ...breedingConfig.iv, [index+1]: value } })
  const start = () => {
    const active = values.slice(0, breedingConfig.ivsCount)
    if (new Set(active).size !== active.length) { setError(true); return }
    const iv: Record<number,IvKey> = {}
    active.forEach((value,index) => { iv[index+1] = value })
    setBreedingConfig({ isBreeding: true, iv })
  }
  const clear = () => { clearBreeding(); setError(false) }

  return <section className="mx-auto w-full max-w-[1168px] px-4 pb-16 pt-4 sm:px-6 lg:px-8">
    <div className="border-b border-white/15 pb-3 text-sm text-mist-400"><span className="text-mist-300">Home</span><span className="mx-2">/</span><span className="text-mist-300">Tools</span><span className="mx-2">/</span><span>Breeding Simulator</span></div>
    <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-[38px]">Breeding Simulator</h1>
    <button type="button" onClick={() => setShowHelp(v => !v)} className="mt-3 inline-flex items-center gap-2 rounded-md bg-cyan-400 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-300"><HelpCircle className="h-4 w-4" />How to use the breeding tool</button>
    {showHelp && <div className="mt-3 max-w-3xl rounded-md bg-[#20252b] p-4 text-sm leading-6 text-mist-300">Choose how many IVs you want, decide whether nature matters, assign a different IV to every group and press Start breeding. Click a circle to mark that breeding path as completed; clicking it again removes the highlighted path.</div>}
    <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-8">
      <div><p className="mb-2 text-sm text-mist-300">How many IVs do you want?</p><div className="inline-flex overflow-hidden rounded-md border border-white/10 bg-[#59616a]">{([2,3,4,5] as const).map(count => <button key={count} type="button" onClick={() => updateCount(count)} className={`min-w-[39px] px-3 py-2 text-sm font-medium ${breedingConfig.ivsCount === count ? "bg-[#6f7882] text-white" : "text-white/90 hover:bg-white/10"}`}>{count}</button>)}</div></div>
      <label className="flex cursor-pointer items-center gap-2 pb-1 text-sm text-mist-300"><input type="checkbox" checked={breedingConfig.nature} onChange={updateNature} className="h-4 w-4 accent-cyan-400" />Consider nature in breeding project?</label>
    </div>
    <div className="mt-3 flex flex-wrap gap-6">{groups.map((count,index) => <FormItemBreeding key={index} id={`iv${index+1}`} ivCount={count} value={values[index]} onChange={value => updateStat(index,value)} />)}</div>
    <div className="mt-3 rounded-md border border-white/5 bg-[#20252b] px-5 py-5 text-sm leading-6 text-mist-300">For this Pokémon you will spend <strong className="text-white">{expectedPrice.toLocaleString("en-US")}$</strong> and you may need <strong className="text-white">{totalPokemon}</strong> Pokémon.<br />Price calculations are based only on the breeding items cost, gender choice and everstone. Keep in consideration that some Pokémon has a higher cost for gender choices.</div>
    {error && <div className="mt-3 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">You can't have the same stats in multiple IVs field.</div>}
    <div className="mt-6 flex gap-3"><button type="button" onClick={start} className="rounded-md bg-[#68727d] px-3 py-2 text-sm font-medium text-white hover:bg-[#77838f]">Start breeding</button><button type="button" onClick={clear} className="rounded-md border border-red-500 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10">Clear</button></div>
    {breedingConfig.isBreeding && <BreedingList />}
  </section>
}

export default function BreedingCalculator() { return <BreedingProvider><BreedingContent /></BreedingProvider> }
