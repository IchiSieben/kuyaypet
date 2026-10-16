// HU-17: favoritos del adoptante. Persiste en el store (localStorage) → sobrevive a logout.
import { useNavigate } from 'react-router-dom';
import { Button, EmptyState, PageHeader } from '@/components/ui';
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
    <div className="px-4 pb-8" data-hu="HU-17">
      <PageHeader
        back
        title="Tus favoritos"
        subtitle="Mascotas que guardaste para verlas más tarde."
      />
      {favoritePets.length === 0 ? (
        <EmptyState
          emoji="🤍"
          title="Aún no tienes favoritos"
          body="Toca el corazón en cualquier mascota para guardarla aquí."
          action={
            <Button variant="soft" onClick={() => navigate('/buscar')}>
              Explorar mascotas
            </Button>
          }
        />
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
