// Mapeo de formas especiales cuyo nombre en español/local no coincide
// con el slug que usa el CDN de sprites animados.
const SPECIAL_SLUGS: Record<string, string> = {
  "rotom agua": "rotomwash",
  "rotom fuego": "rotomheat",
  "rotom hielo": "rotomfrost",
  "rotom ventilador": "rotomfan",
  "rotom corte": "rotommow",
};

/** Convierte un nombre de Pokémon en el slug que usa el CDN de sprites animados. */
export function toSpriteSlug(name: string): string {
  const key = name.trim().toLowerCase();
  if (SPECIAL_SLUGS[key]) return SPECIAL_SLUGS[key];
  return key.replace(/[^a-z0-9]/g, "");
}

/** Sprite animado (gif) del Pokémon, estilo Gen5, para darle vida a las tarjetas. */
export function animatedSpriteUrl(name: string): string {
  return `https://play.pokemonshowdown.com/sprites/ani/${toSpriteSlug(name)}.gif`;
}

/** Ilustración estática local, usada como respaldo si el gif animado no carga. */
export function staticSpriteUrl(name: string): string {
  const base = (import.meta as { env: { BASE_URL: string } }).env.BASE_URL;
  return `${base}images/pokemon/${name.toLowerCase().replace(/ /g, "_")}.png`;
}
