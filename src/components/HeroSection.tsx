interface HeroStats {
  regions: number;
  leaders: number;
  pokemons: number;
  branches: number;
}

const ROUTE = [
  { name: "Teselia", heal: false },
  { name: "Sinnoh", heal: true },
  { name: "Hoenn", heal: true },
  { name: "Johto", heal: false },
  { name: "Kanto", heal: true },
];

export const HeroSection = ({ stats }: { stats: HeroStats }) => {
  return (
    <section id="top" className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pt-16">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="mb-3 text-sm font-medium text-violet-400">Farm Liga · PokeMMO</p>
          <h1 className="max-w-xl font-display text-4xl font-semibold leading-[1.1] text-mist-100 sm:text-5xl">
            Farmea las cinco ligas sin perder ni un combate.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-mist-400">
            Elige región, entrenador y rival: te mostramos el movimiento inicial y el árbol
            de respuestas para cada Pokémon del equipo contrario.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="https://pokepast.es/e356ee22f26cf6dc"
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

        <div id="rutas" className="rounded-2xl border border-ink-700 bg-ink-900/70 p-5">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-mist-500">
            Ruta recomendada
          </p>
          <div className="flex flex-wrap items-center gap-x-1 gap-y-3">
            {ROUTE.map((stop, i) => (
              <div key={stop.name} className="flex items-center gap-1">
                <div className="flex flex-col items-center gap-1.5 rounded-xl border border-ink-700 bg-ink-850 px-3 py-2">
                  <span className="text-sm font-semibold text-mist-100">{stop.name}</span>
                  {stop.heal && (
                    <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                      Centro Pokémon
                    </span>
                  )}
                </div>
                {i < ROUTE.length - 1 && (
                  <span className="px-1 text-violet-500" aria-hidden>
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-ink-700 pt-8 sm:grid-cols-4">
        {[
          { label: "Regiones", value: stats.regions },
          { label: "Entrenadores", value: stats.leaders },
          { label: "Pokémon cubiertos", value: stats.pokemons },
          { label: "Rutas de decisión", value: stats.branches },
        ].map((stat) => (
          <div key={stat.label}>
            <dt className="text-xs font-medium uppercase tracking-wide text-mist-500">
              {stat.label}
            </dt>
            <dd className="font-display text-3xl font-semibold text-mist-100">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
