// src/services/weatherHelpers.ts
// Shared formatters & WMO weather-code → emoji/label mappings for tinyweather.

import type { AmbientTone } from '../components/AmbientBackground';

export interface WeatherDescription {
  label: string;
  emoji: string;
}

export function describeWeatherCode(code: number, isDay: boolean): WeatherDescription {
  if (code === 0)                 return { label: 'Clear sky',        emoji: isDay ? '☀️' : '🌙' };
  if (code === 1)                 return { label: 'Mainly clear',     emoji: isDay ? '🌤️' : '🌙' };
  if (code === 2)                 return { label: 'Partly cloudy',    emoji: '⛅' };
  if (code === 3)                 return { label: 'Overcast',         emoji: '☁️' };
  if (code === 45 || code === 48) return { label: 'Foggy',            emoji: '🌫️' };
  if (code >= 51 && code <= 55)   return { label: 'Drizzle',          emoji: '🌦️' };
  if (code >= 56 && code <= 57)   return { label: 'Freezing drizzle', emoji: '🌧️' };
  if (code >= 61 && code <= 65)   return { label: 'Rain',             emoji: '🌧️' };
  if (code >= 66 && code <= 67)   return { label: 'Freezing rain',    emoji: '🌨️' };
  if (code >= 71 && code <= 75)   return { label: 'Snow',             emoji: '❄️' };
  if (code === 77)                return { label: 'Snow grains',      emoji: '🌨️' };
  if (code >= 80 && code <= 82)   return { label: 'Rain showers',     emoji: '🌦️' };
  if (code >= 85 && code <= 86)   return { label: 'Snow showers',     emoji: '🌨️' };
  if (code >= 95 && code <= 99)   return { label: 'Thunderstorm',     emoji: '⛈️' };
  return { label: 'Unknown', emoji: '❓' };
}

export function windDirectionLabel(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

export function formatDayLabel(isoDate: string): string {
  // Compare in local-date space (Y-M-D), avoiding DST ambiguity from
  // millisecond arithmetic on Date objects spanning a DST boundary.
  const [y, m, d] = isoDate.split('-').map(Number);
  const target = new Date(y, m - 1, d, 12, 0, 0, 0);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (target.getTime() === today.getTime())    return 'Today';
  if (target.getTime() === tomorrow.getTime()) return 'Tomorrow';
  return target.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function ambientForWeather(code: number, isDay: boolean): AmbientTone {
  if (code >= 95)                 return 'storm';
  if (code >= 71 && code <= 77)   return 'snow';
  if (code >= 51 && code <= 67)   return 'storm';
  if (code >= 80 && code <= 82)   return 'storm';
  if (code === 45 || code === 48) return 'cool';
  if (!isDay)                     return 'night';
  if (code === 0 || code === 1)   return 'warm';
  return 'cool';
}

/** Moon phase emoji from a 0–1 phase value. */
export function getMoonEmoji(phase: number): string {
  const p = (phase % 1 + 1) % 1;
  if (p < 0.0625 || p >= 0.9375) return '🌑'; // New
  if (p < 0.1875)                return '🌒'; // Waxing Crescent
  if (p < 0.3125)                return '🌓'; // First Quarter
  if (p < 0.4375)                return '🌔'; // Waxing Gibbous
  if (p < 0.5625)                return '🌕'; // Full
  if (p < 0.6875)                return '🌖'; // Waning Gibbous
  if (p < 0.8125)                return '🌗'; // Last Quarter
  return '🌘';                                // Waning Crescent
}
