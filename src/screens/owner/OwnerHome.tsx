import { CalendarCheck, Check, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar, Button, Card, Chip, ScoreBadge } from '@/components/ui';
import { StatusBadge } from '@/components/PetCard';
import { useCurrentUser } from '@/services/auth';
import { answerInterest, useInterestsForOwner } from '@/services/match';
import { formatDate, respondAdoption, useAdoptionsForOwner } from '@/services/adoptions';
import { findDirectThread } from '@/services/chat';
import { markAdopted } from '@/services/publications';
import { useDb } from '@/services/store';
import { confirm, toast } from '@/services/ui';

const APPROVAL = {
  aprobada: { label: 'Publicada', tone: 'sage' },
  pendiente: { label: 'En revisión', tone: 'honey' },
  rechazada: { label: 'Rechazada', tone: 'coral' },
} as const;

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
    <div className="space-y-5 px-4 pb-6" data-hu="HU-13">
      <div>
        <h1 className="text-2xl font-extrabold">Hola, {user.name.split(' ')[0]} 👋</h1>
        <p className="text-sm text-cocoa-500">Gestiona a tus mascotas y a quienes quieren adoptarlas.</p>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          ['Mascotas', pets.length],
          ['Interesados', interests.length],
          ['Solicitudes', pendingReq.length],
        ].map(([k, v]) => (
          <Card key={k} className="py-3">
            <p className="font-display text-3xl font-extrabold text-terra">{v}</p>
            <p className="text-xs font-bold text-cocoa-500">{k}</p>
          </Card>
        ))}
      </div>

      <section data-tour="owner-interests">
        <h2 className="mb-2 text-lg font-bold">💗 Interesados en tus mascotas</h2>
        {interests.length === 0 ? (
          <p className="rounded-2xl bg-white p-3 text-sm text-cocoa-500">Nadie nuevo por ahora.</p>
        ) : (
          <ul className="space-y-2">
            {interests.map((i) => {
              const a = person(i.adopterId);
              const p = pet(i.petId);
              return (
                <li key={i.id}>
                  <Card className="flex items-center gap-3 p-3">
                    <Avatar src={a?.avatar} name={a?.name ?? '?'} size={44} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">
                        {i.super && '⭐ '}
                        {a?.name}
                      </p>
                      <p className="truncate text-xs text-cocoa-500">quiere conocer a {p?.name}</p>
                      <ScoreBadge score={i.score} className="mt-1 !px-2 !py-0.5 text-xs" />
                    </div>
                    <button aria-label="Rechazar" onClick={() => answerInterest(i.id, false)} className="rounded-full bg-cream-200 p-2.5 text-cocoa-500 hover:bg-cream-300">
                      <X size={18} />
                    </button>
                    <button aria-label="Aceptar y hacer Match" data-tour="owner-accept-interest" onClick={() => accept(i.id, a?.name ?? '', p?.name ?? '')} className="rounded-full bg-coral p-2.5 text-white hover:bg-coral-600">
                      <Check size={18} />
                    </button>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section data-hu="HU-10" data-tour="owner-requests">
        <h2 className="mb-2 flex items-center gap-2 text-lg font-bold">
          <CalendarCheck size={20} className="text-sage" /> Solicitudes de adopción
        </h2>
        {requests.length === 0 ? (
          <p className="rounded-2xl bg-white p-3 text-sm text-cocoa-500">Sin solicitudes todavía.</p>
        ) : (
          <ul className="space-y-2">
            {requests.slice(0, 6).map((r) => {
              const a = person(r.adopterId);
              const p = pet(r.petId);
              const thread = findDirectThread(r.petId, r.adopterId, r.ownerId);
              return (
                <li key={r.id}>
                  <Card className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={p?.photos[0]} alt="" className="h-12 w-12 rounded-2xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold">
                          {a?.name} → {p?.name}
                        </p>
                        <p className="text-sm text-cocoa-500">
                          {formatDate(r.date)} · {r.time}
                          {r.place && ` · ${r.place}`}
                        </p>
                      </div>
                      <Chip tone={r.status === 'aceptada' ? 'sage' : r.status === 'rechazada' ? 'coral' : 'honey'}>{r.status === 'pendiente' ? 'Pendiente' : r.status === 'aceptada' ? 'Aceptada' : 'Rechazada'}</Chip>
                    </div>
                    {r.message && <p className="mt-2 rounded-2xl bg-cream-100 px-3 py-2 text-sm italic text-cocoa-700">“{r.message}”</p>}
                    {r.status === 'pendiente' && (
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {thread ? (
                          <Link to={`/chats/${thread.id}`} className="flex items-center justify-center rounded-full border-2 border-cocoa/10 text-sm font-bold">
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
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold">🐾 Mis publicaciones</h2>
          <Link to="/responsable/nueva">
            <Button size="sm" variant="soft" icon={<Plus size={16} />}>
              Registrar
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {pets.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-3xl bg-white shadow-soft">
              <Link to={`/mascota/${p.id}`}>
                <div className="relative aspect-[4/3]">
                  <img src={p.photos[0]} alt="" className="h-full w-full object-cover" />
                  <span className="absolute left-2 top-2">
                    <StatusBadge pet={p} />
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5">
                  <span className="font-bold">{p.name}</span>
                  <Chip tone={APPROVAL[p.approval].tone} className="!px-2 !py-0.5 text-[11px]">
                    {APPROVAL[p.approval].label}
                  </Chip>
                </div>
              </Link>
              <div className="flex flex-col gap-1.5 px-2.5 pb-2.5">
                <Link to={`/responsable/editar/${p.id}`}>
                  <Button size="sm" variant="outline" block>
                    Editar información
                  </Button>
                </Link>
                {p.status === 'disponible' && (
                  <Button size="sm" variant="success" block onClick={() => onMarkAdopted(p.id, p.name)}>
                    Marcar como adoptada
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
