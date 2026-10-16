import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { formatKm } from '@/lib/match';
import type { GeoPoint, Pet } from '@/types';

function petIcon(pet: Pet) {
  return L.divIcon({
    className: '',
    html: `<div style="width:40px;height:40px;border-radius:9999px;border:3px solid #fff;box-shadow:0 0 0 1px rgba(60,40,30,.18);overflow:hidden;background:#e8ddd0"><img src="${pet.photos[0]}" style="width:100%;height:100%;object-fit:cover" /></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

function InvalidateSize() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

function TileWatcher({ onOffline }: { onOffline: () => void }) {
  const map = useMap();
  useEffect(() => {
    const handler = () => onOffline();
    map.eachLayer((layer) => {
      if ((layer as L.TileLayer).getTileUrl) {
        layer.on('tileerror', handler);
      }
    });
  }, [map, onOffline]);
  return null;
}

export default function PetMap({
  center,
  radiusKm,
  pets,
  distances,
}: {
  center: GeoPoint;
  radiusKm: number;
  pets: Pet[];
  distances: Map<string, number>;
}) {
  const [tilesOffline, setTilesOffline] = useState(false);
  const mapKey = useRef(`${center.lat},${center.lng}`);
  mapKey.current = `${center.lat},${center.lng}`;

  return (
    <div className="relative isolate h-72 w-full overflow-hidden rounded-3xl ring-1 ring-cocoa/10">
      <MapContainer
        key={mapKey.current}
        center={[center.lat, center.lng]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          eventHandlers={{ tileerror: () => setTilesOffline(true) }}
        />
        <Circle center={[center.lat, center.lng]} radius={radiusKm * 1000} pathOptions={{ color: '#c65a3c', fillOpacity: 0.08 }} />
        {pets.map((p) => (
          <Marker key={p.id} position={[p.location.lat, p.location.lng]} icon={petIcon(p)}>
            <Popup>
              <div className="min-w-[7rem] text-sm">
                <p className="font-display text-base font-bold leading-tight text-cocoa-900">{p.name}</p>
                <p className="mb-1 tabular-nums text-cocoa-500">{formatKm(distances.get(p.id) ?? 0)}</p>
                <Link to={`/mascota/${p.id}`} className="font-bold text-terra-600 underline underline-offset-4">
                  Ver perfil
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
        <InvalidateSize />
        <TileWatcher onOffline={() => setTilesOffline(true)} />
      </MapContainer>
      {tilesOffline && (
        <div className="glass absolute inset-x-3 bottom-3 z-[1000] rounded-full px-4 py-2 text-center text-sm font-semibold text-cocoa-900">
          Mapa sin conexión: usa la vista Lista
        </div>
      )}
    </div>
  );
}
