// Generado a partir de la base de datos de bayas de BerryMaster (recetas y drops de semillas).
// itemId enlaza con los iconos existentes en /public/item/{itemId}.png (600-663 = bayas oficiales).
import type { Flavor, SeedVariant } from "./berryPlanner"

export interface RawBerry {
  id: string
  itemId: number
  name: string
  growthTime: number
  minYield: number
  maxYield: number
  recipe: Array<{ flavor: Flavor; variant: SeedVariant; amount: number }>
}

export const berryData: RawBerry[] = [
  { id: "cheri", itemId: 600, name: "Cheri Berry", growthTime: 16.0, minYield: 3, maxYield: 6, recipe: [{ flavor: "spicy", variant: "plain", amount: 3 }] },
  { id: "chesto", itemId: 601, name: "Chesto Berry", growthTime: 16.0, minYield: 3, maxYield: 6, recipe: [{ flavor: "dry", variant: "plain", amount: 3 }] },
  { id: "pecha", itemId: 602, name: "Pecha Berry", growthTime: 16.0, minYield: 3, maxYield: 6, recipe: [{ flavor: "sweet", variant: "plain", amount: 3 }] },
  { id: "rawst", itemId: 604, name: "Rawst Berry", growthTime: 16.0, minYield: 3, maxYield: 6, recipe: [{ flavor: "bitter", variant: "plain", amount: 3 }] },
  { id: "aspear", itemId: 603, name: "Aspear Berry", growthTime: 16.0, minYield: 3, maxYield: 6, recipe: [{ flavor: "sour", variant: "plain", amount: 3 }] },
  { id: "persim", itemId: 605, name: "Persim Berry", growthTime: 16.0, minYield: 3, maxYield: 6, recipe: [{ flavor: "spicy", variant: "plain", amount: 1 }, { flavor: "dry", variant: "plain", amount: 1 }, { flavor: "sweet", variant: "plain", amount: 1 }] },
  { id: "lum", itemId: 655, name: "Lum Berry", growthTime: 44.0, minYield: 7, maxYield: 10, recipe: [{ flavor: "spicy", variant: "very", amount: 1 }, { flavor: "dry", variant: "very", amount: 1 }, { flavor: "sweet", variant: "very", amount: 1 }] },
  { id: "oran", itemId: 606, name: "Oran Berry", growthTime: 16.0, minYield: 3, maxYield: 6, recipe: [{ flavor: "dry", variant: "plain", amount: 1 }, { flavor: "bitter", variant: "plain", amount: 1 }, { flavor: "sour", variant: "plain", amount: 1 }] },
  { id: "sitrus", itemId: 656, name: "Sitrus Berry", growthTime: 44.0, minYield: 7, maxYield: 10, recipe: [{ flavor: "sweet", variant: "very", amount: 1 }, { flavor: "bitter", variant: "very", amount: 1 }, { flavor: "sour", variant: "very", amount: 1 }] },
  { id: "leppa", itemId: 612, name: "Leppa Berry", growthTime: 20.0, minYield: 5, maxYield: 7, recipe: [{ flavor: "spicy", variant: "very", amount: 1 }, { flavor: "sweet", variant: "plain", amount: 1 }, { flavor: "bitter", variant: "plain", amount: 1 }] },
  { id: "figy", itemId: 613, name: "Figy Berry", growthTime: 20.0, minYield: 5, maxYield: 7, recipe: [{ flavor: "spicy", variant: "very", amount: 1 }, { flavor: "sweet", variant: "plain", amount: 1 }] },
  { id: "wiki", itemId: 614, name: "Wiki Berry", growthTime: 20.0, minYield: 5, maxYield: 7, recipe: [{ flavor: "dry", variant: "very", amount: 1 }, { flavor: "bitter", variant: "plain", amount: 1 }] },
  { id: "mago", itemId: 615, name: "Mago Berry", growthTime: 20.0, minYield: 5, maxYield: 7, recipe: [{ flavor: "sweet", variant: "very", amount: 1 }, { flavor: "sour", variant: "plain", amount: 1 }] },
  { id: "aguav", itemId: 616, name: "Aguav Berry", growthTime: 20.0, minYield: 5, maxYield: 7, recipe: [{ flavor: "bitter", variant: "very", amount: 1 }, { flavor: "spicy", variant: "plain", amount: 1 }] },
  { id: "iapapa", itemId: 617, name: "Iapapa Berry", growthTime: 20.0, minYield: 5, maxYield: 7, recipe: [{ flavor: "sour", variant: "very", amount: 1 }, { flavor: "dry", variant: "plain", amount: 1 }] },
  { id: "razz", itemId: 607, name: "Razz Berry", growthTime: 16.0, minYield: 3, maxYield: 6, recipe: [{ flavor: "spicy", variant: "very", amount: 1 }, { flavor: "dry", variant: "plain", amount: 1 }] },
  { id: "bluk", itemId: 608, name: "Bluk Berry", growthTime: 16.0, minYield: 3, maxYield: 6, recipe: [{ flavor: "sweet", variant: "plain", amount: 2 }, { flavor: "dry", variant: "plain", amount: 1 }] },
  { id: "nanab", itemId: 609, name: "Nanab Berry", growthTime: 16.0, minYield: 3, maxYield: 6, recipe: [{ flavor: "sweet", variant: "plain", amount: 2 }, { flavor: "bitter", variant: "plain", amount: 1 }] },
  { id: "wepear", itemId: 610, name: "Wepear Berry", growthTime: 16.0, minYield: 3, maxYield: 6, recipe: [{ flavor: "sour", variant: "plain", amount: 2 }, { flavor: "bitter", variant: "very", amount: 1 }] },
  { id: "pinap", itemId: 611, name: "Pinap Berry", growthTime: 16.0, minYield: 3, maxYield: 6, recipe: [{ flavor: "spicy", variant: "plain", amount: 1 }, { flavor: "sour", variant: "plain", amount: 2 }] },
  { id: "cornn", itemId: 618, name: "Cornn Berry", growthTime: 20.0, minYield: 4, maxYield: 7, recipe: [{ flavor: "dry", variant: "very", amount: 3 }, { flavor: "sweet", variant: "plain", amount: 1 }] },
  { id: "magost", itemId: 619, name: "Magost Berry", growthTime: 20.0, minYield: 4, maxYield: 7, recipe: [{ flavor: "sweet", variant: "very", amount: 3 }, { flavor: "bitter", variant: "plain", amount: 1 }] },
  { id: "rabuta", itemId: 620, name: "Rabuta Berry", growthTime: 20.0, minYield: 4, maxYield: 7, recipe: [{ flavor: "bitter", variant: "very", amount: 3 }, { flavor: "sour", variant: "plain", amount: 1 }] },
  { id: "nomel", itemId: 621, name: "Nomel Berry", growthTime: 20.0, minYield: 4, maxYield: 7, recipe: [{ flavor: "sour", variant: "very", amount: 3 }, { flavor: "spicy", variant: "plain", amount: 1 }] },
  { id: "pomeg", itemId: 645, name: "Pomeg Berry", growthTime: 44.0, minYield: 7, maxYield: 10, recipe: [{ flavor: "spicy", variant: "very", amount: 1 }, { flavor: "dry", variant: "very", amount: 1 }, { flavor: "sweet", variant: "plain", amount: 1 }] },
  { id: "kelpsy", itemId: 646, name: "Kelpsy Berry", growthTime: 44.0, minYield: 7, maxYield: 10, recipe: [{ flavor: "dry", variant: "very", amount: 1 }, { flavor: "sweet", variant: "very", amount: 1 }, { flavor: "bitter", variant: "plain", amount: 1 }] },
  { id: "qualot", itemId: 647, name: "Qualot Berry", growthTime: 44.0, minYield: 7, maxYield: 10, recipe: [{ flavor: "sweet", variant: "very", amount: 1 }, { flavor: "bitter", variant: "very", amount: 1 }, { flavor: "sour", variant: "plain", amount: 1 }] },
  { id: "hondew", itemId: 648, name: "Hondew Berry", growthTime: 44.0, minYield: 7, maxYield: 10, recipe: [{ flavor: "bitter", variant: "very", amount: 1 }, { flavor: "sour", variant: "very", amount: 1 }, { flavor: "spicy", variant: "plain", amount: 1 }] },
  { id: "grepa", itemId: 649, name: "Grepa Berry", growthTime: 44.0, minYield: 7, maxYield: 10, recipe: [{ flavor: "sour", variant: "very", amount: 1 }, { flavor: "spicy", variant: "very", amount: 1 }, { flavor: "dry", variant: "plain", amount: 1 }] },
  { id: "tamato", itemId: 650, name: "Tamato Berry", growthTime: 44.0, minYield: 7, maxYield: 10, recipe: [{ flavor: "dry", variant: "plain", amount: 1 }, { flavor: "sweet", variant: "very", amount: 1 }, { flavor: "sour", variant: "very", amount: 1 }] },
  { id: "occa", itemId: 627, name: "Occa Berry", growthTime: 42.0, minYield: 7, maxYield: 9, recipe: [{ flavor: "spicy", variant: "very", amount: 3 }, { flavor: "sweet", variant: "very", amount: 2 }] },
  { id: "passho", itemId: 628, name: "Passho Berry", growthTime: 42.0, minYield: 7, maxYield: 9, recipe: [{ flavor: "dry", variant: "very", amount: 3 }, { flavor: "bitter", variant: "very", amount: 2 }] },
  { id: "wacan", itemId: 629, name: "Wacan Berry", growthTime: 42.0, minYield: 7, maxYield: 9, recipe: [{ flavor: "sweet", variant: "very", amount: 3 }, { flavor: "sour", variant: "very", amount: 2 }] },
  { id: "rindo", itemId: 630, name: "Rindo Berry", growthTime: 42.0, minYield: 7, maxYield: 9, recipe: [{ flavor: "bitter", variant: "very", amount: 3 }, { flavor: "spicy", variant: "very", amount: 2 }] },
  { id: "yache", itemId: 631, name: "Yache Berry", growthTime: 42.0, minYield: 7, maxYield: 9, recipe: [{ flavor: "sour", variant: "very", amount: 3 }, { flavor: "dry", variant: "very", amount: 2 }] },
  { id: "chople", itemId: 632, name: "Chople Berry", growthTime: 42.0, minYield: 7, maxYield: 9, recipe: [{ flavor: "spicy", variant: "very", amount: 3 }, { flavor: "bitter", variant: "very", amount: 2 }] },
  { id: "kebia", itemId: 633, name: "Kebia Berry", growthTime: 42.0, minYield: 7, maxYield: 9, recipe: [{ flavor: "dry", variant: "very", amount: 3 }, { flavor: "sour", variant: "very", amount: 2 }] },
  { id: "shuca", itemId: 634, name: "Shuca Berry", growthTime: 42.0, minYield: 7, maxYield: 9, recipe: [{ flavor: "sweet", variant: "very", amount: 3 }, { flavor: "spicy", variant: "very", amount: 2 }] },
  { id: "coba", itemId: 635, name: "Coba Berry", growthTime: 42.0, minYield: 7, maxYield: 9, recipe: [{ flavor: "spicy", variant: "very", amount: 3 }, { flavor: "dry", variant: "very", amount: 2 }] },
  { id: "payapa", itemId: 636, name: "Payapa Berry", growthTime: 42.0, minYield: 7, maxYield: 9, recipe: [{ flavor: "sweet", variant: "very", amount: 3 }, { flavor: "bitter", variant: "very", amount: 2 }] },
  { id: "tanga", itemId: 637, name: "Tanga Berry", growthTime: 42.0, minYield: 7, maxYield: 9, recipe: [{ flavor: "dry", variant: "very", amount: 3 }, { flavor: "spicy", variant: "very", amount: 2 }] },
  { id: "charti", itemId: 638, name: "Charti Berry", growthTime: 42.0, minYield: 7, maxYield: 9, recipe: [{ flavor: "bitter", variant: "very", amount: 3 }, { flavor: "dry", variant: "very", amount: 2 }] },
  { id: "kasib", itemId: 639, name: "Kasib Berry", growthTime: 42.0, minYield: 7, maxYield: 9, recipe: [{ flavor: "sour", variant: "very", amount: 3 }, { flavor: "sweet", variant: "very", amount: 2 }] },
  { id: "haban", itemId: 640, name: "Haban Berry", growthTime: 42.0, minYield: 7, maxYield: 9, recipe: [{ flavor: "sweet", variant: "very", amount: 3 }, { flavor: "sour", variant: "very", amount: 2 }] },
  { id: "colbur", itemId: 641, name: "Colbur Berry", growthTime: 42.0, minYield: 7, maxYield: 9, recipe: [{ flavor: "bitter", variant: "very", amount: 3 }, { flavor: "sweet", variant: "very", amount: 2 }] },
  { id: "babiri", itemId: 642, name: "Babiri Berry", growthTime: 42.0, minYield: 7, maxYield: 9, recipe: [{ flavor: "dry", variant: "very", amount: 3 }, { flavor: "sweet", variant: "very", amount: 2 }] },
  { id: "chilan", itemId: 643, name: "Chilan Berry", growthTime: 42.0, minYield: 7, maxYield: 9, recipe: [{ flavor: "sweet", variant: "very", amount: 3 }, { flavor: "dry", variant: "very", amount: 2 }] },
  { id: "enigma", itemId: 644, name: "Enigma Berry", growthTime: 67.0, minYield: 7, maxYield: 10, recipe: [{ flavor: "spicy", variant: "very", amount: 1 }, { flavor: "dry", variant: "very", amount: 1 }, { flavor: "bitter", variant: "very", amount: 1 }] },
  { id: "lansat", itemId: 663, name: "Lansat Berry", growthTime: 67.0, minYield: 7, maxYield: 10, recipe: [{ flavor: "dry", variant: "very", amount: 1 }, { flavor: "sweet", variant: "very", amount: 1 }, { flavor: "sour", variant: "very", amount: 1 }] },
  { id: "starf", itemId: 662, name: "Starf Berry", growthTime: 67.0, minYield: 7, maxYield: 10, recipe: [{ flavor: "sweet", variant: "very", amount: 1 }, { flavor: "bitter", variant: "very", amount: 1 }, { flavor: "spicy", variant: "very", amount: 1 }] },
  { id: "micle", itemId: 651, name: "Micle Berry", growthTime: 67.0, minYield: 7, maxYield: 10, recipe: [{ flavor: "bitter", variant: "very", amount: 1 }, { flavor: "sour", variant: "very", amount: 1 }, { flavor: "dry", variant: "very", amount: 1 }] },
  { id: "custap", itemId: 652, name: "Custap Berry", growthTime: 67.0, minYield: 7, maxYield: 10, recipe: [{ flavor: "sour", variant: "very", amount: 1 }, { flavor: "spicy", variant: "very", amount: 1 }, { flavor: "bitter", variant: "very", amount: 1 }] },
  { id: "jaboca", itemId: 653, name: "Jaboca Berry", growthTime: 67.0, minYield: 7, maxYield: 10, recipe: [{ flavor: "dry", variant: "very", amount: 1 }, { flavor: "spicy", variant: "very", amount: 1 }, { flavor: "sweet", variant: "very", amount: 1 }] },
  { id: "rowap", itemId: 654, name: "Rowap Berry", growthTime: 67.0, minYield: 7, maxYield: 10, recipe: [{ flavor: "bitter", variant: "very", amount: 1 }, { flavor: "dry", variant: "very", amount: 1 }, { flavor: "sweet", variant: "very", amount: 1 }] },
]
