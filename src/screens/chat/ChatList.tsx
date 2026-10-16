import { Link } from 'react-router-dom';
import { Avatar, EmptyState, ListGroup, PageHeader } from '@/components/ui';
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
    <div className="px-4 pb-8" data-hu="HU-08">
      <PageHeader title="Conversaciones" subtitle="Cada chat está vinculado a una mascota." />
      {threads.length === 0 ? (
        <EmptyState emoji="💬" title="Aún no tienes conversaciones" body="Cuando hagas Match, podrás chatear con el responsable aquí." />
      ) : (
        <ListGroup>
          {threads.map((t) => {
            const pet = pets.find((p) => p.id === t.petId);
            const other = users.find((u) => u.id === t.memberIds.find((id) => id !== user.id));
            const last = lastMessage(t.id);
            const unread = unreadIn(t, user.id);
            const title = t.kind === 'group' ? `Grupo de ${pet?.name}` : user.role === 'adopter' ? `${pet?.name} · ${other?.name}` : `${other?.name} · ${pet?.name}`;
            return (
              <li key={t.id}>
                <Link to={`/chats/${t.id}`} className="pressable flex items-center gap-3.5 px-4 py-3.5 hover:bg-white/80 active:bg-cream-100">
                  <span className="relative shrink-0">
                    <img src={pet?.photos[0]} alt="" className="h-16 w-16 rounded-full object-cover ring-1 ring-cocoa/10" />
                    {t.kind === 'direct' && other && (
                      <span className="absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-white">
                        <Avatar src={other.avatar} name={other.name} size={26} />
                      </span>
                    )}
                    {t.kind === 'group' && (
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-honey-100 text-xs ring-2 ring-white" aria-hidden>
                        👥
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className={`truncate text-base text-cocoa-900 ${unread ? 'font-extrabold' : 'font-bold'}`}>{title}</span>
                      {last && <span className={`shrink-0 text-xs tabular-nums ${unread ? 'font-bold text-terra-600' : 'text-cocoa-500'}`}>{timeLabel(last.createdAt)}</span>}
                    </span>
                    <span className="mt-0.5 flex items-center justify-between gap-3">
                      <span className={`line-clamp-2 text-sm leading-snug ${unread ? 'font-semibold text-cocoa-900' : 'text-cocoa-500'}`}>{last?.text ?? 'Inicia la conversación'}</span>
                      {unread > 0 && (
                        <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-coral px-1.5 text-xs font-extrabold tabular-nums text-white">{unread}</span>
                      )}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ListGroup>
      )}
    </div>
  );
}
