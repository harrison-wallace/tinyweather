// src/components/BurgerMenu.tsx
import { useState } from 'react';
import './BurgerMenu.css';
import { searchLocations, formatLocationDisplay, GeocodingResult } from '../services/geocodingService';

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
  removeFavorite: (lat: number, lon: number) => void;
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
  // Search by location state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedResult, setSelectedResult] = useState<GeocodingResult | null>(null);
  const [isSearchMode, setIsSearchMode] = useState(true);

  // Coordinate input state
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [name, setName] = useState('');

  // Handle location search input
  const handleSearchInput = async (value: string) => {
    setSearchQuery(value);
    if (value.trim().length >= 2) {
      const results = await searchLocations(value);
      setSearchResults(results);
      setShowSuggestions(true);
    } else {
      setSearchResults([]);
      setShowSuggestions(false);
    }
  };

  // Handle selecting a suggestion
  const handleSelectSuggestion = (result: GeocodingResult) => {
    setSelectedResult(result);
    setSearchQuery(formatLocationDisplay(result));
    setShowSuggestions(false);
  };

  // Handle submitting location search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedResult) {
      onLocationSubmit(selectedResult.latitude, selectedResult.longitude);
      setSearchQuery('');
      setSearchResults([]);
      setSelectedResult(null);
      setIsOpen(false);
    } else {
      alert('Please select a location from the suggestions.');
    }
  };

  // Handle offering to save searched location to favorites
  const handleSaveSearchedLocation = () => {
    if (selectedResult) {
      addFavorite(selectedResult.latitude, selectedResult.longitude, selectedResult.name);
      setSearchQuery('');
      setSearchResults([]);
      setSelectedResult(null);
    }
  };

  // Handle coordinate submission
  const handleCoordinateSubmit = (e: React.FormEvent) => {
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

  // Handle adding coordinate to favorites
  const handleAddCoordinateFavorite = () => {
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
              <h3>Location Search</h3>
              <button
                className="close-button"
                onClick={() => setIsOpen(false)}
              >
                ✖
              </button>
            </div>

            {/* Mode toggle */}
            <div className="mode-toggle">
              <button
                className={`toggle-btn ${isSearchMode ? 'active' : ''}`}
                onClick={() => setIsSearchMode(true)}
              >
                🔍 Search by Location
              </button>
              <button
                className={`toggle-btn ${!isSearchMode ? 'active' : ''}`}
                onClick={() => setIsSearchMode(false)}
              >
                📍 Enter Coordinates
              </button>
            </div>

            {/* Search by location form */}
            {isSearchMode && (
              <form onSubmit={handleSearchSubmit} className="search-form">
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    placeholder="e.g., London, UK"
                    className="search-input"
                  />
                  {showSuggestions && searchResults.length > 0 && (
                    <div className="suggestions-dropdown">
                      {searchResults.map((result, index) => (
                        <button
                          key={index}
                          type="button"
                          className="suggestion-item"
                          onClick={() => handleSelectSuggestion(result)}
                        >
                          <div className="suggestion-name">{result.name}</div>
                          <div className="suggestion-country">{result.country}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  {showSuggestions && searchResults.length === 0 && searchQuery.trim().length >= 2 && (
                    <div className="suggestions-dropdown">
                      <div className="suggestion-no-results">No locations found</div>
                    </div>
                  )}
                </div>
                <button type="submit" disabled={!selectedResult}>
                  Search Location
                </button>
                {selectedResult && (
                  <button type="button" onClick={handleSaveSearchedLocation} className="secondary-btn">
                    ⭐ Add "{selectedResult.name}" to Favorites
                  </button>
                )}
              </form>
            )}

            {/* Coordinate input form */}
            {!isSearchMode && (
              <form onSubmit={handleCoordinateSubmit} className="coordinate-form">
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
                <button type="button" onClick={handleAddCoordinateFavorite} className="secondary-btn">
                  Add to Favorites
                </button>
              </form>
            )}

            <h3>⭐ Favorites</h3>
            {favorites.length > 0 ? (
              <ul className="favorites-list">
                {favorites.map((fav, index) => (
                  <li key={index}>
                    <button
                      className="favorite-item"
                      onClick={() => {
                        selectFavorite(fav);
                        setIsOpen(false);
                      }}
                    >
                      {fav.name || `(${fav.lat}, ${fav.lon})`}
                    </button>
                    <button
                      className="remove-btn"
                      onClick={() => removeFavorite(fav.lat, fav.lon)}
                      title="Remove from favorites"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-favorites">No favorites yet</p>
            )}

            <hr className="divider" />

            <h3>⚙️ Temperature Unit</h3>
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

            <h3>📏 Text Size</h3>
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

            <h3>✨ Weather Animations</h3>
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
              className="close-btn-bottom"
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
