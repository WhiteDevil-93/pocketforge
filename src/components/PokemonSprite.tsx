// ============================================================================
// PocketForge — Pokemon Sprite Component
// ============================================================================

import { useState, useCallback } from 'react';
import { getSpriteUrl } from '../data';

interface PokemonSpriteProps {
  name: string;
  size?: number;
  animated?: boolean;
  className?: string;
  fallbackText?: string;
}

export default function PokemonSprite({
  name,
  size = 64,
  animated = false,
  className = '',
  fallbackText,
}: PokemonSpriteProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleError = useCallback(() => {
    setError(true);
  }, []);

  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  if (!name || error) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-bg-tertiary ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-text-tertiary text-xs font-jetbrains-mono">
          {fallbackText || '?'}
        </span>
      </div>
    );
  }

  const spriteUrl = getSpriteUrl(name, animated);

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {!loaded && (
        <div
          className="absolute inset-0 rounded-full bg-bg-tertiary animate-pulse"
          style={{ width: size, height: size }}
        />
      )}
      <img
        src={spriteUrl}
        alt={name}
        onError={handleError}
        onLoad={handleLoad}
        className={`object-contain transition-opacity duration-200 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ width: size, height: size, imageRendering: 'pixelated' }}
        loading="lazy"
      />
    </div>
  );
}
