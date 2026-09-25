import { useMemo } from 'react';
import { EmptyState } from '@/components/ui';
import { PetCard } from '@/components/PetCard';
import { formatKm, haversineKm } from '@/lib/match';
import { useCurrentUser } from '@/services/auth';
import { isAvailable, usePets } from '@/services/pets';

/** HU-02: available pets grid. Filters (HU-04) and proximity (HU-05) arrive in Fase 1. */
export function Browse() {
  const user = useCurrentUser();
  const pets = usePets();
  const list = useMemo(() => pets.filter(isAvailable), [pets]);
  const origin = user?.profile?.location;

  return (
    <div className="px-4 pb-6" data-hu="HU-02">
      <h1 className="text-2xl font-extrabold">Mascotas disponibles</h1>
      <p className="mb-4 text-sm text-cocoa-500">Cada mascota merece una segunda oportunidad ♥</p>
      {list.length === 0 ? (
        <EmptyState emoji="🐾" title="No hay mascotas disponibles por ahora" body="Vuelve pronto: los albergues publican nuevas mascotas cada semana." />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {list.map((p) => (
            <PetCard key={p.id} pet={p} distance={origin ? formatKm(haversineKm(origin, p.location)) : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
