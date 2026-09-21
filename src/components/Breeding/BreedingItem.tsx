import breedingTable from "../../data/breedingTable.json"
import { IV_COLORS, useBreeding } from "./BreedingContext"
import styles from "./breeding.module.css"

type BreedingRows = Record<string, number[][]>

export function BreedingItem({ row, index, maxItems, maxRows }: { row: number; index: number; maxItems: number; maxRows: number }) {
  const { breds, setAsBred, removeBred, breedingConfig } = useBreeding()
  const baseSize = 3 / maxRows
  const isOdd = index % 2 === 0
  const requestedIv = `iv${breedingConfig.ivsCount}` as "iv2" | "iv3" | "iv4" | "iv5"
  const table = (breedingConfig.nature ? breedingTable.nature[requestedIv] : breedingTable.random[requestedIv]) as BreedingRows
  const tokens = table[String(row)][index]
  const ivSet = tokens.map(token => token === 0 ? "nat" : breedingConfig.iv[token] || "hp")
  const isBred = breds.some(item => item.row === row + 1 && item.col === index)
  const size = baseSize * row + 1

  return <div style={{ flexBasis: `${100 / maxItems}%` }} className={styles.breedingItem}>
    <button
      type="button"
      title={ivSet.join(" ")}
      onClick={() => isBred ? removeBred({ row: row + 1, col: index }) : setAsBred({ row: row + 1, col: index })}
      className="mx-auto flex overflow-hidden rounded-full p-0 transition-transform hover:scale-105"
      style={{ width: `${size}rem`, height: `${size}rem`, borderRadius: "10rem", border: isBred ? `${(row + 1) * 2}px solid #a2f79f` : "none", gap: 0 }}
    >
      {ivSet.map((item, tokenIndex) => <span key={`${item}-${tokenIndex}`} style={{ background: IV_COLORS[item], height: "100%", flexGrow: 1 }} />)}
    </button>
    {isOdd ? <div className={styles.breedingTournamentRow} style={{ width: `calc(100% - ${size / 2}rem)`, left: `calc(50% + ${size / 2}rem)` }} /> : <div className={styles.breedingTournamentCol} style={{ left: "-.35rem" }} />}
  </div>
}
