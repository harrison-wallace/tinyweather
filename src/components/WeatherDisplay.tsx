import './WeatherDisplay.css';

interface WeatherData {
  temperature: number; // In Celsius
  weatherCode: number;
  time: string;
}

interface WeatherDisplayProps {
  weather: WeatherData | null;
  location: { lat: number; lon: number } | null;
  tempUnit: 'C' | 'F';
}

export const WeatherDisplay = ({ weather, location, tempUnit }: WeatherDisplayProps) => {
  if (!weather || !location) {
    return <p>No weather data available. Set a location to get started.</p>;
  }

  // Convert temperature if Fahrenheit is selected
  const displayTemp = tempUnit === 'F' ? (weather.temperature * 9) / 5 + 32 : weather.temperature;

  // Simple weather code mapping (expand as needed)
  const weatherDescription = (code: number) => {
    switch (code) {
      case 0:
        return 'Clear sky';
      case 1:
      case 2:
      case 3:
        return 'Partly cloudy';
      case 45:
      case 48:
        return 'Fog';
      case 61:
      case 63:
      case 65:
        return 'Rain';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="weather-card">
      <h2>Weather at ({location.lat}, {location.lon})</h2>
      <p>Temperature: {displayTemp.toFixed(1)}°{tempUnit}</p>
      <p>Conditions: {weatherDescription(weather.weatherCode)}</p>
      <p>Updated: {new Date(weather.time).toLocaleTimeString()}</p>
    </div>
  );
};