// Dónde conseguir cada MO. Redactado a partir de la guía de PokeMewcánicos:
// https://www.pokemewcanicos.com/ubicacion-mo-teselia-pokemmo/
// Para añadir otra región, crea otro objeto con la misma forma y agrégalo a LOCATE_MO_REGIONS.

export interface HmEntry {
  /** Nombre del movimiento. */
  name: string
  /** Quién (o qué) la entrega. */
  giver: string
  /** Lugar donde se consigue. */
  place: string
  /** Qué hay que hacer para recibirla. */
  how: string
  /** Para qué sirve (opcional). */
  use?: string
}

export interface LocateMoRegion {
  id: string
  name: string
  /** MO en el orden en que la historia las va pidiendo. */
  hms: HmEntry[]
  /** Aviso extra, por ejemplo una MT que suele confundirse con una MO. */
  extra?: { title: string; giver: string; place: string; how: string }
}

export const LOCATE_MO_SOURCE = {
  label: "PokeMewcánicos",
  url: "https://www.pokemewcanicos.com/ubicacion-mo-teselia-pokemmo/",
}

export const TESELIA_MO: LocateMoRegion = {
  id: "teselia",
  name: "Teselia",
  hms: [
    {
      name: "Corte",
      giver: "Oryza, la investigadora",
      place: "Ciudad Gres, en su casa",
      how: "Derrota al primer líder de gimnasio (Millon, Maíz o Zeo) y vuelve a hablar con ella.",
      use: "Despeja los arbustos que tapan el Solar de los Sueños.",
    },
    {
      name: "Golpe Roca",
      giver: "Un NPC de traje rojo",
      place: "Justo antes de la entrada al Bosque Azulejo",
      how: "Habla con él antes de entrar al bosque.",
      use: "Rompe las rocas que cierran algunos caminos.",
    },
    {
      name: "Fuerza",
      giver: "Un Entrenador Guay de pelo celeste",
      place: "Ciudad Mayólica, en la casa que queda detrás de la casa Examinadora",
      how: "Entra a esa casa y conversa con él.",
      use: "Mueve las rocas grandes del camino.",
    },
    {
      name: "Vuelo",
      giver: "Bel",
      place: "Al salir de Ciudad Fayenza rumbo a la Ruta 6",
      how: "Vence al líder Yakón. Al ir a la Ruta 6, Bel te reta; gánale y te la entrega.",
      use: "Permite viajar rápido entre ciudades.",
    },
    {
      name: "Surf",
      giver: "Mirto, el Campeón",
      place: "Entrada de Monte Tuerca (zona externa)",
      how: "Tras el combate contra Cheren aparece Mirto, conversa un momento y te la da.",
      use: "Cruza el agua.",
    },
    {
      name: "Cascada",
      giver: "Una Pokéball en el suelo",
      place: "Ruta 18",
      how: "Viniendo de la Ruta 17, busca en la orilla del lado opuesto: la Pokéball tirada contiene la MO.",
      use: "Sube por las cascadas.",
    },
    {
      name: "Buceo",
      giver: "Una mujer frente a la casa de Cynthia",
      place: "Pueblo Arenisca",
      how: "Habla con ella para recibirla.",
      use: "Sumerge a tu Pokémon en las zonas profundas del mar.",
    },
  ],
  extra: {
    title: "MT Destello",
    giver: "Un hombre de traje escondido en un callejón",
    place: "Ciudad Porcelana, a la izquierda de Compañía Batalla",
    how: "No es una MO, pero ayuda mucho en las cuevas. Basta con caminar por el callejón y él sale a dártela.",
  },
}

export const LOCATE_MO_REGIONS: LocateMoRegion[] = [TESELIA_MO]
