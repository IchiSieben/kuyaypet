import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Avatar, Button, Card, Chip, EmptyState, Sheet } from '@/components/ui';
import { deactivateUserFromReport, discardReport, hidePublicationFromReport, reportTargetLink, reportTargetUser, useReport } from '@/services/moderation';
import { useDb } from '@/services/store';
import { confirm, toast } from '@/services/ui';
import type { ReportStatus } from '@/types';

const STATUS_LABEL: Record<ReportStatus, string> = { abierto: 'Abierto', resuelto: 'Resuelto', descartado: 'Descartado' };

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
        <EmptyState emoji="🔍" title="Reporte no encontrado" action={<Link to="/admin/reportes"><Button>Volver</Button></Link>} />
      </div>
    );

  const reporter = users.find((u) => u.id === report.reporterId);
  const targetUser = reportTargetUser(report);
  const targetLink = reportTargetLink(report);
  const resolved = report.status !== 'abierto';

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
    <div className="space-y-4 pt-2" data-hu="HU-26">
      <button onClick={() => navigate('/admin/reportes')} className="flex items-center gap-1 text-sm font-bold text-terra">
        <ArrowLeft size={16} /> Reportes
      </button>

      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <Chip tone="coral">{report.targetType}</Chip>
          <Chip tone={report.status === 'abierto' ? 'honey' : report.status === 'resuelto' ? 'sage' : 'neutral'}>{STATUS_LABEL[report.status]}</Chip>
        </div>
        <div className="flex items-center gap-3">
          <Avatar src={reporter?.avatar} name={reporter?.name ?? '?'} size={44} />
          <div>
            <p className="text-xs font-bold text-cocoa-300">Reportado por</p>
            <p className="font-bold">{reporter?.name ?? 'Usuario eliminado'}</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-cocoa-300">Motivo</p>
          <p className="font-bold">{report.reason}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-cocoa-300">Detalle</p>
          <p className="text-cocoa-700">{report.detail}</p>
        </div>
        {targetLink && (
          <Link to={targetLink} className="text-sm font-semibold text-terra underline underline-offset-4">
            Ver {report.targetType} reportado
          </Link>
        )}
        {report.resolution && (
          <p className="rounded-2xl bg-cream-200 p-3 text-sm">
            <b>Resolución:</b> {report.resolution}
          </p>
        )}
      </Card>

      {!resolved && (
        <Card className="space-y-2 p-4">
          <h2 className="text-lg font-bold">Acciones</h2>
          {report.targetType === 'mascota' && (
            <Button block variant="danger" onClick={hide}>
              Ocultar publicación
            </Button>
          )}
          {targetUser && (
            <Button block variant="danger" onClick={deactivate}>
              Desactivar cuenta de {targetUser.name}
            </Button>
          )}
          <Button block variant="outline" onClick={() => setDiscarding(true)}>
            Descartar reporte
          </Button>
        </Card>
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
