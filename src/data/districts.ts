import type { District } from '@/types';

// Approximate centroids of Lima Metropolitana / Callao districts (WGS84).
export const DISTRICTS: District[] = [
  { name: 'Miraflores', lat: -12.1211, lng: -77.0297 },
  { name: 'San Isidro', lat: -12.0977, lng: -77.0365 },
  { name: 'Barranco', lat: -12.1498, lng: -77.0213 },
  { name: 'Santiago de Surco', lat: -12.1459, lng: -76.9918 },
  { name: 'San Borja', lat: -12.1077, lng: -76.9990 },
  { name: 'La Molina', lat: -12.0864, lng: -76.9366 },
  { name: 'Jesús María', lat: -12.0776, lng: -77.0492 },
  { name: 'Lince', lat: -12.0845, lng: -77.0351 },
  { name: 'Magdalena del Mar', lat: -12.0911, lng: -77.0703 },
  { name: 'Pueblo Libre', lat: -12.0746, lng: -77.0633 },
  { name: 'San Miguel', lat: -12.0776, lng: -77.0903 },
  { name: 'Chorrillos', lat: -12.1686, lng: -77.0158 },
  { name: 'San Martín de Porres', lat: -12.0292, lng: -77.0550 },
  { name: 'Los Olivos', lat: -11.9918, lng: -77.0706 },
  { name: 'Callao', lat: -12.0566, lng: -77.1181 },
  { name: 'Ate', lat: -12.0266, lng: -76.9186 },
  { name: 'Surquillo', lat: -12.1136, lng: -77.0122 },
  { name: 'Cercado de Lima', lat: -12.0464, lng: -77.0428 },
  { name: 'San Juan de Miraflores', lat: -12.1569, lng: -76.9722 },
  { name: 'Comas', lat: -11.9331, lng: -77.0460 },
];

export function districtByName(name: string): District {
  return DISTRICTS.find((d) => d.name === name) ?? DISTRICTS[0];
}
