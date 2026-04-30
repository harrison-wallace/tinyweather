// src/App.tsx
import { useState, useEffect, useCallback } from 'react';
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
  time: string;          // ISO local "YYYY-MM-DDTHH:MM"
  hourLabel: string;     // "HH:MM"
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

function App() {
  const [location, setLocation] = useState<Location | null>(() => {
    const savedActive = localStorage.getItem('activeLocation');
    return savedActive ? JSON.parse(savedActive) : null;
  });
  const [todayWeather, setTodayWeather] = useState<TodayWeather | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourForecast[]>([]);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([]);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [windUnit, setWindUnit] = useState<'kmh' | 'mph'>(() => {
    const saved = localStorage.getItem('windUnit');
    return (saved as 'kmh' | 'mph') || 'mph';
  });
  const [textSize, setTextSize] = useState<'small' | 'medium' | 'large'>(() => {
    const savedTextSize = localStorage.getItem('textSize');
    return (savedTextSize as 'small' | 'medium' | 'large') || 'medium';
  });
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(() => {
    const savedAnimations = localStorage.getItem('animationsEnabled');
    return savedAnimations !== null ? JSON.parse(savedAnimations) : true;
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteLocation[]>(() => {
    const savedFavorites = localStorage.getItem('favoriteLocations');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  useEffect(() => { localStorage.setItem('windUnit', windUnit); }, [windUnit]);
  useEffect(() => { localStorage.setItem('favoriteLocations', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('textSize', textSize); }, [textSize]);
  useEffect(() => { localStorage.setItem('animationsEnabled', JSON.stringify(animationsEnabled)); }, [animationsEnabled]);
  useEffect(() => {
    if (location) localStorage.setItem('activeLocation', JSON.stringify(location));
    else          localStorage.removeItem('activeLocation');
  }, [location]);

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
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
      const response = await axios.get(url);
      const hourly = response.data.hourly;
      const daily  = response.data.daily;

      // Find hourly index for "now" — matches vortexhome's strategy.
      const hourlyTimes: string[] = hourly?.time ?? [];
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
        precipitationProbability: hourly.precipitation_probability[startIdx],
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

      const hours: HourForecast[] = [];
      for (let i = startIdx; i < Math.min(hourlyTimes.length, startIdx + HOURS_TO_SHOW); i++) {
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
          const dateObj = new Date(date);
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
      console.error('Error fetching weather:', error);
      setTodayWeather(null);
      setHourlyForecast([]);
      setDailyForecast([]);
    }
  }, []);

  useEffect(() => {
    if (!location) return;
    fetchWeather(location.lat, location.lon);
    const intervalId = setInterval(() => {
      fetchWeather(location.lat, location.lon);
    }, 60 * 60 * 1000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchWeather(location.lat, location.lon);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [location, fetchWeather]);

  const handleLocationSubmit = (lat: number, lon: number) => setLocation({ lat, lon });

  const addFavorite = (lat: number, lon: number, name?: string) => {
    const newFavorite = { lat, lon, name };
    setFavorites((prev) =>
      prev.some(f => f.lat === lat && f.lon === lon) ? prev : [...prev, newFavorite]
    );
  };

  const removeFavorite = (lat: number, lon: number) => {
    setFavorites((prev) => prev.filter(f => !(f.lat === lat && f.lon === lon)));
  };

  const selectFavorite = (fav: FavoriteLocation) => {
    setLocation({ lat: fav.lat, lon: fav.lon });
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
