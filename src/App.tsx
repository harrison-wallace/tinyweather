// src/App.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { BurgerMenu } from './components/BurgerMenu';
import { WeatherDisplay } from './components/WeatherDisplay';
import './App.css';

interface Location {
  lat: number;
  lon: number;
}

interface FavoriteLocation extends Location {
  name?: string;
}

interface TodayWeather {
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
  time: string;
}

interface DailyForecast {
  date: string; // ISO 8601 date (e.g., "2025-03-18")
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  sunrise: string; // ISO 8601 timestamp
  sunset: string; // ISO 8601 timestamp
  windSpeedMax: number;
  weatherCode: number;
}

function App() {
  const [location, setLocation] = useState<Location | null>(() => {
    const savedActive = localStorage.getItem('activeLocation');
    return savedActive ? JSON.parse(savedActive) : null;
  });
  const [todayWeather, setTodayWeather] = useState<TodayWeather | null>(null);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([]);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Ensure setIsOpen is defined
  const [favorites, setFavorites] = useState<FavoriteLocation[]>(() => {
    const savedFavorites = localStorage.getItem('favoriteLocations');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  useEffect(() => {
    localStorage.setItem('favoriteLocations', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (location) {
      localStorage.setItem('activeLocation', JSON.stringify(location));
    } else {
      localStorage.removeItem('activeLocation');
    }
  }, [location]);

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,apparent_temperature,dewpoint_2m,precipitation,rain,snowfall,precipitation_probability,windspeed_10m,winddirection_10m,cloudcover,visibility,relativehumidity_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset,windspeed_10m_max,weathercode&timezone=auto`
      );
      const hourly = response.data.hourly;
      const daily = response.data.daily;
      const now = new Date().getHours();

      setTodayWeather({
        temperature: hourly.temperature_2m[now],
        apparentTemperature: hourly.apparent_temperature[now],
        dewpoint: hourly.dewpoint_2m[now],
        precipitation: hourly.precipitation[now],
        rain: hourly.rain[now],
        snowfall: hourly.snowfall[now],
        precipitationProbability: hourly.precipitation_probability[now],
        windSpeed: hourly.windspeed_10m[now],
        windDirection: hourly.winddirection_10m[now],
        cloudCover: hourly.cloudcover[now],
        visibility: hourly.visibility[now],
        humidity: hourly.relativehumidity_2m[now],
        weatherCode: hourly.weather_code[now],
        time: hourly.time[now],
      });

      setDailyForecast(
        daily.time.map((date: string, index: number) => ({
          date,
          tempMax: daily.temperature_2m_max[index],
          tempMin: daily.temperature_2m_min[index],
          precipitationSum: daily.precipitation_sum[index],
          sunrise: daily.sunrise[index],
          sunset: daily.sunset[index],
          windSpeedMax: daily.windspeed_10m_max[index],
          weatherCode: daily.weathercode[index],
        }))
      );
    } catch (error) {
      console.error('Error fetching weather:', error);
      setTodayWeather(null);
      setDailyForecast([]);
    }
  };

  useEffect(() => {
    if (location) {
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
    }
  }, [location]);

  const handleLocationSubmit = (lat: number, lon: number) => {
    setLocation({ lat, lon });
  };

  const addFavorite = (lat: number, lon: number, name?: string) => {
    const newFavorite = { lat, lon, name };
    setFavorites((prevFavorites) => {
      if (!prevFavorites.some(fav => fav.lat === lat && fav.lon === lon)) {
        return [...prevFavorites, newFavorite];
      }
      return prevFavorites;
    });
  };

  const removeFavorite = (lat: number, lon: number) => {
    setFavorites((prevFavorites) =>
      prevFavorites.filter(fav => !(fav.lat === lat && fav.lon === lon))
    );
  };

  const selectFavorite = (fav: FavoriteLocation) => {
    setLocation({ lat: fav.lat, lon: fav.lon });
    setIsDrawerOpen(false); // Close drawer after selection
  };

  return (
    <div className="app">
      <div className="content">
        <header>
          <h1>TinyWeather</h1>
          <BurgerMenu
            onLocationSubmit={handleLocationSubmit}
            tempUnit={tempUnit}
            setTempUnit={setTempUnit}
            isOpen={isDrawerOpen}
            setIsOpen={setIsDrawerOpen} // Pass setIsOpen correctly
            addFavorite={addFavorite}
            removeFavorite={removeFavorite}
            favorites={favorites}
            selectFavorite={selectFavorite}
          />
        </header>
        <main>
          <WeatherDisplay
            todayWeather={todayWeather}
            dailyForecast={dailyForecast}
            location={location}
            tempUnit={tempUnit}
            favorites={favorites}
          />
        </main>
      </div>
    </div>
  );
}

export default App;