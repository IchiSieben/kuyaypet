import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Chip, EmptyState } from '@/components/ui';
import { useAllPublications } from '@/services/moderation';
import { ageLabel, SPECIES_LABEL } from '@/services/pets';
import { useDb } from '@/services/store';
import type { ApprovalStatus } from '@/types';

const APPROVAL_LABEL: Record<ApprovalStatus, string> = { pendiente: 'Pendiente', aprobada: 'Aprobada', rechazada: 'Rechazada' };
const APPROVAL_TONE: Record<ApprovalStatus, 'honey' | 'sage' | 'coral'> = { pendiente: 'honey', aprobada: 'sage', rechazada: 'coral' };
const FILTERS: (ApprovalStatus | 'todas')[] = ['todas', 'pendiente', 'aprobada', 'rechazada'];

/** HU-23: lista de TODAS las publicaciones, filtrable por estado de aprobación. */
export function AdminPublications() {
  const pets = useAllPublications();
  const users = useDb((s) => s.users);
  const [filter, setFilter] = useState<ApprovalStatus | 'todas'>('todas');

  const filtered = useMemo(() => pets.filter((p) => filter === 'todas' || p.approval === filter), [pets, filter]);

  return (
    <div className="space-y-4 pt-2" data-hu="HU-23">
      <h2 className="text-lg font-bold">Publicaciones ({pets.length})</h2>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f === 'todas' ? 'Todas' : APPROVAL_LABEL[f]}
          </Chip>
        ))}
      </div>
      {filtered.length === 0 ? (
        <EmptyState emoji="🔍" title="Sin publicaciones" body="No hay publicaciones con ese estado." />
      ) : (
        <ul className="space-y-2">
          {filtered.map((p) => {
            const owner = users.find((u) => u.id === p.ownerId);
            return (
              <li key={p.id}>
                <Link to={`/admin/publicaciones/${p.id}`}>
                  <Card className="flex items-center gap-3 p-3">
                    <img src={p.photos[0]} alt="" className="h-16 w-16 rounded-2xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">{p.name}</p>
                      <p className="text-xs text-cocoa-500">
                        {SPECIES_LABEL[p.species]} · {p.breed} · {ageLabel(p.ageMonths)}
                      </p>
                      <p className="text-xs text-cocoa-500">Por {owner?.name}</p>
                    </div>
                    <Chip tone={APPROVAL_TONE[p.approval]}>{APPROVAL_LABEL[p.approval]}</Chip>
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
