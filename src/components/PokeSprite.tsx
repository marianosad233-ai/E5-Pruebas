import { useState } from "react"
import { animatedSpriteUrl, staticSpriteUrl } from "../utils/sprite"

interface PokeSpriteProps {
  name: string
  className?: string
}

/** Sprite animado de un Pokémon con caída automática a la ilustración estática si el gif falla. */
export function PokeSprite({ name, className = "h-8 w-8" }: PokeSpriteProps) {
  const [src, setSrc] = useState(animatedSpriteUrl(name))
  const [triedFallback, setTriedFallback] = useState(false)

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
