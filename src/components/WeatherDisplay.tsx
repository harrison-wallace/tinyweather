import { WiDaySunny, WiCloudy, WiRain, WiFog, WiSnow, WiNa } from 'react-icons/wi';
import './WeatherDisplay.css';
import React from 'react';

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
      case 0: return 'Clear';
      case 1: case 2: case 3: return 'Partly\n Cloudy';
      case 45: case 48: return 'Fog';
      case 61: case 63: case 65: return 'Rain';
      case 71: case 73: case 75: return 'Snow';
      default: return 'Unknown';
    }
  };
  
  const getWeatherIcon = (code: number, size: number = 40) => {
    const icons: { [key: number]: React.ReactElement } = {
      0: <WiDaySunny size={size} color="#ffffff" />,
      1: <WiCloudy size={size} color="#ffffff" />,
      2: <WiCloudy size={size} color="#ffffff" />,
      3: <WiCloudy size={size} color="#ffffff" />,
      45: <WiFog size={size} color="#ffffff" />,
      48: <WiFog size={size} color="#ffffff" />,
      61: <WiRain size={size} color="#ffffff" />,
      63: <WiRain size={size} color="#ffffff" />,
      65: <WiRain size={size} color="#ffffff" />,
      71: <WiSnow size={size} color="#ffffff" />,
      73: <WiSnow size={size} color="#ffffff" />,
      75: <WiSnow size={size} color="#ffffff" />,
    };
  
    return icons[code] || <WiNa size={size} color="#ffffff" />;
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
      {/* Today Section*/}
      <div className="weather-card today">
        <h2>Today at {locationDisplay}</h2>
        <div className="current-weather">
          <div className="temperature-section">
            {getWeatherIcon(todayWeather.weatherCode, 90)}
            <span className="temperature">{convertTemp(todayWeather.temperature).toFixed(0)}°{tempUnit}</span>
          </div>
          <p className="condition"><strong>{weatherDescription(todayWeather.weatherCode)}</strong></p>
          <p className="feels-like">RealFeel® <span className="value">{convertTemp(todayWeather.apparentTemperature).toFixed(0)}°</span></p>
        </div>
        <div className="key-metrics">
          <p><strong>High:</strong> <span className="value">{convertTemp(dailyForecast[0].tempMax).toFixed(0)}°{tempUnit}</span></p>
          <p><strong>Low:</strong> <span className="value">{convertTemp(dailyForecast[0].tempMin).toFixed(0)}°{tempUnit}</span></p>
          <p><strong>Wind:</strong> <span className="value">{windDirectionText(todayWeather.windDirection)} {convertWindSpeed(todayWeather.windSpeed).toFixed(0)} {tempUnit === 'F' ? 'mph' : 'km/h'}</span></p>
        </div>
        <div className="additional-metrics">
          <p><strong>Precipitation:</strong> <span className="value">{todayWeather.precipitation}mm</span></p>
          <p><strong>Precipitation Chance:</strong> <span className="value">{todayWeather.precipitationProbability}%</span></p>
          <p><strong>Snow:</strong> <span className="value">{todayWeather.snowfall}cm</span></p>
          <p><strong>Humidity:</strong> <span className="value">{todayWeather.humidity}%</span></p>
          <p><strong>Visibility:</strong> <span className="value">{convertVisibility(todayWeather.visibility).toFixed(1)} {tempUnit === 'F' ? 'mi' : 'km'}</span></p>
          <p><strong>Cloud Cover:</strong> <span className="value">{todayWeather.cloudCover}%</span></p>
          <p><strong>Dew Point:</strong> <span className="value">{convertTemp(todayWeather.dewpoint).toFixed(0)}°{tempUnit}</span></p>
          <p><strong>🌅</strong> {new Date(dailyForecast[0].sunrise).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
          <p><strong>🌇</strong> {new Date(dailyForecast[0].sunset).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
        </div>
        <p className="updated">Updated: {new Date(todayWeather.time).toLocaleTimeString()}</p>
      </div>

      {/* Next 7 Days Section*/}
      <div className="forecast-section">
        <div className="forecast-list">
          {dailyForecast.slice(0, 7).map((day, index) => (
            <div key={index} className="forecast-card">
              <h3>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
              <p>{getWeatherIcon(day.weatherCode)}</p>
              <p><strong>Conditions:</strong> {weatherDescription(day.weatherCode)}</p>
              <p><strong>High:</strong> <span className="value">{convertTemp(day.tempMax).toFixed(1)}°{tempUnit}</span></p>
              <p><strong>Low:</strong> <span className="value">{convertTemp(day.tempMin).toFixed(1)}°{tempUnit}</span></p>
              <p><strong>Precipitation:</strong> <span className="value">{day.precipitationSum} mm</span></p>
              <p><strong>Wind Max:</strong> <span className="value">{convertWindSpeed(day.windSpeedMax).toFixed(1)} {tempUnit === 'F' ? 'mph' : 'km/h'}</span></p>
              <p><strong>🌅</strong> {new Date(day.sunrise).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
              <p><strong>🌇</strong> {new Date(day.sunset).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};