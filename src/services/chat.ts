// Chat + Mensajería (UML). Owner replies are SIMULATED with keyword templates and a typing delay.
import type { ChatMessage, ChatThread } from '@/types';
import { db, nowIso, uid, useDb } from './store';
import { useUi } from './ui';
import { notify } from './notifications';

export function useThreadsFor(userId: string | undefined): ChatThread[] {
  const threads = useDb((s) => s.threads);
  const messages = useDb((s) => s.messages);
  if (!userId) return [];
  const last = (t: ChatThread) => messages.filter((m) => m.threadId === t.id).at(-1)?.createdAt ?? t.createdAt;
  return threads.filter((t) => t.memberIds.includes(userId)).sort((a, b) => last(b).localeCompare(last(a)));
}

export function useThread(id: string | undefined): ChatThread | undefined {
  return useDb((s) => s.threads.find((t) => t.id === id));
}

export function useMessages(threadId: string | undefined): ChatMessage[] {
  const all = useDb((s) => s.messages);
  return all.filter((m) => m.threadId === threadId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function lastMessage(threadId: string): ChatMessage | undefined {
  return db
    .get()
    .messages.filter((m) => m.threadId === threadId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .at(-1);
}

export function unreadIn(thread: ChatThread, userId: string): number {
  const since = thread.lastReadAt[userId] ?? '';
  return db.get().messages.filter((m) => m.threadId === thread.id && m.senderId !== userId && m.createdAt > since).length;
}

export function markThreadRead(threadId: string, userId: string) {
  db.set((s) => ({
    threads: s.threads.map((t) => (t.id === threadId ? { ...t, lastReadAt: { ...t.lastReadAt, [userId]: nowIso() } } : t)),
  }));
}

export function findDirectThread(petId: string, a: string, b: string): ChatThread | undefined {
  return db.get().threads.find((t) => t.kind === 'direct' && t.petId === petId && t.memberIds.includes(a) && t.memberIds.includes(b));
}

export function ensureDirectThread(petId: string, adopterId: string, ownerId: string): ChatThread {
  const existing = findDirectThread(petId, adopterId, ownerId);
  if (existing) return existing;
  const thread: ChatThread = { id: uid('t'), kind: 'direct', petId, memberIds: [adopterId, ownerId], createdAt: nowIso(), lastReadAt: {} };
  db.set((s) => ({ threads: [...s.threads, thread] }));
  return thread;
}

export function postMessage(threadId: string, senderId: string, text: string, system = false): ChatMessage {
  const msg: ChatMessage = { id: uid('m'), threadId, senderId, text, createdAt: nowIso(), system };
  db.set((s) => ({ messages: [...s.messages, msg] }));
  return msg;
}

export function sendMessage(threadId: string, senderId: string, text: string) {
  const clean = text.trim();
  if (!clean) return;
  postMessage(threadId, senderId, clean);
  const thread = db.get().threads.find((t) => t.id === threadId);
  if (!thread || thread.kind !== 'direct') return;
  const other = thread.memberIds.find((id) => id !== senderId);
  const sender = db.get().users.find((u) => u.id === senderId);
  if (!other || sender?.role !== 'adopter') return;
  scheduleOwnerReply(threadId, other, clean);
}

function replyFor(text: string, petName: string): string {
  const t = text.toLowerCase();
  if (/(visita|conocer|coordinar|cu[aá]ndo|fecha|hora)/.test(t))
    return `¡Claro! Puedes usar el botón “Coordinar adopción” y proponer fecha y hora. Los sábados en la mañana me acomodan muy bien para que conozcas a ${petName} 🐾`;
  if (/(vacuna|esteriliz|castra|desparasit|salud|veterinari)/.test(t))
    return `${petName} tiene sus vacunas al día y está desparasitad@. Te puedo enviar la cartilla de vacunación por aquí 📋`;
  if (/(edad|años|meses|tamaño|grande|peque)/.test(t))
    return `Tiene la edad y tamaño que ves en su perfil; es muy fácil de manejar en casa. ¿Tú vives en casa o departamento?`;
  if (/(niñ|hijo|gato|perro|otra mascota)/.test(t))
    return `Se lleva bastante bien con otros, pero siempre recomendamos una presentación tranquila y progresiva 😊`;
  if (/(hola|buen|buenas|hey)/.test(t))
    return `¡Hola! Qué bueno que te interese ${petName} 😊 ¿Qué te gustaría saber?`;
  if (/(gracias|genial|perfecto|excelente)/.test(t)) return `¡Gracias a ti! Adoptar cambia dos vidas: la suya y la tuya 💛`;
  return `¡Gracias por escribir! ${petName} es un amor. Cuéntame un poco de tu hogar y tu rutina para ver si es un buen match 🏡`;
}

export function scheduleOwnerReply(threadId: string, ownerId: string, lastText: string) {
  const thread = db.get().threads.find((t) => t.id === threadId);
  const pet = db.get().pets.find((p) => p.id === thread?.petId);
  const delay = 1400 + Math.random() * 1600;
  setTimeout(() => useUi.setState((s) => ({ typing: { ...s.typing, [threadId]: true } })), 500);
  setTimeout(() => {
    useUi.setState((s) => ({ typing: { ...s.typing, [threadId]: false } }));
    const reply = replyFor(lastText, pet?.name ?? 'la mascota').replace('desparasitad@', pet?.sex === 'macho' ? 'desparasitado' : 'desparasitada');
    postMessage(threadId, ownerId, reply);
    const adopterId = thread?.memberIds.find((id) => id !== ownerId);
    const owner = db.get().users.find((u) => u.id === ownerId);
    if (adopterId && !location.hash.includes(threadId))
      notify({ userId: adopterId, kind: 'mensaje', title: `Nuevo mensaje de ${owner?.name ?? 'responsable'}`, body: reply.slice(0, 70), link: `/chats/${threadId}`, petId: pet?.id, actorId: ownerId });
  }, delay);
}

/** Group chat per pet (HU-09). */
export function ensureGroupThread(petId: string): ChatThread {
  const existing = db.get().threads.find((t) => t.kind === 'group' && t.petId === petId);
  if (existing) return existing;
  const thread: ChatThread = { id: uid('g'), kind: 'group', petId, memberIds: [], createdAt: nowIso(), lastReadAt: {} };
  db.set((s) => ({ threads: [...s.threads, thread] }));
  return thread;
}

export function joinGroup(threadId: string, userId: string) {
  db.set((s) => ({
    threads: s.threads.map((t) => (t.id === threadId && !t.memberIds.includes(userId) ? { ...t, memberIds: [...t.memberIds, userId] } : t)),
  }));
}
