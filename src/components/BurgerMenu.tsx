import { useState } from 'react';
import './BurgerMenu.css';

interface BurgerMenuProps {
  onLocationSubmit: (lat: number, lon: number) => void;
  tempUnit: 'C' | 'F';
  setTempUnit: (unit: 'C' | 'F') => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const BurgerMenu = ({ onLocationSubmit, tempUnit, setTempUnit, isOpen, setIsOpen }: BurgerMenuProps) => {
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    if (!isNaN(latitude) && !isNaN(longitude)) {
      onLocationSubmit(latitude, longitude);
      setLat('');
      setLon('');
      setIsOpen(false);
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
          <div
            className="burger-menu-drawer"
            onClick={(e) => e.stopPropagation()} // Prevent overlay click from closing the drawer
          >
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
              <button type="submit" style={{ marginTop: '0.5em', padding: '0.5em' }}>
                Set Location
              </button>
            </form>

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