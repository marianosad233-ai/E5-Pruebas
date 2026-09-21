import { BreedingLegend } from "./BreedingLegend"
import { BreedingRow } from "./BreedingRow"
import { useBreeding } from "./BreedingContext"

const MIN_WIDTH = [0, 0, 0, 0, 0, 550, 800]

export function BreedingList() {
  const { breedingConfig } = useBreeding()
  const totalRows = breedingConfig.nature ? breedingConfig.ivsCount + 1 : breedingConfig.ivsCount
  return <div className="mt-4 overflow-x-auto rounded-md bg-[#20252b] p-5">
    <div className="flex min-w-[550px] flex-col gap-6" style={{ minWidth: MIN_WIDTH[totalRows] }}>
      <BreedingLegend />
      {Array.from({ length: totalRows }, (_, index) => <BreedingRow key={index} row={index} count={Math.pow(2, totalRows - index - 1)} maxRows={totalRows} />)}
    </div>
  </div>
}
