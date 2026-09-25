import { motion } from 'framer-motion';
import { ArrowLeft, CalendarCheck, SendHorizonal } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Avatar, EmptyState, Button } from '@/components/ui';
import { useCurrentUser } from '@/services/auth';
import { markThreadRead, sendMessage, useMessages, useThread } from '@/services/chat';
import { usePet } from '@/services/pets';
import { useDb } from '@/services/store';
import { useUi } from '@/services/ui';

export function ChatThreadScreen() {
  const { id } = useParams();
  const thread = useThread(id);
  const messages = useMessages(id);
  const pet = usePet(thread?.petId);
  const user = useCurrentUser();
  const users = useDb((s) => s.users);
  const typing = useUi((s) => (id ? s.typing[id] : false));
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (id && user) markThreadRead(id, user.id);
  }, [messages.length, typing, id, user]);

  if (!thread || !user)
    return (
      <div className="pt-10">
        <EmptyState emoji="💬" title="Conversación no encontrada" action={<Button onClick={() => navigate('/chats')}>Ir a mis chats</Button>} />
      </div>
    );

  const other = users.find((u) => u.id === thread.memberIds.find((m) => m !== user.id));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(thread.id, user.id, text);
    setText('');
  };

  return (
    <div className="flex h-full flex-col bg-cream" data-hu={thread.kind === 'group' ? 'HU-09' : 'HU-08'} data-tour="chat">
      <header className="flex shrink-0 items-center gap-3 border-b border-cream-300 bg-white px-3 pb-2.5 pt-[max(env(safe-area-inset-top),14px)]">
        <button onClick={() => navigate(-1)} aria-label="Volver" className="rounded-full p-2 hover:bg-cream-200">
          <ArrowLeft size={20} />
        </button>
        <Link to={`/mascota/${pet?.id}`} className="flex min-w-0 flex-1 items-center gap-2.5">
          <img src={pet?.photos[0]} alt="" className="h-11 w-11 rounded-full object-cover" />
          <span className="min-w-0">
            <span className="block truncate font-display text-lg font-bold leading-tight">{thread.kind === 'group' ? `Grupo de ${pet?.name}` : pet?.name}</span>
            {thread.kind === 'group' ? (
              <span className="block truncate text-xs text-cocoa-500">{thread.memberIds.length} interesados</span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-cocoa-500">
                <Avatar src={other?.avatar} name={other?.name ?? '?'} size={16} />
                <span className="leading-tight">{other?.name}</span>
              </span>
            )}
          </span>
        </Link>
        {user.role === 'adopter' && pet && thread.kind === 'direct' && (
          <Link to={`/coordinar/${pet.id}`} data-tour="chat-coordinate" aria-label="Coordinar adopción" className="flex shrink-0 items-center gap-1 rounded-full bg-sage-100 px-3 py-2 text-xs font-bold text-sage-600">
            <CalendarCheck size={16} /> Coordinar
          </Link>
        )}
      </header>

      <div className="scroll-area flex-1 space-y-2 px-3 py-4" data-tour="chat-messages">
        {messages.length === 0 && <p className="py-8 text-center text-sm text-cocoa-500">Todavía no hay mensajes. ¡Rompe el hielo! 👋</p>}
        {messages.map((m) => {
          if (m.system)
            return (
              <p key={m.id} className="mx-auto max-w-[85%] rounded-2xl bg-honey-100 px-3 py-1.5 text-center text-xs font-semibold text-cocoa-700">
                {m.text}
              </p>
            );
          const mine = m.senderId === user.id;
          const sender = users.find((u) => u.id === m.senderId);
          return (
            <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex items-end gap-2 ${mine ? 'justify-end' : ''}`}>
              {!mine && <Avatar src={sender?.avatar} name={sender?.name ?? '?'} size={28} />}
              <div className={`max-w-[75%] rounded-3xl px-3.5 py-2 shadow-soft ${mine ? 'rounded-br-md bg-terra text-white' : 'rounded-bl-md bg-white'}`}>
                {!mine && thread.kind === 'group' && <p className="text-xs font-bold text-terra">{sender?.name}</p>}
                <p className="whitespace-pre-wrap text-[15px] leading-snug">{m.text}</p>
                <p className={`mt-0.5 text-right text-[10px] ${mine ? 'text-white/70' : 'text-cocoa-300'}`}>
                  {new Date(m.createdAt).toLocaleString('es-PE', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                </p>
              </div>
            </motion.div>
          );
        })}
        {typing && (
          <div className="flex items-end gap-2">
            <Avatar src={other?.avatar} name={other?.name ?? '?'} size={28} />
            <div className="flex gap-1 rounded-3xl rounded-bl-md bg-white px-4 py-3 shadow-soft" aria-label="Escribiendo">
              {[0, 1, 2].map((i) => (
                <motion.span key={i} className="h-2 w-2 rounded-full bg-cocoa-300" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="flex shrink-0 items-center gap-2 border-t border-cream-300 bg-white p-3 pb-[max(env(safe-area-inset-bottom),12px)]">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje…"
          aria-label="Mensaje"
          data-tour="chat-input"
          className="input !rounded-full !py-2.5"
        />
        <button type="submit" disabled={!text.trim()} aria-label="Enviar" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-terra text-white transition disabled:opacity-40">
          <SendHorizonal size={20} />
        </button>
      </form>
    </div>
  );
}
