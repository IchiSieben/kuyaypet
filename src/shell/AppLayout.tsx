import { Bell, Heart, LayoutDashboard, MessageCircle, Search, Sparkles, User as UserIcon, PawPrint, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

import { useCurrentUser } from '@/services/auth';
import { useUnreadCount } from '@/services/notifications';
import { LogoMark } from '@/components/brand/Logo';
import { RouteFade } from '@/shell/RouteFade';
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
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);
  // The scroller outlives the screens inside it: a new tab starts at the top, not where the last one was.
  useEffect(() => {
    if (main.current) main.current.scrollTop = 0;
  }, [pathname]);
  if (!user) return null;
  const tabs = TABS[user.role];
  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between px-4 pb-2 pt-safe-t">
        <Link to={tabs[0].to} className="w-28 rounded-xl" aria-label="Inicio KuyayPet">
          <LogoMark className="w-full" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-bold text-cocoa-700 shadow-hairline">{ROLE_LABEL[user.role]}</span>
          <Link
            to="/notificaciones"
            data-tour="bell"
            aria-label={`Notificaciones${unread ? `, ${unread} sin leer` : ''}`}
            className="pressable relative rounded-full bg-white p-2.5 shadow-soft hover:shadow-raised"
          >
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1 text-2xs font-extrabold text-white ring-2 ring-cream">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>
        </div>
      </header>
      <main ref={main} className="scroll-area relative flex-1">
        {/* Admin sub-tabs share one fade so AdminShell (and its tab strip) is not remounted. */}
        <RouteFade key={pathname.startsWith('/admin') ? '/admin' : pathname}>
          <Outlet />
        </RouteFade>
      </main>
      <nav className="glass relative z-10 shrink-0 px-2 pb-safe-b pt-1.5" aria-label="Navegación principal">
        <ul className="flex justify-around">
          {tabs.map(({ to, label, icon: Icon, tour }) => (
            <li key={to}>
              <NavLink
                to={to}
                data-tour={tour}
                className={({ isActive }) =>
                  `group flex min-w-16 flex-col items-center gap-0.5 whitespace-nowrap rounded-2xl px-1 py-1 text-2xs font-bold ${
                    isActive ? 'text-terra' : 'text-cocoa-500 hover:text-cocoa-700'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="relative flex h-8 w-14 items-center justify-center">
                      {isActive && (
                        <motion.span
                          layoutId="tab-pill"
                          className="absolute inset-0 rounded-full bg-terra-100"
                          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        />
                      )}
                      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className="relative transition-transform duration-base ease-out group-active:scale-90" />
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
