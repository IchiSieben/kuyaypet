import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, CalendarCheck, SendHorizonal } from 'lucide-react';
import { Fragment, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Avatar, EmptyState, Button, IconButton } from '@/components/ui';
import { useCurrentUser } from '@/services/auth';
import { markThreadRead, sendMessage, useMessages, useThread } from '@/services/chat';
import { usePet } from '@/services/pets';
import { useDb } from '@/services/store';
import { useUi } from '@/services/ui';

const timeOf = (iso: string) => new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
const dayOf = (iso: string) => new Date(iso).toDateString();
const dayLabel = (iso: string) => {
  const l = new Date(iso).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
  return l.charAt(0).toUpperCase() + l.slice(1);
};

export function ChatThreadScreen() {
  const { id } = useParams();
  const thread = useThread(id);
  const messages = useMessages(id);
  const pet = usePet(thread?.petId);
  const user = useCurrentUser();
  const users = useDb((s) => s.users);
  const typing = useUi((s) => (id ? s.typing[id] : false));
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const firstScroll = useRef(true);
  // Messages already on screen at mount do not animate; only ones that arrive afterwards do.
  const initialIds = useRef<Set<string>>(new Set(messages.map((m) => m.id)));

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: firstScroll.current || reduce ? 'auto' : 'smooth' });
    firstScroll.current = false;
    if (id && user) markThreadRead(id, user.id);
  }, [messages.length, typing, id, user, reduce]);

  if (!thread || !user)
    return (
      <div className="pt-10">
        <EmptyState emoji="💬" title="Conversación no encontrada" action={<Button onClick={() => navigate('/chats')}>Ir a mis chats</Button>} />
      </div>
    );

  const lastMineId = [...messages].reverse().find((m) => m.senderId === user.id && !m.system)?.id;
  const other = users.find((u) => u.id === thread.memberIds.find((m) => m !== user.id));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(thread.id, user.id, text);
    setText('');
  };

  return (
    <div className="flex h-full flex-col" data-hu={thread.kind === 'group' ? 'HU-09' : 'HU-08'} data-tour="chat">
      <header className="glass relative z-10 flex shrink-0 items-center gap-2 px-3 pb-2.5 pt-safe-t">
        <IconButton label="Volver" size="sm" onClick={() => navigate(-1)} className="!shadow-none">
          <ArrowLeft size={20} />
        </IconButton>
        <Link to={`/mascota/${pet?.id}`} className="pressable flex min-w-0 flex-1 items-center gap-2.5 rounded-full py-0.5">
          <img src={pet?.photos[0]} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-cocoa/10" />
          <span className="min-w-0">
            <span className="block truncate font-display text-lg font-bold leading-tight text-cocoa-900">{thread.kind === 'group' ? `Grupo de ${pet?.name}` : pet?.name}</span>
            {thread.kind === 'group' ? (
              <span className="block truncate text-xs text-cocoa-500">{thread.memberIds.length} interesados</span>
            ) : (
              <span className="mt-0.5 flex items-center gap-1.5 text-xs text-cocoa-500">
                <Avatar src={other?.avatar} name={other?.name ?? '?'} size={16} />
                <span className="truncate leading-tight">{other?.name}</span>
              </span>
            )}
          </span>
        </Link>
        {user.role === 'adopter' && pet && thread.kind === 'direct' && (
          <Link
            to={`/coordinar/${pet.id}`}
            data-tour="chat-coordinate"
            aria-label="Coordinar adopción"
            className="pressable flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-sage-100 px-3.5 text-sm font-bold text-sage-600 hover:bg-sage-100/70"
          >
            <CalendarCheck size={16} /> Coordinar
          </Link>
        )}
      </header>

      <div className="scroll-area flex-1 px-3 py-4" data-tour="chat-messages">
        {messages.length === 0 && <p className="py-10 text-center text-sm text-cocoa-500">Todavía no hay mensajes. ¡Rompe el hielo! 👋</p>}
        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const next = messages[i + 1];
          const newDay = !prev || dayOf(prev.createdAt) !== dayOf(m.createdAt);
          const day = newDay ? (
            <p className="mb-3 mt-5 text-center text-xs font-semibold text-cocoa-500 first:mt-0">{dayLabel(m.createdAt)}</p>
          ) : null;

          if (m.system)
            return (
              <Fragment key={m.id}>
                {day}
                <p className="mx-auto my-3 max-w-[85%] rounded-2xl bg-honey-100 px-3.5 py-1.5 text-center text-xs font-semibold text-cocoa-700">{m.text}</p>
              </Fragment>
            );

          const mine = m.senderId === user.id;
          const sender = users.find((u) => u.id === m.senderId);
          const samePrev = !newDay && !prev?.system && prev?.senderId === m.senderId;
          const sameNext = !!next && !next.system && next.senderId === m.senderId && dayOf(next.createdAt) === dayOf(m.createdAt);
          const lastOfRun = !sameNext;
          const fresh = !initialIds.current.has(m.id);
          const radius = mine
            ? `rounded-3xl ${samePrev ? 'rounded-tr-lg' : ''} ${lastOfRun ? 'rounded-br-md' : 'rounded-br-lg'}`
            : `rounded-3xl ${samePrev ? 'rounded-tl-lg' : ''} ${lastOfRun ? 'rounded-bl-md' : 'rounded-bl-lg'}`;
          return (
            <Fragment key={m.id}>
              {day}
              <motion.div
                data-tour={m.id === lastMineId ? 'chat-mine-last' : undefined}
                initial={fresh ? { opacity: 0, y: reduce ? 0 : 8 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className={`flex items-end gap-2 ${samePrev ? 'mt-0.5' : 'mt-2.5'} ${mine ? 'justify-end' : ''}`}
              >
                {!mine && <span className="w-7 shrink-0">{lastOfRun && <Avatar src={sender?.avatar} name={sender?.name ?? '?'} size={28} />}</span>}
                <div className={`flex max-w-[78%] flex-col ${mine ? 'items-end' : 'items-start'}`}>
                  <div className={`px-3.5 py-2 ${radius} ${mine ? 'bg-terra text-white shadow-raised' : 'surface-2 text-cocoa-900'}`}>
                    {!mine && thread.kind === 'group' && !samePrev && <p className="text-xs font-bold text-terra-600">{sender?.name}</p>}
                    <p className="whitespace-pre-wrap text-[15px] leading-snug">{m.text}</p>
                  </div>
                  {lastOfRun && <p className="mx-1.5 mt-1 text-2xs tabular-nums text-cocoa-500">{timeOf(m.createdAt)}</p>}
                </div>
              </motion.div>
            </Fragment>
          );
        })}
        {typing && (
          <div className="mt-2.5 flex items-end gap-2">
            <Avatar src={other?.avatar} name={other?.name ?? '?'} size={28} />
            <div className="surface-2 flex gap-1 rounded-3xl rounded-bl-md px-4 py-3.5" aria-label="Escribiendo">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-2 w-2 rounded-full bg-cocoa-400"
                  animate={reduce ? { opacity: [0.4, 1, 0.4] } : { y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="glass relative z-10 flex shrink-0 items-center gap-2 px-3 pb-safe-b pt-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje…"
          aria-label="Mensaje"
          data-tour="chat-input"
          className="input !rounded-full !py-2.5"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          aria-label="Enviar"
          className="pressable flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-terra text-white shadow-raised hover:bg-terra-600 disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none"
        >
          <SendHorizonal size={20} />
        </button>
      </form>
    </div>
  );
}
