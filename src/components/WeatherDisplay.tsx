// src/components/WeatherDisplay.tsx
// Vortexhome-styled weather display, retaining tinyweather features:
//  - 7-day forecast (configurable, currently 7)
//  - per-day weather score + best-day highlight
//  - moon phase + illumination
//  - temp / wind unit conversion (C/F, km/h / mph)
//  - hourly forecast strip

import type { TodayWeather, HourForecast, DailyForecast } from '../App';
import {
  describeWeatherCode,
  windDirectionLabel,
  formatDayLabel,
  ambientForWeather,
  getMoonEmoji,
} from '../services/weatherHelpers';
import { getMoonPhaseName } from '../services/moonPhaseService';
import AmbientBackground from './AmbientBackground';

interface Location {
  lat: number;
  lon: number;
}
interface FavoriteLocation extends Location {
  name?: string;
}

interface WeatherDisplayProps {
  todayWeather: TodayWeather | null;
  hourlyForecast: HourForecast[];
  dailyForecast: DailyForecast[];
  location: Location | null;
  tempUnit: 'C' | 'F';
  windUnit: 'kmh' | 'mph';
  favorites: FavoriteLocation[];
  animationsEnabled: boolean;
}

const FORECAST_DAYS = 7;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-white/40 text-xs tracking-[0.2em] uppercase font-medium leading-none">
        {label}
      </span>
      <span className="text-white text-2xl font-semibold tabular-nums leading-tight">
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-10 bg-white/15" aria-hidden="true" />;
}

function SunriseSunset({ sunrise, sunset }: { sunrise: string; sunset: string }) {
  const fmt = (iso: string) => iso.slice(11, 16);
  return (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-white/40 text-xs tracking-[0.2em] uppercase font-medium leading-none">
          Sunrise
        </span>
        <span className="text-amber-300 text-2xl font-semibold tabular-nums leading-tight">
          🌅 {fmt(sunrise)}
        </span>
      </div>
      <Divider />
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-white/40 text-xs tracking-[0.2em] uppercase font-medium leading-none">
          Sunset
        </span>
        <span className="text-orange-300 text-2xl font-semibold tabular-nums leading-tight">
          🌇 {fmt(sunset)}
        </span>
      </div>
    </div>
  );
}

function MoonPill({ phase, illumination }: { phase: number; illumination: number }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-white/40 text-xs tracking-[0.2em] uppercase font-medium leading-none">
        Moon
      </span>
      <span className="text-indigo-200 text-2xl font-semibold tabular-nums leading-tight">
        <span className="mr-1">{getMoonEmoji(phase)}</span>
        {illumination}%
      </span>
    </div>
  );
}

function HourlyStrip({
  hours,
  convertTemp,
  tempUnit,
}: {
  hours: HourForecast[];
  convertTemp: (c: number) => number;
  tempUnit: 'C' | 'F';
}) {
  if (!hours.length) return null;
  const temps = hours.map(h => convertTemp(h.temperature));
  const tMin = Math.round(Math.min(...temps));
  const tMax = Math.round(Math.max(...temps));

  return (
    <div className="px-6 py-4 w-full max-w-6xl border-t border-white/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/45 text-xs uppercase tracking-[0.2em] font-medium">
          Next {hours.length} hours
        </span>
        <span className="text-white/30 text-xs tabular-nums">
          {tMin}°–{tMax}°{tempUnit}
        </span>
      </div>

      <div className="flex w-full">
        {hours.map(h => {
          const { emoji, label } = describeWeatherCode(h.weatherCode, h.isDay);
          return (
            <div
              key={h.time}
              className={`flex flex-col items-center flex-1 gap-1 py-1 rounded-md ${
                h.isNow ? 'bg-white/10' : ''
              }`}
            >
              <span
                className={`text-xs tabular-nums tracking-wide ${
                  h.isNow ? 'text-white font-semibold' : 'text-white/40'
                }`}
              >
                {h.isNow ? 'Now' : h.hourLabel}
              </span>
              <span className="text-xl leading-none" role="img" aria-label={label}>
                {emoji}
              </span>
              <span className="text-white/85 text-sm tabular-nums font-semibold">
                {Math.round(convertTemp(h.temperature))}°
              </span>
              <div className="w-3/4 h-1 rounded-full bg-white/10 overflow-hidden mt-0.5">
                {h.precipProbability >= 10 && (
                  <div
                    className="h-full bg-sky-400/70"
                    style={{ width: `${h.precipProbability}%` }}
                    title={`${h.precipProbability}% chance of precipitation`}
                  />
                )}
              </div>
              <span
                className={`text-[10px] tabular-nums leading-none ${
                  h.precipProbability >= 30 ? 'text-sky-300/80' : 'text-transparent'
                }`}
              >
                {h.precipProbability}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ForecastCard({
  day,
  isBest,
  score,
  convertTemp,
}: {
  day: DailyForecast;
  isBest: boolean;
  score: number;
  convertTemp: (c: number) => number;
}) {
  const { label, emoji } = describeWeatherCode(day.weatherCode, true);
  const dayLabel = formatDayLabel(day.date);

  return (
    <div
      className={[
        'relative flex flex-col items-center gap-1 px-4 py-4 w-[150px]',
        'rounded-2xl border transition-colors',
        isBest
          ? 'border-amber-300/40 bg-amber-300/5 shadow-[0_0_30px_-10px_rgba(252,211,77,0.4)]'
          : 'border-white/10 bg-white/[0.02]',
      ].join(' ')}
    >
      {isBest && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-300/90 text-black text-[10px] font-bold tracking-widest uppercase">
          Best
        </span>
      )}

      <span className="text-white/55 text-sm font-medium tracking-wide h-5 flex items-center">
        {dayLabel}
      </span>

      <span
        className="text-4xl glow-soft leading-none h-12 flex items-center"
        role="img"
        aria-label={label}
      >
        {emoji}
      </span>

      <span
        className="text-white/45 text-xs text-center leading-tight w-full h-8 overflow-hidden flex items-center justify-center px-1"
        title={label}
      >
        {label}
      </span>

      <div className="flex gap-2 text-lg font-semibold tabular-nums h-6 items-center">
        <span className="text-white">{Math.round(convertTemp(day.tempMax))}°</span>
        <span className="text-white/40">{Math.round(convertTemp(day.tempMin))}°</span>
      </div>

      <div className="flex items-center gap-2 text-[11px] tabular-nums">
        <span className="text-sky-300/80 h-4 flex items-center min-w-[3.5em] text-right">
          {day.precipitationSum > 0 ? `${day.precipitationSum.toFixed(1)} mm` : ''}
        </span>
      </div>

      <div className="mt-1 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-white/35">
        <span>Score</span>
        <span className={`tabular-nums font-bold ${isBest ? 'text-amber-300' : 'text-white/70'}`}>
          {score}
        </span>
      </div>

      <span className="text-base mt-0.5" role="img" aria-label="moon phase" title={getMoonPhaseName(day.moonPhase)}>
        {getMoonEmoji(day.moonPhase)}
      </span>
      <span className="text-[10px] text-white/35 tabular-nums leading-none">
        {day.moonIllumination}%
      </span>

      {/* Marks the top with the gradient hairline (matches widget look) */}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Day-scoring (kept from original tinyweather logic)
// ---------------------------------------------------------------------------

function calculateWeatherScore(day: DailyForecast): number {
  let score = 0;

  if (day.precipitationSum === 0) score += 50;

  if (day.weatherCode === 0) score += 40;
  else if (day.weatherCode >= 1 && day.weatherCode <= 3) score += 20;

  const tempAvg = (day.tempMax + day.tempMin) / 2;
  if (tempAvg >= 18 && tempAvg <= 25) score += 30;
  else if (tempAvg >= 15 && tempAvg <= 28) score += 15;

  if (day.windSpeedMax < 20) score += 10;
  else if (day.windSpeedMax < 30) score += 5;

  const sunrise = new Date(day.sunrise);
  const sunset = new Date(day.sunset);
  const daylightHours = (sunset.getTime() - sunrise.getTime()) / (1000 * 60 * 60);
  score += Math.min(daylightHours, 16);

  return Math.round(score);
}

function findBestDayIndex(forecast: DailyForecast[]): number {
  let bestIndex = 0;
  let bestScore = -1;
  let bestTemp = -999;
  forecast.forEach((day, index) => {
    const score = calculateWeatherScore(day);
    if (score > bestScore || (score === bestScore && day.tempMax > bestTemp)) {
      bestScore = score;
      bestTemp = day.tempMax;
      bestIndex = index;
    }
  });
  return bestIndex;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const WeatherDisplay = ({
  todayWeather,
  hourlyForecast,
  dailyForecast,
  location,
  tempUnit,
  windUnit,
  favorites,
  animationsEnabled,
}: WeatherDisplayProps) => {
  // ----- Empty / loading states -----
  if (!location) {
    return (
      <div className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <AmbientBackground tone="violet" />
        <div className="relative z-10 flex flex-col items-center gap-3 px-6 text-center">
          <span className="text-6xl">🌍</span>
          <h1 className="text-3xl font-light text-gradient">Welcome to TinyWeather</h1>
          <p className="text-white/55 max-w-sm">
            Open the menu in the top-left to set a location and get started.
          </p>
        </div>
      </div>
    );
  }

  if (!todayWeather || !dailyForecast.length) {
    return (
      <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
        <AmbientBackground tone="cool" />
        <span className="relative z-10 text-white/45 text-2xl tracking-wide animate-pulse">
          Loading weather…
        </span>
      </div>
    );
  }

  // ----- Conversions -----
  const convertTemp = (c: number) => (tempUnit === 'F' ? (c * 9) / 5 + 32 : c);
  const convertWindSpeed = (kmh: number) => (windUnit === 'mph' ? kmh / 1.609344 : kmh);
  const windUnitLabel = windUnit === 'mph' ? 'mph' : 'km/h';
  const convertVisibility = (m: number) => (tempUnit === 'F' ? m / 1609.344 : m / 1000);
  const visUnitLabel = tempUnit === 'F' ? 'mi' : 'km';

  // ----- Derived values -----
  const { label, emoji } = describeWeatherCode(todayWeather.weatherCode, todayWeather.isDay);
  const tone = ambientForWeather(todayWeather.weatherCode, todayWeather.isDay);

  const matchingFavorite = favorites.find(f => f.lat === location.lat && f.lon === location.lon);
  const locationDisplay =
    matchingFavorite?.name ?? `${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}`;

  const updatedTime = todayWeather.updatedAt.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const forecastDays = dailyForecast.slice(0, FORECAST_DAYS);
  const bestDayIndex = findBestDayIndex(forecastDays);
  const today = forecastDays[0];

  // Animation gating — if the user disabled animations, drop the *-fade-* classes.
  const a = (cls: string) => (animationsEnabled ? cls : '');

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-evenly py-8 px-6 lg:px-10 overflow-hidden">
      <AmbientBackground tone={tone} />

      <div className={`relative z-10 flex flex-col items-center justify-evenly w-full gap-6 ${a('stagger')}`}>
        {/* Location + updated */}
        <div className={`flex flex-col items-center gap-1 ${a('anim-fade-up')}`}>
          <h2 className="text-white/65 text-2xl tracking-wide font-light">{locationDisplay}</h2>
          <span className="text-white/30 text-xs tabular-nums tracking-widest uppercase">
            Updated {updatedTime}
          </span>
        </div>

        {/* Main conditions */}
        <div className={`flex items-center gap-10 ${a('anim-scale-in')}`}>
          <span
            className="leading-none glow-soft"
            role="img"
            aria-label={label}
            style={{ fontSize: 'clamp(4rem, 10vh, 7rem)' }}
          >
            {emoji}
          </span>
          <div className="flex flex-col gap-1">
            <span
              className="font-bold tabular-nums text-gradient leading-none"
              style={{ fontSize: 'clamp(3.5rem, 9vh, 6rem)' }}
            >
              {Math.round(convertTemp(todayWeather.temperature))}°{tempUnit}
            </span>
            <span className="text-white/55 text-lg font-light">
              Feels like{' '}
              <span className="text-white/80 tabular-nums">
                {Math.round(convertTemp(todayWeather.apparentTemperature))}°{tempUnit}
              </span>{' '}
              · {label}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className={`flex items-center gap-8 flex-wrap justify-center ${a('anim-fade-up')}`}>
          <StatPill
            label="Wind"
            value={`${windDirectionLabel(todayWeather.windDirection)} ${convertWindSpeed(
              todayWeather.windSpeed,
            ).toFixed(0)} ${windUnitLabel}`}
          />
          <Divider />
          <StatPill label="Humidity" value={`${todayWeather.humidity}%`} />
          <Divider />
          <StatPill label="Cloud" value={`${todayWeather.cloudCover}%`} />
          <Divider />
          <StatPill
            label="Visibility"
            value={`${convertVisibility(todayWeather.visibility).toFixed(1)} ${visUnitLabel}`}
          />
          <Divider />
          <StatPill
            label="High / Low"
            value={`${Math.round(convertTemp(today.tempMax))}° / ${Math.round(convertTemp(today.tempMin))}°`}
          />
          {todayWeather.precipitation > 0 && (
            <>
              <Divider />
              <StatPill label="Precip" value={`${todayWeather.precipitation} mm`} />
            </>
          )}
          <Divider />
          <SunriseSunset sunrise={today.sunrise} sunset={today.sunset} />
          <Divider />
          <MoonPill phase={today.moonPhase} illumination={today.moonIllumination} />
        </div>

        {/* Hourly forecast strip */}
        <div className={`w-full flex justify-center ${a('anim-fade-up')}`}>
          <HourlyStrip
            hours={hourlyForecast}
            convertTemp={convertTemp}
            tempUnit={tempUnit}
          />
        </div>

        {/* 7-day forecast */}
        <div className={`flex gap-3 flex-wrap justify-center items-stretch ${a('anim-fade-up')}`}>
          {forecastDays.map((day, index) => (
            <ForecastCard
              key={day.date}
              day={day}
              isBest={index === bestDayIndex}
              score={calculateWeatherScore(day)}
              convertTemp={convertTemp}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
