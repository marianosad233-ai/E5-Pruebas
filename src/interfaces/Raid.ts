/** Una fila de la tabla turno a turno. */
export interface RaidTurn {
  /** Etiqueta del turno, por ejemplo "T1". */
  turn: string
  /** Qué hace cada jugador este turno (jugador 1 primero). */
  players: string[]
  /** % de PS aproximado del jefe al terminar el turno, por ejemplo "96.4%". */
  hp?: string
  /** Aviso de RESET para este turno (se resalta en rojo). */
  reset?: string
  /** Nota extra para este turno. */
  note?: string
}

export interface RaidGuide {
  /** Identificador para la URL (#/tools/raids/<id>). Solo minúsculas, números y guiones. */
  id: string
  /** Nombre que se muestra, por ejemplo "Meloetta". */
  name: string
  /** Emoji que acompaña al nombre (opcional). */
  emoji?: string
  /** Nombre de la estrategia, por ejemplo "Starfall Optimizada". */
  subtitle?: string
  /** Número de jugadores. Si falta, se deduce de la tabla. */
  players?: number
  /** Archivo de imagen dentro de public/images/raids/ (opcional). */
  image?: string
  /** Texto corto bajo el título. */
  summary?: string
  /** Aviso importante que se muestra destacado. */
  warning?: string
  /** Nombres de las columnas de jugadores; por defecto "Jugador 1", "Jugador 2"... */
  playerLabels?: string[]
  /** Tabla turno a turno. */
  turns: RaidTurn[]
  /** Notas generales (equipo, objetos, consejos). */
  notes?: string[]
  /** Créditos: autor de la estrategia y quién la tradujo. */
  credits?: string
  /** Orden en la lista (menor primero). Si falta, se ordena por nombre. */
  order?: number
}
