export type IvKey = "hp" | "atk" | "def" | "spatk" | "spdef" | "spe"

export type BreedingConfig = {
  ivsCount: 2 | 3 | 4 | 5
  nature: boolean
  isBreeding: boolean
  iv: Record<number, IvKey | false>
}

export type BredNode = { row: number; col: number }
