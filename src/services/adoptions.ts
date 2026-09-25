// Coordinación + Adopciones (UML): adoption requests with proposed date/time (HU-10).
import type { AdoptionRequest, AdoptionStatus } from '@/types';
import { db, nowIso, uid, useDb } from './store';
import { notify } from './notifications';
import { ensureDirectThread, postMessage } from './chat';

export interface AdoptionInput {
  adopterId: string;
  petId: string;
  date: string;
  time: string;
  place: string;
  message: string;
}

export function validateAdoption(i: AdoptionInput): string | null {
  if (!i.date || !i.time) return 'Elige una fecha y una hora propuestas.';
  const when = new Date(`${i.date}T${i.time}`);
  if (Number.isNaN(when.getTime())) return 'La fecha u hora no es válida.';
  if (when.getTime() < Date.now()) return 'La fecha propuesta debe ser futura.';
  const pet = db.get().pets.find((p) => p.id === i.petId);
  if (!pet) return 'La mascota no existe.';
  if (pet.status !== 'disponible') return `${pet.name} ya no está disponible para adopción.`;
  const open = db.get().adoptions.find((a) => a.adopterId === i.adopterId && a.petId === i.petId && a.status === 'pendiente');
  if (open) return 'Ya tienes una solicitud pendiente para esta mascota.';
  return null;
}

export function requestAdoption(i: AdoptionInput): { ok: true; request: AdoptionRequest } | { ok: false; error: string } {
  const error = validateAdoption(i);
  if (error) return { ok: false, error };
  const s = db.get();
  const pet = s.pets.find((p) => p.id === i.petId)!;
  const adopter = s.users.find((u) => u.id === i.adopterId);
  const request: AdoptionRequest = { ...i, id: uid('a'), ownerId: pet.ownerId, status: 'pendiente', createdAt: nowIso() };
  db.set((st) => ({ adoptions: [...st.adoptions, request] }));
  const thread = ensureDirectThread(pet.id, i.adopterId, pet.ownerId);
  postMessage(thread.id, 'system', `📅 Solicitud de adopción enviada: ${formatDate(i.date)} a las ${i.time}${i.place ? ` · ${i.place}` : ''}.`, true);
  notify(
    {
      userId: pet.ownerId,
      kind: 'solicitud',
      title: `Solicitud de adopción para ${pet.name}`,
      body: `${adopter?.name ?? 'Un adoptante'} propone ${formatDate(i.date)} a las ${i.time}.`,
      link: '/responsable',
      actorId: i.adopterId,
      petId: pet.id,
    },
    { toastIfCurrent: false },
  );
  return { ok: true, request };
}

export function respondAdoption(id: string, status: Exclude<AdoptionStatus, 'pendiente'>) {
  const req = db.get().adoptions.find((a) => a.id === id);
  if (!req || req.status !== 'pendiente') return;
  db.set((s) => ({ adoptions: s.adoptions.map((a) => (a.id === id ? { ...a, status } : a)) }));
  const pet = db.get().pets.find((p) => p.id === req.petId);
  const thread = ensureDirectThread(req.petId, req.adopterId, req.ownerId);
  postMessage(
    thread.id,
    'system',
    status === 'aceptada'
      ? `✅ La visita para conocer a ${pet?.name} fue aceptada: ${formatDate(req.date)} a las ${req.time}.`
      : `La solicitud para ${pet?.name} fue rechazada por el responsable.`,
    true,
  );
  notify({
    userId: req.adopterId,
    kind: 'solicitud_respuesta',
    title: status === 'aceptada' ? `¡Tu solicitud para ${pet?.name} fue aceptada!` : `Tu solicitud para ${pet?.name} fue rechazada`,
    body: status === 'aceptada' ? `Te esperan el ${formatDate(req.date)} a las ${req.time}.` : 'Puedes seguir buscando a tu compañero ideal.',
    link: `/chats/${thread.id}`,
    petId: req.petId,
    actorId: req.ownerId,
  });
}

export function useAdoptionsForAdopter(adopterId: string | undefined) {
  return useDb((s) => s.adoptions).filter((a) => a.adopterId === adopterId);
}

export function useAdoptionsForOwner(ownerId: string | undefined) {
  return useDb((s) => s.adoptions).filter((a) => a.ownerId === ownerId);
}

export function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' });
}

export const ADOPTION_STATUS_LABEL: Record<AdoptionStatus, string> = {
  pendiente: 'Pendiente',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
};
