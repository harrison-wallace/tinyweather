// src/services/moonPhaseService.ts

/**
 * Calculate moon phase for a given date
 * Returns phase as 0-1 where:
 * - 0 = New Moon
 * - 0.25 = First Quarter
 * - 0.5 = Full Moon
 * - 0.75 = Last Quarter
 */
export function calculateMoonPhase(date: Date): number {
  // Unix timestamp for reference new moon (January 6, 2000 at 18:14 UTC)
  const KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z').getTime();
  
  // Lunar cycle length in milliseconds (29.530588 days)
  const LUNAR_CYCLE = 29.530588 * 24 * 60 * 60 * 1000;
  
  const dateTime = date.getTime();
  const daysSinceNewMoon = (dateTime - KNOWN_NEW_MOON) / LUNAR_CYCLE;
  
  // Get the fractional part (0-1) representing position in current cycle
  return (daysSinceNewMoon % 1 + 1) % 1;
}

/**
 * Calculate moon illumination percentage for a given date
 * Returns 0-100
 */
export function calculateMoonIllumination(date: Date): number {
  const phase = calculateMoonPhase(date);
  
  // Illumination is highest at full moon (0.5 phase)
  // Formula: cos((phase - 0.5) * 2π) * 0.5 + 0.5
  const illumination = (Math.cos((phase - 0.5) * 2 * Math.PI) * 0.5 + 0.5) * 100;
  
  return Math.round(illumination);
}

/**
 * Get moon phase name from phase value (0-1)
 */
export function getMoonPhaseName(phase: number): string {
  // Normalize phase to 0-1
  const normalizedPhase = (phase % 1 + 1) % 1;
  
  // Each phase name spans roughly 1/8 of the cycle
  if (normalizedPhase < 0.0625) return 'New Moon';
  if (normalizedPhase < 0.1875) return 'Waxing Crescent';
  if (normalizedPhase < 0.3125) return 'First Quarter';
  if (normalizedPhase < 0.4375) return 'Waxing Gibbous';
  if (normalizedPhase < 0.5625) return 'Full Moon';
  if (normalizedPhase < 0.6875) return 'Waning Gibbous';
  if (normalizedPhase < 0.8125) return 'Last Quarter';
  if (normalizedPhase < 0.9375) return 'Waning Crescent';
  return 'New Moon';
}


