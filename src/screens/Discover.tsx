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

  const onSwipe = (entry: DeckEntry, kind: InteractionKind) => {
    recordSwipe(user, entry.pet.id, kind);
    if (kind === 'like') toast({ title: `Te gusta ${entry.pet.name}`, body: 'Avisamos a su responsable. Si acepta, ¡es Match!', emoji: '💗' });
    if (kind === 'superlike') toast({ title: `¡Súper Kuyay para ${entry.pet.name}!`, body: 'Tu interés llega destacado al responsable.', emoji: '⭐' });
    if (kind === 'dislike') toast({ title: 'Siguiente', body: `No te mostraremos a ${entry.pet.name} de nuevo.`, emoji: '👋' });
    setIndex((i) => i + 1);
  };

  return (
    <div className="flex h-full flex-col px-4 pb-3" data-hu="HU-06">
      <div className="mb-2 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Descubre</h1>
          <p className="text-sm text-cocoa-500">Ordenadas por compatibilidad contigo</p>
        </div>
        <span className="font-hand text-xl text-terra">¡Encuentra tu mejor compañero!</span>
      </div>

      <div className="relative min-h-0 flex-1" data-tour="deck">
        {current ? (
          <>
            {next && <SwipeCard key={next.pet.id} entry={next} behind />}
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
        <div className="mt-3 flex items-center justify-center gap-5">
          <RoundButton label="No me gusta" onClick={() => swipeProgrammatic('dislike')} className="h-16 w-16 bg-white text-cocoa-500">
            <X size={30} strokeWidth={3} />
          </RoundButton>
          <RoundButton label="Súper Kuyay" onClick={() => swipeProgrammatic('superlike')} className="h-12 w-12 bg-white text-honey">
            <Star size={22} fill="currentColor" />
          </RoundButton>
          <RoundButton label="Me gusta" tour="like-btn" onClick={() => swipeProgrammatic('like')} className="h-16 w-16 bg-coral text-white">
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
        onClick={onClick}
        aria-label={label}
        data-tour={tour}
        className={`flex items-center justify-center rounded-full shadow-card ${className}`}
      >
        {children}
      </motion.button>
      <span className="text-[11px] font-bold text-cocoa-500">{label}</span>
    </div>
  );
}

function SwipeCard({ entry, onSwipe, behind }: { entry: DeckEntry; onSwipe?: (k: InteractionKind) => void; behind?: boolean }) {
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
    animate(x, target.x, { duration: 0.35 });
    animate(y, target.y, { duration: 0.35 }).then(() => onSwipe?.(kind));
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
      className="absolute inset-0 touch-none select-none overflow-hidden rounded-4xl bg-cocoa shadow-card"
      style={behind ? {} : { x, y, rotate }}
      initial={behind ? { scale: 0.94, y: 14 } : { scale: 0.96, opacity: 0.6 }}
      animate={behind ? { scale: 0.94, y: 14 } : { scale: 1, opacity: 1 }}
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
              <span key={i} className={`h-1 flex-1 rounded-full ${i === photo ? 'bg-white' : 'bg-white/40'}`} />
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
          <motion.span style={{ opacity: likeOpacity }} className="absolute left-5 top-16 -rotate-12 rounded-2xl border-4 border-sage bg-white/80 px-3 py-1 font-display text-3xl font-extrabold text-sage">
            ME GUSTA
          </motion.span>
          <motion.span style={{ opacity: nopeOpacity }} className="absolute right-5 top-16 rotate-12 rounded-2xl border-4 border-coral bg-white/80 px-3 py-1 font-display text-3xl font-extrabold text-coral">
            NO
          </motion.span>
          <motion.span style={{ opacity: superOpacity }} className="absolute inset-x-0 top-1/3 mx-auto w-fit rounded-2xl border-4 border-honey bg-white/80 px-3 py-1 font-display text-3xl font-extrabold text-honey">
            ⭐ SÚPER KUYAY
          </motion.span>
        </>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent p-4 pt-20 text-white">
        <div className="flex items-end justify-between gap-2">
          <div>
            <h2 className="text-3xl font-extrabold drop-shadow">
              {pet.name} <span className="text-2xl font-semibold opacity-90">{ageLabel(pet.ageMonths)}</span>
            </h2>
            <p className="flex items-center gap-1 text-sm opacity-95">
              <MapPin size={14} /> {pet.district} · {formatKm(match.distanceKm)} · {pet.breed}
            </p>
          </div>
          {!behind && (
            <Link to={`/mascota/${pet.id}`} aria-label={`Ver perfil de ${pet.name}`} className="rounded-full bg-white/20 p-2.5 backdrop-blur hover:bg-white/30">
              <Info size={20} />
            </Link>
          )}
        </div>
        <ul className="mt-2 space-y-1" data-tour={behind ? undefined : 'reasons'}>
          {match.reasons.slice(0, 3).map((r) => (
            <li key={r.factor} className="rounded-xl bg-white/15 px-2.5 py-1 text-[13px] font-semibold backdrop-blur-sm">
              {r.text}
            </li>
          ))}
          {match.warnings.slice(0, 1).map((w) => (
            <li key={w.factor + w.text} className="rounded-xl bg-honey/80 px-2.5 py-1 text-[13px] font-semibold text-cocoa">
              {w.text}
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}
