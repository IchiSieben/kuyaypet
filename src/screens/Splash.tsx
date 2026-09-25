import { motion, useReducedMotion } from 'framer-motion';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui';
import { DEMO_IDS, HOME_BY_ROLE, loginAs, useCurrentUser } from '@/services/auth';
import { toast } from '@/services/ui';
import { useDb } from '@/services/store';
import { startTour } from '@/shell/Tour';
import type { Role } from '@/types';

const ROLES: { role: Role; emoji: string; label: string; hint: string }[] = [
  { role: 'adopter', emoji: '🧡', label: 'Adoptante', hint: 'Valeria' },
  { role: 'owner', emoji: '🏡', label: 'Responsable', hint: 'Rosa' },
  { role: 'admin', emoji: '🛡️', label: 'Admin', hint: 'Moderación' },
];

const PAWS = [
  { left: '8%', top: '18%', size: 22, delay: 0, duration: 7 },
  { left: '82%', top: '12%', size: 16, delay: 1.2, duration: 8.5 },
  { left: '15%', top: '68%', size: 18, delay: 0.6, duration: 9 },
  { left: '85%', top: '72%', size: 24, delay: 1.8, duration: 7.5 },
];

export function Splash() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const tourDone = useDb((s) => s.demo.tourDone);
  const reduceMotion = useReducedMotion();
  if (user) return <Navigate to={user.profile || user.role !== 'adopter' ? HOME_BY_ROLE[user.role] : '/onboarding'} replace />;

  const enterAs = (role: Role) => {
    const r = loginAs(DEMO_IDS[role]);
    if (!r.ok) return toast({ title: r.error, tone: 'error' });
    toast({ title: `Hola, ${r.user.name.split(' ')[0]}`, body: 'Entraste con una cuenta demo.', emoji: '👋' });
    navigate(HOME_BY_ROLE[role]);
  };

  return (
    <div className="scroll-area relative flex h-full flex-col items-center overflow-hidden px-6 pb-6 pt-10 text-center" data-hu="HU-01" data-tour="splash">
      {!reduceMotion && (
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
          {PAWS.map((p, i) => (
            <motion.span
              key={i}
              className="absolute text-terra-300/40"
              style={{ left: p.left, top: p.top, fontSize: p.size }}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 1, 1, 0], y: [-6, 6, -6] }}
              transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
            >
              🐾
            </motion.span>
          ))}
        </div>
      )}
      <motion.div
        initial={reduceMotion ? { opacity: 1 } : { y: -20, opacity: 0, scale: 0.85 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 160, damping: 14 }}
        className="relative z-10 w-72"
      >
        <Logo />
      </motion.div>
      <p className="relative z-10 mt-1 text-xs font-bold uppercase tracking-wide text-cocoa-500">Plataforma de conexión y adopción de mascotas</p>
      <motion.h1
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="relative z-10 mt-6 font-hand text-4xl text-terra"
      >
        Conecta corazones, cambia vidas
      </motion.h1>
      <p className="mt-2 max-w-xs text-cocoa-500">Desliza, haz match por compatibilidad y coordina la adopción de tu nuevo compañero en Lima.</p>

      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <Button size="lg" block onClick={() => navigate('/registro')}>
          Crear cuenta
        </Button>
        <Button size="lg" variant="outline" block onClick={() => navigate('/login')}>
          Iniciar sesión
        </Button>
      </div>

      {!tourDone && (
        <button onClick={startTour} className="mt-6 flex w-full max-w-xs items-center gap-3 rounded-3xl border-2 border-dashed border-terra-400 bg-terra-100/60 px-4 py-3 text-left">
          <span className="text-2xl">🧭</span>
          <span>
            <span className="block font-bold text-terra-600">¿Primera vez? Ver el tour guiado</span>
            <span className="block text-xs text-cocoa-500">2 minutos: del swipe a la adopción</span>
          </span>
        </button>
      )}

      <div className="mt-6 w-full max-w-xs rounded-3xl bg-white/80 p-4 shadow-soft" data-tour="roles">
        <p className="text-sm font-bold text-cocoa-700">Probar la demo como…</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {ROLES.map((r) => (
            <button
              key={r.role}
              onClick={() => enterAs(r.role)}
              className="flex flex-col items-center rounded-2xl border-2 border-cream-300 bg-cream px-1 py-2.5 transition hover:border-terra active:scale-95"
            >
              <span className="text-2xl">{r.emoji}</span>
              <span className="text-sm font-bold">{r.label}</span>
              <span className="text-[11px] text-cocoa-500">{r.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <Link to="/guia" className="mt-5 text-sm font-bold text-terra underline underline-offset-4">
        📘 Guía de adopción responsable
      </Link>
      <a href="./manual/" target="_blank" rel="noreferrer" className="mt-2 text-sm font-bold text-sage-600 underline underline-offset-4">
        📘 Manual de la demo
      </a>
      <Link to="/creditos" className="mt-auto pt-6 text-sm font-semibold text-cocoa-500 underline decoration-terra/40 underline-offset-4">
        Hecho por el Equipo KuyayPet · UPCH 2026-2
      </Link>
    </div>
  );
}
