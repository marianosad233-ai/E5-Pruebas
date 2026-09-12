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
      className={`group relative flex h-[84px] flex-col items-center justify-end rounded-lg border bg-ink-850 pt-1.5 transition-all duration-150 sm:h-28 sm:rounded-xl sm:pt-2.5 ${
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
        className="h-11 w-11 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)] sm:h-16 sm:w-16 sm:drop-shadow-[0_6px_10px_rgba(0,0,0,0.45)]"
        style={triedFallback ? undefined : { imageRendering: "pixelated" }}
      />
      <span
        className={`mt-1 w-full truncate rounded-b-lg px-0.5 py-0.5 text-center text-[9px] font-semibold uppercase leading-tight tracking-tight sm:rounded-b-xl sm:px-1 sm:py-1 sm:text-[10px] ${
          isSelected ? "bg-violet-600/20 text-violet-300" : "bg-black/20 text-mist-300"
        }`}
      >
        {pokemon.name}
      </span>
    </button>
  );
};
