import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/services/auth';
import { findDirectThread } from '@/services/chat';
import { useMatchById } from '@/services/match';
import { usePet, useUser } from '@/services/pets';
import { useUi } from '@/services/ui';
import { Avatar, Button } from '@/components/ui';

/** "¡Es un Match!" overlay (HU-07). Shown when the owner accepts while the adopter is using the app. */
export function MatchCelebration() {
  const matchId = useUi((s) => s.celebrationMatchId);
  const match = useMatchById(matchId);
  const pet = usePet(match?.petId);
  const owner = useUser(match?.ownerId);
  const me = useCurrentUser();
  const navigate = useNavigate();
  const close = () => useUi.setState({ celebrationMatchId: null });

  useEffect(() => {
    if (!match) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'pointer-events-none absolute inset-0 z-[56] h-full w-full';
    document.getElementById('app-screen')?.appendChild(canvas);
    const fire = confetti.create(canvas, { resize: true });
    const colors = ['#E4555F', '#B5553A', '#E9A23B', '#4F8A65', '#FFF8EE'];
    fire({ particleCount: 120, spread: 90, origin: { y: 0.35 }, colors });
    const t = setTimeout(() => fire({ particleCount: 80, spread: 120, origin: { y: 0.5 }, colors, shapes: ['circle'] }), 450);
    return () => {
      clearTimeout(t);
      setTimeout(() => canvas.remove(), 2500);
    };
  }, [match]);

  return (
    <AnimatePresence>
      {match && pet && (
        <motion.div
          data-hu="HU-07"
          data-tour="match-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`Es un Match con ${pet.name}`}
          className="absolute inset-0 z-[55] flex flex-col items-center justify-center bg-gradient-to-b from-terra via-coral to-terra-600 p-6 text-center text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.h2
            className="font-display text-5xl font-extrabold drop-shadow"
            initial={{ scale: 0.3, rotate: -8 }}
            animate={{ scale: 1, rotate: -4 }}
            transition={{ type: 'spring', stiffness: 260, damping: 12 }}
          >
            ¡Es un Match!
          </motion.h2>
          <p className="mt-2 font-hand text-2xl">Conecta corazones, cambia vidas</p>
          <div className="relative mt-8 flex items-center">
            <motion.div initial={{ x: -80, rotate: -20 }} animate={{ x: 12, rotate: -8 }} transition={{ type: 'spring', stiffness: 120 }} className="rounded-full border-4 border-white shadow-card">
              <Avatar src={me?.avatar} name={me?.name ?? 'Tú'} size={112} />
            </motion.div>
            <motion.div
              className="z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white text-3xl shadow-card"
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ repeat: Infinity, duration: 1.1 }}
            >
              💗
            </motion.div>
            <motion.img
              src={pet.photos[0]}
              alt={pet.name}
              initial={{ x: 80, rotate: 20 }}
              animate={{ x: -12, rotate: 8 }}
              transition={{ type: 'spring', stiffness: 120 }}
              className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-card"
            />
          </div>
          <p className="mt-6 max-w-xs text-lg font-semibold">
            A ti te gustó <b>{pet.name}</b> y {owner?.name ?? 'su responsable'} aceptó continuar. ¡Hay interés mutuo!
          </p>
          <div className="mt-2 rounded-full bg-white/20 px-4 py-1 font-display font-bold">🐾 {match.score}% de compatibilidad</div>
          <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
            <Button
              size="lg"
              variant="outline"
              data-tour="match-chat"
              className="border-white bg-white !text-terra"
              icon={<MessageCircle size={20} />}
              onClick={() => {
                const thread = findDirectThread(match.petId, match.adopterId, match.ownerId);
                close();
                if (thread) navigate(`/chats/${thread.id}`);
              }}
            >
              Continuar al chat
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/15" onClick={close}>
              Seguir descubriendo
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
