import axios from 'axios';

export interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // State/Province
}

interface GeocodingApiResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

interface GeocodingApiResponse {
  results?: GeocodingApiResult[];
}

const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';

/**
 * Search for locations by name using Open-Meteo Geocoding API.
 * @param query  Location name (e.g., "London, UK")
 * @param signal Optional AbortSignal to cancel an in-flight request
 */
export const searchLocations = async (
  query: string,
  signal?: AbortSignal,
): Promise<GeocodingResult[]> => {
  if (!query || query.trim().length < 2) return [];

  try {
    const response = await axios.get<GeocodingApiResponse>(GEOCODING_API, {
      params: {
        name: query.trim(),
        count: 10,
        language: 'en',
        format: 'json',
      },
      signal,
    });

    if (!response.data.results) return [];

    return response.data.results.map((r) => ({
      name: r.name,
      latitude: r.latitude,
      longitude: r.longitude,
      country: r.country,
      admin1: r.admin1,
    }));
  } catch (error) {
    // Swallow user-initiated cancellations; surface real errors only.
    if (axios.isCancel(error) || (error as Error)?.name === 'CanceledError') {
      return [];
    }
    console.error('Geocoding API error:', error);
    return [];
  }
};

/**
 * Format a location result for display, e.g. "London, England, United Kingdom".
 */
export const formatLocationDisplay = (result: GeocodingResult): string => {
  const parts = [result.name];
  if (result.admin1) parts.push(result.admin1);
  parts.push(result.country);
  return parts.join(', ');
};
