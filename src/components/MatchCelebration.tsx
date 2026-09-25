import confetti from 'canvas-confetti';
import { animate, AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/services/auth';
import { findDirectThread } from '@/services/chat';
import { useMatchById } from '@/services/match';
import { useMatch, usePet, useUser } from '@/services/pets';
import { useUi } from '@/services/ui';
import { Avatar, Button } from '@/components/ui';

const RING_C = 2 * Math.PI * 40;

/** "¡Es un Match!" overlay (HU-07). Shown when the owner accepts while the adopter is using the app. */
export function MatchCelebration() {
  const matchId = useUi((s) => s.celebrationMatchId);
  const match = useMatchById(matchId);
  const pet = usePet(match?.petId);
  const owner = useUser(match?.ownerId);
  const me = useCurrentUser();
  const navigate = useNavigate();
  const close = () => useUi.setState({ celebrationMatchId: null });
  const result = useMatch(me?.profile, pet);
  const reduced = useReducedMotion();
  const score = match?.score ?? result?.score ?? 0;
  const [shown, setShown] = useState(0);

  // Compatibility ring fills and counts up (instant with reduced motion).
  useEffect(() => {
    if (!match) return;
    if (reduced) return setShown(score);
    setShown(0);
    const c = animate(0, score, { duration: 1.4, delay: 0.5, ease: 'easeOut', onUpdate: (v) => setShown(Math.round(v)) });
    return () => c.stop();
  }, [match, score, reduced]);

  useEffect(() => {
    if (!match) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'pointer-events-none absolute inset-0 z-[56] h-full w-full';
    document.getElementById('app-screen')?.appendChild(canvas);
    const fire = confetti.create(canvas, { resize: true });
    const colors = ['#E4555F', '#B5553A', '#E9A23B', '#4F8A65', '#FFF8EE'];
    // Paw prints and hearts, not generic squares.
    const paw = confetti.shapeFromText({ text: '🐾', scalar: 2.2 });
    const heart = confetti.shapeFromText({ text: '💗', scalar: 2.2 });
    fire({ particleCount: 90, spread: 90, origin: { y: 0.35 }, colors });
    const t = setTimeout(() => fire({ particleCount: 36, spread: 120, origin: { y: 0.4 }, shapes: [paw, heart], scalar: 2.2, flat: true }), 350);
    const t2 = setTimeout(() => fire({ particleCount: 60, spread: 140, origin: { y: 0.55 }, colors, shapes: ['circle'] }), 900);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
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
          className="scroll-area absolute inset-0 z-[55] flex flex-col items-center justify-start bg-gradient-to-b from-terra via-coral to-terra-600 px-6 pb-6 pt-8 text-center text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.h2
            className="font-display text-[2.6rem] font-extrabold leading-tight drop-shadow"
            initial={{ scale: 0.3, rotate: -8 }}
            animate={{ scale: 1, rotate: -4 }}
            transition={{ type: 'spring', stiffness: 260, damping: 12 }}
          >
            ¡Es un Match!
          </motion.h2>
          <p className="mt-2 font-hand text-2xl">Conecta corazones, cambia vidas</p>
          <div className="relative mt-6 flex items-center">
            <motion.div initial={{ x: -80, rotate: -20 }} animate={{ x: 10, rotate: -8 }} transition={{ type: 'spring', stiffness: 120 }} className="rounded-full border-4 border-white shadow-card">
              <Avatar src={me?.avatar} name={me?.name ?? 'Tú'} size={92} />
            </motion.div>
            {/* Compatibility ring between the two of them */}
            <motion.div
              className="relative z-10 flex h-[104px] w-[104px] items-center justify-center rounded-full bg-white shadow-card"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.25 }}
              aria-label={`${score}% de compatibilidad`}
              data-match-score={score}
            >
              <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden="true">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#F9E6CC" strokeWidth="9" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#kp-ring)"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={RING_C}
                  strokeDashoffset={RING_C * (1 - shown / 100)}
                />
                <defs>
                  <linearGradient id="kp-ring" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#E4555F" />
                    <stop offset="100%" stopColor="#4F8A65" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="font-display text-3xl font-extrabold leading-none text-terra">
                {shown}
                <span className="text-base">%</span>
              </span>
            </motion.div>
            <motion.img
              src={pet.photos[0]}
              alt={pet.name}
              initial={{ x: 80, rotate: 20 }}
              animate={{ x: -10, rotate: 8 }}
              transition={{ type: 'spring', stiffness: 120 }}
              className="h-[100px] w-[100px] rounded-full border-4 border-white object-cover shadow-card"
            />
          </div>
          <p className="mt-5 max-w-xs text-base font-semibold">
            A ti te gustó <b>{pet.name}</b> y {owner?.name ?? 'su responsable'} aceptó continuar. ¡Hay interés mutuo!
          </p>
          {result && result.reasons.length > 0 && (
            <ul className="mt-3 w-full max-w-xs space-y-1.5 text-left" aria-label="Por qué hacen match">
              {result.reasons.slice(0, 3).map((r, i) => (
                <motion.li
                  key={r.factor}
                  initial={reduced ? false : { opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 + i * 0.35, type: 'spring', stiffness: 200, damping: 20 }}
                  className="rounded-2xl bg-white/20 px-3 py-1.5 text-sm font-semibold backdrop-blur-sm"
                >
                  {r.text}
                </motion.li>
              ))}
            </ul>
          )}
          <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
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
