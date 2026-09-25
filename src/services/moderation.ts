// Panel Admin + Moderación + Publicaciones (UML).
import type { Report, ReportStatus, User } from '@/types';
import { db, nowIso, uid, useDb } from './store';
import { notify } from './notifications';

export function usePendingPublications() {
  return useDb((s) => s.pets).filter((p) => p.approval === 'pendiente');
}

export function useAllPublications() {
  return useDb((s) => s.pets);
}

export function usePublication(id: string | undefined) {
  return useDb((s) => s.pets.find((p) => p.id === id));
}

/** HU-23: admin edits the public text fields of a publication. */
export function updatePublication(petId: string, patch: Partial<Pick<import('@/types').Pet, 'name' | 'breed' | 'about' | 'story' | 'specialCare'>>) {
  db.set((s) => ({ pets: s.pets.map((p) => (p.id === petId ? { ...p, ...patch } : p)) }));
}

export function approvePublication(petId: string) {
  db.set((s) => ({ pets: s.pets.map((p) => (p.id === petId ? { ...p, approval: 'aprobada', rejectionReason: undefined } : p)) }));
  const pet = db.get().pets.find((p) => p.id === petId);
  if (pet)
    notify({ userId: pet.ownerId, kind: 'publicacion', title: `Publicación de ${pet.name} aprobada`, body: 'Ya aparece para los adoptantes 🎉', link: '/responsable', petId });
}

export function rejectPublication(petId: string, reason: string) {
  db.set((s) => ({ pets: s.pets.map((p) => (p.id === petId ? { ...p, approval: 'rechazada', rejectionReason: reason } : p)) }));
  const pet = db.get().pets.find((p) => p.id === petId);
  if (pet) notify({ userId: pet.ownerId, kind: 'publicacion', title: `Publicación de ${pet.name} rechazada`, body: reason, link: '/responsable', petId });
}

/** HU-25: activar/desactivar cuenta. Un usuario inactivo no puede iniciar sesión (ver services/auth). */
export function setUserActive(userId: string, active: boolean) {
  db.set((s) => ({ users: s.users.map((u) => (u.id === userId ? { ...u, active } : u)) }));
}

export function useOpenReports() {
  return useDb((s) => s.reports).filter((r) => r.status === 'abierto');
}

export function useReports() {
  return useDb((s) => s.reports);
}

export function useReport(id: string | undefined) {
  return useDb((s) => s.reports.find((r) => r.id === id));
}

/** HU-26: cualquier usuario logueado puede reportar una mascota, usuario o mensaje. */
export function createReport(input: { reporterId: string; targetType: Report['targetType']; targetId: string; reason: string; detail: string }) {
  const report: Report = { id: uid('rep'), status: 'abierto', createdAt: nowIso(), ...input };
  db.set((s) => ({ reports: [report, ...s.reports] }));
  const admin = db.get().users.find((u) => u.role === 'admin');
  if (admin) notify({ userId: admin.id, kind: 'sistema', title: 'Nuevo reporte', body: `${input.reason} (${input.targetType})` });
  return report;
}

function resolveReport(id: string, status: ReportStatus, resolution: string) {
  db.set((s) => ({ reports: s.reports.map((r) => (r.id === id ? { ...r, status, resolution } : r)) }));
}

/** HU-26 acción "Ocultar publicación": retira la mascota reportada y cierra el reporte. */
export function hidePublicationFromReport(reportId: string, petId: string, resolution: string) {
  db.set((s) => ({ pets: s.pets.map((p) => (p.id === petId ? { ...p, approval: 'rechazada', status: 'retirada', rejectionReason: resolution } : p)) }));
  resolveReport(reportId, 'resuelto', resolution);
}

/** HU-26 acción "Desactivar cuenta" reutilizando HU-25. */
export function deactivateUserFromReport(reportId: string, userId: string, resolution: string) {
  setUserActive(userId, false);
  resolveReport(reportId, 'resuelto', resolution);
}

export function discardReport(reportId: string, resolution: string) {
  resolveReport(reportId, 'descartado', resolution);
}

/** Resolves the concrete user id for a report's target (mascota→owner, usuario→that user, mensaje→sender). */
export function reportTargetUser(report: Report): User | undefined {
  const s = db.get();
  if (report.targetType === 'usuario') return s.users.find((u) => u.id === report.targetId);
  if (report.targetType === 'mascota') {
    const pet = s.pets.find((p) => p.id === report.targetId);
    return pet ? s.users.find((u) => u.id === pet.ownerId) : undefined;
  }
  const msg = s.messages.find((m) => m.id === report.targetId);
  return msg ? s.users.find((u) => u.id === msg.senderId) : undefined;
}

export function reportTargetLink(report: Report): string | undefined {
  const s = db.get();
  if (report.targetType === 'mascota') return `/mascota/${report.targetId}`;
  if (report.targetType === 'mensaje') {
    const msg = s.messages.find((m) => m.id === report.targetId);
    return msg ? `/chats/${msg.threadId}` : undefined;
  }
  return undefined;
}
