import { ArrowLeft, ExternalLink, RefreshCw, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Chip, EmptyState } from '@/components/ui';
import { HU_STATUS } from '@/data/huStatus';
import { DEMO_IDS, loginAs, useCurrentUser } from '@/services/auth';
import { agoLabel, HU_MD_URL, parseHuTable, REPO, REPO_URL, useGh, type HuRow } from '@/services/github';

const ROLE_ORDER = ['Adoptante', 'Responsable de mascota', 'Administrador', 'Usuario común'];

const PRIORITY_TONE: Record<string, 'coral' | 'honey' | 'sage' | 'neutral'> = { Alta: 'coral', Media: 'honey', Baja: 'sage' };

function issueUrl(id: string) {
  return `${REPO_URL}/issues?q=${encodeURIComponent(id)}`;
}

export function Historias() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const { data, error, loading, at, stale } = useGh<string>(HU_MD_URL, 'text');
  const rows = data ? parseHuTable(data) : [];
  const byRole = new Map<string, HuRow[]>();
  for (const r of rows) byRole.set(r.role, [...(byRole.get(r.role) ?? []), r]);
  const roles = [...ROLE_ORDER.filter((r) => byRole.has(r)), ...[...byRole.keys()].filter((r) => !ROLE_ORDER.includes(r))];

  const openInApp = (id: string) => {
    const hu = HU_STATUS.find((h) => h.id === id);
    if (!hu) return;
    if (hu.role !== 'any' && user?.role !== hu.role) loginAs(DEMO_IDS[hu.role]);
    if (hu.role === 'any' && hu.route !== '/registro' && hu.route !== '/login' && !user) loginAs(DEMO_IDS.adopter);
    navigate(hu.route);
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center gap-3 px-4 pb-3 pt-safe-t">
        <button onClick={() => navigate(-1)} aria-label="Volver" className="pressable rounded-full bg-white p-2 shadow-soft">
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold">Historias de usuario</h1>
          <p className="truncate text-sm text-cocoa-500">{rows.length ? `${rows.length} historias · ${agoLabel(at)}` : 'Catálogo del equipo'}</p>
        </div>
      </header>

      <div className="scroll-area flex-1 px-4 pb-6">
        <p className="surface-1 rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed text-cocoa-700">
          El texto se lee <b>tal cual</b> desde el repositorio del equipo (<code className="font-semibold">{REPO}</code>, <code className="font-semibold">docs/historias-de-usuario.md</code>) en el momento de abrir esta pantalla. No hay copia local.
          {stale && <span className="block text-honey-600">Sin conexión con GitHub: mostrando la última lectura guardada.</span>}
        </p>

        {loading && (
          <div className="mt-4 space-y-3" aria-label="Cargando">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-24" />
            ))}
          </div>
        )}

        {!loading && error && (
          <EmptyState
            emoji={error === 'rate-limit' ? '⏳' : '📡'}
            title={error === 'rate-limit' ? 'GitHub pide esperar unos minutos' : 'No se pudo leer el repositorio'}
            body={
              error === 'rate-limit'
                ? 'Se alcanzó el límite de lecturas sin sesión. Vuelve a intentar en unos minutos.'
                : 'Esta pantalla necesita internet para leer el catálogo del equipo. La app sigue funcionando sin conexión.'
            }
            action={
              <div className="flex flex-col items-center gap-2">
                <Button icon={<RefreshCw size={18} />} onClick={() => location.reload()}>
                  Reintentar
                </Button>
                <a href={`${REPO_URL}/blob/main/docs/historias-de-usuario.md`} target="_blank" rel="noreferrer" className="text-sm font-bold text-terra underline underline-offset-4">
                  Abrir en GitHub
                </a>
              </div>
            }
          />
        )}

        {!loading && !error && rows.length === 0 && <EmptyState emoji="🗒️" title="El catálogo está vacío" body="El archivo existe pero no tiene la tabla de historias." />}

        {roles.map((role) => {
          const list = byRole.get(role) ?? [];
          return (
            <section key={role} className="mt-5">
              <div className="mb-2 flex items-baseline justify-between px-1">
                <h2 className="text-lg font-bold">{role}</h2>
                <span className="text-xs font-bold text-cocoa-400">{list.length}</span>
              </div>
              <ul className="space-y-2.5">
                {list.map((r) => {
                  const local = HU_STATUS.find((h) => h.id === r.id);
                  return (
                    <li key={r.id} className="surface-2 rounded-3xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-display text-sm font-extrabold text-terra">{r.id}</p>
                          <h3 className="mt-0.5 text-base font-bold leading-snug">{r.title}</h3>
                        </div>
                        <Chip tone={PRIORITY_TONE[r.priority] ?? 'neutral'} className="shrink-0 !py-0.5 text-xs">
                          {r.priority}
                        </Chip>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        {local && (
                          <Button size="sm" onClick={() => openInApp(r.id)}>
                            Ver en la app
                          </Button>
                        )}
                        <a
                          href={issueUrl(r.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="pressable inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-bold text-cocoa-700 hover:bg-cocoa/[.06]"
                        >
                          Issue <ExternalLink size={14} />
                        </a>
                        {local && <span className="ml-auto truncate text-2xs text-cocoa-400">{local.route}</span>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        {!loading && !error && rows.length > 0 && (
          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-2xs text-cocoa-400">
            {stale && <WifiOff size={12} />} Fuente: {REPO_URL}/blob/main/docs/historias-de-usuario.md
          </p>
        )}
      </div>
    </div>
  );
}
