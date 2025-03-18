// src/components/BurgerMenu.tsx
import { useState } from 'react';
import './BurgerMenu.css';

interface BurgerMenuProps {
  onLocationSubmit: (lat: number, lon: number) => void;
  tempUnit: 'C' | 'F';
  setTempUnit: (unit: 'C' | 'F') => void;
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
        style={{
          background: 'transparent',
          border: 'none',
          color: '#ddd',
          fontSize: '1.5rem',
          cursor: 'pointer',
        }}
      >
        ☰
      </button>
      {isOpen && (
        <div className="burger-menu-overlay" onClick={() => setIsOpen(false)}>
          <div className="burger-menu-drawer" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#fff', margin: 0 }}>Settings</h3>
              <button
                className="close-button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ddd',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                }}
              >
                ✖
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5em', marginTop: '1em' }}>
              <label style={{ color: '#fff' }}>
                Latitude:
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="e.g., 51.5074"
                  style={{ width: '100%', padding: '0.3em', marginTop: '0.2em' }}
                />
              </label>
              <label style={{ color: '#fff' }}>
                Longitude:
                <input
                  type="text"
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                  placeholder="e.g., -0.1278"
                  style={{ width: '100%', padding: '0.3em', marginTop: '0.2em' }}
                />
              </label>
              <label style={{ color: '#fff' }}>
                Name (optional):
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., London"
                  style={{ width: '100%', padding: '0.3em', marginTop: '0.2em' }}
                />
              </label>
              <button type="submit" style={{ marginTop: '0.5em', padding: '0.5em' }}>
                Set Location
              </button>
              <button type="button" onClick={handleAddFavorite} style={{ marginTop: '0.5em', padding: '0.5em' }}>
                Add to Favorites
              </button>
            </form>

            <h3 style={{ color: '#fff', marginTop: '1em' }}>Favorites</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {favorites.map((fav, index) => (
                <li key={index} style={{ color: '#fff', marginBottom: '0.5em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={() => selectFavorite(fav)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#646cff',
                      cursor: 'pointer',
                      padding: 0,
                      textAlign: 'left',
                    }}
                  >
                    {fav.name || `(${fav.lat}, ${fav.lon})`}
                  </button>
                  <button
                    onClick={() => removeFavorite(fav.lat, fav.lon)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ff4444',
                      cursor: 'pointer',
                      padding: '0 0.5em',
                      fontSize: '1rem',
                    }}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            <h3 style={{ color: '#fff', marginTop: '1em' }}>Temperature Unit</h3>
            <div style={{ display: 'flex', gap: '1em' }}>
              <label style={{ color: '#fff' }}>
                <input
                  type="radio"
                  value="C"
                  checked={tempUnit === 'C'}
                  onChange={() => setTempUnit('C')}
                />
                Celsius
              </label>
              <label style={{ color: '#fff' }}>
                <input
                  type="radio"
                  value="F"
                  checked={tempUnit === 'F'}
                  onChange={() => setTempUnit('F')}
                />
                Fahrenheit
              </label>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{ marginTop: '1em', width: '100%', padding: '0.5em' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};