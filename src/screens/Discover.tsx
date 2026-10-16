import { animate, AnimatePresence, motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { Heart, Info, MapPin, RotateCcw, Star, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { rankDeck, formatKm, type DeckEntry } from '@/lib/match';
import { useCurrentUser } from '@/services/auth';
import { recordSwipe, seenPetIds } from '@/services/match';
import { ageLabel, usePets } from '@/services/pets';
import { toast, useUi } from '@/services/ui';
import { Button, EmptyState, ScoreBadge } from '@/components/ui';
import type { InteractionKind } from '@/types';

const SWIPE_THRESHOLD = 110;

export function Discover() {
  const user = useCurrentUser();
  const pets = usePets();
  const navigate = useNavigate();
  const [round, setRound] = useState(0);
  const pinned = useUi((s) => s.pinnedPetId);
  // Rank once per visit/round so the deck doesn't reshuffle while swiping.
  const deck = useMemo<DeckEntry[]>(
    () => {
      if (!user?.profile) return [];
      const ranked = rankDeck(user.profile, pets, seenPetIds(user.id));
      const i = ranked.findIndex((e) => e.pet.id === pinned);
      if (i > 0) ranked.unshift(...ranked.splice(i, 1));
      return ranked;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.id, user?.profile, round, pinned],
  );
  const [index, setIndex] = useState(0);

  if (!user) return null;
  if (!user.profile)
    return (
      <div data-hu="HU-06">
        <EmptyState
          emoji="📝"
          title="Cuéntanos sobre ti"
          body="Responde 8 preguntas rápidas para calcular tu compatibilidad con cada mascota."
          action={<Button onClick={() => navigate('/onboarding')}>Completar mis preferencias</Button>}
        />
      </div>
    );

  const current = deck[index];
  const next = deck[index + 1];
  const nextNext = deck[index + 2];

  const onSwipe = (entry: DeckEntry, kind: InteractionKind) => {
    recordSwipe(user, entry.pet.id, kind);
    if (kind === 'like') toast({ title: `Te gusta ${entry.pet.name}`, body: 'Avisamos a su responsable. Si acepta, ¡es Match!', emoji: '💗' });
    if (kind === 'superlike') toast({ title: `¡Súper Kuyay para ${entry.pet.name}!`, body: 'Tu interés llega destacado al responsable.', emoji: '⭐' });
    if (kind === 'dislike') toast({ title: 'Siguiente', body: `No te mostraremos a ${entry.pet.name} de nuevo.`, emoji: '👋' });
    setIndex((i) => i + 1);
  };

  return (
    <div className="flex h-full flex-col px-4 pb-3" data-hu="HU-06">
      <div className="mb-2.5 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Descubre</h1>
          <p className="text-sm text-cocoa-500">Ordenadas por compatibilidad contigo</p>
        </div>
        <span className="max-w-[9.5rem] text-right font-hand text-xl leading-tight text-terra">¡Encuentra tu mejor compañero!</span>
      </div>

      <div className="relative min-h-0 flex-1" data-tour="deck">
        {current ? (
          <>
            {nextNext && <SwipeCard key={nextNext.pet.id} entry={nextNext} behind={2} />}
            {next && <SwipeCard key={next.pet.id} entry={next} behind={1} />}
            <AnimatePresence>
              <SwipeCard key={current.pet.id} entry={current} onSwipe={(k) => onSwipe(current, k)} />
            </AnimatePresence>
          </>
        ) : (
          <EmptyState
            emoji="🐾"
            title="¡Viste todas las mascotas compatibles!"
            body="Amplía tu radio o ajusta tus preferencias para ver más."
            action={
              <div className="flex flex-col gap-2">
                <Button onClick={() => navigate('/onboarding')}>Editar preferencias</Button>
                <Button
                  variant="ghost"
                  icon={<RotateCcw size={18} />}
                  onClick={() => {
                    setIndex(0);
                    setRound((r) => r + 1);
                  }}
                >
                  Volver a cargar
                </Button>
              </div>
            }
          />
        )}
      </div>

      {current && (
        <div className="mt-3.5 flex items-center justify-center gap-6">
          <RoundButton label="No me gusta" onClick={() => swipeProgrammatic('dislike')} className="h-16 w-16 bg-white text-cocoa-500 ring-1 ring-cocoa/[.06] hover:text-cocoa">
            <X size={30} strokeWidth={3} />
          </RoundButton>
          <RoundButton label="Súper Kuyay" onClick={() => swipeProgrammatic('superlike')} className="h-12 w-12 bg-white text-honey ring-1 ring-cocoa/[.06]">
            <Star size={22} fill="currentColor" />
          </RoundButton>
          <RoundButton label="Me gusta" tour="like-btn" onClick={() => swipeProgrammatic('like')} className="h-16 w-16 bg-coral text-white ring-4 ring-coral/15 hover:bg-coral-600">
            <Heart size={30} fill="currentColor" />
          </RoundButton>
        </div>
      )}
    </div>
  );
}

// The top card registers its animator here so the buttons (and the tour) can swipe it.
let topCardSwipe: ((k: InteractionKind) => void) | null = null;
function swipeProgrammatic(kind: InteractionKind) {
  topCardSwipe?.(kind);
}

function RoundButton({ label, onClick, className, children, tour }: { label: string; onClick: () => void; className: string; children: React.ReactNode; tour?: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <motion.button
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.06 }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        onClick={onClick}
        aria-label={label}
        data-tour={tour}
        className={`flex items-center justify-center rounded-full shadow-raised transition-colors ${className}`}
      >
        {children}
      </motion.button>
      <span className="text-[11px] font-bold text-cocoa-500">{label}</span>
    </div>
  );
}

function SwipeCard({ entry, onSwipe, behind }: { entry: DeckEntry; onSwipe?: (k: InteractionKind) => void; behind?: 1 | 2 }) {
  const { pet, match } = entry;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-14, 14]);
  const likeOpacity = useTransform(x, [30, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-120, -30], [1, 0]);
  const superOpacity = useTransform(y, [-120, -40], [1, 0]);
  const [photo, setPhoto] = useState(0);

  const fly = (kind: InteractionKind) => {
    const target = kind === 'like' ? { x: 520, y: 40 } : kind === 'dislike' ? { x: -520, y: 40 } : { x: 0, y: -800 };
    const pattern = kind === 'like' ? [30] : kind === 'dislike' ? [15] : [20, 40, 20];
    navigator.vibrate?.(pattern);
    animate(x, target.x, { duration: 0.38, ease: [0.4, 0, 1, 1] });
    animate(y, target.y, { duration: 0.38, ease: [0.4, 0, 1, 1] }).then(() => onSwipe?.(kind));
  };

  if (!behind) topCardSwipe = fly;

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > 600) fly('like');
    else if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -600) fly('dislike');
    else if (info.offset.y < -SWIPE_THRESHOLD) fly('superlike');
    else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 });
      animate(y, 0, { type: 'spring', stiffness: 400, damping: 30 });
    }
  };

  return (
    <motion.article
      className={`absolute inset-0 touch-none select-none overflow-hidden rounded-4xl bg-cocoa ring-1 ring-white/50 ${behind ? 'shadow-soft' : 'shadow-float'}`}
      style={behind ? { zIndex: behind === 1 ? 2 : 1 } : { x, y, rotate, zIndex: 3 }}
      initial={behind ? { scale: behind === 1 ? 0.95 : 0.9, y: behind === 1 ? 12 : 24, opacity: behind === 1 ? 0.9 : 0.6 } : { scale: 0.96, opacity: 0.6 }}
      animate={behind ? { scale: behind === 1 ? 0.95 : 0.9, y: behind === 1 ? 12 : 24, opacity: behind === 1 ? 0.9 : 0.6 } : { scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      drag={!behind}
      data-tour={behind ? undefined : 'top-card'}
      dragMomentum={false}
      onDragEnd={onDragEnd}
      aria-label={`${pet.name}, ${match.score}% de compatibilidad`}
    >
      <img src={pet.photos[photo]} alt={`Foto de ${pet.name}`} className="pointer-events-none h-full w-full object-cover" draggable={false} />
      {/* photo pager */}
      {pet.photos.length > 1 && (
        <>
          <div className="absolute inset-x-3 top-3 flex gap-1.5">
            {pet.photos.map((_, i) => (
              <span key={i} className={`h-[3px] flex-1 rounded-full shadow-sm transition-colors duration-slow ${i === photo ? 'bg-white' : 'bg-white/35'}`} />
            ))}
          </div>
          {!behind && (
            <>
              <button aria-label="Foto anterior" className="absolute left-0 top-0 h-1/2 w-1/3" onClick={() => setPhoto((p) => Math.max(0, p - 1))} />
              <button aria-label="Foto siguiente" className="absolute right-0 top-0 h-1/2 w-1/3" onClick={() => setPhoto((p) => Math.min(pet.photos.length - 1, p + 1))} />
            </>
          )}
        </>
      )}
      <div className="absolute right-3 top-6" data-tour={behind ? undefined : 'score'}>
        <ScoreBadge score={match.score} className="text-lg" />
      </div>

      {!behind && (
        <>
          <motion.span style={{ opacity: likeOpacity }} className="absolute left-5 top-16 -rotate-12 rounded-2xl border-4 border-sage bg-white/85 px-3 py-1 font-display text-3xl font-extrabold text-sage shadow-raised backdrop-blur-sm">
            ME GUSTA
          </motion.span>
          <motion.span style={{ opacity: nopeOpacity }} className="absolute right-5 top-16 rotate-12 rounded-2xl border-4 border-coral bg-white/85 px-3 py-1 font-display text-3xl font-extrabold text-coral shadow-raised backdrop-blur-sm">
            NO
          </motion.span>
          <motion.span style={{ opacity: superOpacity }} className="absolute inset-x-0 top-1/3 mx-auto w-fit rounded-2xl border-4 border-honey bg-white/85 px-3 py-1 font-display text-3xl font-extrabold text-honey shadow-raised backdrop-blur-sm">
            ⭐ SÚPER KUYAY
          </motion.span>
        </>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-cocoa-900/90 via-cocoa-900/55 to-transparent p-4 pt-24 text-white">
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-3xl font-extrabold leading-none drop-shadow-sm">
              {pet.name} <span className="text-2xl font-semibold opacity-85">{ageLabel(pet.ageMonths)}</span>
            </h2>
            <p className="mt-1.5 flex items-center gap-1 text-sm font-medium opacity-90">
              <MapPin size={14} /> {pet.district} · {formatKm(match.distanceKm)} · {pet.breed}
            </p>
          </div>
          {!behind && (
            <Link to={`/mascota/${pet.id}`} aria-label={`Ver perfil de ${pet.name}`} className="pressable shrink-0 rounded-full bg-white/15 p-2.5 ring-1 ring-white/30 backdrop-blur hover:bg-white/30">
              <Info size={20} />
            </Link>
          )}
        </div>
        <ul className="mt-2.5 space-y-1" data-tour={behind ? undefined : 'reasons'}>
          {match.reasons.slice(0, 3).map((r) => (
            <li key={r.factor} className="rounded-xl bg-white/[.14] px-2.5 py-1 text-[13px] font-semibold ring-1 ring-inset ring-white/15 backdrop-blur-sm">
              {r.text}
            </li>
          ))}
          {match.warnings.slice(0, 1).map((w) => (
            <li key={w.factor + w.text} className="rounded-xl bg-honey/85 px-2.5 py-1 text-[13px] font-semibold text-cocoa ring-1 ring-inset ring-white/30">
              {w.text}
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}
