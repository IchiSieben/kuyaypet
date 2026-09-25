// Panel Admin + Moderación + Publicaciones (UML).
import { db, useDb } from './store';
import { notify } from './notifications';

export function usePendingPublications() {
  return useDb((s) => s.pets).filter((p) => p.approval === 'pendiente');
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

export function setUserActive(userId: string, active: boolean) {
  db.set((s) => ({ users: s.users.map((u) => (u.id === userId ? { ...u, active } : u)) }));
}

export function useOpenReports() {
  return useDb((s) => s.reports).filter((r) => r.status === 'abierto');
}
