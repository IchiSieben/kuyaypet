import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, Button, Card, Chip, EmptyState, ListGroup, ListRow, PageHeader, Section, Sheet } from '@/components/ui';
import { deactivateUserFromReport, discardReport, hidePublicationFromReport, reportTargetLink, reportTargetUser, useReport } from '@/services/moderation';
import { useDb } from '@/services/store';
import { confirm, toast } from '@/services/ui';
import type { ReportStatus } from '@/types';
import { Field, fmtDay } from './adminUi';

const STATUS_LABEL: Record<ReportStatus, string> = { abierto: 'Abierto', resuelto: 'Resuelto', descartado: 'Descartado' };
const STATUS_TONE: Record<ReportStatus, 'honey' | 'sage' | 'neutral'> = { abierto: 'honey', resuelto: 'sage', descartado: 'neutral' };

/** HU-26: detalle del reporte + acciones (ocultar publicación, desactivar cuenta, descartar). */
export function AdminReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const report = useReport(id);
  const users = useDb((s) => s.users);
  const [discarding, setDiscarding] = useState(false);
  const [note, setNote] = useState('');

  if (!report)
    return (
      <div className="pt-10" data-hu="HU-26">
        <EmptyState emoji="🔍" title="Reporte no encontrado" action={<Button onClick={() => navigate('/admin/reportes')}>Volver</Button>} />
      </div>
    );

  const reporter = users.find((u) => u.id === report.reporterId);
  const targetUser = reportTargetUser(report);
  const targetLink = reportTargetLink(report);
  const resolved = report.status !== 'abierto';
  const hidesPet = report.targetType === 'mascota';

  const hide = async () => {
    const ok = await confirm({ title: '¿Ocultar la publicación reportada?', body: 'Se retirará de Descubrir y quedará como rechazada.', emoji: '🙈', confirmLabel: 'Ocultar', danger: true });
    if (!ok) return;
    hidePublicationFromReport(report.id, report.targetId, `Ocultada por reporte: ${report.reason}`);
    toast({ title: 'Publicación ocultada', body: 'El reporte quedó resuelto.', tone: 'success' });
  };

  const deactivate = async () => {
    if (!targetUser) return;
    const ok = await confirm({ title: `¿Desactivar a ${targetUser.name}?`, body: 'No podrá iniciar sesión.', emoji: '🚫', confirmLabel: 'Desactivar', danger: true });
    if (!ok) return;
    deactivateUserFromReport(report.id, targetUser.id, `Cuenta desactivada por reporte: ${report.reason}`);
    toast({ title: 'Cuenta desactivada', body: 'El reporte quedó resuelto.', tone: 'success' });
  };

  const doDiscard = () => {
    discardReport(report.id, note.trim() || 'Descartado sin acción.');
    toast({ title: 'Reporte descartado' });
    setDiscarding(false);
    setNote('');
  };

  return (
    <div data-hu="HU-26">
      <PageHeader back="/admin/reportes" title="Reporte" subtitle={fmtDay(report.createdAt)} />

      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Chip tone="coral" className="!px-2.5 !py-0.5 !text-[13px] capitalize">
            {report.targetType}
          </Chip>
          <Chip tone={STATUS_TONE[report.status]} className="!px-2.5 !py-0.5 !text-[13px]">
            {STATUS_LABEL[report.status]}
          </Chip>
        </div>
        <dl className="mt-4 space-y-4">
          <Field label="Reportado por">
            <span className="flex items-center gap-2.5">
              <Avatar src={reporter?.avatar} name={reporter?.name ?? '?'} size={36} />
              {reporter?.name ?? 'Usuario eliminado'}
            </span>
          </Field>
          <Field label="Motivo">{report.reason}</Field>
          <Field label="Detalle">
            <span className="font-normal text-cocoa-700">{report.detail}</span>
          </Field>
        </dl>
        {report.resolution && (
          <p className="mt-4 rounded-2xl bg-cream-200 p-3 text-sm text-cocoa-900">
            <b>Resolución:</b> {report.resolution}
          </p>
        )}
      </Card>

      {targetLink && (
        <ListGroup className="mt-3">
          <ListRow to={targetLink} title={`Ver ${report.targetType} reportado`} />
        </ListGroup>
      )}

      {!resolved && (
        <Section title="Acciones" className="mt-6">
          <Card className="space-y-2 p-4">
            {hidesPet && (
              <Button block variant="danger" onClick={hide}>
                Ocultar publicación
              </Button>
            )}
            {targetUser && (
              <Button
                block
                variant={hidesPet ? 'outline' : 'danger'}
                className={hidesPet ? '!border-coral/40 !text-coral-600 hover:!bg-coral-100/60' : ''}
                onClick={deactivate}
              >
                Desactivar cuenta de {targetUser.name}
              </Button>
            )}
            <Button block variant={hidesPet || targetUser ? 'ghost' : 'outline'} onClick={() => setDiscarding(true)}>
              Descartar reporte
            </Button>
          </Card>
        </Section>
      )}

      <Sheet open={discarding} onClose={() => setDiscarding(false)} title="Descartar reporte">
        <p className="mb-3 text-sm text-cocoa-500">Explica brevemente por qué se descarta (opcional).</p>
        <textarea rows={3} className="input resize-none" placeholder="Nota de resolución" value={note} onChange={(e) => setNote(e.target.value)} aria-label="Nota de resolución" />
        <Button block variant="outline" className="mt-3" onClick={doDiscard}>
          Confirmar descarte
        </Button>
      </Sheet>
    </div>
  );
}
