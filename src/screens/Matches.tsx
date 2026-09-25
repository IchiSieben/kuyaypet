import { Check, Home, MapPin, Settings2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, EmptyState, ScoreBadge } from '@/components/ui';
import { FavoriteButton } from '@/components/PetCard';
import { computeMatch, formatKm } from '@/lib/match';
import { useCurrentUser } from '@/services/auth';
import { findDirectThread } from '@/services/chat';
import { useMatchesFor } from '@/services/match';
import { ageLabel, isAvailable, SIZE_LABEL, SPECIES_LABEL, usePets } from '@/services/pets';
import { useDb } from '@/services/store';
import type { Species } from '@/types';

const HOUSING_LABEL = { departamento: 'Departamento', casa_sin_patio: 'Casa sin patio', casa_con_patio: 'Casa con patio' } as const;

export function Matches() {
  const user = useCurrentUser();
  const pets = usePets();
  const navigate = useNavigate();
  const matches = useMatchesFor(user?.id);
  const pending = useDb((s) => s.interests).filter((i) => i.adopterId === user?.id && i.status === 'pendiente');
  const [sort, setSort] = useState<'score' | 'distance'>('score');
  const [species, setSpecies] = useState<Species | 'todas'>('todas');

  const ranked = useMemo(() => {
    if (!user?.profile) return [];
    return pets
      .filter(isAvailable)
      .filter((p) => species === 'todas' || p.species === species)
      .map((pet) => ({ pet, m: computeMatch(user.profile!, pet) }))
      .filter((x) => !x.m.hardBlock)
      .sort((a, b) => (sort === 'score' ? b.m.score - a.m.score : a.m.distanceKm - b.m.distanceKm));
  }, [pets, user?.profile, sort, species]);

  if (!user) return null;
  if (!user.profile)
    return (
      <div data-hu="HU-20">
        <EmptyState emoji="📝" title="Completa tus preferencias" body="Necesitamos conocerte para calcular tu compatibilidad con cada mascota." action={<Button onClick={() => navigate('/onboarding')}>Completar preferencias</Button>} />
      </div>
    );

  const mutual = matches
    .map((m) => ({ m, pet: pets.find((p) => p.id === m.petId) }))
    .filter((x) => x.pet)
    .sort((a, b) => b.m.createdAt.localeCompare(a.m.createdAt));

  return (
    <div className="space-y-5 px-4 pb-6" data-hu="HU-20">
      <div>
        <h1 className="text-2xl font-extrabold">💞 Mis Matches</h1>
        <p className="text-sm text-cocoa-500">Conoce las mascotas que mejor se adaptan a ti.</p>
      </div>

      <section data-hu="HU-07" data-tour="mutual-matches">
        <h2 className="mb-2 flex items-center justify-between text-lg font-bold">
          Interés mutuo <span className="text-sm font-semibold text-cocoa-500">{mutual.length}</span>
        </h2>
        {mutual.length === 0 ? (
          <p className="rounded-2xl bg-white p-3 text-sm text-cocoa-500">Aún no tienes Matches. Da “Me gusta” en Descubrir: cuando el responsable acepte, aparecerán aquí.</p>
        ) : (
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {mutual.map(({ m, pet }) => {
              const thread = findDirectThread(m.petId, m.adopterId, m.ownerId);
              return (
                <button key={m.id} onClick={() => thread && navigate(`/chats/${thread.id}`)} className="flex w-20 shrink-0 flex-col items-center gap-1">
                  <span className="relative">
                    <img src={pet!.photos[0]} alt="" className="h-20 w-20 rounded-full border-4 border-coral object-cover shadow-soft" />
                    {pet!.status === 'adoptada' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-sage px-1.5 text-[10px] font-bold text-white">Adoptada</span>}
                  </span>
                  <span className="truncate text-sm font-bold">{pet!.name}</span>
                </button>
              );
            })}
          </div>
        )}
        {pending.length > 0 && (
          <p className="mt-2 text-sm text-cocoa-500">
            ⏳ {pending.length} {pending.length === 1 ? 'interés espera' : 'intereses esperan'} la respuesta del responsable.
          </p>
        )}
      </section>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-bold">
            <Settings2 size={18} /> Tus preferencias
          </h2>
          <Link to="/onboarding" className="text-sm font-bold text-terra underline underline-offset-4">
            Editar
          </Link>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-cocoa-700">
          <span className="flex items-center gap-1">
            <MapPin size={14} /> {user.profile.district} · {user.profile.radiusKm} km
          </span>
          <span className="flex items-center gap-1">
            <Home size={14} /> {HOUSING_LABEL[user.profile.housing]}
          </span>
          <span>🐾 {user.profile.prefs.species.length ? user.profile.prefs.species.map((s) => SPECIES_LABEL[s]).join(' o ') : 'Perro o gato'}</span>
        </div>
      </Card>

      <section>
        <h2 className="mb-2 text-lg font-bold">Más compatibles contigo</h2>
        <div className="mb-3 flex gap-2">
          <select aria-label="Ordenar por" className="input !py-2 text-sm" value={sort} onChange={(e) => setSort(e.target.value as 'score' | 'distance')}>
            <option value="score">Mayor compatibilidad</option>
            <option value="distance">Más cerca</option>
          </select>
          <select aria-label="Especie" className="input !py-2 text-sm" value={species} onChange={(e) => setSpecies(e.target.value as Species | 'todas')}>
            <option value="todas">Todas</option>
            <option value="perro">Perros</option>
            <option value="gato">Gatos</option>
          </select>
        </div>
        {ranked.length === 0 ? (
          <EmptyState emoji="🔎" title="No encontramos mascotas compatibles" body="Prueba ampliando tu radio o ajustando tus preferencias." action={<Button onClick={() => navigate('/onboarding')}>Editar preferencias</Button>} />
        ) : (
          <div className="space-y-3">
            {ranked.map(({ pet, m }, i) => (
              <Link key={pet.id} to={`/mascota/${pet.id}`} className={`flex gap-3 rounded-3xl bg-white p-3 shadow-soft transition hover:shadow-card ${i === 0 && sort === 'score' ? 'ring-2 ring-honey' : ''}`}>
                <div className="relative shrink-0">
                  <img src={pet.photos[0]} alt="" loading="lazy" className="h-28 w-24 rounded-2xl object-cover" />
                  {i === 0 && sort === 'score' && <span className="absolute -left-1 -top-2 rounded-full bg-honey px-2 py-0.5 text-[10px] font-extrabold text-cocoa">⭐ Mejor</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <h3 className="text-lg font-bold leading-tight">{pet.name}</h3>
                      <p className="text-xs text-cocoa-500">
                        {SPECIES_LABEL[pet.species]} · {ageLabel(pet.ageMonths)} · {SIZE_LABEL[pet.size]}
                      </p>
                      <p className="text-xs text-cocoa-500">
                        {pet.district} · {formatKm(m.distanceKm)}
                      </p>
                    </div>
                    <ScoreBadge score={m.score} className="!px-2 text-sm" />
                  </div>
                  <p className="mt-1.5 text-[11px] font-bold text-cocoa-300">Coincide contigo porque:</p>
                  <ul className="text-xs text-cocoa-700">
                    {m.reasons.slice(0, 2).map((r) => (
                      <li key={r.factor} className="flex items-start gap-1">
                        <Check size={14} className="mt-px shrink-0 text-sage" /> <span className="line-clamp-1">{r.text.replace(/^\S+\s/, '')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <FavoriteButton pet={pet} className="self-end" />
              </Link>
            ))}
          </div>
        )}
        <p className="mt-4 text-center text-xs text-cocoa-300">ⓘ Los resultados se basan en las preferencias de tu perfil.</p>
      </section>
    </div>
  );
}
