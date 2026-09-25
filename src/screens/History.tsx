// HU-18: historial de interés (likes/superlikes) del adoptante.
import { ArrowLeft, Heart, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/ui';
import { useCurrentUser } from '@/services/auth';
import { useHistory } from '@/services/match';
import { useDb } from '@/services/store';

function timeLabel(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function History() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const history = useHistory(user?.id);
  const pets = useDb((s) => s.pets);

  const rows = history
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((i) => ({ interaction: i, pet: pets.find((p) => p.id === i.petId) }))
    .filter((r) => r.pet);

  return (
    <div className="px-4 pb-6 pt-2" data-hu="HU-18">
      <button onClick={() => navigate(-1)} className="-ml-2 mb-2 flex items-center gap-1 rounded-full px-2 py-1 font-semibold text-cocoa-500 hover:bg-cream-200">
        <ArrowLeft size={18} /> Volver
      </button>
      <h1 className="text-2xl font-extrabold">Historial de interés</h1>
      <p className="mb-4 text-sm text-cocoa-500">Mascotas a las que les diste “Me gusta” o Súper Kuyay.</p>
      {rows.length === 0 ? (
        <EmptyState emoji="🕐" title="Todavía no tienes historial" body="Cuando le des “Me gusta” a una mascota, aparecerá aquí." />
      ) : (
        <ul className="space-y-2">
          {rows.map(({ interaction, pet }) => {
            const p = pet!;
            const available = p.status === 'disponible' && p.approval === 'aprobada';
            const content = (
              <>
                <img src={p.photos[0]} alt="" className="h-14 w-14 shrink-0 rounded-2xl object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 font-bold">
                    {interaction.kind === 'superlike' ? <Star size={14} className="fill-honey text-honey" /> : <Heart size={14} className="fill-coral text-coral" />}
                    {p.name}
                  </span>
                  <span className="block text-xs text-cocoa-500">{timeLabel(interaction.createdAt)}</span>
                </span>
                <span className="shrink-0">
                  {p.status === 'adoptada' ? (
                    <span className="rounded-full bg-sage px-2.5 py-0.5 text-xs font-bold text-white">Adoptada</span>
                  ) : !available ? (
                    <span className="text-xs font-semibold text-cocoa-300">Este perfil ya no está disponible</span>
                  ) : (
                    <span className="text-xs font-bold text-terra">Ver perfil →</span>
                  )}
                </span>
              </>
            );
            const cls = 'flex items-center gap-3 rounded-3xl bg-white p-3 shadow-soft';
            return (
              <li key={interaction.id}>
                {available ? (
                  <Link to={`/mascota/${p.id}`} className={`${cls} transition hover:shadow-card`}>
                    {content}
                  </Link>
                ) : (
                  <div className={cls}>{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
