import { NavLink, Outlet } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const TABS = [
  { to: '/admin', label: 'Resumen', end: true },
  { to: '/admin/usuarios', label: 'Usuarios' },
  { to: '/admin/publicaciones', label: 'Publicaciones' },
  { to: '/admin/reportes', label: 'Reportes' },
];

/** Admin panel shell: tabs + Outlet. Each tab is its own route so it is directly linkable (presenter panel, tests). */
export function AdminShell() {
  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 px-4 pb-1 pt-1">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold">
          <ShieldCheck className="text-sage" /> Panel de administración
        </h1>
        <p className="text-sm text-cocoa-500">Métricas, usuarios, publicaciones y reportes.</p>
      </div>
      <nav className="shrink-0 overflow-x-auto px-4 pb-2 pt-1" aria-label="Secciones del panel admin">
        <ul className="flex gap-2">
          {TABS.map((t) => (
            <li key={t.to}>
              <NavLink
                to={t.to}
                end={t.end}
                className={({ isActive }) =>
                  `inline-flex whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-bold transition ${
                    isActive ? 'bg-terra text-white shadow-soft' : 'bg-cream-200 text-cocoa-700 hover:bg-cream-300'
                  }`
                }
              >
                {t.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="scroll-area flex-1 px-4 pb-6">
        <Outlet />
      </div>
    </div>
  );
}
