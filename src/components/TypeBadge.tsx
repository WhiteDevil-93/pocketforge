// ============================================================================
// PocketForge — Type Badge Component
// ============================================================================

import { getTypeColor } from '../data';

interface TypeBadgeProps {
  type: string;
  size?: 'sm' | 'md';
  className?: string;
}

export default function TypeBadge({ type, size = 'sm', className = '' }: TypeBadgeProps) {
  const color = getTypeColor(type);

  const sizeClasses = {
    sm: 'h-6 px-2.5 text-[10px]',
    md: 'h-7 px-3 text-[11px]',
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold uppercase tracking-wide ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: `${color}26`, // ~15% opacity
        color: color,
      }}
    >
      {type}
    </span>
  );
}
