import { useEffect, useRef, useState } from "react"
import { Check, ChevronDown, Menu, X } from "lucide-react"
import { E4_STRATEGIES, GYM_RERUN_STRATEGIES, RED_BATTLE_STRATEGIES } from "../config/strategies"
import { TOOLS, getRememberedStrategies, hashFor, routeKey as getRouteKey, type Route } from "../config/routes"
import { revisitCurrentRoute, useRoute } from "../hooks/useRoute"

type MenuId = "e4" | "gym" | "red" | "tools"

interface MenuItem {
  id: string
  label: string
  description: string
  href: string
  selected: boolean
}

interface MenuGroup {
  id: MenuId
  label: string
  title: string
  subtitle: string
  /** true si la ruta actual pertenece a este grupo. */
  active: boolean
  items: MenuItem[]
  /** Opciones sueltas que van después de un separador. */
  extra?: MenuItem[]
}

const DISCORD_URL = "https://discord.gg/pKPxjAFNmA"
const TUTORIAL_URL = "https://youtu.be/LidSI0vJYKs?si=JRz1Vgg_1OzLFPDI"

// Orden fijo del menú: E4, Gym Rerun, Red Battle, Herramientas.
function buildGroups(route: Route): MenuGroup[] {
  const remembered = getRememberedStrategies()
  const e4Strategy = route.section === "e4" || route.section === "e4-lab" ? route.strategy : remembered.e4

  return [
    {
      id: "e4",
      label: "E4",
      title: "Estrategia E4",
      subtitle: "Selecciona la estrategia de farmeo",
      active: route.section === "e4" || route.section === "e4-lab",
      items: E4_STRATEGIES.map((s) => ({
        id: s.id,
        label: s.name,
        description: s.description,
        href: hashFor.e4(s.id),
        selected: route.section === "e4" && route.strategy === s.id,
      })),
      extra: [
        {
          id: "e4-lab",
          label: "🧪 E4 LAB",
          description: "Probar el nuevo asistente",
          href: hashFor.e4Lab(e4Strategy),
          selected: route.section === "e4-lab",
        },
      ],
    },
    {
      id: "gym",
      label: "Gym Rerun",
      title: "Estrategias Gym Rerun",
      subtitle: "Selecciona una estrategia",
      active: route.section === "gym",
      items: GYM_RERUN_STRATEGIES.map((s) => ({
        id: s.id,
        label: s.name,
        description: s.description,
        href: hashFor.gym(s.id),
        selected: route.section === "gym" && route.strategy === s.id,
      })),
    },
    {
      id: "red",
      label: "Red Battle",
      title: "Estrategias Red Battle",
      subtitle: "Selecciona una estrategia",
      active: route.section === "red",
      items: RED_BATTLE_STRATEGIES.map((s) => ({
        id: s.id,
        label: s.name,
        description: s.description,
        href: hashFor.red(s.id),
        selected: route.section === "red" && route.strategy === s.id,
      })),
    },
    {
      id: "tools",
      label: "Herramientas",
      title: "Herramientas PokeMMO",
      subtitle: "Calculadoras y utilidades",
      active: TOOLS.some((t) => t.id === route.section),
      items: TOOLS.map((t) => ({
        id: t.id,
        label: t.label,
        description: t.description,
        href: hashFor.tool(t.path),
        selected: route.section === t.id,
      })),
    },
  ]
}

export const SiteHeader = () => {
  const { route } = useRoute()
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  const groups = buildGroups(route)
  const routeKey = getRouteKey(route)
  const e4Home = groups[0].items.find((item) => item.selected)?.href ?? groups[0].items[0].href

  const closeAll = () => {
    setOpenMenu(null)
    setMobileOpen(false)
  }

  // Al pulsar una opción: se cierran los menús y, si ya estabas en esa ruta, se reinicia la sección.
  const handleNavigate = (href: string) => {
    if (window.location.hash === href) revisitCurrentRoute()
    closeAll()
  }

  // Cierra los menús al navegar con atrás/adelante.
  useEffect(() => {
    setOpenMenu(null)
    setMobileOpen(false)
  }, [routeKey])

  // Cierra los menús al pulsar fuera del encabezado o con Escape.
  useEffect(() => {
    if (!openMenu && !mobileOpen) return
    const closeAllMenus = () => {
      setOpenMenu(null)
      setMobileOpen(false)
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) closeAllMenus()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAllMenus()
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [openMenu, mobileOpen])

  return (
    <header ref={headerRef} className="sticky top-0 z-30 border-b border-ink-700/80 bg-ink-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <a href={e4Home} onClick={() => handleNavigate(e4Home)} className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 font-display text-sm font-bold text-white">
            FL
          </span>
          <span className="font-display text-base font-semibold text-mist-100 sm:text-lg">Farm Liga</span>
        </a>

        {/* Escritorio */}
        <nav aria-label="Principal" className="hidden items-center gap-4 text-sm font-medium text-mist-400 md:flex">
          {groups.map((group) => {
            const open = openMenu === group.id
            return (
              <div key={group.id} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenMenu((value) => (value === group.id ? null : group.id))}
                  aria-haspopup="menu"
                  aria-expanded={open}
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 transition-colors ${
                    open
                      ? "bg-violet-600/15 text-violet-300"
                      : group.active
                        ? "text-violet-300"
                        : "hover:text-mist-100"
                  }`}
                >
                  <span>{group.label}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
                </button>

                {open && (
                  <div
                    role="menu"
                    className={`absolute top-full mt-2 w-64 overflow-hidden rounded-2xl border border-ink-700 bg-ink-950/95 p-1.5 shadow-2xl shadow-black/30 backdrop-blur ${
                      group.id === "tools" ? "right-0" : "left-0"
                    }`}
                  >
                    <div className="px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mist-500">{group.title}</p>
                      <p className="mt-1 text-xs text-mist-500">{group.subtitle}</p>
                    </div>

                    {group.items.map((item) => (
                      <DesktopItem key={item.id} item={item} onNavigate={handleNavigate} />
                    ))}

                    {group.extra && (
                      <>
                        <div className="my-1 border-t border-ink-800" />
                        {group.extra.map((item) => (
                          <DesktopItem key={item.id} item={item} onNavigate={handleNavigate} />
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full border border-ink-700 px-3 py-1.5 text-xs font-medium text-mist-300 transition-colors hover:border-violet-500 hover:text-violet-300 lg:block"
          >
            Discord
          </a>
          <a
            href={TUTORIAL_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-violet-500 sm:text-sm"
          >
            Ver tutorial
          </a>
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            className="rounded-full border border-ink-700 p-2 text-mist-200 transition-colors hover:border-violet-500 md:hidden"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Móvil: todas las secciones en un solo panel */}
      {mobileOpen && (
        <nav
          id="mobile-menu"
          aria-label="Menú móvil"
          className="absolute inset-x-0 top-full max-h-[70vh] overflow-y-auto border-b border-ink-700 bg-ink-950 px-4 pb-4 pt-2 shadow-2xl shadow-black/40 md:hidden"
        >
          {groups.map((group) => (
            <div key={group.id} className="border-b border-ink-800 py-2 last:border-b-0">
              <p className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-mist-500">
                {group.label}
              </p>
              {[...group.items, ...(group.extra ?? [])].map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => handleNavigate(item.href)}
                  aria-current={item.selected ? "page" : undefined}
                  className={`flex min-h-11 items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                    item.selected ? "bg-violet-600/15 text-violet-200" : "text-mist-200 hover:bg-ink-800"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.selected && <Check className="h-4 w-4 shrink-0 text-violet-400" />}
                </a>
              ))}
            </div>
          ))}
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-2 flex min-h-11 items-center rounded-xl px-3 py-2.5 text-sm font-semibold text-mist-300 hover:bg-ink-800"
          >
            Discord
          </a>
        </nav>
      )}
    </header>
  )
}

function DesktopItem({ item, onNavigate }: { item: MenuItem; onNavigate: (href: string) => void }) {
  return (
    <a
      href={item.href}
      role="menuitem"
      onClick={() => onNavigate(item.href)}
      aria-current={item.selected ? "page" : undefined}
      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${
        item.selected ? "bg-violet-600/15 text-violet-200" : "text-mist-300 hover:bg-ink-800 hover:text-mist-100"
      }`}
    >
      <span>
        <span className="block text-sm font-semibold">{item.label}</span>
        <span className="mt-0.5 block text-[11px] text-mist-500">{item.description}</span>
      </span>
      {item.selected && <Check className="h-4 w-4 flex-shrink-0 text-violet-400" />}
    </a>
  )
}
