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

type TreeNode = { tokens: string[] }

const LABELS: Record<IvKey, string> = Object.fromEntries(
  IVS.map((iv) => [iv.key, iv.label]),
) as Record<IvKey, string>

const RANDOM_TABLE: Record<2 | 3 | 4 | 5, Token[][][]> = {
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
}

const NATURE_TABLE: Record<2 | 3 | 4 | 5, Token[][][]> = {
  2: [
    [[0], [1], [1], [2]],
    [[0, 1], [1, 2]],
    [[0, 1, 2]],
  ],
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
}

// Colors match the PokeMMO Hub breeding graph.
const COLORS: Record<string, string> = {
  hp: "#4caf50",
  atk: "#f5223b",
  def: "#ff7a18",
  spa: "#f4d91b",
  spd: "#f4d91b",
  spe: "#25c7df",
  nat: "#8b8f94",
}

const COSTS = {
  random: { 2: 20000, 3: 65000, 4: 155000, 5: 340000 },
  nature: { 2: 75000, 3: 170000, 4: 355000, 5: 715000 },
} as const

const COUNTS = {
  random: { 2: [1, 1], 3: [2, 1, 1], 4: [2, 3, 2, 1], 5: [2, 5, 5, 3, 1] },
  nature: { 2: [2, 1, 1], 3: [4, 2, 1], 4: [6, 5, 3, 1], 5: [2, 11, 10, 6, 2] },
} as const

const tokenToStat = (token: Token, selected: IvKey[]): string =>
  token === 0 ? "nat" : (selected[token - 1] ?? "")

function makeRows(ivCount: 2 | 3 | 4 | 5, nature: boolean, selected: IvKey[]): TreeNode[][] {
  const source = (nature ? NATURE_TABLE : RANDOM_TABLE)[ivCount]
  return source.map((row) =>
    row.map((tokens) => ({ tokens: tokens.map((token) => tokenToStat(token, selected)) })),
  )
}

function Legend({ selected, nature }: { selected: IvKey[]; nature: boolean }) {
  return (
    <div className="mb-7 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-[#f1f1f1]">
      {selected.map((stat) => (
        <div key={stat} className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ background: COLORS[stat] }} />
          {LABELS[stat]}
        </div>
      ))}
      {nature && (
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ background: COLORS.nat }} />
          Nature
        </div>
      )}
    </div>
  )
}

function BreedingItem({
  node,
  rowIndex,
  totalRows,
  completed,
  highlighted,
  selectedNode,
  onClick,
}: {
  node: TreeNode
  rowIndex: number
  totalRows: number
  completed: boolean
  highlighted: boolean
  selectedNode: boolean
  onClick: () => void
}) {
  // Hub grows the circles as the tree gets closer to the final result.
  const size = Math.round(15 + (rowIndex / Math.max(totalRows - 1, 1)) * 34)
  const label = node.tokens
    .map((token) => token === "nat" ? "Nature" : LABELS[token as IvKey])
    .join(" + ")

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="relative z-10 flex shrink-0 overflow-hidden rounded-full p-0 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50"
      style={{
        width: size,
        height: size,
        border: `${selectedNode ? Math.max(3, Math.round(size / 6)) : highlighted || completed ? Math.max(2, Math.round(size / 8)) : 0}px solid ${selectedNode ? "#4f9cff" : "#7bea75"}`,
        boxShadow: selectedNode
          ? "0 0 0 3px rgba(79,156,255,.45), 0 0 18px rgba(79,156,255,.35)"
          : highlighted
            ? "0 0 0 3px rgba(123,234,117,.38), 0 0 14px rgba(123,234,117,.20)"
            : completed
              ? "0 0 0 2px rgba(123,234,117,.35)"
              : "none",
        transform: highlighted || selectedNode ? "scale(1.08)" : undefined,
        transition: "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
        animation: highlighted || selectedNode ? "breedingPathPulse 650ms ease-out" : undefined,
        animationDelay: highlighted && !selectedNode ? `${Math.max(0, totalRows - rowIndex - 1) * 90}ms` : "0ms",
      }}
    >
      {node.tokens.map((token, index) => (
        <span
          key={`${token}-${index}`}
          className="h-full flex-1"
          style={{ background: COLORS[token] ?? "#777" }}
        />
      ))}
    </button>
  )
}

function BreedingList({
  rows,
  selected,
  nature,
  completed,
  highlighted,
  selectedNode,
  toggle,
}: {
  rows: TreeNode[][]
  selected: IvKey[]
  nature: boolean
  completed: Set<string>
  highlighted: Set<string>
  selectedNode: string | null
  toggle: (row: number, column: number) => void
}) {
  // Compact layout like PokeMMO Hub. Each pair of parents connects to
  // the single child directly below the pair.
  const rowHeight = 62
  const graphTop = 2
  const graphHeight = rows.length * rowHeight

  const itemSize = (rowIndex: number) =>
    Math.round(15 + (rowIndex / Math.max(rows.length - 1, 1)) * 33)

  return (
    <>
      <style>{`
        @keyframes breedingPathPulse {
          0% { transform: scale(1); filter: brightness(1); }
          45% { transform: scale(1.12); filter: brightness(1.35); }
          100% { transform: scale(1.08); filter: brightness(1); }
        }
      `}</style>
      <div className="rounded-md bg-[#20252b] px-4 py-6 sm:px-6">
      <div className="mx-auto min-w-[680px] max-w-[1168px]">
        <Legend selected={selected} nature={nature} />

        <div className="relative" style={{ height: graphHeight }}>
          <svg
            className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
            viewBox={`0 0 100 ${graphHeight}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {rows.slice(0, -1).map((row, rowIndex) => {
              const parentCount = row.length
              const childCount = rows[rowIndex + 1].length
              const parentSize = itemSize(rowIndex)
              const childSize = itemSize(rowIndex + 1)

              // Use the real circle centers. This prevents the connector
              // from appearing above/beside the circles.
              const parentY = graphTop + rowIndex * rowHeight + parentSize / 2 + 4
              const childY = graphTop + (rowIndex + 1) * rowHeight + childSize / 2 + 4
              return Array.from({ length: childCount }).map((_, childIndex) => {
                const leftParentIndex = childIndex * 2
                const rightParentIndex = leftParentIndex + 1
                const leftX = ((leftParentIndex + 0.5) / parentCount) * 100
                const rightX = ((rightParentIndex + 0.5) / parentCount) * 100
                const midX = (leftX + rightX) / 2
                const connectorColor = highlighted.has(`${rowIndex}-${leftParentIndex}`) && highlighted.has(`${rowIndex}-${rightParentIndex}`) && highlighted.has(`${rowIndex + 1}-${childIndex}`)
                  ? "#7bea75"
                  : "#d4d4d4"

                return (
                  <g
                    key={`${rowIndex}-${childIndex}`}
                    stroke={connectorColor}
                    strokeWidth={connectorColor === "#7bea75" ? 1.7 : 1.2}
                    fill="none"
                    vectorEffect="non-scaling-stroke"
                    className="transition-all duration-200"
                  >
                    <line x1={leftX} y1={parentY} x2={rightX} y2={parentY} />
                    <line x1={midX} y1={parentY} x2={midX} y2={childY} />
                  </g>
                )
              })
            })}
          </svg>

          {rows.map((row, rowIndex) => {
            const size = itemSize(rowIndex)
            return (
              <div
                key={rowIndex}
                className="absolute left-0 z-10 flex w-full"
                style={{
                  top: graphTop + rowIndex * rowHeight,
                  height: size + 8,
                }}
              >
                {row.map((node, columnIndex) => (
                  <div
                    key={`${rowIndex}-${columnIndex}`}
                    className="flex justify-center"
                    style={{ width: `${100 / row.length}%` }}
                  >
                    <BreedingItem
                      node={node}
                      rowIndex={rowIndex}
                      totalRows={rows.length}
                      completed={completed.has(`${rowIndex}-${columnIndex}`)}
                      highlighted={highlighted.has(`${rowIndex}-${columnIndex}`)}
                      selectedNode={selectedNode === `${rowIndex}-${columnIndex}`}
                      onClick={() => toggle(rowIndex, columnIndex)}
                    />
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
      </div>
    </>
  )
}

export default function BreedingCalculator() {
  const [ivCount, setIvCount] = useState<2 | 3 | 4 | 5>(5)
  const [nature, setNature] = useState(false)
  const [selected, setSelected] = useState<IvKey[]>(["hp", "atk", "def", "spd", "spe"])
  const [started, setStarted] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [bred, setBred] = useState<Set<string>>(new Set())
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [error, setError] = useState("")

  const groups = useMemo(() => (nature ? COUNTS.nature : COUNTS.random)[ivCount], [ivCount, nature])
  const totalPokemon = nature ? [0, 3, 7, 15, 31][ivCount] : [0, 2, 4, 8, 16][ivCount]
  const expectedPrice = (nature ? COSTS.nature : COSTS.random)[ivCount]
  const activeSelected = selected.slice(0, ivCount)
  const rows = useMemo(() => makeRows(ivCount, nature, activeSelected), [ivCount, nature, selected])

  const changeCount = (count: 2 | 3 | 4 | 5) => {
    const defaults: IvKey[] = ["hp", "atk", "def", "spd", "spe"]
    setSelected(defaults.slice(0, count))
    setIvCount(count)
    setStarted(false)
    setError("")
    setBred(new Set())
    setSelectedNode(null)
  }

  const changeStat = (index: number, value: IvKey) => {
    setSelected((current) => current.map((stat, i) => i === index ? value : stat))
    setStarted(false)
    setError("")
    setBred(new Set())
    setSelectedNode(null)
  }

  const startBreeding = () => {
    if (new Set(activeSelected).size !== activeSelected.length) {
      setError("You cannot have the same stats in multiple IV fields.")
      return
    }
    setError("")
    setStarted(true)
    setBred(new Set())
    setSelectedNode(null)
  }

  const clear = () => {
    setIvCount(5)
    setNature(false)
    setSelected(["hp", "atk", "def", "spd", "spe"])
    setStarted(false)
    setError("")
    setBred(new Set())
    setSelectedNode(null)
  }

  const getPath = (row: number, column: number) => {
    const path = new Set<string>()
    const visit = (r: number, c: number) => {
      const key = `${r}-${c}`
      path.add(key)
      if (r === 0) return
      visit(r - 1, c * 2)
      visit(r - 1, c * 2 + 1)
    }
    visit(row, column)
    return path
  }

  const toggleBred = (row: number, column: number) => {
    const key = `${row}-${column}`
    setSelectedNode((current) => (current === key ? null : key))
    setBred((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const highlightedPath = useMemo(() => {
    if (!selectedNode) return new Set<string>()
    const [row, column] = selectedNode.split("-").map(Number)
    return getPath(row, column)
  }, [selectedNode, rows.length])

  return (
    <section className="mx-auto w-full max-w-[1168px] px-4 pb-16 pt-5 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-[38px]">Breeding Simulator</h1>

      <button
        type="button"
        onClick={() => setShowHelp((value) => !value)}
        className="mt-3 inline-flex items-center gap-2 rounded-md bg-[#68727d] px-3 py-2 text-sm font-medium text-white hover:bg-[#77838f]"
      >
        <HelpCircle className="h-4 w-4" />
        How to use the breeding tool
      </button>

      {showHelp && (
        <div className="mt-3 max-w-3xl rounded-md bg-[#20252b] p-4 text-sm leading-6 text-[#adb3b8]">
          Choose how many IVs you want, decide whether nature matters, assign an IV to every group and press Start breeding. The generated graph contains every breeding step and the final result.
        </div>
      )}

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-8">
        <div>
          <p className="mb-2 text-sm text-[#adb3b8]">How many IVs do you want?</p>
          <div className="inline-flex overflow-hidden rounded-md border border-white/10 bg-[#59616a]">
            {[2, 3, 4, 5].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => changeCount(count as 2 | 3 | 4 | 5)}
                className={`min-w-[39px] px-3 py-2 text-sm font-medium ${ivCount === count ? "bg-[#6f7882] text-white" : "text-white/90 hover:bg-white/10"}`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2 pb-1 text-sm text-[#adb3b8]">
          <input
            type="checkbox"
            checked={nature}
            onChange={(event) => {
              setNature(event.target.checked)
              setStarted(false)
              setError("")
              setBred(new Set())
            }}
            className="h-4 w-4 accent-cyan-400"
          />
          Consider nature in breeding project?
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-6">
        {groups.map((count, index) => (
          <label key={index} className="min-w-[190px] flex-1">
            <span className="mb-1 block text-sm text-[#adb3b8]">
              <strong className="text-base text-white">{count}</strong> 1x31 IV in...
            </span>
            <select
              value={selected[index] ?? "hp"}
              onChange={(event) => changeStat(index, event.target.value as IvKey)}
              className="w-full rounded-md border border-white/20 bg-[#66707a] px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
            >
              {IVS.map((iv) => <option key={iv.key} value={iv.key}>{iv.label}</option>)}
            </select>
          </label>
        ))}
      </div>

      <div className="mt-3 rounded-md bg-[#20252b] px-5 py-5 text-sm leading-6 text-[#adb3b8]">
        For this Pokémon you will spend <strong className="text-white">{expectedPrice.toLocaleString("en-US")}$</strong> and you may need <strong className="text-white">{totalPokemon}</strong> Pokémon.<br />
        Price calculations are based only on the breeding items cost, gender choice and everstone. Keep in consideration that some Pokémon has a higher cost for gender choices.
      </div>

      {error && <div className="mt-3 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

      <div className="mt-6 flex gap-3">
        <button type="button" onClick={startBreeding} className="rounded-md bg-[#68727d] px-3 py-2 text-sm font-medium text-white hover:bg-[#77838f]">Start breeding</button>
        <button type="button" onClick={clear} className="rounded-md border border-red-500 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10">Clear</button>
      </div>

      {started && (
        <div className="mt-4 overflow-x-auto">
          <BreedingList rows={rows} selected={activeSelected} nature={nature} completed={bred} highlighted={highlightedPath} selectedNode={selectedNode} toggle={toggleBred} />
        </div>
      )}
    </section>
  )
}
