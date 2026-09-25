import { BookOpen, ChevronRight, Heart, History, LogOut, Settings2, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Card } from '@/components/ui';
import { logout, useCurrentUser } from '@/services/auth';
import { useFavorites, useHistory } from '@/services/match';
import { confirm, toast } from '@/services/ui';

const ROLE_LABEL = { adopter: 'Adoptante', owner: 'Responsable de mascotas', admin: 'Administrador' } as const;

function Row({ icon, label, hint, to, onClick, soon }: { icon: ReactNode; label: string; hint?: string; to?: string; onClick?: () => void; soon?: boolean }) {
  const body = (
    <>
      <span className="rounded-2xl bg-terra-100 p-2 text-terra">{icon}</span>
      <span className="flex-1">
        <span className="block font-bold">{label}</span>
        {hint && <span className="block text-xs text-cocoa-500">{hint}</span>}
      </span>
      {soon ? <span className="rounded-full bg-honey-100 px-2 py-0.5 text-[10px] font-bold">Fase 1</span> : <ChevronRight size={18} className="text-cocoa-300" />}
    </>
  );
  const cls = 'flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-cream-100';
  return to ? (
    <Link to={to} className={cls}>
      {body}
    </Link>
  ) : (
    <button onClick={onClick} className={cls}>
      {body}
    </button>
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
    <div className="space-y-4 px-4 pb-6" data-hu="HU-21">
      <Card className="flex items-center gap-4 p-4">
        <Avatar src={user.avatar} name={user.name} size={64} />
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-extrabold">{user.name}</h1>
          <p className="truncate text-sm text-cocoa-500">{user.email}</p>
          <span className="mt-1 inline-block rounded-full bg-cream-200 px-2.5 py-0.5 text-xs font-bold">{ROLE_LABEL[user.role]}</span>
        </div>
      </Card>

      {user.role === 'adopter' && (
        <Card className="divide-y divide-cream-200 overflow-hidden">
          <Row icon={<Settings2 size={20} />} label="Mis preferencias" hint="Cuestionario de compatibilidad" to="/onboarding" />
          <Row icon={<Heart size={20} />} label="Favoritos" hint={`${favs.length} mascotas guardadas`} to="/favoritos" />
          <Row icon={<History size={20} />} label="Historial de interés" hint={`${history.length} mascotas`} to="/historial" />
        </Card>
      )}
      <Card className="divide-y divide-cream-200 overflow-hidden">
        <Row icon={<BookOpen size={20} />} label="Guía de adopción" hint="Requisitos, vacunas, Ley 30407 y 31807" to="/guia" />
        <Row icon={<Users size={20} />} label="Equipo KuyayPet" hint="Créditos del proyecto · UPCH" to="/creditos" />
      </Card>
      <Card className="overflow-hidden">
        <Row icon={<LogOut size={20} />} label="Cerrar sesión" onClick={onLogout} />
      </Card>
      <p className="text-center text-xs text-cocoa-300">La sesión se cierra sola tras 15 min de inactividad.</p>
    </div>
  );
}
