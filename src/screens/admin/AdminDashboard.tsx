import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button, Chip, EmptyState, ListGroup, Section, StatTile } from '@/components/ui';
import { approvePublication, rejectPublication, useAllPublications, usePendingPublications, useReports } from '@/services/moderation';
import { ageLabel, SPECIES_LABEL } from '@/services/pets';
import { useDb } from '@/services/store';
import { confirm, toast } from '@/services/ui';
import type { Pet } from '@/types';
import { RejectSheet } from './adminUi';

const GOALS = { users: 500, matches: 200 };

/** KPI: big tabular number, a short label and either a progress-to-goal bar or a hint. */
function Kpi({ label, value, goal, hint, tone }: { label: string; value: number; goal?: number; hint?: string; tone: 'terra' | 'coral' | 'sage' | 'honey' }) {
  const pct = goal ? Math.min(100, Math.round((value / goal) * 100)) : undefined;
  const bar = { terra: 'bg-terra', coral: 'bg-coral', sage: 'bg-sage', honey: 'bg-honey' }[tone];
  return (
    <StatTile
      tone={tone}
      value={value}
      className="!p-3.5"
      label={
        <>
          {label}
          {pct !== undefined ? (
            <span className="mt-2 block">
              <span className="block h-1.5 w-full overflow-hidden rounded-full bg-cocoa/[.08]">
                <span className={`block h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
              </span>
              <span className="mt-1 block text-xs font-medium tabular-nums">
                {pct}% de la meta ({goal})
              </span>
            </span>
          ) : (
            hint && <span className="mt-2 block text-xs font-medium">{hint}</span>
          )}
        </>
      }
    />
  );
}

/** Dashboard (index de /admin): KPIs del caso de negocio + cola de publicaciones pendientes (HU-24). */
export function AdminDashboard() {
  const pending = usePendingPublications();
  const allPubs = useAllPublications();
  const reports = useReports();
  const users = useDb((s) => s.users);
  const pets = useDb((s) => s.pets);
  const matches = useDb((s) => s.matches);
  const adoptions = useDb((s) => s.adoptions);
  const [rejecting, setRejecting] = useState<Pet | null>(null);

  const activeUsers = users.filter((u) => u.active).length;
  const activePct = users.length ? Math.round((activeUsers / users.length) * 100) : 0;
  const adoptedCount = pets.filter((p) => p.status === 'adoptada').length + adoptions.filter((a) => a.status === 'aceptada').length;

  const byStatus = {
    pendiente: allPubs.filter((p) => p.approval === 'pendiente').length,
    aprobada: allPubs.filter((p) => p.approval === 'aprobada').length,
    rechazada: allPubs.filter((p) => p.approval === 'rechazada').length,
  };
  const openReports = reports.filter((r) => r.status === 'abierto').length;

  const approve = async (p: Pet) => {
    const ok = await confirm({ title: `¿Aprobar a ${p.name}?`, body: 'La publicación será visible para todos los adoptantes.', emoji: '✅', confirmLabel: 'Aprobar' });
    if (!ok) return;
    approvePublication(p.id);
    toast({ title: `Publicación de ${p.name} aprobada`, tone: 'success' });
  };

  const doReject = (reason: string) => {
    if (!rejecting) return;
    rejectPublication(rejecting.id, reason);
    toast({ title: `Publicación de ${rejecting.name} rechazada`, body: 'Se notificó al responsable con el motivo.' });
    setRejecting(null);
  };

  const total = allPubs.length || 1;
  const segments = [
    { key: 'aprobada', label: 'Aprobadas', n: byStatus.aprobada, bar: 'bg-sage', dot: 'bg-sage' },
    { key: 'pendiente', label: 'Pendientes', n: byStatus.pendiente, bar: 'bg-honey', dot: 'bg-honey' },
    { key: 'rechazada', label: 'Rechazadas', n: byStatus.rechazada, bar: 'bg-coral', dot: 'bg-coral' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2.5">
        <Kpi tone="terra" label="Usuarios" value={users.length} goal={GOALS.users} />
        <Kpi tone="coral" label="Matches" value={matches.length} goal={GOALS.matches} />
        <Kpi tone="sage" label="% usuarios activos" value={activePct} hint="meta 60%" />
        <Kpi tone="honey" label="Adopciones" value={adoptedCount} hint="visitas + adoptadas" />
      </div>

      <Section
        title={`Publicaciones pendientes (${pending.length})`}
        aside={
          <Link to="/admin/publicaciones" className="inline-flex items-center text-terra hover:underline">
            Ver todas
            <ChevronRight size={16} aria-hidden />
          </Link>
        }
        data-tour="admin-pending"
        data-hu="HU-24"
      >
        {pending.length === 0 ? (
          <EmptyState emoji="🎉" title="Todo revisado" body="No hay publicaciones pendientes de aprobación." />
        ) : (
          <ListGroup>
            {pending.map((p) => {
              const owner = users.find((u) => u.id === p.ownerId);
              return (
                <li key={p.id} className="px-3 pb-3 pt-3">
                  <Link to={`/mascota/${p.id}`} className="pressable flex items-center gap-3 rounded-2xl">
                    <img src={p.photos[0]} alt="" className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-1 ring-cocoa/10" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-cocoa-900">{p.name}</p>
                      <p className="truncate text-sm text-cocoa-500">
                        {SPECIES_LABEL[p.species]} · {p.breed} · {ageLabel(p.ageMonths)}
                      </p>
                      <p className="truncate text-sm text-cocoa-500">Por {owner?.name}</p>
                    </div>
                    <Chip tone="honey" className="shrink-0 !px-2.5 !py-0.5 !text-[13px]">
                      Pendiente
                    </Chip>
                  </Link>
                  <div className="mt-2.5 grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline" onClick={() => setRejecting(p)}>
                      Rechazar
                    </Button>
                    <Button size="sm" variant="success" data-tour="admin-approve" onClick={() => approve(p)}>
                      Aprobar
                    </Button>
                  </div>
                </li>
              );
            })}
          </ListGroup>
        )}
      </Section>

      <Section title="Estado de las publicaciones" aside={<span className="tabular-nums">{allPubs.length} en total</span>}>
        <div className="surface-2 rounded-3xl p-4">
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-cocoa/[.08]">
            {segments.map((s) => (
              <span key={s.key} className={`${s.bar} h-full`} style={{ width: `${(s.n / total) * 100}%` }} />
            ))}
          </div>
          <dl className="mt-3 grid grid-cols-3 gap-2">
            {segments.map((s) => (
              <div key={s.key}>
                <dt className="flex items-center gap-1.5 text-sm font-semibold text-cocoa-500">
                  <span aria-hidden className={`h-2 w-2 rounded-full ${s.dot}`} />
                  {s.label}
                </dt>
                <dd className="font-display text-xl font-extrabold tabular-nums text-cocoa-900">{s.n}</dd>
              </div>
            ))}
          </dl>
          <Link
            to="/admin/reportes"
            className="pressable -mx-1 mt-3 flex items-center justify-between rounded-2xl border-t border-cocoa/[.07] px-1 pt-3 text-sm font-semibold text-cocoa-700 hover:text-terra"
          >
            <span>
              Reportes abiertos <b className="ml-1 font-display text-base tabular-nums text-coral-600">{openReports}</b>
            </span>
            <ChevronRight size={18} className="text-cocoa-300" aria-hidden />
          </Link>
        </div>
      </Section>

      <RejectSheet name={rejecting?.name ?? ''} open={!!rejecting} onClose={() => setRejecting(null)} onConfirm={doReject} />
    </div>
  );
}
