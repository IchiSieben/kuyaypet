import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Chip, EmptyState, Sheet } from '@/components/ui';
import { approvePublication, rejectPublication, usePendingPublications } from '@/services/moderation';
import { ageLabel, SPECIES_LABEL } from '@/services/pets';
import { useDb } from '@/services/store';
import { confirm, toast } from '@/services/ui';
import { useCountUp } from '@/lib/useCountUp';
import type { Pet } from '@/types';

const REASONS = ['Fotos no corresponden a la mascota', 'Información incompleta o falsa', 'Posible venta encubierta', 'Contenido inapropiado'];

const GOALS = { users: 500, matches: 200 };

function Kpi({ label, value, goal, hint }: { label: string; value: number; goal?: number; hint?: string }) {
  const shown = useCountUp(value);
  const pct = goal ? Math.min(100, Math.round((value / goal) * 100)) : undefined;
  return (
    <Card className="p-3">
      <p className="font-display text-3xl font-extrabold text-terra">{shown}</p>
      <p className="text-sm font-bold">{label}</p>
      {pct !== undefined ? (
        <div className="mt-1.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-200">
            <div className="h-full rounded-full bg-sage transition-[width] duration-700" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-0.5 text-[11px] text-cocoa-300">
            {pct}% de la meta ({goal})
          </p>
        </div>
      ) : (
        hint && <p className="text-[11px] text-cocoa-300">{hint}</p>
      )}
    </Card>
  );
}

/** Dashboard (index de /admin): KPIs del caso de negocio + cola de publicaciones pendientes (HU-24). */
export function AdminDashboard() {
  const pending = usePendingPublications();
  const users = useDb((s) => s.users);
  const pets = useDb((s) => s.pets);
  const matches = useDb((s) => s.matches);
  const adoptions = useDb((s) => s.adoptions);
  const [rejecting, setRejecting] = useState<Pet | null>(null);
  const [reason, setReason] = useState('');

  const activeUsers = users.filter((u) => u.active).length;
  const activePct = users.length ? Math.round((activeUsers / users.length) * 100) : 0;
  const adoptedCount = pets.filter((p) => p.status === 'adoptada').length + adoptions.filter((a) => a.status === 'aceptada').length;

  const approve = async (p: Pet) => {
    const ok = await confirm({ title: `¿Aprobar a ${p.name}?`, body: 'La publicación será visible para todos los adoptantes.', emoji: '✅', confirmLabel: 'Aprobar' });
    if (!ok) return;
    approvePublication(p.id);
    toast({ title: `Publicación de ${p.name} aprobada`, tone: 'success' });
  };

  const doReject = () => {
    if (!rejecting || !reason.trim()) return;
    rejectPublication(rejecting.id, reason.trim());
    toast({ title: `Publicación de ${rejecting.name} rechazada`, body: 'Se notificó al responsable con el motivo.' });
    setRejecting(null);
    setReason('');
  };

  return (
    <div className="space-y-5 pt-2">
      <div className="grid grid-cols-2 gap-2">
        <Kpi label="Usuarios" value={users.length} goal={GOALS.users} />
        <Kpi label="Matches" value={matches.length} goal={GOALS.matches} />
        <Kpi label="% usuarios activos" value={activePct} hint="meta 60%" />
        <Kpi label="Adopciones" value={adoptedCount} hint="visitas + adoptadas" />
      </div>

      <section data-tour="admin-pending" data-hu="HU-24">
        <h2 className="mb-2 text-lg font-bold">📋 Publicaciones pendientes ({pending.length})</h2>
        {pending.length === 0 ? (
          <EmptyState emoji="🎉" title="Todo revisado" body="No hay publicaciones pendientes de aprobación." />
        ) : (
          <ul className="space-y-2">
            {pending.map((p) => {
              const owner = users.find((u) => u.id === p.ownerId);
              return (
                <li key={p.id}>
                  <Card className="p-3">
                    <Link to={`/mascota/${p.id}`} className="flex items-center gap-3">
                      <img src={p.photos[0]} alt="" className="h-16 w-16 rounded-2xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold">{p.name}</p>
                        <p className="text-xs text-cocoa-500">
                          {SPECIES_LABEL[p.species]} · {p.breed} · {ageLabel(p.ageMonths)}
                        </p>
                        <p className="text-xs text-cocoa-500">Por {owner?.name}</p>
                      </div>
                      <Chip tone="honey">Pendiente</Chip>
                    </Link>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline" onClick={() => setRejecting(p)}>
                        Rechazar
                      </Button>
                      <Button size="sm" variant="success" data-tour="admin-approve" onClick={() => approve(p)}>
                        Aprobar
                      </Button>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Sheet open={!!rejecting} onClose={() => setRejecting(null)} title={`Rechazar a ${rejecting?.name ?? ''}`}>
        <p className="mb-3 text-sm text-cocoa-500">El motivo se enviará al responsable.</p>
        <div className="mb-3 flex flex-wrap gap-2">
          {REASONS.map((r) => (
            <Chip key={r} active={reason === r} onClick={() => setReason(r)}>
              {r}
            </Chip>
          ))}
        </div>
        <textarea rows={3} className="input resize-none" placeholder="Escribe el motivo del rechazo" value={reason} onChange={(e) => setReason(e.target.value)} aria-label="Motivo del rechazo" />
        <Button block variant="danger" className="mt-3" disabled={!reason.trim()} onClick={doReject}>
          Rechazar publicación
        </Button>
      </Sheet>
    </div>
  );
}
