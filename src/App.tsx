import { useState, useEffect } from 'react';
import axios from 'axios';
import { BurgerMenu } from './components/BurgerMenu';
import { WeatherDisplay } from './components/WeatherDisplay';
import './App.css';

interface WeatherData {
  temperature: number; // In Celsius from Open-Meteo
  weatherCode: number;
  time: string;
}

function App() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C'); // Default to Celsius
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weather_code&timezone=auto`
      );
      const hourly = response.data.hourly;
      const now = new Date().getHours();
      setWeather({
        temperature: hourly.temperature_2m[now],
        weatherCode: hourly.weather_code[now],
        time: hourly.time[now],
      });
    } catch (error) {
      console.error('Error fetching weather:', error);
      setWeather(null);
    }
  };

  useEffect(() => {
    if (location) {
      fetchWeather(location.lat, location.lon);
    }
  }, [location]);

  const handleLocationSubmit = (lat: number, lon: number) => {
    setLocation({ lat, lon });
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
            setIsOpen={setIsDrawerOpen}
          />
        </header>
        <main>
          <WeatherDisplay weather={weather} location={location} tempUnit={tempUnit} />
        </main>
      </div>
    </div>
  );
}

export default App;