// Dónde conseguir cada MO. Redactado a partir de la guía de PokeMewcánicos:
// https://www.pokemewcanicos.com/ubicacion-mo-teselia-pokemmo/
// Para añadir otra región, crea otro objeto con la misma forma y agrégalo a LOCATE_MO_REGIONS.

/** Carpeta (dentro de `public/`) donde están las capturas de las MO. */
export const SHOTS_BASE = `${import.meta.env.BASE_URL}images/mo/`

export interface Shot {
  /** Nombre del archivo dentro de SHOTS_BASE. */
  file: string
  /** Descripción corta de lo que muestra la captura. */
  alt: string
}

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
  /** Capturas de pantalla (opcional). */
  shots?: Shot[]
}

export interface LocateMoRegion {
  id: string
  name: string
  /** MO en el orden en que la historia las va pidiendo. */
  hms: HmEntry[]
  /** Aviso extra, por ejemplo una MT que suele confundirse con una MO. */
  extra?: { title: string; giver: string; place: string; how: string; shots?: Shot[] }
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
      shots: [{ file: "mo-corte-oryza.webp", alt: "Oryza entrega la MO Corte en Ciudad Gres" }],
    },
    {
      name: "Golpe Roca",
      giver: "Un NPC de traje rojo",
      place: "Justo antes de la entrada al Bosque Azulejo",
      how: "Habla con él antes de entrar al bosque.",
      use: "Rompe las rocas que cierran algunos caminos.",
      shots: [{ file: "mo-golpe-roca-teselia.webp", alt: "El NPC de traje rojo que entrega Golpe Roca" }],
    },
    {
      name: "Fuerza",
      giver: "Un Entrenador Guay de pelo celeste",
      place: "Ciudad Mayólica, en la casa que queda detrás de la casa Examinadora",
      how: "Entra a esa casa y conversa con él.",
      use: "Mueve las rocas grandes del camino.",
      shots: [{ file: "mo-fuerza-teselia.webp", alt: "El Entrenador Guay que entrega Fuerza en Ciudad Mayólica" }],
    },
    {
      name: "Vuelo",
      giver: "Bel",
      place: "Al salir de Ciudad Fayenza rumbo a la Ruta 6",
      how: "Vence al líder Yakón. Al ir a la Ruta 6, Bel te reta; gánale y te la entrega.",
      use: "Permite viajar rápido entre ciudades.",
      shots: [{ file: "mo-vuelo-teselia.webp", alt: "Bel entrega Vuelo después del combate" }],
    },
    {
      name: "Surf",
      giver: "Mirto, el Campeón",
      place: "Entrada de Monte Tuerca (zona externa)",
      how: "Tras el combate contra Cheren aparece Mirto, conversa un momento y te la da.",
      use: "Cruza el agua.",
      shots: [{ file: "mo-surf-teselia.webp", alt: "Mirto entrega Surf en la entrada de Monte Tuerca" }],
    },
    {
      name: "Cascada",
      giver: "Una Pokéball en el suelo",
      place: "Ruta 18",
      how: "Viniendo de la Ruta 17, busca en la orilla del lado opuesto: la Pokéball tirada contiene la MO.",
      use: "Sube por las cascadas.",
      shots: [
        { file: "mo-cascada-pokeball-teselia.webp", alt: "La Pokéball con la MO Cascada en la Ruta 18" },
        { file: "mo-cascada-teselia.webp", alt: "Recibiendo la MO Cascada" },
      ],
    },
    {
      name: "Buceo",
      giver: "Una mujer frente a la casa de Cynthia",
      place: "Pueblo Arenisca",
      how: "Habla con ella para recibirla.",
      use: "Sumerge a tu Pokémon en las zonas profundas del mar.",
      shots: [{ file: "mo-buceo-teselia.webp", alt: "La mujer frente a la casa de Cynthia que entrega Buceo" }],
    },
  ],
  extra: {
    title: "MT Destello",
    giver: "Un hombre de traje escondido en un callejón",
    place: "Ciudad Porcelana, a la izquierda de Compañía Batalla",
    how: "No es una MO, pero ayuda mucho en las cuevas. Basta con caminar por el callejón y él sale a dártela.",
    shots: [{ file: "mt-destello-teselia.webp", alt: "El callejón de Ciudad Porcelana donde se consigue la MT Destello" }],
  },
}

export const LOCATE_MO_REGIONS: LocateMoRegion[] = [TESELIA_MO]
