const credits = [
  { img: "LehosifJS.png", link: null, alt: "Lehosif" },
  { img: "IrviingHC.png", link: "https://imgur.com/IgDjlXj", alt: "Irviing" },
  { img: "zParzival.png", link: "https://imgur.com/Hxui6yL", alt: "Parzival" },
  { img: "ItachiiSuka.png", link: "https://imgur.com/JRVJmKe", alt: "Itachii" },
]

const links = [
  { label: "Tutorial en video", href: "https://youtu.be/LidSI0vJYKs?si=JRz1Vgg_1OzLFPDI" },
  { label: "Discord", href: "https://discord.gg/pKPxjAFNmA" },
  { label: "Stream", href: "https://www.twitch.tv/parzivalmmo" },
]

const avatarClass = "h-6 w-6 rounded-full border border-ink-700 object-cover"

// Pie de página compacto: una sola fila en pantallas anchas, apilado en móvil.
export const SiteFooter = () => {
  return (
    <footer id="creditos" className="border-t border-ink-700 bg-ink-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 text-xs text-mist-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-semibold text-mist-300">Farm Liga</span>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="hover:text-violet-300"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="flex items-center gap-1.5">
            <span>Créditos:</span>
            {credits.map((c) => {
              const img = (
                <img
                  src={`${import.meta.env.BASE_URL}images/${c.img}`}
                  alt={c.alt}
                  title={c.alt}
                  className={`${avatarClass} ${c.link ? "transition-transform hover:scale-110" : ""}`}
                />
              )
              return c.link ? (
                <a key={c.img} href={c.link} target="_blank" rel="noreferrer">
                  {img}
                </a>
              ) : (
                <span key={c.img}>{img}</span>
              )
            })}
          </span>
          <span>
            Berries Helper basado en{" "}
            <a
              href="https://pokemmohub.com"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-violet-300"
            >
              PokeMMO Hub
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
