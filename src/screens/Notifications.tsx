import { useNavigate } from 'react-router-dom';
import { Avatar, Button, EmptyState, ListGroup, PageHeader } from '@/components/ui';
import { useCurrentUser } from '@/services/auth';
import { markAllRead, markRead, useNotifications } from '@/services/notifications';
import { useDb } from '@/services/store';

const KIND_EMOJI = { interes: '💗', match: '🎉', mensaje: '💬', solicitud: '📅', solicitud_respuesta: '✅', publicacion: '📢', sistema: '🐾' } as const;

export function Notifications() {
  const user = useCurrentUser();
  const list = useNotifications(user?.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const users = useDb((s) => s.users);
  const pets = useDb((s) => s.pets);
  const navigate = useNavigate();
  if (!user) return null;
  const unread = list.filter((n) => !n.read).length;

  return (
    <div className="px-4 pb-8" data-hu="HU-13">
      <PageHeader
        title="Notificaciones"
        subtitle={unread ? `${unread} sin leer` : 'Estás al día'}
        aside={
          unread > 0 ? (
            <Button size="sm" variant="ghost" onClick={() => markAllRead(user.id)}>
              Marcar todo como leído
            </Button>
          ) : undefined
        }
      />
      {list.length === 0 ? (
        <div className="surface-1 rounded-3xl">
          <EmptyState emoji="🔔" title="Sin notificaciones" body="Aquí aparecerán los intereses, matches y mensajes sobre tus mascotas." />
        </div>
      ) : (
        <ListGroup>
          {list.map((n) => {
            const actor = users.find((u) => u.id === n.actorId);
            const pet = pets.find((p) => p.id === n.petId);
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => {
                    markRead(n.id);
                    if (n.link) return navigate(n.link);
                    // Legacy/seeded notifications may lack a link: derive the destination (HU-13).
                    if ((n.kind === 'interes' || n.kind === 'solicitud') && n.actorId && (user.role === 'owner' || user.role === 'admin')) {
                      navigate(`/adoptante/${n.actorId}${n.petId ? `?petId=${n.petId}` : ''}`);
                    }
                  }}
                  className={`pressable flex w-full items-start gap-3.5 px-4 py-3.5 text-left hover:bg-white/80 ${n.read ? '' : 'bg-terra-50/70'}`}
                >
                  <span className="relative shrink-0">
                    {pet ? <img src={pet.photos[0]} alt="" className="h-14 w-14 rounded-2xl bg-cream-200 object-cover" /> : <Avatar src={actor?.avatar} name={actor?.name ?? 'K'} size={56} />}
                    <span className="surface-3 absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-sm leading-none">{KIND_EMOJI[n.kind]}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block leading-snug text-cocoa-900 ${n.read ? 'font-semibold' : 'font-extrabold'}`}>{n.title}</span>
                    <span className="mt-0.5 block text-sm leading-snug text-cocoa-500">{n.body}</span>
                    <span className="mt-1 block text-xs tabular-nums text-cocoa-500">
                      {new Date(n.createdAt).toLocaleString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </span>
                  {!n.read && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-coral" aria-label="No leída" />}
                </button>
              </li>
            );
          })}
        </ListGroup>
      )}
    </div>
  );
}
