// src/App.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { BurgerMenu } from './components/BurgerMenu';
import { WeatherDisplay } from './components/WeatherDisplay';
import { calculateMoonPhase, calculateMoonIllumination } from './services/moonPhaseService';
import './App.css';

interface Location {
  lat: number;
  lon: number;
}

interface FavoriteLocation extends Location {
  name?: string;
}

export interface TodayWeather {
  temperature: number;
  apparentTemperature: number;
  dewpoint: number;
  precipitation: number;
  rain: number;
  snowfall: number;
  precipitationProbability: number;
  windSpeed: number;
  windDirection: number;
  cloudCover: number;
  visibility: number;
  humidity: number;
  weatherCode: number;
  isDay: boolean;
  time: string;
  updatedAt: Date;
}

export interface HourForecast {
  time: string;
  hourLabel: string;
  temperature: number;
  weatherCode: number;
  precipProbability: number;
  precipMm: number;
  isDay: boolean;
  isNow: boolean;
}

export interface DailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  sunrise: string;
  sunset: string;
  windSpeedMax: number;
  weatherCode: number;
  moonPhase: number;
  moonIllumination: number;
}

const HOURS_TO_SHOW = 18;
const REFRESH_INTERVAL_MS = 60 * 60 * 1000;

/** Safely read JSON from localStorage. Returns fallback on parse error or missing key. */
function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    console.warn(`Corrupt localStorage value for "${key}", resetting.`);
    localStorage.removeItem(key);
    return fallback;
  }
}

function readLSString<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  const raw = localStorage.getItem(key);
  return (raw && (allowed as readonly string[]).includes(raw)) ? (raw as T) : fallback;
}

function App() {
  const [location, setLocation]                   = useState<Location | null>(() => readLS<Location | null>('activeLocation', null));
  const [todayWeather, setTodayWeather]           = useState<TodayWeather | null>(null);
  const [hourlyForecast, setHourlyForecast]       = useState<HourForecast[]>([]);
  const [dailyForecast, setDailyForecast]         = useState<DailyForecast[]>([]);
  const [tempUnit, setTempUnit]                   = useState<'C' | 'F'>(() => readLSString('tempUnit', ['C', 'F'] as const, 'C'));
  const [windUnit, setWindUnit]                   = useState<'kmh' | 'mph'>(() => readLSString('windUnit', ['kmh', 'mph'] as const, 'mph'));
  const [textSize, setTextSize]                   = useState<'small' | 'medium' | 'large'>(() => readLSString('textSize', ['small', 'medium', 'large'] as const, 'medium'));
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(() => readLS<boolean>('animationsEnabled', true));
  const [isDrawerOpen, setIsDrawerOpen]           = useState(false);
  const [favorites, setFavorites]                 = useState<FavoriteLocation[]>(() => readLS<FavoriteLocation[]>('favoriteLocations', []));

  // Persist settings.
  useEffect(() => { localStorage.setItem('tempUnit', tempUnit); }, [tempUnit]);
  useEffect(() => { localStorage.setItem('windUnit', windUnit); }, [windUnit]);
  useEffect(() => { localStorage.setItem('favoriteLocations', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('textSize', textSize); }, [textSize]);
  useEffect(() => { localStorage.setItem('animationsEnabled', JSON.stringify(animationsEnabled)); }, [animationsEnabled]);
  useEffect(() => {
    if (location) localStorage.setItem('activeLocation', JSON.stringify(location));
    else          localStorage.removeItem('activeLocation');
  }, [location]);

  // Track in-flight request to cancel stale fetches when location changes rapidly.
  const inflightRef = useRef<AbortController | null>(null);

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    inflightRef.current?.abort();
    const ctrl = new AbortController();
    inflightRef.current = ctrl;

    try {
      const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${lat}&longitude=${lon}` +
        `&hourly=temperature_2m,apparent_temperature,dewpoint_2m,precipitation,rain,snowfall,` +
        `precipitation_probability,windspeed_10m,winddirection_10m,cloudcover,visibility,` +
        `relativehumidity_2m,weather_code,is_day` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset,` +
        `windspeed_10m_max,weathercode` +
        `&forecast_days=8&timezone=auto`;
      const response = await axios.get(url, { signal: ctrl.signal });
      const hourly = response.data.hourly;
      const daily  = response.data.daily;

      const hourlyTimes: string[] = hourly?.time ?? [];
      if (!hourlyTimes.length) throw new Error('Empty hourly data');

      // Find index of the current hour (largest i where time <= now).
      const nowMs = Date.now();
      let startIdx = 0;
      for (let i = 0; i < hourlyTimes.length; i++) {
        const t = Date.parse(hourlyTimes[i]);
        if (!isNaN(t) && t <= nowMs) startIdx = i;
        else break;
      }

      setTodayWeather({
        temperature:              hourly.temperature_2m[startIdx],
        apparentTemperature:      hourly.apparent_temperature[startIdx],
        dewpoint:                 hourly.dewpoint_2m[startIdx],
        precipitation:            hourly.precipitation[startIdx],
        rain:                     hourly.rain[startIdx],
        snowfall:                 hourly.snowfall[startIdx],
        precipitationProbability: hourly.precipitation_probability?.[startIdx] ?? 0,
        windSpeed:                hourly.windspeed_10m[startIdx],
        windDirection:            hourly.winddirection_10m[startIdx],
        cloudCover:               hourly.cloudcover[startIdx],
        visibility:               hourly.visibility[startIdx],
        humidity:                 hourly.relativehumidity_2m[startIdx],
        weatherCode:              hourly.weather_code[startIdx],
        isDay:                    (hourly.is_day?.[startIdx] ?? 1) === 1,
        time:                     hourlyTimes[startIdx],
        updatedAt:                new Date(),
      });

      const endIdx = Math.min(hourlyTimes.length, startIdx + HOURS_TO_SHOW);
      const hours: HourForecast[] = [];
      for (let i = startIdx; i < endIdx; i++) {
        const time = hourlyTimes[i];
        hours.push({
          time,
          hourLabel:         time.slice(11, 16),
          temperature:       Math.round(hourly.temperature_2m[i]),
          weatherCode:       hourly.weather_code[i],
          precipProbability: Math.round(hourly.precipitation_probability?.[i] ?? 0),
          precipMm:          hourly.precipitation?.[i] ?? 0,
          isDay:             (hourly.is_day?.[i] ?? 1) === 1,
          isNow:             i === startIdx,
        });
      }
      setHourlyForecast(hours);

      setDailyForecast(
        (daily.time as string[]).map((date: string, index: number) => {
          // Use noon UTC to avoid DST/timezone edge cases when computing moon phase.
          const dateObj = new Date(`${date}T12:00:00Z`);
          return {
            date,
            tempMax:          daily.temperature_2m_max[index],
            tempMin:          daily.temperature_2m_min[index],
            precipitationSum: daily.precipitation_sum[index],
            sunrise:          daily.sunrise[index],
            sunset:           daily.sunset[index],
            windSpeedMax:     daily.windspeed_10m_max[index],
            weatherCode:      daily.weathercode[index],
            moonPhase:        calculateMoonPhase(dateObj),
            moonIllumination: calculateMoonIllumination(dateObj),
          };
        })
      );
    } catch (error) {
      if (axios.isCancel(error) || (error as Error).name === 'CanceledError') return;
      console.error('Error fetching weather:', error);
      setTodayWeather(null);
      setHourlyForecast([]);
      setDailyForecast([]);
    } finally {
      if (inflightRef.current === ctrl) inflightRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!location) return;
    fetchWeather(location.lat, location.lon);
    const intervalId = setInterval(() => {
      fetchWeather(location.lat, location.lon);
    }, REFRESH_INTERVAL_MS);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchWeather(location.lat, location.lon);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      inflightRef.current?.abort();
    };
  }, [location, fetchWeather]);

  const handleLocationSubmit = (lat: number, lon: number) => {
    // No-op if same coords (avoid pointless refetch).
    if (location && location.lat === lat && location.lon === lon) {
      setIsDrawerOpen(false);
      return;
    }
    setLocation({ lat, lon });
  };

  const addFavorite = (lat: number, lon: number, name?: string) => {
    setFavorites((prev) =>
      prev.some(f => f.lat === lat && f.lon === lon) ? prev : [...prev, { lat, lon, name }]
    );
  };

  const removeFavorite = (lat: number, lon: number) => {
    setFavorites((prev) => prev.filter(f => !(f.lat === lat && f.lon === lon)));
  };

  const selectFavorite = (fav: FavoriteLocation) => {
    handleLocationSubmit(fav.lat, fav.lon);
    setIsDrawerOpen(false);
  };

  return (
    <div className={`app text-size-${textSize}`}>
      <BurgerMenu
        onLocationSubmit={handleLocationSubmit}
        tempUnit={tempUnit}
        setTempUnit={setTempUnit}
        windUnit={windUnit}
        setWindUnit={setWindUnit}
        textSize={textSize}
        setTextSize={setTextSize}
        animationsEnabled={animationsEnabled}
        setAnimationsEnabled={setAnimationsEnabled}
        isOpen={isDrawerOpen}
        setIsOpen={setIsDrawerOpen}
        addFavorite={addFavorite}
        removeFavorite={removeFavorite}
        favorites={favorites}
        selectFavorite={selectFavorite}
      />
      <WeatherDisplay
        todayWeather={todayWeather}
        hourlyForecast={hourlyForecast}
        dailyForecast={dailyForecast}
        location={location}
        tempUnit={tempUnit}
        windUnit={windUnit}
        favorites={favorites}
        animationsEnabled={animationsEnabled}
      />
    </div>
  );
}

export default App;
