export interface SeismicEvent {
  id: string;
  title: string;
  magnitude: number;
  depthKm: number;
  latitude: number;
  longitude: number;
  place: string;
  timeIso: string;
  significance: number;
  url: string;
  distanceFromKathmanduKm?: number;
}

// Kathmandu coordinates: 27.7172° N, 85.3240° E
export function calculateDistanceFromKathmanduKm(lat: number, lon: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat - 27.7172) * (Math.PI / 180);
  const dLon = (lon - 85.3240) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(27.7172 * (Math.PI / 180)) *
      Math.cos(lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
