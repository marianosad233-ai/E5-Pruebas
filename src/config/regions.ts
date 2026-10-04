// Orden en que se muestran las regiones del E4. Se aplica en código (y no en config-region.json)
// para que sobreviva si ese JSON se actualiza desde la guía original.
// Cualquier región que no esté en esta lista se muestra al final, en su orden original.
export const REGION_ORDER = ["teselia", "sinnoh", "hoenn", "johto", "kanto"] as const

export function sortRegions<T extends { id: string }>(regions: T[]): T[] {
  const rank = (id: string) => {
    const index = (REGION_ORDER as readonly string[]).indexOf(id)
    return index === -1 ? REGION_ORDER.length : index
  }
  // sort es estable: las regiones desconocidas conservan su orden relativo.
  return [...regions].sort((a, b) => rank(a.id) - rank(b.id))
}
