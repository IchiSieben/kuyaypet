import { useEffect, useState, type ReactNode } from 'react';
import { Button, Chip, Sheet, Skeleton } from '@/components/ui';

/* Local helpers shared by the admin screens (v0.5). Candidates to promote into ui/index.tsx. */

export const REJECT_REASONS = ['Fotos no corresponden a la mascota', 'Información incompleta o falsa', 'Posible venta encubierta', 'Contenido inapropiado'];

/** Short day + month, e.g. "21 sep". */
export function fmtDay(iso: string): string {
  return new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }).replace('.', '');
}

/** Compact, wrap-friendly filter chips. `count` is decorative (aria-hidden) so accessible names stay the same. */
export function FilterBar<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <Chip key={o.value} active={value === o.value} onClick={() => onChange(o.value)} className="!px-3 !py-1 !text-[13px]">
          {o.label}
          {o.count !== undefined && (
            <span aria-hidden className="tabular-nums opacity-70">
              {o.count}
            </span>
          )}
        </Chip>
      ))}
    </div>
  );
}

/** Bottom sheet that collects a rejection reason. Shared by the dashboard queue and the publication detail. */
export function RejectSheet({ name, open, onClose, onConfirm }: { name: string; open: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState('');
  useEffect(() => {
    if (!open) setReason('');
  }, [open]);
  return (
    <Sheet open={open} onClose={onClose} title={`Rechazar a ${name}`}>
      <p className="mb-3 text-sm text-cocoa-500">El motivo se enviará al responsable.</p>
      <div className="mb-3 flex flex-wrap gap-2">
        {REJECT_REASONS.map((r) => (
          <Chip key={r} active={reason === r} onClick={() => setReason(r)}>
            {r}
          </Chip>
        ))}
      </div>
      <textarea rows={3} className="input resize-none" placeholder="Escribe el motivo del rechazo" value={reason} onChange={(e) => setReason(e.target.value)} aria-label="Motivo del rechazo" />
      <Button block variant="danger" className="mt-3" disabled={!reason.trim()} onClick={() => onConfirm(reason.trim())}>
        Rechazar publicación
      </Button>
    </Sheet>
  );
}

/** Label / value pair used in detail cards. */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-cocoa-500">{label}</dt>
      <dd className="mt-0.5 font-semibold text-cocoa-900">{children}</dd>
    </div>
  );
}

/** Sticky glass action bar for the one decision a detail page is about. */
export function ActionBar({ children }: { children: ReactNode }) {
  return <div className="glass sticky bottom-0 z-10 -mx-4 mt-6 px-4 pb-3 pt-3">{children}</div>;
}

/** Skeleton shaped like the admin list screens while the route chunk loads. */
export function AdminSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-11 w-full !rounded-xl" />
      <div className="surface-2 divide-y divide-cocoa/[.07] overflow-hidden rounded-3xl">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="h-11 w-11 !rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-16 !rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
