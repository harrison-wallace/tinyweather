// src/components/BurgerMenu.tsx
import { useEffect, useRef, useState } from 'react';
import { searchLocations, formatLocationDisplay, GeocodingResult } from '../services/geocodingService';

interface BurgerMenuProps {
  onLocationSubmit: (lat: number, lon: number) => void;
  tempUnit: 'C' | 'F';
  setTempUnit: (unit: 'C' | 'F') => void;
  windUnit: 'kmh' | 'mph';
  setWindUnit: (unit: 'kmh' | 'mph') => void;
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

// ---------------------------------------------------------------------------
// Reusable Tailwind class fragments
// (Tailwind v4 only allows opacity multiples of 5: /5 /10 /15 /20 /25…)
// ---------------------------------------------------------------------------
const labelCaps  = 'block text-[11px] uppercase tracking-[0.18em] font-medium text-white/45 mb-1.5';
const sectionH3  = 'mt-7 mb-2 text-[11px] uppercase tracking-[0.2em] font-medium text-white/55';
const fieldInput =
  'w-full bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono ' +
  'px-3 py-2.5 transition-colors outline-none ' +
  'focus:border-white/30 focus:bg-white/10 focus:ring-2 focus:ring-white/10 ' +
  'placeholder:text-white/30';
const btnBase =
  'w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium ' +
  'transition-all border min-h-[44px] uppercase tracking-wider ' +
  'disabled:opacity-40 disabled:cursor-not-allowed';
const btnPrimary =
  `${btnBase} bg-white/10 border-white/20 text-white hover:bg-white/15 hover:border-white/30 ` +
  'shadow-[0_4px_18px_-8px_rgba(0,0,0,0.6)]';
const btnSecondary =
  `${btnBase} bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white`;
const radioRow =
  'inline-flex items-center gap-2 cursor-pointer select-none px-3 py-2 rounded-lg ' +
  'bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm';

const SEARCH_DEBOUNCE_MS = 250;

export const BurgerMenu = ({
  onLocationSubmit,
  tempUnit,
  setTempUnit,
  windUnit,
  setWindUnit,
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
  const [searchQuery, setSearchQuery]         = useState('');
  const [searchResults, setSearchResults]     = useState<GeocodingResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedResult, setSelectedResult]   = useState<GeocodingResult | null>(null);
  const [isSearchMode, setIsSearchMode]       = useState(true);

  const [lat, setLat]   = useState('');
  const [lon, setLon]   = useState('');
  const [name, setName] = useState('');

  // Debounce + abort the geocoding lookup so we don't fire on every keystroke.
  const debounceRef = useRef<number | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    setSelectedResult(null);

    if (debounceRef.current !== null) window.clearTimeout(debounceRef.current);
    searchAbortRef.current?.abort();

    if (value.trim().length < 2) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = window.setTimeout(async () => {
      const ctrl = new AbortController();
      searchAbortRef.current = ctrl;
      const results = await searchLocations(value, ctrl.signal);
      if (ctrl.signal.aborted) return;
      setSearchResults(results);
      setShowSuggestions(true);
    }, SEARCH_DEBOUNCE_MS);
  };

  // Close on Escape; cleanup pending search timers/aborts on unmount.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, setIsOpen]);

  useEffect(() => () => {
    if (debounceRef.current !== null) window.clearTimeout(debounceRef.current);
    searchAbortRef.current?.abort();
  }, []);

  const switchMode = (toSearch: boolean) => {
    setIsSearchMode(toSearch);
    setSelectedResult(null);
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (result: GeocodingResult) => {
    setSelectedResult(result);
    setSearchQuery(formatLocationDisplay(result));
    setShowSuggestions(false);
  };

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

  const handleSaveSearchedLocation = () => {
    if (selectedResult) {
      addFavorite(selectedResult.latitude, selectedResult.longitude, selectedResult.name);
      setSearchQuery('');
      setSearchResults([]);
      setSelectedResult(null);
    }
  };

  const handleCoordinateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const latitude  = parseFloat(lat);
    const longitude = parseFloat(lon);
    if (!isNaN(latitude) && !isNaN(longitude)) {
      onLocationSubmit(latitude, longitude);
      setLat(''); setLon(''); setName('');
      setIsOpen(false);
    } else {
      alert('Please enter valid latitude and longitude values.');
    }
  };

  const handleAddCoordinateFavorite = () => {
    const latitude  = parseFloat(lat);
    const longitude = parseFloat(lon);
    if (!isNaN(latitude) && !isNaN(longitude)) {
      addFavorite(latitude, longitude, name || undefined);
      setLat(''); setLon(''); setName('');
    } else {
      alert('Please enter valid latitude and longitude values.');
    }
  };

  return (
    <>
      {/* Trigger button — fixed top-left */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        className="fixed top-4 left-4 z-50 inline-flex items-center justify-center w-12 h-12 rounded-xl
                   bg-white/10 hover:bg-white/15 active:bg-white/20
                   border border-white/15 text-white text-xl
                   backdrop-blur-md transition-all
                   shadow-[0_4px_18px_-8px_rgba(0,0,0,0.6)]"
      >
        ☰
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm anim-fade-in"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        >
          <aside
            className="absolute top-0 left-0 h-full w-[360px] max-w-[88vw]
                       bg-[#0c0c0c]/95 backdrop-blur-xl
                       border-r border-white/10
                       shadow-[6px_0_28px_-4px_rgba(0,0,0,0.7)]
                       overflow-y-auto overscroll-contain
                       px-6 py-6 anim-fade-up"
            style={{ animationDuration: '0.28s' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Settings"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-xl font-semibold text-gradient leading-tight">TinyWeather</h1>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/35 mt-1">Settings</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
                className="w-9 h-9 rounded-lg flex items-center justify-center
                           text-white/55 hover:text-white hover:bg-white/10 transition-colors"
              >
                ✖
              </button>
            </div>

            {/* Mode toggle */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-white/5 border border-white/10 mb-4">
              <button
                type="button"
                onClick={() => switchMode(true)}
                className={`px-3 py-2 rounded-lg text-xs uppercase tracking-wider transition-colors ${
                  isSearchMode
                    ? 'bg-white/15 text-white shadow-[0_0_12px_-4px_rgba(255,255,255,0.2)]'
                    : 'text-white/55 hover:text-white hover:bg-white/10'
                }`}
              >
                🔍 Search
              </button>
              <button
                type="button"
                onClick={() => switchMode(false)}
                className={`px-3 py-2 rounded-lg text-xs uppercase tracking-wider transition-colors ${
                  !isSearchMode
                    ? 'bg-white/15 text-white shadow-[0_0_12px_-4px_rgba(255,255,255,0.2)]'
                    : 'text-white/55 hover:text-white hover:bg-white/10'
                }`}
              >
                📍 Coords
              </button>
            </div>

            {/* Search form */}
            {isSearchMode && (
              <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    placeholder="e.g., London, UK"
                    className={fieldInput}
                  />
                  {showSuggestions && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-10
                                    bg-[#0c0c0c]/95 backdrop-blur-xl
                                    border border-white/10 rounded-lg overflow-hidden
                                    max-h-72 overflow-y-auto
                                    shadow-[0_12px_32px_-8px_rgba(0,0,0,0.7)]">
                      {searchResults.map((result) => (
                        <button
                          key={`${result.latitude},${result.longitude}`}
                          type="button"
                          onClick={() => handleSelectSuggestion(result)}
                          className="w-full px-3 py-2.5 text-left
                                     border-b border-white/5 last:border-0
                                     hover:bg-white/10 active:bg-white/15 transition-colors"
                        >
                          <div className="text-sm text-white font-medium">{result.name}</div>
                          <div className="text-xs text-white/45 tabular-nums">
                            {result.admin1 ? `${result.admin1}, ` : ''}{result.country}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {showSuggestions && searchResults.length === 0 && searchQuery.trim().length >= 2 && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-10
                                    bg-[#0c0c0c]/95 border border-white/10 rounded-lg
                                    px-3 py-3 text-sm text-white/45 text-center">
                      No locations found
                    </div>
                  )}
                </div>
                <button type="submit" disabled={!selectedResult} className={btnPrimary}>
                  Set Location
                </button>
                {selectedResult && (
                  <button type="button" onClick={handleSaveSearchedLocation} className={btnSecondary}>
                    ⭐ Add “{selectedResult.name}” to Favorites
                  </button>
                )}
              </form>
            )}

            {/* Coordinate form */}
            {!isSearchMode && (
              <form onSubmit={handleCoordinateSubmit} className="flex flex-col gap-3">
                <div>
                  <label htmlFor="bm-lat" className={labelCaps}>Latitude</label>
                  <input id="bm-lat" type="text" value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="e.g., 51.5074" className={fieldInput} />
                </div>
                <div>
                  <label htmlFor="bm-lon" className={labelCaps}>Longitude</label>
                  <input id="bm-lon" type="text" value={lon}
                    onChange={(e) => setLon(e.target.value)}
                    placeholder="e.g., -0.1278" className={fieldInput} />
                </div>
                <div>
                  <label htmlFor="bm-name" className={labelCaps}>Name (optional)</label>
                  <input id="bm-name" type="text" value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., London" className={fieldInput} />
                </div>
                <button type="submit" className={btnPrimary}>Set Location</button>
                <button type="button" onClick={handleAddCoordinateFavorite} className={btnSecondary}>
                  ⭐ Add to Favorites
                </button>
              </form>
            )}

            {/* Favorites */}
            <h3 className={sectionH3}>⭐ Favorites</h3>
            {favorites.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {favorites.map((fav) => (
                  <li key={`${fav.lat},${fav.lon}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg
                                 bg-white/5 border border-white/10 hover:bg-white/10
                                 transition-colors">
                    <button
                      type="button"
                      onClick={() => selectFavorite(fav)}
                      className="flex-1 text-left text-sm text-white truncate hover:text-white"
                    >
                      {fav.name || `${fav.lat.toFixed(2)}, ${fav.lon.toFixed(2)}`}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFavorite(fav.lat, fav.lon)}
                      title="Remove from favorites"
                      aria-label={`Remove ${fav.name ?? 'favorite'}`}
                      className="w-9 h-9 flex items-center justify-center rounded-lg
                                 text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-white/35 text-sm italic text-center py-3">No favorites yet</p>
            )}

            <hr className="my-6 border-white/10" />

            {/* Settings groups */}
            <h3 className={sectionH3}>🌡️ Temperature</h3>
            <div className="flex gap-2">
              {(['C', 'F'] as const).map((u) => (
                <label key={u} className={radioRow}>
                  <input type="radio" name="temp" value={u}
                    checked={tempUnit === u}
                    onChange={() => setTempUnit(u)}
                    className="accent-white/80" />
                  {u === 'C' ? 'Celsius' : 'Fahrenheit'}
                </label>
              ))}
            </div>

            <h3 className={sectionH3}>💨 Wind Speed</h3>
            <div className="flex gap-2">
              {(['mph', 'kmh'] as const).map((u) => (
                <label key={u} className={radioRow}>
                  <input type="radio" name="wind" value={u}
                    checked={windUnit === u}
                    onChange={() => setWindUnit(u)}
                    className="accent-white/80" />
                  {u === 'mph' ? 'mph' : 'km/h'}
                </label>
              ))}
            </div>

            <h3 className={sectionH3}>📏 Text Size</h3>
            <div className="flex gap-2 flex-wrap">
              {(['small', 'medium', 'large'] as const).map((s) => (
                <label key={s} className={radioRow}>
                  <input type="radio" name="textsize" value={s}
                    checked={textSize === s}
                    onChange={() => setTextSize(s)}
                    className="accent-white/80" />
                  <span className="capitalize">{s}</span>
                </label>
              ))}
            </div>

            <h3 className={sectionH3}>✨ Animations</h3>
            <label className={radioRow + ' w-full'}>
              <input type="checkbox"
                checked={animationsEnabled}
                onChange={(e) => setAnimationsEnabled(e.target.checked)}
                className="accent-white/80" />
              Enable subtle fade-in animations
            </label>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className={btnSecondary + ' mt-6'}
            >
              Close
            </button>
          </aside>
        </div>
      )}
    </>
  );
};
