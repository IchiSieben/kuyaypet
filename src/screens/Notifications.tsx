import { useNavigate } from 'react-router-dom';
import { Avatar, Button, EmptyState } from '@/components/ui';
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
    <div className="px-4 pb-6" data-hu="HU-13">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Notificaciones</h1>
          <p className="text-sm text-cocoa-500">{unread ? `${unread} sin leer` : 'Estás al día'}</p>
        </div>
        {unread > 0 && (
          <Button size="sm" variant="ghost" onClick={() => markAllRead(user.id)}>
            Marcar todo como leído
          </Button>
        )}
      </div>
      {list.length === 0 ? (
        <EmptyState emoji="🔔" title="Sin notificaciones" />
      ) : (
        <ul className="space-y-2">
          {list.map((n) => {
            const actor = users.find((u) => u.id === n.actorId);
            const pet = pets.find((p) => p.id === n.petId);
            return (
              <li key={n.id}>
                <button
                  onClick={() => {
                    markRead(n.id);
                    if (n.link) navigate(n.link);
                  }}
                  className={`flex w-full items-start gap-3 rounded-3xl p-3 text-left shadow-soft transition ${n.read ? 'bg-white/70' : 'bg-white ring-2 ring-terra-100'}`}
                >
                  <span className="relative">
                    {pet ? <img src={pet.photos[0]} alt="" className="h-12 w-12 rounded-2xl object-cover" /> : <Avatar src={actor?.avatar} name={actor?.name ?? 'K'} size={48} />}
                    <span className="absolute -bottom-1 -right-1 text-lg">{KIND_EMOJI[n.kind]}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block ${n.read ? 'font-semibold' : 'font-extrabold'}`}>{n.title}</span>
                    <span className="block text-sm text-cocoa-500">{n.body}</span>
                    <span className="mt-0.5 block text-[11px] text-cocoa-300">
                      {new Date(n.createdAt).toLocaleString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </span>
                  {!n.read && <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-coral" aria-label="No leída" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
