import { useMemo, useState } from 'react';
import { Chip, EmptyState, ListGroup, ListRow, Section } from '@/components/ui';
import { useAllPublications } from '@/services/moderation';
import { ageLabel, SPECIES_LABEL } from '@/services/pets';
import { useDb } from '@/services/store';
import type { ApprovalStatus } from '@/types';
import { FilterBar } from './adminUi';

const APPROVAL_LABEL: Record<ApprovalStatus, string> = { pendiente: 'Pendiente', aprobada: 'Aprobada', rechazada: 'Rechazada' };
const APPROVAL_TONE: Record<ApprovalStatus, 'honey' | 'sage' | 'coral'> = { pendiente: 'honey', aprobada: 'sage', rechazada: 'coral' };
const FILTERS: (ApprovalStatus | 'todas')[] = ['todas', 'pendiente', 'aprobada', 'rechazada'];

/** HU-23: lista de TODAS las publicaciones, filtrable por estado de aprobación. */
export function AdminPublications() {
  const pets = useAllPublications();
  const users = useDb((s) => s.users);
  const [filter, setFilter] = useState<ApprovalStatus | 'todas'>('todas');

  const filtered = useMemo(() => pets.filter((p) => filter === 'todas' || p.approval === filter), [pets, filter]);
  const count = (f: ApprovalStatus | 'todas') => (f === 'todas' ? pets.length : pets.filter((p) => p.approval === f).length);

  return (
    <div data-hu="HU-23">
      <Section title={`Publicaciones (${pets.length})`}>
        <div className="mb-3">
          <FilterBar value={filter} onChange={setFilter} options={FILTERS.map((f) => ({ value: f, label: f === 'todas' ? 'Todas' : APPROVAL_LABEL[f], count: count(f) }))} />
        </div>
        {filtered.length === 0 ? (
          <EmptyState emoji="🔍" title="Sin publicaciones" body="No hay publicaciones con ese estado." />
        ) : (
          <ListGroup>
            {filtered.map((p) => {
              const owner = users.find((u) => u.id === p.ownerId);
              return (
                <ListRow
                  key={p.id}
                  to={`/admin/publicaciones/${p.id}`}
                  className="!py-2.5"
                  leading={<img src={p.photos[0]} alt="" className="h-12 w-12 rounded-xl object-cover ring-1 ring-cocoa/10" />}
                  title={p.name}
                  subtitle={
                    <>
                      <span className="block truncate">
                        {SPECIES_LABEL[p.species]} · {p.breed} · {ageLabel(p.ageMonths)}
                      </span>
                      <span className="block truncate text-xs">Por {owner?.name}</span>
                    </>
                  }
                  trailing={
                    <Chip tone={APPROVAL_TONE[p.approval]} className="!px-2.5 !py-0.5 !text-[13px]">
                      {APPROVAL_LABEL[p.approval]}
                    </Chip>
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
