// HU-18: historial de interés (likes/superlikes) del adoptante.
import { Heart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Chip, EmptyState, ListGroup, ListRow, PageHeader } from '@/components/ui';
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
    <div className="px-4 pb-8" data-hu="HU-18">
      <PageHeader back title="Historial de interés" subtitle="Mascotas a las que les diste “Me gusta” o Súper Kuyay." />
      {rows.length === 0 ? (
        <EmptyState
          emoji="🕐"
          title="Todavía no tienes historial"
          body="Cuando le des “Me gusta” a una mascota, aparecerá aquí."
          action={
            <Button variant="soft" onClick={() => navigate('/descubrir')}>
              Ir a Descubrir
            </Button>
          }
        />
      ) : (
        <ListGroup>
          {rows.map(({ interaction, pet }) => {
            const p = pet!;
            const available = p.status === 'disponible' && p.approval === 'aprobada';
            return (
              <ListRow
                key={interaction.id}
                to={available ? `/mascota/${p.id}` : undefined}
                chevron={false}
                leading={<img src={p.photos[0]} alt="" className="h-14 w-14 rounded-2xl bg-cream-200 object-cover" />}
                title={
                  <span className="inline-flex items-center gap-1.5">
                    {interaction.kind === 'superlike' ? <Star size={14} className="fill-honey text-honey" /> : <Heart size={14} className="fill-coral text-coral" />}
                    {p.name}
                  </span>
                }
                subtitle={
                  <>
                    <span className="block tabular-nums">{timeLabel(interaction.createdAt)}</span>
                    {!available && p.status !== 'adoptada' && <span className="block font-semibold">Este perfil ya no está disponible</span>}
                  </>
                }
                trailing={
                  p.status === 'adoptada' ? (
                    <Chip tone="sage">Adoptada</Chip>
                  ) : available ? (
                    <span className="font-display font-bold text-terra-600">Ver perfil →</span>
                  ) : undefined
                }
              />
            );
          })}
        </ListGroup>
      )}
    </div>
  );
}
