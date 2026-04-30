// src/components/AmbientBackground.tsx
// Per-page radial gradient tint. Tones map 1:1 to `.ambient-*` classes in index.css.

export type AmbientTone =
  | 'violet'
  | 'warm'
  | 'cool'
  | 'night'
  | 'storm'
  | 'snow'
  | 'silver';

interface AmbientBackgroundProps {
  tone?: AmbientTone;
}

export default function AmbientBackground({ tone = 'violet' }: AmbientBackgroundProps) {
  return <div className={`ambient ambient-${tone}`} aria-hidden="true" />;
}
