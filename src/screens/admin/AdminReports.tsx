import { Flag } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Card, Chip, EmptyState } from '@/components/ui';
import { useReports } from '@/services/moderation';
import { useDb } from '@/services/store';
import type { ReportStatus } from '@/types';

const STATUS_LABEL: Record<ReportStatus, string> = { abierto: 'Abierto', resuelto: 'Resuelto', descartado: 'Descartado' };
const STATUS_TONE: Record<ReportStatus, 'honey' | 'sage' | 'neutral'> = { abierto: 'honey', resuelto: 'sage', descartado: 'neutral' };
const FILTERS: (ReportStatus | 'todos')[] = ['abierto', 'todos', 'resuelto', 'descartado'];

/** HU-26: cola de reportes de contenido/usuarios inapropiados. */
export function AdminReports() {
  const reports = useReports();
  const users = useDb((s) => s.users);
  const [filter, setFilter] = useState<ReportStatus | 'todos'>('abierto');

  const filtered = useMemo(() => reports.filter((r) => filter === 'todos' || r.status === filter), [reports, filter]);

  return (
    <div className="space-y-4 pt-2" data-hu="HU-26">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <Flag size={18} className="text-coral" /> Reportes ({reports.length})
      </h2>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f === 'todos' ? 'Todos' : STATUS_LABEL[f]}
          </Chip>
        ))}
      </div>
      {filtered.length === 0 ? (
        <EmptyState emoji="🎉" title="Sin reportes" body="No hay reportes con ese estado." />
      ) : (
        <ul className="space-y-2">
          {filtered.map((r) => {
            const reporter = users.find((u) => u.id === r.reporterId);
            return (
              <li key={r.id}>
                <Link to={`/admin/reportes/${r.id}`}>
                  <Card className="flex items-start gap-3 p-3">
                    <Avatar src={reporter?.avatar} name={reporter?.name ?? '?'} size={40} />
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="font-bold">{r.reason}</p>
                      <p className="line-clamp-2 text-cocoa-500">{r.detail}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Chip tone="coral" className="!text-[11px]">
                        {r.targetType}
                      </Chip>
                      <Chip tone={STATUS_TONE[r.status]} className="!text-[11px]">
                        {STATUS_LABEL[r.status]}
                      </Chip>
                    </div>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
