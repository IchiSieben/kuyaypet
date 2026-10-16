import { BookOpen, Heart, History, LogOut, Settings2, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Chip, ListGroup, ListRow } from '@/components/ui';
import { logout, useCurrentUser } from '@/services/auth';
import { useFavorites, useHistory } from '@/services/match';
import { confirm, toast } from '@/services/ui';

const ROLE_LABEL = { adopter: 'Adoptante', owner: 'Responsable de mascotas', admin: 'Administrador' } as const;

/** Rounded icon tile used as the leading element of a settings row (local helper). */
function Tile({ children, tone = 'terra' }: { children: ReactNode; tone?: 'terra' | 'coral' }) {
  return (
    <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone === 'coral' ? 'bg-coral-100 text-coral-600' : 'bg-terra-100 text-terra'}`}>{children}</span>
  );
}

export function Profile() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const favs = useFavorites(user?.id);
  const history = useHistory(user?.id);
  if (!user) return null;

  const onLogout = async () => {
    const ok = await confirm({ title: '¿Cerrar sesión?', body: 'Tendrás que volver a ingresar tus datos para entrar.', emoji: '👋', confirmLabel: 'Cerrar sesión', danger: true });
    if (!ok) return;
    logout();
    navigate('/login', { replace: true });
    toast({ title: 'Sesión cerrada', body: '¡Vuelve pronto!', emoji: '👋' });
  };

  return (
    <div className="px-4 pb-8" data-hu="HU-21">
      <header className="flex flex-col items-center px-2 pb-6 pt-3 text-center">
        <Avatar src={user.avatar} name={user.name} size={96} />
        <h1 className="mt-4 max-w-full truncate text-3xl font-extrabold text-cocoa-900">{user.name}</h1>
        <p className="mt-0.5 max-w-full truncate text-[0.95rem] text-cocoa-500">{user.email}</p>
        <Chip tone="terra" className="mt-3">
          {ROLE_LABEL[user.role]}
        </Chip>
      </header>

      <div className="space-y-6">
        {user.role === 'adopter' && (
          <ListGroup>
            <ListRow leading={<Tile><Settings2 size={20} /></Tile>} title="Mis preferencias" subtitle="Cuestionario de compatibilidad" to="/onboarding" />
            <ListRow leading={<Tile><Heart size={20} /></Tile>} title="Favoritos" subtitle={`${favs.length} mascotas guardadas`} to="/favoritos" />
            <ListRow leading={<Tile><History size={20} /></Tile>} title="Historial de interés" subtitle={`${history.length} mascotas`} to="/historial" />
          </ListGroup>
        )}
        <ListGroup>
          <ListRow leading={<Tile><BookOpen size={20} /></Tile>} title="Guía de adopción" subtitle="Requisitos, vacunas, Ley 30407 y 31807" to="/guia" />
          <ListRow leading={<Tile><Users size={20} /></Tile>} title="Equipo KuyayPet" subtitle="Créditos del proyecto · UPCH" to="/creditos" />
        </ListGroup>
        <ListGroup>
          <ListRow leading={<Tile tone="coral"><LogOut size={20} /></Tile>} title={<span className="text-coral-600">Cerrar sesión</span>} onClick={onLogout} chevron={false} />
        </ListGroup>
      </div>
      <p className="mt-6 px-6 text-center text-xs leading-snug text-cocoa-500">La sesión se cierra sola tras 15 min de inactividad.</p>
    </div>
  );
}
