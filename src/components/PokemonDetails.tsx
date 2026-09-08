import type { Pokemon } from "../interfaces/Pokemon";
import { TrickItem } from "./TrickItem";
import { animatedSpriteUrl } from "../utils/sprite";

interface PokemonDetailsProps {
  pokemon: Pokemon;
}

export const PokemonDetails = ({ pokemon }: PokemonDetailsProps) => {
  return (
    <div className="animate-in rounded-2xl border border-ink-700 bg-ink-900/80 p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-4 border-b border-ink-700 pb-5">
        <img
          src={animatedSpriteUrl(pokemon.name)}
          alt=""
          className="h-14 w-14 flex-shrink-0 object-contain"
          style={{ imageRendering: "pixelated" }}
        />
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-violet-400">
            Plan de batalla
          </p>
          <h3 className="truncate font-display text-lg font-semibold text-mist-100 sm:text-xl">
            vs {pokemon.name}
          </h3>
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3">
        <p className="text-sm leading-relaxed text-amber-300">{pokemon.initialMove}</p>
      </div>

      <div>
        {pokemon.tricks && pokemon.tricks.length > 0 ? (
          pokemon.tricks.map((trick, index) => (
            <TrickItem
              key={index}
              trick={trick}
              isLast={index === pokemon.tricks.length - 1}
            />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-ink-700 py-6 text-center text-sm text-mist-500">
            Todavía no hay variantes registradas para {pokemon.name}.
          </div>
        )}
      </div>
    </div>
  );
};
