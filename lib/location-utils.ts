/**
 * Location utility functions for CivicTrack
 * Handles location-based filtering and distance calculations
 */

export interface Coordinates {
  lat: number
  lng: number
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param coord1 First coordinate
 * @param coord2 Second coordinate
 * @returns Distance in kilometers
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180)
  const dLng = (coord2.lng - coord1.lng) * (Math.PI / 180)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * (Math.PI / 180)) * Math.cos(coord2.lat * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Check if a coordinate is within a specified radius from a center point
 * @param center Center coordinate
 * @param target Target coordinate to check
 * @param radiusKm Radius in kilometers
 * @returns True if target is within radius
 */
export function isWithinRadius(center: Coordinates, target: Coordinates, radiusKm: number): boolean {
  return calculateDistance(center, target) <= radiusKm
}

/**
 * Filter items by location within specified radius
 * @param items Array of items with location property
 * @param userLocation User's current location
 * @param radiusKm Radius in kilometers
 * @returns Filtered array of items within radius
 */
export function filterByLocation<T extends { location: Coordinates }>(
  items: T[],
  userLocation: Coordinates,
  radiusKm: number
): T[] {
  return items.filter(item => isWithinRadius(userLocation, item.location, radiusKm))
}

/**
 * Get user's current location with enhanced error handling
 * @param options Geolocation options
 * @returns Promise resolving to coordinates or null if failed
 */
export function getCurrentLocation(options?: PositionOptions): Promise<Coordinates | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
      ...options
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      (error) => {
        console.error('Geolocation error:', error)
        resolve(null)
      },
      defaultOptions
    )
  })
}

/**
 * Watch user's location for real-time updates
 * @param callback Function to call when location changes
 * @param options Geolocation options
 * @returns Watch ID that can be used to clear the watch
 */
export function watchLocation(
  callback: (location: Coordinates | null) => void,
  options?: PositionOptions
): number | null {
  if (!navigator.geolocation) {
    callback(null)
    return null
  }

  const defaultOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 60000, // 1 minute
    ...options
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      })
    },
    (error) => {
      console.error('Geolocation watch error:', error)
      callback(null)
    },
    defaultOptions
  )
}

/**
 * Constants for location-based features
 */
export const LOCATION_CONSTANTS = {
  DEFAULT_RADIUS_KM: 3,
  MAX_RADIUS_KM: 5,
  MIN_RADIUS_KM: 1,
  DEFAULT_LOCATION: {
    lat: 40.7128,
    lng: -74.006 // NYC coordinates as fallback
  }
} as const

/**
 * Format distance for display
 * @param distanceKm Distance in kilometers
 * @returns Formatted distance string
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`
  }
  return `${distanceKm.toFixed(1)}km`
}
