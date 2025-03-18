// src/components/WeatherDisplay.tsx
import { WiDaySunny, WiCloudy, WiRain, WiFog, WiSnow, WiNa } from 'react-icons/wi'; // Added WiNa for unknown
import './WeatherDisplay.css';

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
  date: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  sunrise: string;
  sunset: string;
  windSpeedMax: number;
  weatherCode: number;
}

interface Location {
  lat: number;
  lon: number;
}

interface FavoriteLocation extends Location {
  name?: string;
}

interface WeatherDisplayProps {
  todayWeather: TodayWeather | null;
  dailyForecast: DailyForecast[];
  location: Location | null;
  tempUnit: 'C' | 'F';
  favorites: FavoriteLocation[];
}

export const WeatherDisplay = ({ todayWeather, dailyForecast, location, tempUnit, favorites }: WeatherDisplayProps) => {
  if (!todayWeather || !location || !dailyForecast.length) {
    return <p>No weather data available. Set a location to get started.</p>;
  }

  const convertTemp = (celsius: number) => tempUnit === 'F' ? (celsius * 9) / 5 + 32 : celsius;
  const convertWindSpeed = (kmh: number) => tempUnit === 'F' ? kmh / 1.609344 : kmh;
  const convertVisibility = (meters: number) => tempUnit === 'F' ? meters / 1609.344 : meters / 1000;

  const weatherDescription = (code: number) => {
    switch (code) {
      case 0: return 'Clear sky';
      case 1: case 2: case 3: return 'Partly cloudy';
      case 45: case 48: return 'Fog';
      case 61: case 63: case 65: return 'Rain';
      case 71: case 73: case 75: return 'Snow';
      default: return 'Unknown';
    }
  };

  const getWeatherIcon = (code: number) => {
    switch (code) {
      case 0: return <WiDaySunny size={24} color="#ffffff" />;
      case 1: case 2: case 3: return <WiCloudy size={24} color="#ffffff" />;
      case 45: case 48: return <WiFog size={24} color="#ffffff" />;
      case 61: case 63: case 65: return <WiRain size={24} color="#ffffff" />;
      case 71: case 73: case 75: return <WiSnow size={24} color="#ffffff" />;
      default: return <WiNa size={24} color="#ffffff" />; // Fallback for unknown codes
    }
  };

  const windDirectionText = (degrees: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const matchingFavorite = favorites.find(
    (fav) => fav.lat === location.lat && fav.lon === location.lon
  );
  const locationDisplay = matchingFavorite?.name || `(${location.lat}, ${location.lon})`;

  return (
    <div className="weather-container">
      {/* Today Section */}
      <div className="weather-card today">
        <h2>Today at {locationDisplay}</h2>
        <p><strong>Temperature:</strong> <span className="value">{convertTemp(todayWeather.temperature).toFixed(1)}°{tempUnit}</span></p>
        <p><strong>Feels Like:</strong> <span className="value">{convertTemp(todayWeather.apparentTemperature).toFixed(1)}°{tempUnit}</span></p>
        <p><strong>Dew Point:</strong> <span className="value">{convertTemp(todayWeather.dewpoint).toFixed(1)}°{tempUnit}</span></p>
        <p>
          <strong>Conditions:</strong> {getWeatherIcon(todayWeather.weatherCode)} {weatherDescription(todayWeather.weatherCode)}
        </p>
        <p><strong>Precipitation:</strong> <span className="value">{todayWeather.precipitation} mm</span> (Rain: <span className="value">{todayWeather.rain} mm</span>, Snow: <span className="value">{todayWeather.snowfall} cm</span>)</p>
        <p><strong>Precipitation Chance:</strong> <span className="value">{todayWeather.precipitationProbability}%</span></p>
        <p><strong>Wind:</strong> <span className="value">{convertWindSpeed(todayWeather.windSpeed).toFixed(1)}</span> <span className="value">{tempUnit === 'F' ? 'mph' : 'km/h'}</span> <span className="value">{windDirectionText(todayWeather.windDirection)}</span></p>
        <p><strong>Cloud Cover:</strong> <span className="value">{todayWeather.cloudCover}%</span></p>
        <p><strong>Visibility:</strong> <span className="value">{convertVisibility(todayWeather.visibility).toFixed(1)}</span> <span className="value">{tempUnit === 'F' ? 'mi' : 'km'}</span></p>
        <p><strong>Humidity:</strong> <span className="value">{todayWeather.humidity}%</span></p>
        <p><strong>High:</strong> <span className="value">{convertTemp(dailyForecast[0].tempMax).toFixed(1)}°{tempUnit}</span></p>
        <p><strong>Low:</strong> <span className="value">{convertTemp(dailyForecast[0].tempMin).toFixed(1)}°{tempUnit}</span></p>
        <p><strong>Sunrise:</strong> {new Date(dailyForecast[0].sunrise).toLocaleTimeString()}</p>
        <p><strong>Sunset:</strong> {new Date(dailyForecast[0].sunset).toLocaleTimeString()}</p>
        <p><strong>Updated:</strong> {new Date(todayWeather.time).toLocaleTimeString()}</p>
      </div>

      {/* 7-Day Forecast Section */}
      <div className="forecast-section">
        <h2>Next 7 Days</h2>
        <div className="forecast-list">
          {dailyForecast.map((day, index) => (
            <div key={index} className="forecast-card">
              <h3>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
              <p><strong>High:</strong> <span className="value">{convertTemp(day.tempMax).toFixed(1)}°{tempUnit}</span></p>
              <p><strong>Low:</strong> <span className="value">{convertTemp(day.tempMin).toFixed(1)}°{tempUnit}</span></p>
              <p><strong>Precipitation:</strong> <span className="value">{day.precipitationSum} mm</span></p>
              <p><strong>Wind Max:</strong> <span className="value">{convertWindSpeed(day.windSpeedMax).toFixed(1)}</span> <span className="value">{tempUnit === 'F' ? 'mph' : 'km/h'}</span></p>
              <p>
                <strong>Conditions:</strong> {getWeatherIcon(day.weatherCode)} {weatherDescription(day.weatherCode)}
              </p>
              <p><strong>Sunrise:</strong> {new Date(day.sunrise).toLocaleTimeString()}</p>
              <p><strong>Sunset:</strong> {new Date(day.sunset).toLocaleTimeString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};