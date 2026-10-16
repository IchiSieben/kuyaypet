import { Flag } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Avatar, Chip, EmptyState, ListGroup, ListRow, Section } from '@/components/ui';
import { useReports } from '@/services/moderation';
import { useDb } from '@/services/store';
import type { ReportStatus } from '@/types';
import { FilterBar, fmtDay } from './adminUi';

const STATUS_LABEL: Record<ReportStatus, string> = { abierto: 'Abierto', resuelto: 'Resuelto', descartado: 'Descartado' };
const STATUS_TONE: Record<ReportStatus, 'honey' | 'sage' | 'neutral'> = { abierto: 'honey', resuelto: 'sage', descartado: 'neutral' };
const FILTERS: (ReportStatus | 'todos')[] = ['abierto', 'todos', 'resuelto', 'descartado'];

/** HU-26: cola de reportes de contenido/usuarios inapropiados. */
export function AdminReports() {
  const reports = useReports();
  const users = useDb((s) => s.users);
  const [filter, setFilter] = useState<ReportStatus | 'todos'>('abierto');

  const filtered = useMemo(() => reports.filter((r) => filter === 'todos' || r.status === filter), [reports, filter]);
  const count = (f: ReportStatus | 'todos') => (f === 'todos' ? reports.length : reports.filter((r) => r.status === f).length);

  return (
    <div data-hu="HU-26">
      <Section
        title={
          <span className="flex items-center gap-2">
            <Flag size={18} className="text-coral" aria-hidden /> Reportes ({reports.length})
          </span>
        }
      >
        <div className="mb-3">
          <FilterBar value={filter} onChange={setFilter} options={FILTERS.map((f) => ({ value: f, label: f === 'todos' ? 'Todos' : STATUS_LABEL[f], count: count(f) }))} />
        </div>
        {filtered.length === 0 ? (
          <EmptyState emoji="🎉" title="Sin reportes" body="No hay reportes con ese estado." />
        ) : (
          <ListGroup>
            {filtered.map((r) => {
              const reporter = users.find((u) => u.id === r.reporterId);
              return (
                <ListRow
                  key={r.id}
                  to={`/admin/reportes/${r.id}`}
                  className="!items-start !py-3"
                  leading={<Avatar src={reporter?.avatar} name={reporter?.name ?? '?'} size={40} />}
                  title={r.reason}
                  subtitle={
                    <>
                      <span className="line-clamp-2">{r.detail}</span>
                      <span className="mt-0.5 block text-xs tabular-nums">
                        {reporter?.name ?? 'Usuario eliminado'} · {fmtDay(r.createdAt)}
                      </span>
                    </>
                  }
                  trailing={
                    <span className="flex flex-col items-end gap-1">
                      <Chip tone={STATUS_TONE[r.status]} className="!px-2.5 !py-0.5 !text-[13px]">
                        {STATUS_LABEL[r.status]}
                      </Chip>
                      <Chip tone="coral" className="!px-2.5 !py-0.5 !text-xs capitalize">
                        {r.targetType}
                      </Chip>
                    </span>
                  }
                />
              );
            })}
          </ListGroup>
        )}
      </Section>
    </div>
  );
}
