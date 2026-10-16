import { CalendarCheck, Check, Plus, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Button, Chip, EmptyState, ListGroup, PageHeader, ScoreBadge, Section, StatTile } from '@/components/ui';
import { StatusBadge } from '@/components/PetCard';
import { useCurrentUser } from '@/services/auth';
import { answerInterest, useInterestsForOwner } from '@/services/match';
import { formatDate, respondAdoption, useAdoptionsForOwner } from '@/services/adoptions';
import { findDirectThread } from '@/services/chat';
import { markAdopted } from '@/services/publications';
import { useDb } from '@/services/store';
import { confirm, toast } from '@/services/ui';
import { ageLabel } from '@/services/pets';

const APPROVAL = {
  aprobada: { label: 'Publicada', tone: 'sage' },
  pendiente: { label: 'En revisión', tone: 'honey' },
  rechazada: { label: 'Rechazada', tone: 'coral' },
} as const;

/** Quiet inline empty state for a section that sits under a heading (EmptyState is page-sized). */
function QuietEmpty({ children }: { children: ReactNode }) {
  return <p className="surface-1 rounded-3xl px-4 py-5 text-center text-sm font-semibold text-cocoa-500">{children}</p>;
}

/** Responsable home: interested adopters (accept = Match, HU-07/13), adoption requests (HU-10) and own pets. */
export function OwnerHome() {
  const user = useCurrentUser();
  const pets = useDb((s) => s.pets).filter((p) => p.ownerId === user?.id);
  const users = useDb((s) => s.users);
  const interests = useInterestsForOwner(user?.id).filter((i) => i.status === 'pendiente').sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const requests = useAdoptionsForOwner(user?.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const pendingReq = requests.filter((r) => r.status === 'pendiente');
  if (!user) return null;
  const pet = (id: string) => pets.find((p) => p.id === id);
  const person = (id: string) => users.find((u) => u.id === id);

  const accept = (id: string, adopterName: string, petName: string) => {
    answerInterest(id, true);
    toast({ title: `¡Match con ${adopterName}!`, body: `Ya pueden conversar sobre ${petName}.`, emoji: '🎉', tone: 'success' });
  };

  const onRequest = async (id: string, status: 'aceptada' | 'rechazada', who: string) => {
    const ok = await confirm({
      title: status === 'aceptada' ? '¿Aceptar la visita?' : '¿Rechazar la solicitud?',
      body: status === 'aceptada' ? `${who} recibirá la confirmación con la fecha y hora.` : `Avisaremos a ${who} que no podrá ser esta vez.`,
      emoji: status === 'aceptada' ? '📅' : '🙅',
      confirmLabel: status === 'aceptada' ? 'Aceptar' : 'Rechazar',
      danger: status === 'rechazada',
    });
    if (!ok) return;
    respondAdoption(id, status);
    toast({ title: status === 'aceptada' ? 'Visita confirmada' : 'Solicitud rechazada', tone: status === 'aceptada' ? 'success' : 'info' });
  };

  const onMarkAdopted = async (petId: string, petName: string) => {
    const ok = await confirm({
      title: '¿Marcar como adoptada?',
      body: `${petName} dejará de aparecer para los adoptantes y no se aceptarán nuevas solicitudes.`,
      emoji: '🎉',
      confirmLabel: 'Marcar como adoptada',
    });
    if (!ok) return;
    markAdopted(petId);
    toast({ title: `${petName} ahora figura como adoptada`, tone: 'success', emoji: '🎉' });
  };

  return (
    <div className="px-4 pb-8" data-hu="HU-13">
      <PageHeader title={`Hola, ${user.name.split(' ')[0]} 👋`} subtitle="Gestiona a tus mascotas y a quienes quieren adoptarlas." />

      <div className="grid grid-cols-3 gap-2.5">
        <StatTile value={pets.length} label="Mascotas" />
        <StatTile value={interests.length} label="Interesados" tone={interests.length ? 'coral' : 'neutral'} />
        <StatTile value={pendingReq.length} label="Solicitudes" tone={pendingReq.length ? 'terra' : 'neutral'} />
      </div>

      <Section title="💗 Interesados en tus mascotas" aside={interests.length > 0 ? interests.length : undefined} className="!mt-7" data-tour="owner-interests">
        {interests.length === 0 ? (
          <QuietEmpty>Nadie nuevo por ahora.</QuietEmpty>
        ) : (
          <ListGroup>
            {interests.map((i) => {
              const a = person(i.adopterId);
              const p = pet(i.petId);
              return (
                <li key={i.id} className="flex items-center gap-3 px-4 py-3">
                  <Avatar src={a?.avatar} name={a?.name ?? '?'} size={48} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-cocoa-900">
                      {i.super && '⭐ '}
                      {a?.name}
                    </p>
                    <p className="text-sm leading-snug text-cocoa-500">quiere conocer a {p?.name}</p>
                    <ScoreBadge score={i.score} className="mt-1.5 !px-2 !py-0.5 text-xs" />
                  </div>
                  <button
                    type="button"
                    aria-label="Rechazar"
                    title="Rechazar"
                    onClick={() => answerInterest(i.id, false)}
                    className="pressable surface-3 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-cocoa-500 hover:text-coral-600"
                  >
                    <X size={18} />
                  </button>
                  <Button
                    variant="like"
                    aria-label="Aceptar y hacer Match"
                    title="Aceptar y hacer Match"
                    data-tour="owner-accept-interest"
                    className="!h-11 !w-11 !px-0"
                    onClick={() => accept(i.id, a?.name ?? '', p?.name ?? '')}
                  >
                    <Check size={20} strokeWidth={2.6} />
                  </Button>
                </li>
              );
            })}
          </ListGroup>
        )}
      </Section>

      <Section
        title={
          <span className="flex items-center gap-2">
            <CalendarCheck size={20} className="text-sage" /> Solicitudes de adopción
          </span>
        }
        aside={requests.length > 6 ? `${requests.length}` : undefined}
        data-hu="HU-10"
        data-tour="owner-requests"
      >
        {requests.length === 0 ? (
          <QuietEmpty>Sin solicitudes todavía.</QuietEmpty>
        ) : (
          <ListGroup>
            {requests.slice(0, 6).map((r) => {
              const a = person(r.adopterId);
              const p = pet(r.petId);
              const thread = findDirectThread(r.petId, r.adopterId, r.ownerId);
              return (
                <li key={r.id} className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <img src={p?.photos[0]} alt="" className="h-12 w-12 shrink-0 rounded-2xl bg-cream-200 object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold leading-snug text-cocoa-900">
                        {a?.name} → {p?.name}
                      </p>
                      <p className="text-sm text-cocoa-500">
                        {formatDate(r.date)} · {r.time}
                        {r.place && ` · ${r.place}`}
                      </p>
                    </div>
                    <Chip tone={r.status === 'aceptada' ? 'sage' : r.status === 'rechazada' ? 'coral' : 'honey'}>
                      {r.status === 'pendiente' ? 'Pendiente' : r.status === 'aceptada' ? 'Aceptada' : 'Rechazada'}
                    </Chip>
                  </div>
                  {r.message && <p className="mt-2.5 rounded-2xl bg-cream-100 px-3 py-2 text-sm italic text-cocoa-700">“{r.message}”</p>}
                  {r.status === 'pendiente' && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {thread ? (
                        <Link
                          to={`/chats/${thread.id}`}
                          className="pressable inline-flex h-9 items-center justify-center rounded-full border border-cocoa/15 bg-white/80 font-display text-sm font-bold text-cocoa shadow-hairline hover:border-terra/60 hover:text-terra"
                        >
                          Chat
                        </Link>
                      ) : (
                        <span />
                      )}
                      <Button size="sm" variant="outline" onClick={() => onRequest(r.id, 'rechazada', a?.name ?? '')}>
                        Rechazar
                      </Button>
                      <Button size="sm" variant="success" data-tour="owner-accept-request" onClick={() => onRequest(r.id, 'aceptada', a?.name ?? '')}>
                        Aceptar
                      </Button>
                    </div>
                  )}
                </li>
              );
            })}
          </ListGroup>
        )}
      </Section>

      <Section
        title="🐾 Mis publicaciones"
        aside={
          <Link
            to="/responsable/nueva"
            className="pressable inline-flex h-9 items-center gap-1.5 rounded-full bg-terra-100 px-3.5 font-display text-sm font-bold text-terra-600 hover:bg-terra-50"
          >
            <Plus size={16} /> Registrar
          </Link>
        }
      >
        {pets.length === 0 ? (
          <div className="surface-1 rounded-3xl">
            <EmptyState emoji="🐾" title="Aún no tienes mascotas publicadas" body="Registra la primera para que los adoptantes puedan conocerla." />
          </div>
        ) : (
          <ListGroup>
            {pets.map((p) => (
              <li key={p.id} className="px-4 py-3.5">
                <Link to={`/mascota/${p.id}`} className="pressable flex items-center gap-3.5">
                  <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl bg-cream-200">
                    <img src={p.photos[0]} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-lg font-bold leading-tight text-cocoa-900">{p.name}</p>
                    <p className="truncate text-sm text-cocoa-500">
                      {p.breed} · {ageLabel(p.ageMonths)}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <Chip tone={APPROVAL[p.approval].tone} className="!px-2 !py-0.5 text-xs">
                        {APPROVAL[p.approval].label}
                      </Chip>
                      <StatusBadge pet={p} />
                    </div>
                  </div>
                </Link>
                <div className="mt-3 grid grid-cols-[auto_1fr] gap-2">
                  <Link
                    to={`/responsable/editar/${p.id}`}
                    className="pressable inline-flex h-9 items-center justify-center whitespace-nowrap rounded-full border border-cocoa/15 bg-white/80 px-4 font-display text-sm font-bold text-cocoa shadow-hairline hover:border-terra/60 hover:text-terra"
                  >
                    Editar información
                  </Link>
                  {p.status === 'disponible' ? (
                    <Button size="sm" variant="soft" className="whitespace-nowrap" onClick={() => onMarkAdopted(p.id, p.name)}>
                      Marcar como adoptada
                    </Button>
                  ) : (
                    <span />
                  )}
                </div>
              </li>
            ))}
          </ListGroup>
        )}
      </Section>
    </div>
  );
}
