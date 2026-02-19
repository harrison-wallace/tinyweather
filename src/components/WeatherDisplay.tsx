import { WiDaySunny, WiCloudy, WiRain, WiFog, WiSnow, WiNa } from 'react-icons/wi';
import './WeatherDisplay.css';
import React from 'react';
import { getMoonPhaseName } from '../services/moonPhaseService';

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
  moonPhase: number;
  moonIllumination: number;
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
  animationsEnabled: boolean;
}

export const WeatherDisplay = ({ todayWeather, dailyForecast, location, tempUnit, favorites, animationsEnabled }: WeatherDisplayProps) => {
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

  const getWeatherClass = (code: number): string => {
    if (code === 0) return 'weather-clear';
    if (code >= 1 && code <= 3) return 'weather-cloudy';
    if (code === 45 || code === 48) return 'weather-fog';
    if (code === 61 || code === 63 || code === 65) return 'weather-rain';
    if (code === 71 || code === 73 || code === 75) return 'weather-snow';
    return '';
  };

  // Calculate weather score for a day (0-100 scale)
  const calculateWeatherScore = (day: DailyForecast): number => {
    let score = 0;

    // No rain (major positive): +50 points
    if (day.precipitationSum === 0) {
      score += 50;
    }

    // Clear skies (major positive): +40 points, Partly cloudy: +20 points
    if (day.weatherCode === 0) {
      score += 40;
    } else if (day.weatherCode >= 1 && day.weatherCode <= 3) {
      score += 20;
    }

    // Comfortable temperature 18-25°C (moderate positive): +30 points
    const tempAvg = (day.tempMax + day.tempMin) / 2;
    if (tempAvg >= 18 && tempAvg <= 25) {
      score += 30;
    } else if (tempAvg >= 15 && tempAvg <= 28) {
      score += 15; // Somewhat comfortable
    }

    // Low wind (minor positive): +10 points
    if (day.windSpeedMax < 20) {
      score += 10;
    } else if (day.windSpeedMax < 30) {
      score += 5; // Moderate wind
    }

    // Sunshine duration (minor positive): +1 point per hour
    const sunrise = new Date(day.sunrise);
    const sunset = new Date(day.sunset);
    const daylightHours = (sunset.getTime() - sunrise.getTime()) / (1000 * 60 * 60);
    score += Math.min(daylightHours, 16); // Cap at 16 hours

    return Math.round(score);
  };

  // Find the best day from forecast
  const findBestDayIndex = (forecast: DailyForecast[]): number => {
    let bestIndex = 0;
    let bestScore = -1;
    let bestTemp = -999;

    forecast.forEach((day, index) => {
      const score = calculateWeatherScore(day);
      if (score > bestScore) {
        bestScore = score;
        bestTemp = day.tempMax;
        bestIndex = index;
      } else if (score === bestScore) {
        // Tiebreaker: higher temperature wins
        if (day.tempMax > bestTemp) {
          bestTemp = day.tempMax;
          bestIndex = index;
        }
      }
    });

    return bestIndex;
  };

  // Seeded random generator for consistent but unique per-card randomness
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  // Generate unique particle props for each card based on seed
  const generateParticlePropsForCard = (seed: number, isTodayCard: boolean) => {
    const rainCount = isTodayCard ? 20 : 10;
    const cloudCount = isTodayCard ? 6 : 3;

    const rainProps = Array.from({ length: rainCount }, (_, i) => ({
      left: seededRandom(seed * 100 + i * 7) * 100,
      delay: seededRandom(seed * 200 + i * 13) * 2,
      duration: 1.5 + seededRandom(seed * 300 + i * 17) * 1,
    }));

    const cloudProps = Array.from({ length: cloudCount }, (_, i) => ({
      top: seededRandom(seed * 400 + i * 19) * (isTodayCard ? 90 : 80),
      delay: seededRandom(seed * 500 + i * 23) * 6,
      duration: 16 + seededRandom(seed * 600 + i * 29) * 12,
      width: (isTodayCard ? 200 : 140) + seededRandom(seed * 700 + i * 31) * (isTodayCard ? 180 : 120),
      height: (isTodayCard ? 90 : 60) + seededRandom(seed * 800 + i * 37) * (isTodayCard ? 80 : 50),
    }));

    const snowCount = isTodayCard ? 20 : 10;
    const snowProps = Array.from({ length: snowCount }, (_, i) => ({
      left: (i + 1) * (100 / (snowCount + 1)) + seededRandom(seed * 900 + i * 41) * 5 - 2.5,
      delay: seededRandom(seed * 1000 + i * 43) * 0.3,
    }));

    return { rainProps, cloudProps, snowProps };
  };

  const renderParticles = (weatherCode: number, isTodayCard: boolean = false, cardSeed: number = 0) => {
    if (!animationsEnabled) return null;

    const weatherClass = getWeatherClass(weatherCode);
    const particleProps = generateParticlePropsForCard(cardSeed, isTodayCard);

    // Rain particles - Today: 20 drops, Forecast: 10 drops
    if (weatherClass === 'weather-rain') {
      return (
        <div className="weather-particles">
          {particleProps.rainProps.map((props, i) => (
            <div 
              key={i} 
              className={`rain-drop ${isTodayCard ? '' : 'forecast-particle'}`}
              style={{ 
                left: `${props.left}%`, 
                animationDelay: `${props.delay}s`,
                animationDuration: `${props.duration}s`
              }} 
            />
          ))}
        </div>
      );
    }

    // Snow particles - Today: 20 snowflakes, Forecast: 10 snowflakes
    if (weatherClass === 'weather-snow') {
      return (
        <div className="weather-particles">
          {particleProps.snowProps.map((props, i) => (
            <div 
              key={i} 
              className={`snowflake ${isTodayCard ? '' : 'forecast-particle'}`}
              style={{ 
                left: `${props.left}%`, 
                animationDelay: `${props.delay}s` 
              }} 
            />
          ))}
        </div>
      );
    }

    // Cloud wisps - Today: 6 wisps, Forecast: 3 wisps
    if (weatherClass === 'weather-cloudy') {
      return (
        <div className="weather-particles">
          {particleProps.cloudProps.map((props, i) => (
            <div 
              key={i} 
              className={`cloud-wisp ${isTodayCard ? '' : 'forecast-particle'}`}
              style={{ 
                top: `${props.top}%`, 
                animationDelay: `${props.delay}s`,
                animationDuration: `${props.duration}s`,
                width: `${props.width}px`,
                height: `${props.height}px`
              }} 
            />
          ))}
        </div>
      );
    }

    // Fog layers - Same for both (4 layers)
    if (weatherClass === 'weather-fog') {
      return (
        <div className="weather-particles">
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className={`fog-layer ${isTodayCard ? '' : 'forecast-particle'}`}
              style={{ 
                top: `${15 + i * 25}%`, 
                animationDelay: `${i * 1.5 + seededRandom(cardSeed * 50 + i) * 2}s` 
              }} 
            />
          ))}
        </div>
      );
    }

    return null;
  };

  const matchingFavorite = favorites.find(
    (fav) => fav.lat === location.lat && fav.lon === location.lon
  );
  const locationDisplay = matchingFavorite?.name || `(${location.lat}, ${location.lon})`;

  // Calculate best day from first 8 days of forecast
  const forecastDays = dailyForecast.slice(0, 8);
  const bestDayIndex = findBestDayIndex(forecastDays);

  return (
    <div className="weather-container">
      {/* Today Section*/}
      <div className={`weather-card today ${animationsEnabled ? getWeatherClass(todayWeather.weatherCode) : ''}`}>
        {renderParticles(todayWeather.weatherCode, true, 1)}
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
          <div className="sun-times">
            <div className="sun-pair">
              <div className="sun-time-item">
                <span className="sun-moon-icon">🌅</span>
                <span className="sun-moon-text">{new Date(dailyForecast[0].sunrise).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
              </div>
              <div className="sun-time-item">
                <span className="sun-moon-icon">🌇</span>
                <span className="sun-moon-text">{new Date(dailyForecast[0].sunset).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
              </div>
            </div>
            <div className="moon-item">
              <span className="sun-moon-icon">🌙</span>
              <span className="sun-moon-text">{getMoonPhaseName(dailyForecast[0].moonPhase)} ({dailyForecast[0].moonIllumination}%)</span>
            </div>
          </div>
        </div>
        <p className="updated">Updated: {new Date(todayWeather.time).toLocaleTimeString()}</p>
      </div>

      {/* Next 8 Days Section*/}
      <div className="forecast-section">
        <div className="forecast-list">
          {forecastDays.map((day, index) => {
            const score = calculateWeatherScore(day);
            const isBestDay = index === bestDayIndex;
            return (
              <div key={index} className={`forecast-card ${animationsEnabled ? getWeatherClass(day.weatherCode) : ''} ${isBestDay ? 'best-day' : ''}`}>
                {renderParticles(day.weatherCode, false, index + 2)}
                <h3>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
                <p className="weather-icon-container">{getWeatherIcon(day.weatherCode)}</p>
              <p><strong>Conditions:</strong> <span className="value">{weatherDescription(day.weatherCode)}</span></p>
              <p><strong>Score:</strong> <span className="value">{score}/100</span></p>
                <p><strong>High:</strong> <span className="value">{convertTemp(day.tempMax).toFixed(1)}°{tempUnit}</span></p>
                <p><strong>Low:</strong> <span className="value">{convertTemp(day.tempMin).toFixed(1)}°{tempUnit}</span></p>
                <p><strong>Precipitation:</strong> <span className="value">{day.precipitationSum} mm</span></p>
                <p><strong>Wind Max:</strong> <span className="value">{convertWindSpeed(day.windSpeedMax).toFixed(1)} {tempUnit === 'F' ? 'mph' : 'km/h'}</span></p>
                <div className="sun-moon-info">
                  <div className="sun-pair">
                    <div className="sun-time-item">
                      <span className="sun-moon-icon">🌅</span>
                      <span className="sun-moon-text">{new Date(day.sunrise).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                    </div>
                    <div className="sun-time-item">
                      <span className="sun-moon-icon">🌇</span>
                      <span className="sun-moon-text">{new Date(day.sunset).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                    </div>
                  </div>
                  <div className="moon-item">
                    <span className="sun-moon-icon">🌙</span>
                    <span className="sun-moon-text">{getMoonPhaseName(day.moonPhase)} ({day.moonIllumination}%)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};