// Lógica de las 5 gotas de riego de una baya plantada.
//
// Reglas (basadas en PokeMMO Hub, con el borde del "recién plantada" corregido):
//  - Una baya recién plantada y sin regar SIEMPRE muestra 2 gotas.
//  - Bayas normales pierden una gota cada 2 h; las de crecimiento largo
//    (42 h, 44 h y 67 h) pierden una cada 3 h.
//  - Sin gotas = baya seca (las 5 gotas parpadean en rojo).
//  - Recién regada = 5 gotas.

export const MAX_DROPS = 5

const HOUR_MS = 3_600_000
const MINUTE_MS = 60_000

// Horas "virtuales" desde el último riego con las que arranca una baya sin regar.
// Equivalen a que la baya ya tiene 2 gotas en el momento de plantarla.
const UNWATERED_START_HOURS = { normal: 6, long: 8 } as const

export function isLongGrowthBerry(growTimeHours: number): boolean {
  return growTimeHours === 42 || growTimeHours === 44 || growTimeHours === 67
}

/** Gotas llenas (0-5) para un tiempo transcurrido `hours` desde el último riego. */
export function dropsFromElapsedHours(hours: number, isLongGrowth: boolean): number {
  const e = Math.max(0, hours)
  const lost = isLongGrowth
    ? Math.max(0, Math.ceil((e - 2) / 3))
    : Math.max(0, Math.ceil(e / 2) - 1)
  return Math.min(MAX_DROPS, Math.max(0, MAX_DROPS - lost))
}

export interface DropletInfo {
  /** Gotas llenas, de 0 a 5. */
  drops: number
  /** true si la baya acaba de plantarse y aún no se ha regado nunca. */
  neverWatered: boolean
  /** true si la baya está seca (0 gotas). */
  dry: boolean
}

export function getDropletInfo(
  planted: { tsPlant: number; tsLastWater: number },
  growTimeHours: number,
  now: number,
): DropletInfo {
  const isLong = isLongGrowthBerry(growTimeHours)
  const neverWatered = planted.tsPlant === planted.tsLastWater

  let elapsedHours: number
  if (neverWatered) {
    // Mínimo 1 minuto: evita el caso límite justo al plantar, donde el
    // redondeo mostraba 3 gotas en vez de 2.
    const sincePlant = Math.max(now - planted.tsPlant, MINUTE_MS)
    elapsedHours =
      (isLong ? UNWATERED_START_HOURS.long : UNWATERED_START_HOURS.normal) +
      sincePlant / HOUR_MS
  } else {
    elapsedHours = Math.max(now - planted.tsLastWater, 0) / HOUR_MS
  }

  const drops = dropsFromElapsedHours(elapsedHours, isLong)
  return { drops, neverWatered, dry: drops === 0 }
}
