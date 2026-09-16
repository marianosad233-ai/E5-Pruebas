import { useEffect, useState } from "react"
import { animatedSpriteUrl, staticSpriteUrl } from "../utils/sprite"

interface PokeSpriteProps {
  name: string
  className?: string
}

/** Sprite animado de un Pokémon con caída automática a la ilustración estática si el gif falla. */
export function PokeSprite({ name, className = "h-8 w-8" }: PokeSpriteProps) {
  const [src, setSrc] = useState(() => animatedSpriteUrl(name))
  const [triedFallback, setTriedFallback] = useState(false)

  // Si el nombre cambia (p. ej. el usuario elige otro Pokémon), hay que
  // recalcular el sprite: el estado interno no se actualiza solo.
  useEffect(() => {
    setSrc(animatedSpriteUrl(name))
    setTriedFallback(false)
  }, [name])

  const handleError = () => {
    if (!triedFallback) {
      setTriedFallback(true)
      setSrc(staticSpriteUrl(name))
    }
  }

  return (
    <img
      src={src}
      onError={handleError}
      alt={name}
      loading="lazy"
      className={`flex-shrink-0 object-contain ${className}`}
      style={triedFallback ? undefined : { imageRendering: "pixelated" }}
    />
  )
}
