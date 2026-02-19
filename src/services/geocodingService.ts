import axios from 'axios';

export interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // State/Province
}

const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';

/**
 * Search for locations by name using Open-Meteo Geocoding API
 * @param query - Location name (e.g., "London, UK")
 * @returns Array of matching locations with coordinates
 */
export const searchLocations = async (query: string): Promise<GeocodingResult[]> => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const response = await axios.get(GEOCODING_API, {
      params: {
        name: query.trim(),
        count: 10, // Return up to 10 results
        language: 'en',
        format: 'json',
      },
    });

    // Open-Meteo returns results in the format { results: [...] }
    if (!response.data.results) {
      return [];
    }

    // Map results to our GeocodingResult format
    return response.data.results.map((result: any) => ({
      name: result.name,
      latitude: result.latitude,
      longitude: result.longitude,
      country: result.country,
      admin1: result.admin1,
    }));
  } catch (error) {
    console.error('Geocoding API error:', error);
    return [];
  }
};

/**
 * Format a location result for display
 * @param result - GeocodingResult object
 * @returns Formatted string (e.g., "London, United Kingdom")
 */
export const formatLocationDisplay = (result: GeocodingResult): string => {
  const parts = [result.name];
  if (result.admin1) {
    parts.push(result.admin1);
  }
  parts.push(result.country);
  return parts.join(', ');
};
