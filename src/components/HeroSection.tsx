interface HeroStats {
  regions: number
  leaders: number
  pokemons: number
  branches: number
}

export const HeroSection = ({
  activeStrategy,
}: {
  stats?: HeroStats
  activeStrategy: "dingxianyou" | "dingxianyou-2"
}) => {
  return (
    <section id="top" className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pt-16">
      <div className="max-w-2xl">
        <p className="mb-3 text-sm font-medium text-violet-400">Farm Liga · PokeMMO</p>
        <h1 className="font-display text-4xl font-semibold leading-[1.1] text-mist-100 sm:text-5xl">
          Farmea las cinco ligas sin perder ni un combate.
        </h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-mist-400">
          Elige región, entrenador y rival: te mostramos el movimiento inicial y el árbol
          de respuestas para cada Pokémon del equipo contrario.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={activeStrategy === "dingxianyou-2" ? "https://pokepast.es/5f996cd37e292763" : "https://pokepast.es/e356ee22f26cf6dc"}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
          >
            Ver equipo necesario
          </a>
          <a
            href="#guia"
            className="rounded-full border border-ink-700 px-5 py-2.5 text-sm font-semibold text-mist-200 transition-colors hover:border-violet-500 hover:text-violet-200"
          >
            Empezar a farmear
          </a>
        </div>
      </div>
    </section>
  )
}
