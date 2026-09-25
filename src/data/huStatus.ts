// Traceability HU ↔ screen ↔ role. `done` is set only when every criterion in docs/historias_usuario.md is met.
import type { Role } from '@/types';

export interface HuEntry {
  id: string;
  title: string;
  role: Role | 'any';
  route: string;
  done: boolean;
  phase: 0 | 1 | 2 | 3;
}

export const HU_STATUS: HuEntry[] = [
  { id: 'HU-01', title: 'Registro de usuario', role: 'any', route: '/registro', done: true, phase: 0 },
  { id: 'HU-02', title: 'Ver mascotas disponibles', role: 'adopter', route: '/buscar', done: true, phase: 1 },
  { id: 'HU-03', title: 'Perfil detallado de mascota', role: 'adopter', route: '/mascota/p01', done: true, phase: 1 },
  { id: 'HU-04', title: 'Filtrar mascotas', role: 'adopter', route: '/buscar', done: true, phase: 1 },
  { id: 'HU-05', title: 'Mascotas cercanas', role: 'adopter', route: '/buscar', done: true, phase: 1 },
  { id: 'HU-06', title: 'Me gusta / No me gusta', role: 'adopter', route: '/descubrir', done: true, phase: 0 },
  { id: 'HU-07', title: 'Match por interés mutuo', role: 'adopter', route: '/matches', done: true, phase: 0 },
  { id: 'HU-08', title: 'Chat con el responsable', role: 'adopter', route: '/chats', done: true, phase: 0 },
  { id: 'HU-09', title: 'Chat grupal por mascota', role: 'adopter', route: '/mascota/p01', done: true, phase: 1 },
  { id: 'HU-10', title: 'Coordinar adopción', role: 'adopter', route: '/coordinar/p01', done: true, phase: 0 },
  { id: 'HU-11', title: 'Registrar mascota', role: 'owner', route: '/responsable/nueva', done: true, phase: 2 },
  { id: 'HU-12', title: 'Editar información de mascota', role: 'owner', route: '/responsable', done: true, phase: 2 },
  { id: 'HU-13', title: 'Notificaciones de interés', role: 'owner', route: '/notificaciones', done: true, phase: 2 },
  { id: 'HU-14', title: 'Guía de adopción', role: 'any', route: '/guia', done: true, phase: 1 },
  { id: 'HU-15', title: 'Recuperar contraseña', role: 'any', route: '/recuperar', done: true, phase: 1 },
  { id: 'HU-16', title: 'Fotos y etiquetas', role: 'owner', route: '/responsable/nueva', done: true, phase: 2 },
  { id: 'HU-17', title: 'Favoritos', role: 'adopter', route: '/favoritos', done: true, phase: 1 },
  { id: 'HU-18', title: 'Historial de interés', role: 'adopter', route: '/historial', done: true, phase: 1 },
  { id: 'HU-19', title: 'Marcar como adoptada', role: 'owner', route: '/responsable', done: true, phase: 2 },
  { id: 'HU-20', title: 'Mis Matches por compatibilidad', role: 'adopter', route: '/matches', done: true, phase: 0 },
  { id: 'HU-21', title: 'Cerrar sesión', role: 'any', route: '/perfil', done: true, phase: 1 },
  { id: 'HU-22', title: 'Gestionar usuarios', role: 'admin', route: '/admin/usuarios', done: true, phase: 3 },
  { id: 'HU-23', title: 'Revisar publicaciones', role: 'admin', route: '/admin/publicaciones', done: true, phase: 3 },
  { id: 'HU-24', title: 'Aprobar / rechazar publicaciones', role: 'admin', route: '/admin', done: true, phase: 3 },
  { id: 'HU-25', title: 'Desactivar cuentas', role: 'admin', route: '/admin/usuarios', done: true, phase: 3 },
  { id: 'HU-26', title: 'Información inapropiada (reportes)', role: 'admin', route: '/admin/reportes', done: true, phase: 3 },
];
