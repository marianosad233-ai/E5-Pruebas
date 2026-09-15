import { useMemo, useState } from "react"
import { HelpCircle } from "lucide-react"

const IVS = [
  { key: "hp", label: "HP" },
  { key: "atk", label: "ATK" },
  { key: "def", label: "DEF" },
  { key: "spa", label: "SPA" },
  { key: "spd", label: "SPD" },
  { key: "spe", label: "SPE" },
] as const

type IvKey = (typeof IVS)[number]["key"]

const IV_LABELS: Record<IvKey, string> = Object.fromEntries(
  IVS.map((iv) => [iv.key, iv.label]),
) as Record<IvKey, string>

const DEFAULT_GROUPS: Record<number, number[]> = {
  2: [1, 1],
  3: [1, 2, 1],
  4: [1, 2, 3, 2],
  // This is the grouping shown by PokeMMO Hub in the reference screen.
  5: [2, 5, 5, 3, 1],
  6: [1, 3, 7, 9, 8, 4],
}

const STAT_ORDER: IvKey[] = ["hp", "atk", "def", "spa", "spd", "spe"]

function distributeGroups(ivCount: number, selected: IvKey[]) {
  const counts = DEFAULT_GROUPS[ivCount] ?? []
  return counts.map((count, index) => ({
    count,
    stat: selected[index % selected.length],
  }))
}

function buildTree(groups: { count: number; stat: IvKey }[]) {
  let id = 0
  let layer = groups.map((group) => ({
    id: `leaf-${id++}`,
    label: `${group.count} × 1x31`,
    stat: IV_LABELS[group.stat],
  }))

  const layers = [layer]
  while (layer.length > 1) {
    const next: typeof layer = []
    for (let i = 0; i < layer.length; i += 2) {
      const left = layer[i]
      const right = layer[i + 1]
      if (!right) {
        next.push(left)
        continue
      }
      next.push({
        id: `breed-${id++}`,
        label: "Breed",
        stat: `${left.stat} + ${right.stat}`,
      })
    }
    layer = next
    layers.push(layer)
  }
  return layers
}

export default function BreedingCalculator() {
  const [ivCount, setIvCount] = useState(5)
  const [nature, setNature] = useState(false)
  const [selectedIvs, setSelectedIvs] = useState<IvKey[]>(["hp", "atk", "def", "spd", "spe"])
  const [groups, setGroups] = useState(() => distributeGroups(5, ["hp", "atk", "def", "spd", "spe"]))
  const [started, setStarted] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const availableIvs = useMemo(() => {
    return STAT_ORDER.filter((key) => selectedIvs.includes(key))
  }, [selectedIvs])

  const totalPokemon = useMemo(() => {
    return 2 ** Math.max(0, ivCount - 1) * (nature ? 2 : 1)
  }, [ivCount])

  const totalBreeds = Math.max(0, totalPokemon - 1)

  const estimatedCost = useMemo(() => {
    // Compact estimate matching the simple presentation used by PokeMMO Hub.
    // 1x31 breeders + two braces per breed + gender choices.
    const breederCost = totalPokemon * 10_000
    const breedingCost = totalBreeds * 12_000
    const natureCost = nature ? 15_000 : 0
    return breederCost + breedingCost + natureCost
  }, [totalPokemon, totalBreeds, nature])

  const tree = useMemo(() => buildTree(groups), [groups])

  const changeIvCount = (count: number) => {
    const nextSelected = selectedIvs.slice(0, count)
    const filled = [...nextSelected]
    for (const iv of IVS.map((item) => item.key)) {
      if (filled.length >= count) break
      if (!filled.includes(iv)) filled.push(iv)
    }
    setSelectedIvs(filled)
    setGroups(distributeGroups(count, filled))
    setIvCount(count)
    setStarted(false)
  }

  const changeGroup = (index: number, stat: IvKey) => {
    setGroups((current) => current.map((group, i) => (i === index ? { ...group, stat } : group)))
    setStarted(false)
  }

  const clear = () => {
    const defaults = ["hp", "atk", "def", "spd", "spe"] as IvKey[]
    setIvCount(5)
    setNature(false)
    setSelectedIvs(defaults)
    setGroups(distributeGroups(5, defaults))
    setStarted(false)
  }

  return (
    <section className="mx-auto w-full max-w-[1168px] px-4 pb-16 pt-4 sm:px-6 lg:px-8">
      <div className="border-b border-white/15 pb-3 text-sm text-mist-400">
        <span className="text-mist-300">Home</span>
        <span className="mx-2">/</span>
        <span className="text-mist-300">Tools</span>
        <span className="mx-2">/</span>
        <span className="text-mist-500">Breeding Simulator</span>
      </div>

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-8 top-0 hidden h-32 w-32 rounded-full border-[18px] border-cyan-300/20 sm:block" />
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-[38px]">Breeding Simulator</h1>

        <button
          type="button"
          onClick={() => setShowHelp((value) => !value)}
          className="mt-3 inline-flex items-center gap-2 rounded-md bg-cyan-400 px-3 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-300"
        >
          <HelpCircle className="h-4 w-4" />
          How to use the breeding tool
        </button>

        {showHelp && (
          <div className="mt-3 max-w-3xl rounded-md border border-white/10 bg-[#20252b] p-4 text-sm leading-6 text-mist-300">
            Choose how many perfect IVs you want, decide whether nature matters, assign one IV to every group and press <strong className="text-white">Start breeding</strong>. The simulator then shows the breeding tree and an estimated total cost.
          </div>
        )}

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-8">
          <div>
            <p className="mb-2 text-sm text-mist-300">How many IVs do you want?</p>
            <div className="inline-flex overflow-hidden rounded-md border border-white/10 bg-[#59616a]">
              {[2, 3, 4, 5, 6].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => changeIvCount(count)}
                  className={`min-w-[39px] px-3 py-2 text-sm font-medium transition ${ivCount === count ? "bg-[#6f7882] text-white" : "text-white/90 hover:bg-white/10"}`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2 pb-1 text-sm text-mist-300">
            <input
              type="checkbox"
              checked={nature}
              onChange={(event) => {
                setNature(event.target.checked)
                setStarted(false)
              }}
              className="h-4 w-4 accent-cyan-400"
            />
            Consider nature in breeding project?
          </label>
        </div>

        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {groups.map((group, index) => (
            <label key={`${index}-${group.stat}`} className="min-w-0">
              <span className="mb-1 block truncate text-sm text-white">
                <strong>{group.count}</strong> <span className="text-xs text-mist-400">1x31 IV in...</span>
              </span>
              <select
                value={group.stat}
                onChange={(event) => changeGroup(index, event.target.value as IvKey)}
                className="w-full rounded-md border border-white/20 bg-[#66707a] px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300"
              >
                {availableIvs.map((iv) => (
                  <option key={iv} value={iv}>{IV_LABELS[iv]}</option>
                ))}
              </select>
            </label>
          ))}
        </div>

        <div className="mt-3 rounded-md border border-white/5 bg-[#20252b] px-5 py-5 text-sm leading-6 text-mist-300">
          For this Pokémon you will spend <strong className="text-white">{estimatedCost.toLocaleString("en-US")}$</strong> and you may need <strong className="text-white">{totalPokemon}</strong> Pokémon.
          <br />
          Price calculations are based only on the breeding items cost, gender choice and everstone. Keep in consideration that some Pokémon has a higher cost for gender choices.
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="rounded-md bg-[#68727d] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#77838f]"
          >
            Start breeding
          </button>
          <button
            type="button"
            onClick={clear}
            className="rounded-md border border-red-500 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
          >
            Clear
          </button>
        </div>

        {started && (
          <div className="mt-8 overflow-x-auto rounded-md border border-white/10 bg-[#20252b] p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">Breeding plan</h2>
                <p className="text-sm text-mist-400">{ivCount}x31{nature ? " + Nature" : ""}</p>
              </div>
              <div className="text-right text-sm text-mist-400">
                <div>{totalPokemon} Pokémon</div>
                <div>{totalBreeds} breeds</div>
              </div>
            </div>

            <div className="min-w-[760px] space-y-3">
              {tree.map((layer, layerIndex) => (
                <div key={layerIndex} className="flex justify-center gap-3">
                  {layer.map((node) => (
                    <div
                      key={node.id}
                      className={`min-w-[112px] rounded-md border px-3 py-2 text-center ${layerIndex === tree.length - 1 ? "border-cyan-300/50 bg-cyan-400/10" : "border-white/10 bg-[#30363d]"}`}
                    >
                      <div className="text-xs font-semibold text-white">{node.label}</div>
                      <div className="mt-1 text-[11px] text-mist-400">{node.stat}</div>
                    </div>
                  ))}
                </div>
              ))}
              <div className="flex justify-center pt-2 text-xs font-semibold uppercase tracking-widest text-cyan-300">
                Final Pokémon
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
