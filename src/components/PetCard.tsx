import { Calendar, Heart, MapPin, PawPrint } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScoreBadge } from '@/components/ui';
import { useCurrentUser } from '@/services/auth';
import { toggleFavorite, useIsFavorite } from '@/services/match';
import { ageLabel, SPECIES_LABEL } from '@/services/pets';
import { toast } from '@/services/ui';
import type { Pet } from '@/types';

export function FavoriteButton({ pet, className = '' }: { pet: Pet; className?: string }) {
  const user = useCurrentUser();
  const fav = useIsFavorite(user?.id, pet.id);
  if (!user || user.role !== 'adopter') return null;
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        const added = toggleFavorite(user.id, pet.id);
        toast({ title: added ? `${pet.name} está en tus favoritos` : `Quitaste a ${pet.name} de favoritos`, emoji: added ? '❤️' : '🤍' });
      }}
      aria-pressed={fav}
      aria-label={fav ? `Quitar a ${pet.name} de favoritos` : `Agregar a ${pet.name} a favoritos`}
      className={`rounded-full bg-white/90 p-2 shadow-soft transition active:scale-90 ${className}`}
    >
      <Heart size={18} className={fav ? 'fill-coral text-coral' : 'text-cocoa-500'} />
    </button>
  );
}

export function StatusBadge({ pet }: { pet: Pet }) {
  if (pet.status === 'adoptada') return <span className="rounded-full bg-sage px-2.5 py-0.5 text-xs font-bold text-white">Adoptada 🎉</span>;
  if (pet.status === 'retirada') return <span className="rounded-full bg-cocoa-300 px-2.5 py-0.5 text-xs font-bold text-white">No disponible</span>;
  return null;
}

export function PetCard({ pet, score, distance }: { pet: Pet; score?: number; distance?: string }) {
  return (
    <Link to={`/mascota/${pet.id}`} className="group block overflow-hidden rounded-3xl bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-card">
      <div className="relative aspect-square overflow-hidden bg-cream-200">
        <img src={pet.photos[0]} alt={`Foto de ${pet.name}`} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
        <FavoriteButton pet={pet} className="absolute right-2 top-2" />
        {score !== undefined && <ScoreBadge score={score} className="absolute bottom-2 left-2 !px-2 text-sm" />}
        <span className="absolute left-2 top-2">
          <StatusBadge pet={pet} />
        </span>
      </div>
      <div className="space-y-0.5 p-3 text-[13px] text-cocoa-700">
        <h3 className="text-lg font-bold text-cocoa">{pet.name}</h3>
        <p className="flex items-center gap-1.5">
          <PawPrint size={14} className="text-terra" /> {SPECIES_LABEL[pet.species]} · {pet.breed}
        </p>
        <p className="flex items-center gap-1.5">
          <Calendar size={14} className="text-terra" /> {ageLabel(pet.ageMonths)}
        </p>
        <p className="flex items-center gap-1.5">
          <MapPin size={14} className="text-terra" /> {pet.district}
          {distance && <b className="ml-auto text-sage-600">{distance}</b>}
        </p>
      </div>
    </Link>
  );
}
