import { Link } from 'react-router-dom';
import { Avatar, EmptyState } from '@/components/ui';
import { useCurrentUser } from '@/services/auth';
import { lastMessage, unreadIn, useThreadsFor } from '@/services/chat';
import { useDb } from '@/services/store';

function timeLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  return d.toDateString() === today.toDateString()
    ? d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
}

export function ChatList() {
  const user = useCurrentUser();
  const threads = useThreadsFor(user?.id);
  const pets = useDb((s) => s.pets);
  const users = useDb((s) => s.users);
  useDb((s) => s.messages.length); // re-render on new messages

  if (!user) return null;
  return (
    <div className="px-4 pb-6" data-hu="HU-08">
      <h1 className="text-2xl font-extrabold">Conversaciones</h1>
      <p className="mb-4 text-sm text-cocoa-500">Cada chat está vinculado a una mascota.</p>
      {threads.length === 0 ? (
        <EmptyState emoji="💬" title="Aún no tienes conversaciones" body="Cuando hagas Match, podrás chatear con el responsable aquí." />
      ) : (
        <ul className="space-y-2">
          {threads.map((t) => {
            const pet = pets.find((p) => p.id === t.petId);
            const other = users.find((u) => u.id === t.memberIds.find((id) => id !== user.id));
            const last = lastMessage(t.id);
            const unread = unreadIn(t, user.id);
            const title = t.kind === 'group' ? `Grupo de ${pet?.name}` : user.role === 'adopter' ? `${pet?.name} · ${other?.name}` : `${other?.name} · ${pet?.name}`;
            return (
              <li key={t.id}>
                <Link to={`/chats/${t.id}`} className="flex items-center gap-3 rounded-3xl bg-white p-3 shadow-soft transition hover:shadow-card">
                  <span className="relative">
                    <img src={pet?.photos[0]} alt="" className="h-14 w-14 rounded-full object-cover" />
                    {t.kind === 'direct' && other && (
                      <span className="absolute -bottom-1 -right-1 rounded-full border-2 border-white">
                        <Avatar src={other.avatar} name={other.name} size={24} />
                      </span>
                    )}
                    {t.kind === 'group' && <span className="absolute -bottom-1 -right-1 rounded-full border-2 border-white bg-honey px-1 text-xs">👥</span>}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate font-bold">{title}</span>
                      {last && <span className="shrink-0 text-xs text-cocoa-300">{timeLabel(last.createdAt)}</span>}
                    </span>
                    <span className={`block truncate text-sm ${unread ? 'font-bold text-cocoa' : 'text-cocoa-500'}`}>{last?.text ?? 'Inicia la conversación'}</span>
                  </span>
                  {unread > 0 && <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-coral px-1.5 text-xs font-extrabold text-white">{unread}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
