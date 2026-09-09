import { useState } from "react";
import type { Pokemon } from "../interfaces/Pokemon";
import { animatedSpriteUrl, staticSpriteUrl } from "../utils/sprite";

interface PokemonCardProps {
  pokemon: Pokemon;
  isSelected: boolean;
  onClick: (pokemon: Pokemon) => void;
}

export const PokemonCard = ({ pokemon, isSelected, onClick }: PokemonCardProps) => {
  const [src, setSrc] = useState(animatedSpriteUrl(pokemon.name));
  const [triedFallback, setTriedFallback] = useState(false);

  const handleError = () => {
    if (!triedFallback) {
      setTriedFallback(true);
      setSrc(staticSpriteUrl(pokemon.name));
    }
  };

  return (
    <button
      type="button"
      onClick={() => onClick(pokemon)}
      className={`group relative flex h-36 flex-col items-center justify-end rounded-xl border bg-ink-850 pt-3 transition-all duration-150 sm:h-40 ${
        isSelected
          ? "border-violet-500 shadow-glow"
          : "border-ink-700 hover:border-violet-500/60 hover:bg-ink-800"
      }`}
    >
      <img
        src={src}
        onError={handleError}
        alt={pokemon.name}
        loading="lazy"
        className="h-24 w-24 object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.45)] sm:h-28 sm:w-28"
        style={triedFallback ? undefined : { imageRendering: "pixelated" }}
      />
      <span
        className={`mt-1 w-full truncate rounded-b-xl px-1.5 py-1.5 text-center text-xs font-medium uppercase tracking-tight sm:text-sm ${
          isSelected ? "bg-violet-600/20 text-violet-300" : "bg-black/20 text-mist-300"
        }`}
      >
        {pokemon.name}
      </span>
    </button>
  );
};
