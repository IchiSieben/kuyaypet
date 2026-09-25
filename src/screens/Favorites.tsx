// HU-17: favoritos del adoptante. Persiste en el store (localStorage) → sobrevive a logout.
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/ui';
import { PetCard } from '@/components/PetCard';
import { useCurrentUser } from '@/services/auth';
import { useFavorites } from '@/services/match';
import { useDb } from '@/services/store';

export function Favorites() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const favorites = useFavorites(user?.id);
  const pets = useDb((s) => s.pets);
  const favoritePets = favorites
    .map((f) => pets.find((p) => p.id === f.petId))
    .filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <div className="px-4 pb-6 pt-2" data-hu="HU-17">
      <button onClick={() => navigate(-1)} className="-ml-2 mb-2 flex items-center gap-1 rounded-full px-2 py-1 font-semibold text-cocoa-500 hover:bg-cream-200">
        <ArrowLeft size={18} /> Volver
      </button>
      <h1 className="text-2xl font-extrabold">Tus favoritos</h1>
      <p className="mb-4 text-sm text-cocoa-500">Mascotas que guardaste para verlas más tarde.</p>
      {favoritePets.length === 0 ? (
        <EmptyState emoji="🤍" title="Aún no tienes favoritos" body="Toca el corazón en cualquier mascota para guardarla aquí." />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {favoritePets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      )}
    </div>
  );
}
