import { Bell, Heart, LayoutDashboard, MessageCircle, Search, Sparkles, User as UserIcon, PawPrint, type LucideIcon } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';

import { useCurrentUser } from '@/services/auth';
import { useUnreadCount } from '@/services/notifications';
import { LogoMark } from '@/components/brand/Logo';
import type { Role } from '@/types';

type Tab = { to: string; label: string; icon: LucideIcon; tour?: string };

const TABS: Record<Role, Tab[]> = {
  adopter: [
    { to: '/descubrir', label: 'Descubrir', icon: Sparkles },
    { to: '/buscar', label: 'Buscar', icon: Search },
    { to: '/matches', label: 'Matches', icon: Heart, tour: 'tab-matches' },
    { to: '/chats', label: 'Chats', icon: MessageCircle, tour: 'tab-chats' },
    { to: '/perfil', label: 'Perfil', icon: UserIcon },
  ],
  owner: [
    { to: '/responsable', label: 'Mis mascotas', icon: PawPrint },
    { to: '/chats', label: 'Chats', icon: MessageCircle },
    { to: '/notificaciones', label: 'Avisos', icon: Bell },
    { to: '/perfil', label: 'Perfil', icon: UserIcon },
  ],
  admin: [
    { to: '/admin', label: 'Panel', icon: LayoutDashboard },
    { to: '/notificaciones', label: 'Avisos', icon: Bell },
    { to: '/perfil', label: 'Perfil', icon: UserIcon },
  ],
};

const ROLE_LABEL: Record<Role, string> = { adopter: 'Adoptante', owner: 'Responsable', admin: 'Administrador' };

export function AppLayout() {
  const user = useCurrentUser();
  const unread = useUnreadCount(user?.id);
  if (!user) return null;
  const tabs = TABS[user.role];
  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between px-4 pb-2 pt-[max(env(safe-area-inset-top),14px)]">
        <Link to={tabs[0].to} className="w-28" aria-label="Inicio KuyayPet">
          <LogoMark className="w-full" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-cream-200 px-2.5 py-1 text-xs font-bold text-cocoa-700">{ROLE_LABEL[user.role]}</span>
          <Link
            to="/notificaciones"
            data-tour="bell"
            aria-label={`Notificaciones${unread ? `, ${unread} sin leer` : ''}`}
            className="relative rounded-full bg-white p-2.5 shadow-soft"
          >
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1 text-[11px] font-extrabold text-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>
        </div>
      </header>
      <main className="scroll-area relative flex-1">
        <Outlet />
      </main>
      <nav className="shrink-0 border-t border-cream-300 bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-1.5 backdrop-blur" aria-label="Navegación principal">
        <ul className="flex justify-around">
          {tabs.map(({ to, label, icon: Icon, tour }) => (
            <li key={to}>
              <NavLink
                to={to}
                data-tour={tour}
                className={({ isActive }) =>
                  `flex w-16 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-bold transition ${
                    isActive ? 'text-terra' : 'text-cocoa-300 hover:text-cocoa-500'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`rounded-full px-3 py-1 transition ${isActive ? 'bg-terra-100' : ''}`}>
                      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    </span>
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
