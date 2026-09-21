import { useMemo, useState } from "react"
import { HelpCircle } from "lucide-react"
import breedingTable from "../data/breedingTable.json"
import styles from "./breeding.module.css"

const IVS = [
  { key: "hp", label: "HP" },
  { key: "atk", label: "Attack" },
  { key: "def", label: "Defense" },
  { key: "spa", label: "Sp. Attack" },
  { key: "spd", label: "Sp. Defense" },
  { key: "spe", label: "Speed" },
] as const

type IvKey = typeof IVS[number]["key"]
type Token = number

const LABELS = Object.fromEntries(IVS.map((iv) => [iv.key, iv.label])) as Record<IvKey, string>
const COLORS: Record<string, string> = {
  hp: "#66d9a6", atk: "#f26b6b", def: "#e8a95a", spa: "#63a9f5", spd: "#a78bfa", spe: "#f4d35e", nat: "#9ca3af",
}
const COSTS = { random: { 2: 20000, 3: 65000, 4: 155000, 5: 340000 }, nature: { 2: 75000, 3: 170000, 4: 355000, 5: 715000 } } as const
const COUNTS = {
  random: { 2: [1, 1], 3: [2, 1, 1], 4: [2, 3, 2, 1], 5: [2, 5, 5, 3, 1] },
  nature: { 2: [2, 1, 1], 3: [4, 2, 1], 4: [6, 5, 3, 1], 5: [2, 11, 10, 6, 2] },
} as const

const getTable = (nature: boolean, count: 2 | 3 | 4 | 5) => {
  const table = breedingTable[nature ? "nature" : "random"] as Record<string, Record<string, number[][]>>
  return table[`iv${count}`]
}

export default function BreedingCalculator() {
  const [ivCount, setIvCount] = useState<2 | 3 | 4 | 5>(5)
  const [nature, setNature] = useState(false)
  const [selected, setSelected] = useState<IvKey[]>(["hp", "atk", "def", "spd", "spe"])
  const [started, setStarted] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [bred, setBred] = useState<Set<string>>(new Set())
  const [error, setError] = useState("")

  const groups = useMemo(() => (nature ? COUNTS.nature : COUNTS.random)[ivCount], [nature, ivCount])
  const table = useMemo(() => getTable(nature, ivCount), [nature, ivCount])
  const totalRows = Object.keys(table).length
  const totalPokemon = groups.reduce((sum, value) => sum + value, 0)
  const expectedPrice = (nature ? COSTS.nature : COSTS.random)[ivCount]

  const changeCount = (count: 2 | 3 | 4 | 5) => {
    const defaults: IvKey[] = ["hp", "atk", "def", "spd", "spe"]
    setSelected(defaults.slice(0, count))
    setIvCount(count)
    setStarted(false); setError(""); setBred(new Set())
  }

  const changeStat = (index: number, value: IvKey) => {
    setSelected((current) => current.map((stat, i) => i === index ? value : stat))
    setStarted(false); setError(""); setBred(new Set())
  }

  const startBreeding = () => {
    const active = selected.slice(0, ivCount)
    if (new Set(active).size !== active.length) {
      setError("You cannot have the same stats in multiple IV fields.")
      return
    }
    setError(""); setStarted(true); setBred(new Set())
  }

  const clear = () => {
    setIvCount(5); setNature(false); setSelected(["hp", "atk", "def", "spd", "spe"])
    setStarted(false); setError(""); setBred(new Set())
  }

  const toggleBred = (row: number, col: number) => {
    const key = `${row}-${col}`
    setBred((current) => {
      const next = new Set(current)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  return <section className="mx-auto w-full max-w-[1168px] px-4 pb-16 pt-4 sm:px-6 lg:px-8">
    <div className="border-b border-white/15 pb-3 text-sm text-mist-400"><span className="text-mist-300">Home</span><span className="mx-2">/</span><span className="text-mist-300">Tools</span><span className="mx-2">/</span><span className="text-mist-500">Breeding Simulator</span></div>
    <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-[38px]">Breeding Simulator</h1>
    <button type="button" onClick={() => setShowHelp((v) => !v)} className="mt-3 inline-flex items-center gap-2 rounded-md bg-cyan-400 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-300"><HelpCircle className="h-4 w-4" /> How to use the breeding tool</button>
    {showHelp && <div className="mt-3 max-w-3xl rounded-md bg-[#20252b] p-4 text-sm leading-6 text-mist-300">Choose how many IVs you want, decide whether nature matters, assign a different IV to every group and press Start breeding. Click a circle when that breeding step is complete.</div>}

    <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-8">
      <div><p className="mb-2 text-sm text-mist-300">How many IVs do you want?</p><div className="inline-flex overflow-hidden rounded-md border border-white/10 bg-[#59616a]">{[2,3,4,5].map((count) => <button key={count} type="button" onClick={() => changeCount(count as 2|3|4|5)} className={`min-w-[39px] px-3 py-2 text-sm font-medium ${ivCount === count ? "bg-[#6f7882] text-white" : "text-white/90 hover:bg-white/10"}`}>{count}</button>)}</div></div>
      <label className="flex cursor-pointer items-center gap-2 pb-1 text-sm text-mist-300"><input type="checkbox" checked={nature} onChange={(e) => { setNature(e.target.checked); setStarted(false); setError(""); setBred(new Set()) }} className="h-4 w-4 accent-cyan-400" /> Consider nature in breeding project?</label>
    </div>

    <div className="mt-3 flex flex-wrap gap-6">{groups.map((count, index) => <label key={index} className="min-w-[190px] flex-1"><span className="mb-1 block text-sm text-mist-300"><strong className="text-base text-white">{count}</strong> 1x31 IV in...</span><select value={selected[index] ?? "hp"} onChange={(e) => changeStat(index, e.target.value as IvKey)} className="w-full rounded-md border border-white/20 bg-[#66707a] px-3 py-2 text-sm text-white outline-none focus:border-cyan-300">{IVS.map((iv) => <option key={iv.key} value={iv.key}>{iv.label}</option>)}</select></label>)}</div>

    <div className="mt-3 rounded-md border border-white/5 bg-[#20252b] px-5 py-5 text-sm leading-6 text-mist-300">For this Pokémon you will spend <strong className="text-white">{expectedPrice.toLocaleString("en-US")}$</strong> and you may need <strong className="text-white">{totalPokemon}</strong> Pokémon.<br />Price calculations are based only on the breeding items cost, gender choice and everstone. Keep in consideration that some Pokémon has a higher cost for gender choices.</div>
    {error && <div className="mt-3 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
    <div className="mt-6 flex gap-3"><button type="button" onClick={startBreeding} className="rounded-md bg-[#68727d] px-3 py-2 text-sm font-medium text-white hover:bg-[#77838f]">Start breeding</button><button type="button" onClick={clear} className="rounded-md border border-red-500 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10">Clear</button></div>

    {started && <div className="mt-4 overflow-x-auto rounded-md bg-[#20252b] p-5"><div className="flex min-w-[550px] flex-col gap-6" style={{ minWidth: totalRows >= 7 ? 800 : totalRows >= 6 ? 550 : undefined }}>
      <div className="flex justify-center gap-5 text-xs text-mist-300">{selected.slice(0, ivCount).map((stat) => <div key={stat} className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: COLORS[stat] }} />{LABELS[stat]}</div>)}{nature && <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: COLORS.nat }} />Nature</div>}</div>
      {Object.entries(table).map(([rowKey, values], rowIndex) => <div key={rowKey} className={`d-flex ${styles.breedingRows}`} style={{ gap: ".5rem" }}>
        {values.map((tokens, colIndex) => {
          const sizeRem = (3 / totalRows * rowIndex + 1)
          const key = `${rowIndex + 1}-${colIndex}`
          const isBred = bred.has(key)
          const ivSet = tokens.map((token: Token) => token === 0 ? "nat" : selected[token - 1] ?? "")
          const isOdd = colIndex % 2 === 0
          return <div key={key} style={{ flexBasis: `${100 / values.length}%` }} className={styles.breedingItem}>
            <button type="button" title={ivSet.map((token) => token === "nat" ? "Nature" : LABELS[token as IvKey]).join(" ")} onClick={() => toggleBred(rowIndex + 1, colIndex)} className="mx-auto flex overflow-hidden rounded-full p-0 transition hover:scale-105" style={{ width: `${sizeRem}rem`, height: `${sizeRem}rem`, border: isBred ? `${(rowIndex + 1) * 2}px solid #a2f79f` : "none", gap: 0 }}>
              {ivSet.map((token, i) => <span key={`${token}-${i}`} className="h-full flex-1" style={{ background: COLORS[token] }} />)}
            </button>
            {isOdd ? <div className={styles.breedingTournamentRow} style={{ width: `calc(100% - ${(sizeRem) / 2}rem)`, left: `calc(50% + ${(sizeRem) / 2}rem)` }} /> : <div className={styles.breedingTournamentCol} style={{ left: "-.35rem" }} />}
          </div>
        })}
      </div>)}
    </div></div>}
  </section>
}
