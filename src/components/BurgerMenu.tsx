// src/components/BurgerMenu.tsx
import { useState } from 'react';
import './BurgerMenu.css';

interface BurgerMenuProps {
  onLocationSubmit: (lat: number, lon: number) => void;
  tempUnit: 'C' | 'F';
  setTempUnit: (unit: 'C' | 'F') => void;
  textSize: 'small' | 'medium' | 'large';
  setTextSize: (size: 'small' | 'medium' | 'large') => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addFavorite: (lat: number, lon: number, name?: string) => void;
  removeFavorite: (lat: number, lon: number) => void; // New prop
  favorites: FavoriteLocation[];
  selectFavorite: (fav: FavoriteLocation) => void;
}

interface FavoriteLocation {
  lat: number;
  lon: number;
  name?: string;
}

export const BurgerMenu = ({
  onLocationSubmit,
  tempUnit,
  setTempUnit,
  textSize,
  setTextSize,
  animationsEnabled,
  setAnimationsEnabled,
  isOpen,
  setIsOpen,
  addFavorite,
  removeFavorite,
  favorites,
  selectFavorite,
}: BurgerMenuProps) => {
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    if (!isNaN(latitude) && !isNaN(longitude)) {
      onLocationSubmit(latitude, longitude);
      setLat('');
      setLon('');
      setName('');
      setIsOpen(false);
    } else {
      alert('Please enter valid latitude and longitude values.');
    }
  };

  const handleAddFavorite = () => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    if (!isNaN(latitude) && !isNaN(longitude)) {
      addFavorite(latitude, longitude, name || undefined);
      setLat('');
      setLon('');
      setName('');
    } else {
      alert('Please enter valid latitude and longitude values.');
    }
  };

  return (
    <div className="burger-menu">
      <button
        className="burger-button"
        onClick={() => setIsOpen(true)}
      >
        ☰
      </button>
      {isOpen && (
      <div className="burger-menu-overlay" onClick={() => setIsOpen(false)}>
        <div className="burger-menu-drawer" onClick={(e) => e.stopPropagation()}>
          <h1>TinyWeather</h1>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Settings</h3>
            <button
              className="close-button"
              onClick={() => setIsOpen(false)}
            >
              ✖
            </button>
          </div>
            <form onSubmit={handleSubmit}>
              <label>
                Latitude:
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="e.g., 51.5074"
                />
              </label>
              <label>
                Longitude:
                <input
                  type="text"
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                  placeholder="e.g., -0.1278"
                />
              </label>
              <label>
                Name (optional):
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., London"
                />
              </label>
              <button type="submit">
                Set Location
              </button>
              <button type="button" onClick={handleAddFavorite}>
                Add to Favorites
              </button>
            </form>

            <h3>Favorites</h3>
            <ul>
              {favorites.map((fav, index) => (
                <li key={index}>
                  <button
                    onClick={() => selectFavorite(fav)}
                  >
                    {fav.name || `(${fav.lat}, ${fav.lon})`}
                  </button>
                  <button
                    onClick={() => removeFavorite(fav.lat, fav.lon)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            <h3>Temperature Unit</h3>
            <div style={{ display: 'flex', gap: '1em' }}>
              <label>
                <input
                  type="radio"
                  value="C"
                  checked={tempUnit === 'C'}
                  onChange={() => setTempUnit('C')}
                />
                Celsius
              </label>
              <label>
                <input
                  type="radio"
                  value="F"
                  checked={tempUnit === 'F'}
                  onChange={() => setTempUnit('F')}
                />
                Fahrenheit
              </label>
            </div>

            <h3>Text Size</h3>
            <div style={{ display: 'flex', gap: '1em', flexWrap: 'wrap' }}>
              <label>
                <input
                  type="radio"
                  value="small"
                  checked={textSize === 'small'}
                  onChange={() => setTextSize('small')}
                />
                Small
              </label>
              <label>
                <input
                  type="radio"
                  value="medium"
                  checked={textSize === 'medium'}
                  onChange={() => setTextSize('medium')}
                />
                Medium
              </label>
              <label>
                <input
                  type="radio"
                  value="large"
                  checked={textSize === 'large'}
                  onChange={() => setTextSize('large')}
                />
                Large
              </label>
            </div>

            <h3>Weather Animations</h3>
            <div style={{ display: 'flex', gap: '1em' }}>
              <label>
                <input
                  type="checkbox"
                  checked={animationsEnabled}
                  onChange={(e) => setAnimationsEnabled(e.target.checked)}
                />
                Enable weather animations
              </label>
            </div>

            <button
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};