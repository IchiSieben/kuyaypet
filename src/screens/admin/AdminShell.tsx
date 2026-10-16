import { Suspense } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { usePendingPublications, useReports } from '@/services/moderation';
import { AdminSkeleton } from './adminUi';

const TABS = [
  { to: '/admin', label: 'Resumen', end: true },
  { to: '/admin/usuarios', label: 'Usuarios' },
  { to: '/admin/publicaciones', label: 'Publicaciones', badge: 'pending' as const },
  { to: '/admin/reportes', label: 'Reportes', badge: 'reports' as const },
];

/**
 * Admin panel shell: title + segmented tabs + Outlet. Each tab is its own route so it is directly linkable
 * (presenter panel, tests). Detail routes (/admin/<section>/<id>) are pushed screens with their own header,
 * so the shell chrome steps aside there.
 */
export function AdminShell() {
  const { pathname } = useLocation();
  const isDetail = pathname.split('/').filter(Boolean).length > 2;
  const pending = usePendingPublications().length;
  const openReports = useReports().filter((r) => r.status === 'abierto').length;
  const badges = { pending, reports: openReports };

  return (
    <div className="flex h-full flex-col">
      {!isDetail && (
        <>
          <div className="shrink-0 px-4 pb-3 pt-1">
            <h1 className="flex items-center gap-2 text-2xl font-extrabold text-cocoa-900">
              <ShieldCheck className="text-sage" /> Panel de administración
            </h1>
            <p className="mt-0.5 text-sm text-cocoa-500">Métricas, usuarios, publicaciones y reportes.</p>
          </div>
          <nav className="shrink-0 px-4 pb-3" aria-label="Secciones del panel admin">
            <ul className="surface-1 flex rounded-full p-0.5">
              {TABS.map((t) => {
                const n = t.badge ? badges[t.badge] : 0;
                return (
                  <li key={t.to} className="min-w-0 flex-auto">
                    <NavLink
                      to={t.to}
                      end={t.end}
                      className={({ isActive }) =>
                        `pressable flex h-9 items-center justify-center gap-1 whitespace-nowrap rounded-full px-1 text-[12.5px] font-bold ${
                          isActive ? 'bg-terra text-white shadow-soft' : 'text-cocoa-700 hover:bg-white/70'
                        }`
                      }
                    >
                      {t.label}
                      {n > 0 && (
                        <span
                          aria-hidden
                          className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-2xs font-extrabold tabular-nums ${
                            t.badge === 'reports' ? 'bg-coral text-white' : 'bg-honey text-cocoa-900'
                          }`}
                        >
                          {n}
                        </span>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>
        </>
      )}
      <div className={`scroll-area flex-1 px-4 pb-8 ${isDetail ? '' : 'pt-1'}`}>
        <Suspense fallback={<AdminSkeleton />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}
