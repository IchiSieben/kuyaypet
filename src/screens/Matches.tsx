import { Check, Home, MapPin, Settings2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Chip, EmptyState, PageHeader, ScoreBadge, Section } from '@/components/ui';
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
    <div className="px-4 pb-8" data-hu="HU-20">
      <PageHeader title="💞 Mis Matches" subtitle="Conoce las mascotas que mejor se adaptan a ti." />

      <Section title="Interés mutuo" aside={<span className="tabular-nums">{mutual.length}</span>} data-hu="HU-07" data-tour="mutual-matches">
        {mutual.length === 0 ? (
          <Card className="p-4 text-[0.95rem] text-cocoa-500">Aún no tienes Matches. Da “Me gusta” en Descubrir: cuando el responsable acepte, aparecerán aquí.</Card>
        ) : (
          <div className="-mx-4 flex gap-4 overflow-x-auto px-5 pb-1 pt-1">
            {mutual.map(({ m, pet }) => {
              const thread = findDirectThread(m.petId, m.adopterId, m.ownerId);
              return (
                <button key={m.id} onClick={() => thread && navigate(`/chats/${thread.id}`)} className="pressable flex w-[4.75rem] shrink-0 flex-col items-center gap-1.5">
                  <span className="relative">
                    <img src={pet!.photos[0]} alt="" className="h-[4.5rem] w-[4.5rem] rounded-full object-cover ring-2 ring-coral ring-offset-2 ring-offset-cream" />
                    {pet!.status === 'adoptada' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-sage px-1.5 text-[10px] font-bold text-white">Adoptada</span>}
                  </span>
                  <span className="w-full truncate text-center text-sm font-bold text-cocoa-900">{pet!.name}</span>
                </button>
              );
            })}
          </div>
        )}
        {pending.length > 0 && (
          <p className="mt-3 px-1 text-sm text-cocoa-500">
            ⏳ {pending.length} {pending.length === 1 ? 'interés espera' : 'intereses esperan'} la respuesta del responsable.
          </p>
        )}
      </Section>

      <Section>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display font-bold text-cocoa-900">
              <Settings2 size={18} className="text-cocoa-500" /> Tus preferencias
            </h2>
            <Link to="/onboarding" className="rounded-full px-2 py-1 text-sm font-bold text-terra-600 hover:bg-terra-50">
              Editar
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip>
              <MapPin size={14} /> {user.profile.district} · {user.profile.radiusKm} km
            </Chip>
            <Chip>
              <Home size={14} /> {HOUSING_LABEL[user.profile.housing]}
            </Chip>
            <Chip>🐾 {user.profile.prefs.species.length ? user.profile.prefs.species.map((s) => SPECIES_LABEL[s]).join(' o ') : 'Perro o gato'}</Chip>
          </div>
        </Card>
      </Section>

      <Section title="Más compatibles contigo">
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
              <Link key={pet.id} to={`/mascota/${pet.id}`} className="surface-2 pressable flex gap-3 rounded-3xl p-3 hover:shadow-card">
                <div className="relative shrink-0">
                  <img src={pet.photos[0]} alt="" loading="lazy" className="h-32 w-28 rounded-2xl bg-cream-200 object-cover" />
                  {i === 0 && sort === 'score' && <span className="glass absolute left-1.5 top-1.5 rounded-full px-2 py-0.5 text-xs font-bold text-cocoa-900">⭐ Mejor</span>}
                  <ScoreBadge score={m.score} className="absolute bottom-1.5 left-1.5 !px-2 text-sm" />
                </div>
                <div className="min-w-0 flex-1">
                  <div>
                    <div className="min-w-0">
                      <h3 className="text-xl font-bold leading-tight text-cocoa-900">{pet.name}</h3>
                      <p className="mt-0.5 text-sm text-cocoa-500">
                        {SPECIES_LABEL[pet.species]} · {ageLabel(pet.ageMonths)} · {SIZE_LABEL[pet.size]}
                      </p>
                      <p className="text-sm text-cocoa-500">
                        {pet.district} · {formatKm(m.distanceKm)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs font-bold text-cocoa-500">Coincide contigo porque:</p>
                  <ul className="mt-0.5 text-sm text-cocoa-700">
                    {m.reasons.slice(0, 2).map((r) => (
                      <li key={r.factor} className="flex items-start gap-1">
                        <Check size={14} className="mt-1 shrink-0 text-sage-600" /> <span className="line-clamp-1">{r.text.replace(/^\S+\s/, '')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <FavoriteButton pet={pet} className="self-end" />
              </Link>
            ))}
          </div>
        )}
        <p className="mt-5 text-center text-sm text-cocoa-500">ⓘ Los resultados se basan en las preferencias de tu perfil.</p>
      </Section>
    </div>
  );
}
