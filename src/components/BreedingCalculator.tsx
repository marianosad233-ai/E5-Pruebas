import { useMemo, useState } from "react"
import { HelpCircle } from "lucide-react"

const IVS = [
  { key: "hp", label: "HP" },
  { key: "atk", label: "Attack" },
  { key: "def", label: "Defense" },
  { key: "spa", label: "Sp. Attack" },
  { key: "spd", label: "Sp. Defense" },
  { key: "spe", label: "Speed" },
] as const

type IvKey = (typeof IVS)[number]["key"]
type Token = 0 | 1 | 2 | 3 | 4 | 5

const LABELS: Record<IvKey, string> = Object.fromEntries(IVS.map((iv) => [iv.key, iv.label])) as Record<IvKey, string>

// Exact breedingTable.json data used by PokeMMO Hub.
const TABLES: Record<"random" | "nature", Record<2 | 3 | 4 | 5, Token[][][]>> = {
  random: {
    2: [
      [[1], [2]],
      [[1, 2]],
    ],
    3: [
      [[1], [2], [1], [3]],
      [[1, 2], [1, 3]],
      [[1, 2, 3]],
    ],
    4: [
      [[1], [2], [1], [3], [2], [3], [2], [4]],
      [[1, 2], [1, 3], [2, 3], [2, 4]],
      [[1, 2, 3], [2, 3, 4]],
      [[1, 2, 3, 4]],
    ],
    5: [
      [[1], [2], [1], [3], [2], [3], [2], [4], [2], [3], [2], [4], [3], [4], [3], [5]],
      [[1, 2], [1, 3], [2, 3], [2, 4], [2, 3], [2, 4], [3, 4], [3, 5]],
      [[1, 2, 3], [2, 3, 4], [2, 3, 4], [3, 4, 5]],
      [[1, 2, 3, 4], [2, 3, 4, 5]],
      [[1, 2, 3, 4, 5]],
    ],
  },
  nature: {
    2: [[[0], [1], [1], [2]], [[0, 1], [1, 2]], [[0, 1, 2]]],
    3: [
      [[0], [1], [1], [2], [1], [2], [1], [3]],
      [[0, 1], [1, 2], [1, 2], [1, 3]],
      [[0, 1, 2], [1, 2, 3]],
      [[0, 1, 2, 3]],
    ],
    4: [
      [[0], [1], [1], [2], [1], [2], [1], [3], [1], [2], [1], [3], [2], [3], [2], [4]],
      [[0, 1], [1, 2], [1, 2], [1, 3], [1, 2], [1, 3], [2, 3], [2, 4]],
      [[0, 1, 2], [1, 2, 3], [1, 2, 3], [2, 3, 4]],
      [[0, 1, 2, 3], [1, 2, 3, 4]],
      [[0, 1, 2, 3, 4]],
    ],
    5: [
      [[1], [2], [1], [3], [2], [3], [2], [4], [2], [3], [2], [4], [3], [4], [3], [5], [0], [2], [2], [3], [2], [3], [2], [4], [2], [3], [2], [4], [3], [4], [3], [5]],
      [[1, 2], [1, 3], [2, 3], [2, 4], [2, 3], [2, 4], [3, 4], [3, 5], [0, 2], [2, 3], [2, 3], [2, 4], [2, 3], [2, 4], [3, 4], [3, 5]],
      [[1, 2, 3], [2, 3, 4], [2, 3, 4], [3, 4, 5], [0, 2, 3], [2, 3, 4], [2, 3, 4], [3, 4, 5]],
      [[1, 2, 3, 4], [2, 3, 4, 5], [0, 2, 3, 4], [2, 3, 4, 5]],
      [[1, 2, 3, 4, 5], [0, 2, 3, 4, 5]],
      [[1, 2, 3, 4, 5, 0]],
    ],
  },
}

const COLORS: Record<string, string> = {
  hp: "#66d9a6", atk: "#f26b6b", def: "#e8a95a", spa: "#63a9f5", spd: "#a78bfa", spe: "#f4d35e", nat: "#9ca3af",
}

const COSTS = {
  random: { 2: 20000, 3: 65000, 4: 155000, 5: 340000 },
  nature: { 2: 75000, 3: 170000, 4: 355000, 5: 715000 },
} as const

const COUNTS = {
  random: { 2: [1, 1], 3: [2, 1, 1], 4: [2, 3, 2, 1], 5: [2, 5, 5, 3, 1] },
  nature: { 2: [2, 1, 1], 3: [4, 2, 1], 4: [6, 5, 3, 1], 5: [2, 11, 10, 6, 2] },
} as const

const tokenToStat = (token: Token, selected: IvKey[]): string => token === 0 ? "nat" : (selected[token - 1] ?? "")

function makeRows(ivCount: 2 | 3 | 4 | 5, nature: boolean, selected: IvKey[]) {
  const source = TABLES[nature ? "nature" : "random"][ivCount]
  return source.map((row) => row.map((tokens) => ({ tokens: tokens.map((token) => tokenToStat(token, selected)) })))
}

export default function BreedingCalculator() {
  const [ivCount, setIvCount] = useState<2 | 3 | 4 | 5>(5)
  const [nature, setNature] = useState(false)
  const [selected, setSelected] = useState<IvKey[]>(["hp", "atk", "def", "spd", "spe"])
  const [started, setStarted] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [bred, setBred] = useState<Set<string>>(new Set())
  const [error, setError] = useState("")

  const groups = useMemo(() => (nature ? COUNTS.nature : COUNTS.random)[ivCount], [ivCount, nature])
  const totalPokemon = nature ? [0, 3, 7, 15, 31][ivCount] : [0, 2, 4, 8, 16][ivCount]
  const expectedPrice = (nature ? COSTS.nature : COSTS.random)[ivCount]
  const rows = useMemo(() => makeRows(ivCount, nature, selected), [ivCount, nature, selected])
  const totalRows = rows.length

  const changeCount = (count: 2 | 3 | 4 | 5) => {
    const defaults: IvKey[] = ["hp", "atk", "def", "spd", "spe"]
    setSelected(defaults.slice(0, count))
    setIvCount(count)
    setStarted(false)
    setError("")
    setBred(new Set())
  }

  const changeStat = (index: number, value: IvKey) => {
    setSelected((current) => current.map((stat, i) => i === index ? value : stat))
    setStarted(false)
    setError("")
    setBred(new Set())
  }

  const startBreeding = () => {
    const active = selected.slice(0, ivCount)
    if (new Set(active).size !== active.length) {
      setError("You cannot have the same stats in multiple IV fields.")
      return
    }
    setError("")
    setStarted(true)
    setBred(new Set())
  }

  const clear = () => {
    setIvCount(5)
    setNature(false)
    setSelected(["hp", "atk", "def", "spd", "spe"])
    setStarted(false)
    setError("")
    setBred(new Set())
  }

  const toggleBred = (row: number, col: number) => {
    const key = `${row}-${col}`
    setBred((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }

  return (
    <section className="mx-auto w-full max-w-[1168px] px-4 pb-16 pt-4 sm:px-6 lg:px-8">
      <div className="border-b border-white/15 pb-3 text-sm text-mist-400"><span className="text-mist-300">Home</span><span className="mx-2">/</span><span className="text-mist-300">Tools</span><span className="mx-2">/</span><span className="text-mist-500">Breeding Simulator</span></div>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-[38px]">Breeding Simulator</h1>
      <button type="button" onClick={() => setShowHelp((v) => !v)} className="mt-3 inline-flex items-center gap-2 rounded-md bg-cyan-400 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-300"><HelpCircle className="h-4 w-4" /> How to use the breeding tool</button>
      {showHelp && <div className="mt-3 max-w-3xl rounded-md bg-[#20252b] p-4 text-sm leading-6 text-mist-300">Choose how many IVs you want, decide whether nature matters, assign a different IV to every group and press Start breeding. Click a circle when that breeding step is complete.</div>}

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-8">
        <div><p className="mb-2 text-sm text-mist-300">How many IVs do you want?</p><div className="inline-flex overflow-hidden rounded-md border border-white/10 bg-[#59616a]">{[2,3,4,5].map((count) => <button key={count} type="button" onClick={() => changeCount(count as 2|3|4|5)} className={`min-w-[39px] px-3 py-2 text-sm font-medium ${ivCount === count ? "bg-[#6f7882] text-white" : "text-white/90 hover:bg-white/10"}`}>{count}</button>)}</div></div>
        <label className="flex cursor-pointer items-center gap-2 pb-1 text-sm text-mist-300"><input type="checkbox" checked={nature} onChange={(e) => { setNature(e.target.checked); setStarted(false); setError(""); setBred(new Set()) }} className="h-4 w-4 accent-cyan-400" /> Consider nature in breeding project?</label>
      </div>

      <div className="mt-3 flex flex-wrap gap-6">{groups.map((count, index) => <label key={index} className={count === 0 ? "hidden" : "min-w-[190px] flex-1"}><span className="mb-1 block text-sm text-mist-300"><strong className="text-base text-white">{count}</strong> 1x31 IV in...</span><select value={selected[index] ?? "hp"} onChange={(e) => changeStat(index, e.target.value as IvKey)} className="w-full rounded-md border border-white/20 bg-[#66707a] px-3 py-2 text-sm text-white outline-none focus:border-cyan-300">{IVS.map((iv) => <option key={iv.key} value={iv.key}>{iv.label}</option>)}</select></label>)}</div>

      <div className="mt-3 rounded-md border border-white/5 bg-[#20252b] px-5 py-5 text-sm leading-6 text-mist-300">For this Pokémon you will spend <strong className="text-white">{expectedPrice.toLocaleString("en-US")}$</strong> and you may need <strong className="text-white">{totalPokemon}</strong> Pokémon.<br />Price calculations are based only on the breeding items cost, gender choice and everstone. Keep in consideration that some Pokémon has a higher cost for gender choices.</div>

      {error && <div className="mt-3 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
      <div className="mt-6 flex gap-3"><button type="button" onClick={startBreeding} className="rounded-md bg-[#68727d] px-3 py-2 text-sm font-medium text-white hover:bg-[#77838f]">Start breeding</button><button type="button" onClick={clear} className="rounded-md border border-red-500 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10">Clear</button></div>

      {started && <div className="mt-4 overflow-x-auto rounded-md bg-[#20252b] p-5"><div className="min-w-[550px] py-2" style={{ minWidth: totalRows >= 7 ? 800 : totalRows >= 6 ? 550 : undefined }}>
        <div className="mb-6 flex justify-center gap-5 text-xs text-mist-300">{selected.slice(0, ivCount).map((stat) => <div key={stat} className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: COLORS[stat] }} />{LABELS[stat]}</div>)}{nature && <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: COLORS.nat }} />Nature</div>}</div>
        <div className="flex flex-col" style={{ gap: "1.5rem" }}>
          {rows.map((row, rowIndex) => {
            const sizeRem = 1 + (3 / totalRows) * rowIndex
            return <div key={rowIndex} className="relative flex items-center" style={{ gap: ".5rem" }}>
              {row.map((node, colIndex) => {
                const key = `${rowIndex + 1}-${colIndex}`
                const isBred = bred.has(key)
                return <div key={key} className="relative text-center" style={{ flexBasis: `${100 / row.length}%` }}>
                  <button type="button" title={node.tokens.map((token) => token === "nat" ? "Nature" : LABELS[token as IvKey]).join(" ")} onClick={() => toggleBred(rowIndex + 1, colIndex)} className="mx-auto flex overflow-hidden rounded-full p-0 transition hover:scale-105" style={{ width: `${sizeRem}rem`, height: `${sizeRem}rem`, border: isBred ? `${(rowIndex + 1) * 2}px solid #a2f79f` : "none", gap: 0 }}>
                    {node.tokens.map((token, tokenIndex) => <span key={`${token}-${tokenIndex}`} className="h-full flex-1" style={{ background: COLORS[token] }} />)}
                  </button>
                  {rowIndex < rows.length - 1 && <span aria-hidden className="absolute top-1/2 left-1/2 hidden h-[2px] bg-[#ddd] md:block" style={{ width: `calc(100% - ${sizeRem / 2}rem)`, transform: "translateY(-50%)", marginLeft: `${sizeRem / 2}rem` }} />}
                </div>
              })}
            </div>
          })}
        </div>
      </div></div>}
    </section>
  )
}
