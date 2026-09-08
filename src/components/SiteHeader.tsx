export const SiteHeader = () => {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-700/80 bg-ink-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#top" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 font-display text-sm font-bold text-white">
            FL
          </span>
          <span className="font-display text-base font-semibold text-mist-100 sm:text-lg">
            Farm Liga
          </span>
        </a>

        <nav className="hidden items-center gap-6 text-sm font-medium text-mist-400 sm:flex">
          <a href="#rutas" className="transition-colors hover:text-mist-100">Ruta</a>
          <a href="#guia" className="transition-colors hover:text-mist-100">Guía</a>
          <a href="#creditos" className="transition-colors hover:text-mist-100">Créditos</a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://discord.gg/pKPxjAFNmA"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full border border-ink-700 px-3 py-1.5 text-xs font-medium text-mist-300 transition-colors hover:border-violet-500 hover:text-violet-300 sm:block"
          >
            Discord
          </a>
          <a
            href="https://youtu.be/LidSI0vJYKs?si=JRz1Vgg_1OzLFPDI"
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-violet-500 sm:text-sm"
          >
            Ver tutorial
          </a>
        </div>
      </div>
    </header>
  );
};
