export const SiteFooter = () => {
  return (
    <footer id="creditos" className="border-t border-ink-700 bg-ink-950">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 font-display text-xs font-bold text-white">
                FL
              </span>
              <span className="font-display text-sm font-semibold text-mist-100">Farm Liga</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-mist-500">
              Guía de farmeo de las cinco ligas de PokeMMO: ruta, rivales y plan de batalla
              en un solo lugar.
            </p>
          </div>

          <div className="flex gap-12">
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-mist-500">
                Recursos
              </p>
              <ul className="space-y-2 text-sm text-mist-400">
                <li>
                  <a
                    href="https://youtu.be/LidSI0vJYKs?si=JRz1Vgg_1OzLFPDI"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-violet-300"
                  >
                    Tutorial en video
                  </a>
                </li>
                <li>
                  <a
                    href="https://discord.gg/pKPxjAFNmA"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-violet-300"
                  >
                    Discord — reportes
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.twitch.tv/parzivalmmo"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-violet-300"
                  >
                    Farmeo en stream
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-mist-500">
                Créditos
              </p>
              <div className="flex items-center gap-2">
                {[
                  { img: "LehosifJS.png", link: null, alt: "Lehosif" },
                  { img: "IrviingHC.png", link: "https://imgur.com/IgDjlXj", alt: "Irviing" },
                  { img: "zParzival.png", link: "https://imgur.com/Hxui6yL", alt: "Parzival" },
                  { img: "ItachiiSuka.png", link: "https://imgur.com/JRVJmKe", alt: "Itachii" },
                ].map((c) =>
                  c.link ? (
                    <a key={c.img} href={c.link} target="_blank" rel="noreferrer">
                      <img
                        src={`${import.meta.env.BASE_URL}images/${c.img}`}
                        alt={c.alt}
                        className="h-9 w-9 rounded-full border border-ink-700 object-cover transition-transform hover:scale-110"
                      />
                    </a>
                  ) : (
                    <img
                      key={c.img}
                      src={`${import.meta.env.BASE_URL}images/${c.img}`}
                      alt={c.alt}
                      className="h-9 w-9 rounded-full border border-ink-700 object-cover"
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-ink-800 pt-6 text-xs text-mist-500">
          © {new Date().getFullYear()} Farm Liga PokeMMO. Guía hecha por y para la comunidad.
        </div>
      </div>
    </footer>
  );
};
