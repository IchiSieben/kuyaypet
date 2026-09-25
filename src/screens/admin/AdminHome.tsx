import { Flag, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Button, Card, Chip, EmptyState, Sheet } from '@/components/ui';
import { approvePublication, rejectPublication, useOpenReports, usePendingPublications } from '@/services/moderation';
import { ageLabel, SPECIES_LABEL } from '@/services/pets';
import { useDb } from '@/services/store';
import { confirm, toast } from '@/services/ui';
import type { Pet } from '@/types';

const REASONS = ['Fotos no corresponden a la mascota', 'Información incompleta o falsa', 'Posible venta encubierta', 'Contenido inapropiado'];

/** Admin panel (Fase 0: metrics + approve/reject publications). Users, reports and deactivation in Fase 3. */
export function AdminHome() {
  const pending = usePendingPublications();
  const reports = useOpenReports();
  const users = useDb((s) => s.users);
  const pets = useDb((s) => s.pets);
  const matches = useDb((s) => s.matches);
  const adoptions = useDb((s) => s.adoptions);
  const [rejecting, setRejecting] = useState<Pet | null>(null);
  const [reason, setReason] = useState('');

  const metrics = [
    ['Usuarios', users.length, 'meta 500'],
    ['Matches', matches.length, 'meta 200'],
    ['Mascotas activas', pets.filter((p) => p.status === 'disponible' && p.approval === 'aprobada').length, ''],
    ['Adopciones', pets.filter((p) => p.status === 'adoptada').length + adoptions.filter((a) => a.status === 'aceptada').length, 'visitas + adoptadas'],
  ] as const;

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
    <div className="space-y-5 px-4 pb-6" data-hu="HU-24">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold">
          <ShieldCheck className="text-sage" /> Panel de administración
        </h1>
        <p className="text-sm text-cocoa-500">Métricas del caso de negocio y moderación.</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {metrics.map(([k, v, hint]) => (
          <Card key={k} className="p-3">
            <p className="font-display text-3xl font-extrabold text-terra">{v}</p>
            <p className="text-sm font-bold">{k}</p>
            {hint && <p className="text-[11px] text-cocoa-300">{hint}</p>}
          </Card>
        ))}
      </div>

      <section data-tour="admin-pending">
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

      <section>
        <h2 className="mb-2 flex items-center gap-2 text-lg font-bold">
          <Flag size={18} className="text-coral" /> Reportes abiertos ({reports.length})
        </h2>
        <ul className="space-y-2">
          {reports.slice(0, 3).map((r) => {
            const reporter = users.find((u) => u.id === r.reporterId);
            return (
              <li key={r.id}>
                <Card className="flex items-start gap-3 p-3">
                  <Avatar src={reporter?.avatar} name={reporter?.name ?? '?'} size={36} />
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="font-bold">{r.reason}</p>
                    <p className="line-clamp-2 text-cocoa-500">{r.detail}</p>
                  </div>
                  <Chip tone="coral" className="!text-[11px]">
                    {r.targetType}
                  </Chip>
                </Card>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-center text-xs text-cocoa-300">Gestión completa de usuarios y reportes: Fase 3.</p>
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
