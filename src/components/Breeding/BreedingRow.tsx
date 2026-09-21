import { BreedingItem } from "./BreedingItem"
import styles from "./breeding.module.css"

export function BreedingRow({ row, count, maxRows }: { row: number; count: number; maxRows: number }) {
  return <div className={`flex ${styles.breedingRows}`} style={{ gap: ".5rem" }}>
    {Array.from({ length: count }, (_, index) => <BreedingItem key={`${row}-${index}`} maxItems={count} maxRows={maxRows} row={row} index={index} />)}
  </div>
}
