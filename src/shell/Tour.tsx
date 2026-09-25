// Guided tour as a deterministic state machine (Fase 1, Bloque B).
// Each step declares role, route, target and how it advances: "Siguiente", or a concrete action by the
// presenter (with a "Hazlo por mí" fallback). The db is snapshotted at each step's entry, so "Atrás" and
// off-script actions re-sync to a known state instead of breaking the script. On exit, the pre-tour state
// is restored.
import { motion } from 'framer-motion';
import { Hand, RotateCcw, X } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { DEMO_IDS, loginAs, logout } from '@/services/auth';
import { findDirectThread, sendMessage } from '@/services/chat';
import { setGuaranteedMatch } from '@/services/match';
import { db, useDb, type DbState } from '@/services/store';
import { useUi } from '@/services/ui';
import { resetDemo, setTourDone } from '@/services/users';

const TOUR_PET = 'p29'; // Luna, owned by the demo Responsable (Rosa)
type Role = keyof typeof DEMO_IDS;

interface Step {
  title: string;
  body: string;
  hu?: string;
  /** Session the step needs (null = logged out). */
  role: Role | null;
  route: string | (() => string);
  target?: string;
  /** Short popover (title + hint): the screen itself tells the story. */
  compact?: boolean;
  /** Runs after role + route are applied (and again on re-sync, after the snapshot is restored). */
  enter?: () => void | Promise<void>;
  /** The step advances when the presenter does this (or presses "Hazlo por mí"). */
  action?: { hint: string; done: () => boolean; doIt: () => void | Promise<void> };
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const click = (tour: string) => (document.querySelector(`[data-tour="${tour}"]`) as HTMLElement | null)?.click();
async function waitFor(check: () => boolean, timeout = 5000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    if (check()) return true;
    await wait(120);
  }
  return false;
}
const hasTarget = (tour: string) => () => !!document.querySelector(`[data-tour="${tour}"]`);

// Scenario queries (the tour always tells the same story: Valeria ♥ Luna, Rosa accepts).
const lunaMatch = () => db.get().matches.find((m) => m.petId === TOUR_PET && m.adopterId === DEMO_IDS.adopter);
const lunaThread = () => findDirectThread(TOUR_PET, DEMO_IDS.adopter, DEMO_IDS.owner);
const lunaRequest = () => db.get().adoptions.find((a) => a.petId === TOUR_PET && a.adopterId === DEMO_IDS.adopter);
const pendingCount = () => db.get().pets.filter((p) => p.approval === 'pendiente').length;
let pendingAtEntry = 0;

async function clickAndConfirm(tour: string) {
  click(tour);
  await waitFor(() => !!useUi.getState().confirmState, 2000);
  useUi.getState().closeConfirm(true);
}

export const TOUR: Step[] = [
  {
    title: '¡Bienvenidos a KuyayPet! 🐾',
    body: 'Un “Tinder para adoptar”: desliza, haz Match por compatibilidad y coordina la adopción. Aquí se crea la cuenta (HU-01) o se entra con cuentas demo.',
    hu: 'HU-01',
    role: null,
    route: '/',
    target: 'roles',
  },
  {
    title: 'Cuestionario de compatibilidad',
    body: 'Estilo Bumble: una pregunta por pantalla (vivienda, horas solo, actividad, niños, alergias…). Con estas respuestas el motor KuyayMatch calcula el %.',
    hu: 'HU-20',
    role: 'adopter',
    route: '/onboarding',
    target: 'onboarding-q',
  },
  {
    title: 'Descubre mascotas',
    body: 'Cartas ordenadas por compatibilidad. Cada una muestra el % y las razones: nada de caja negra. Se desliza con el dedo o con los botones.',
    hu: 'HU-06 · HU-20',
    role: 'adopter',
    route: '/descubrir',
    target: 'reasons',
    enter: () => useUi.setState({ pinnedPetId: TOUR_PET }),
  },
  {
    title: 'Me gusta 💗',
    body: 'Al dar “Me gusta” se registra el interés y se notifica al responsable. El Match solo ocurre si el responsable también acepta (interés mutuo).',
    hu: 'HU-06',
    role: 'adopter',
    route: '/descubrir',
    target: 'like-btn',
    enter: () => {
      useUi.setState({ pinnedPetId: TOUR_PET });
      setGuaranteedMatch(true); // the scripted card always ends in a Match
    },
    action: { hint: 'Toca ♥ “Me gusta” en Luna.', done: () => !!lunaMatch(), doIt: () => click('like-btn') },
  },
  {
    title: '¡Es un Match! 🎉',
    body: 'Rosa aceptó (en la demo, simulado con retardo). Queda en “Mis Matches” y se abre el chat vinculado a la mascota.',
    hu: 'HU-07',
    role: 'adopter',
    route: '/descubrir',
    target: 'match-chat',
    compact: true,
    enter: () => {
      const m = lunaMatch();
      if (m) useUi.setState({ celebrationMatchId: m.id });
    },
    action: { hint: 'Toca “Continuar al chat”.', done: () => location.hash.includes('/chats/'), doIt: () => click('match-chat') },
  },
  {
    title: 'Chat con el responsable',
    body: 'Mensajes en orden cronológico e historial persistente. Las respuestas del responsable están simuladas en esta fase.',
    hu: 'HU-08',
    role: 'adopter',
    route: () => `/chats/${lunaThread()?.id ?? ''}`,
    target: 'chat-mine-last',
    enter: () => {
      const t = lunaThread();
      if (t && !db.get().messages.some((m) => m.threadId === t.id && m.senderId === DEMO_IDS.adopter))
        sendMessage(t.id, DEMO_IDS.adopter, 'Hola, me encantó Luna 😍 ¿Podemos coordinar una visita para conocerla?');
    },
  },
  {
    title: 'Coordinar la adopción',
    body: 'Desde el chat o el perfil se propone fecha y hora para conocer a la mascota.',
    hu: 'HU-10',
    role: 'adopter',
    route: `/coordinar/${TOUR_PET}`,
    target: 'coordinate-submit',
    action: { hint: 'Toca “Enviar solicitud”.', done: () => !!lunaRequest(), doIt: () => click('coordinate-submit') },
  },
  {
    title: 'Solicitud enviada',
    body: 'El adoptante ve el estado: Pendiente → Aceptada / Rechazada. Ahora cambiemos de rol…',
    hu: 'HU-10',
    role: 'adopter',
    route: `/coordinar/${TOUR_PET}`,
    target: 'coordinate-status',
  },
  {
    title: 'Somos Rosa, la responsable',
    body: 'La campana muestra el contador de notificaciones: alguien mostró interés y envió una solicitud.',
    hu: 'HU-13',
    role: 'owner',
    route: '/responsable',
    target: 'bell',
  },
  {
    title: 'Aceptar la visita',
    body: 'Rosa revisa la solicitud (fecha, hora, mensaje) y la acepta. El adoptante recibe la notificación y un mensaje en el chat.',
    hu: 'HU-10 · HU-13',
    role: 'owner',
    route: '/responsable',
    target: 'owner-accept-request',
    action: { hint: 'Toca “Aceptar” y confirma.', done: () => lunaRequest()?.status === 'aceptada', doIt: () => clickAndConfirm('owner-accept-request') },
  },
  {
    title: 'El administrador modera',
    body: 'Toda publicación nueva pasa por revisión: el admin aprueba o rechaza con motivo. Así evitamos ventas encubiertas y perfiles falsos.',
    hu: 'HU-24',
    role: 'admin',
    route: '/admin',
    target: 'admin-approve',
    enter: () => {
      pendingAtEntry = pendingCount();
    },
    action: { hint: 'Toca “Aprobar” y confirma.', done: () => pendingCount() < pendingAtEntry, doIt: () => clickAndConfirm('admin-approve') },
  },
  {
    title: '¡Adopta · Conecta · Transforma! ♥',
    body: 'Eso es KuyayPet. Escanea el QR del panel para probarlo en tu celular. Hecho por el Equipo KuyayPet · UPCH 2026-2.',
    role: null,
    route: '/creditos',
  },
];

// ---- Machine state outside React (survives re-renders; the tour is a singleton) ----
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x)) as T;
let saved: { db: DbState; hash: string } | null = null; // state before the tour, restored on exit
let snaps: DbState[] = []; // db at each step's entry

export function startTour() {
  if (useUi.getState().tourStep === null) saved = { db: clone(db.get()), hash: location.hash || '#/' };
  resetDemo(); // fixed tour scenario = seed data
  snaps = [];
  useUi.setState((s) => ({ tourStep: 0, tourRun: s.tourRun + 1, pinnedPetId: null, celebrationMatchId: null }));
}

/** Leaves the tour and restores what the presenter had before it. */
export function endTour() {
  useUi.setState({ tourStep: null, pinnedPetId: null, celebrationMatchId: null, toasts: [] });
  if (saved) {
    db.set(saved.db, true);
    const hash = saved.hash;
    saved = null;
    location.hash = hash;
  }
  setTourDone(true);
  snaps = [];
}

/** The presenter reset the demo from the panel: drop the tour without restoring. */
export function abortTour() {
  saved = null;
  snaps = [];
  useUi.setState({ tourStep: null, pinnedPetId: null, celebrationMatchId: null });
}

const routeOf = (s: Step) => (typeof s.route === 'function' ? s.route() : s.route);
const roleOk = (s: Step) => (s.role ? db.get().sessionUserId === DEMO_IDS[s.role] : !db.get().sessionUserId);

async function applyStep(k: number, navigate: (to: string) => void) {
  const s = TOUR[k];
  useUi.setState({ toasts: [], celebrationMatchId: null });
  if (snaps[k]) {
    db.set(clone(snaps[k]), true);
  } else {
    if (!roleOk(s)) {
      if (s.role) loginAs(DEMO_IDS[s.role]);
      else logout();
      await wait(120); // let the splash redirect settle before navigating
    }
    snaps[k] = clone(db.get());
  }
  navigate(routeOf(s));
  await s.enter?.();
  if (s.target) await waitFor(hasTarget(s.target));
  await wait(250);
}

type Phase = 'entering' | 'ready' | 'doing';

export function TourOverlay() {
  const step = useUi((s) => s.tourStep);
  const run = useUi((s) => s.tourRun);
  const confirmOpen = useUi((s) => !!s.confirmState);
  const session = useDb((s) => s.sessionUserId);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [phase, setPhase] = useState<Phase>('entering');
  const [sync, setSync] = useState(0);
  const [note, setNote] = useState('');
  const [nudge, setNudge] = useState(false);
  const advancing = useRef(false);
  const readyAt = useRef(0);
  const current = step !== null ? TOUR[step] : null;

  const measure = () => {
    const screen = document.getElementById('app-screen');
    const el = current?.target ? document.querySelector(`[data-tour="${current.target}"]`) : null;
    if (!screen || !el) return setRect(null);
    // Scroll only the app's own scroll container (scrollIntoView would also scroll the desktop page).
    const scroller = el.closest('.scroll-area') as HTMLElement | null;
    if (scroller) {
      const er = el.getBoundingClientRect();
      const sr = scroller.getBoundingClientRect();
      if (er.top < sr.top || er.bottom > sr.bottom) scroller.scrollTop += er.top - sr.top - sr.height / 3;
    }
    const s = screen.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const scale = s.width / screen.offsetWidth || 1; // the frame may be scaled on small projectors
    const next = new DOMRect((r.left - s.left) / scale, (r.top - s.top) / scale, r.width / scale, r.height / scale);
    setRect((prev) => (prev && Math.abs(prev.x - next.x) + Math.abs(prev.y - next.y) + Math.abs(prev.width - next.width) + Math.abs(prev.height - next.height) < 1 ? prev : next));
  };

  // Enter the step (also on restart and on re-sync).
  useEffect(() => {
    if (step === null) return;
    let alive = true;
    advancing.current = false;
    setPhase('entering');
    setRect(null);
    setNudge(false);
    (async () => {
      await applyStep(step, (to) => navigate(to));
      if (!alive) return;
      measure();
      readyAt.current = Date.now();
      setPhase('ready');
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, run, sync]);

  const advance = () => {
    if (step === null || advancing.current) return;
    advancing.current = true;
    if (step + 1 >= TOUR.length) endTour();
    else useUi.setState({ tourStep: step + 1 });
  };

  const back = () => {
    if (step === null || step === 0 || phase !== 'ready') return;
    snaps = snaps.slice(0, step); // keeps snaps[step - 1]: the previous step restores its own entry state
    useUi.setState({ tourStep: step - 1 });
  };

  // Action steps: advance as soon as the presenter does the scripted action.
  useEffect(() => {
    if (phase !== 'ready' || !current?.action) return;
    const done = current.action.done;
    const t = setInterval(() => done() && advance(), 150);
    const n = setTimeout(() => setNudge(true), 30_000); // timeout: offer to do it for the presenter
    return () => {
      clearInterval(t);
      clearTimeout(n);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, step]);

  // Off-script navigation or role switch (panel buttons, back gesture…): re-sync instead of breaking.
  useEffect(() => {
    if (phase !== 'ready' || !current) return;
    if (current.action?.done()) return advance();
    if (pathname !== routeOf(current) || !roleOk(current)) {
      // Late redirects right after entering (splash → home) are ours, not the presenter's: re-sync silently.
      if (Date.now() - readyAt.current > 1200) {
        setNote('Volvimos al guion del tour ↺');
        setTimeout(() => setNote(''), 2500);
      }
      setSync((n) => n + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, session, phase]);

  // Keep the spotlight on the target while it animates or the layout shifts.
  useEffect(() => {
    if (phase !== 'ready') return;
    const t = setInterval(measure, 400);
    window.addEventListener('resize', measure);
    return () => {
      clearInterval(t);
      window.removeEventListener('resize', measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, step]);

  const goNext = async () => {
    if (!current || phase !== 'ready') return;
    if (!current.action) return advance();
    setPhase('doing');
    await current.action.doIt();
    await waitFor(current.action.done, 8000);
    advance();
  };

  // Keyboard: → next, ← back, Esc leaves (presenter's clicker / keyboard).
  useEffect(() => {
    if (step === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') back();
      else if (e.key === 'Escape') endTour();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // ---- Popover placement: flip (below ↔ above) + shift inside the screen; never over the target ----
  const popRef = useRef<HTMLDivElement>(null);
  const [fullH, setFullH] = useState<number | null>(null);
  const compactRef = useRef(false);
  useLayoutEffect(() => setFullH(null), [step]);
  // Measure the natural height on every render (content changes: hint, note), except in compact mode.
  useLayoutEffect(() => {
    const el = popRef.current;
    if (!el || compactRef.current || el.dataset.step !== String(step)) return;
    const h = el.offsetHeight;
    if (fullH === null || Math.abs(h - fullH) > 1) setFullH(h);
  });

  if (!current || step === null) return null;
  // While a confirm dialog of a scripted action is open, get out of its way.
  if (confirmOpen && current.action) return <div data-tour-overlay className="hidden" />;

  const pad = 8;
  const gap = 12;
  const margin = 10;
  const screenH = document.getElementById('app-screen')?.offsetHeight ?? 844;
  const h = fullH ?? 190;
  let top = screenH - margin - h;
  let maxH: number | undefined;
  let compact = false;
  if (rect) {
    const holeTop = rect.top - pad;
    const holeBottom = rect.bottom + pad;
    const below = screenH - holeBottom - gap - margin;
    const above = holeTop - gap - margin;
    if (below >= h) top = holeBottom + gap;
    else if (above >= h) top = holeTop - gap - h;
    else if (below >= above) [top, maxH, compact] = [holeBottom + gap, below, true];
    else [top, maxH, compact] = [margin, above, true];
    top = Math.max(margin, Math.min(top, screenH - margin - Math.min(h, maxH ?? h)));
  }
  compactRef.current = compact;

  const hole = rect && { l: rect.left - pad, t: rect.top - pad, w: rect.width + pad * 2, hh: rect.height + pad * 2 };
  // Only the target itself is clickable, and only on action steps; everything else is blocked.
  const letThrough = phase === 'ready' && !!current.action && !!hole;
  const block = 'pointer-events-auto absolute';

  return (
    <div className="pointer-events-none absolute inset-0 z-[80]" data-tour-overlay data-tour-step={step + 1} data-tour-phase={phase}>
      {letThrough && hole ? (
        <>
          <div className={`${block} inset-x-0 top-0`} style={{ height: Math.max(0, hole.t) }} />
          <div className={`${block} inset-x-0 bottom-0`} style={{ top: hole.t + hole.hh }} />
          <div className={`${block} left-0`} style={{ top: hole.t, height: hole.hh, width: Math.max(0, hole.l) }} />
          <div className={`${block} right-0`} style={{ top: hole.t, height: hole.hh, left: hole.l + hole.w }} />
        </>
      ) : (
        <div className={`${block} inset-0`} title="Usa Siguiente para avanzar el tour" />
      )}

      {hole ? (
        <motion.div
          data-tour-spot
          className="absolute rounded-3xl ring-4 ring-honey"
          initial={false}
          animate={{ left: hole.l, top: hole.t, width: hole.w, height: hole.hh }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          style={{ boxShadow: '0 0 0 9999px rgba(40, 22, 14, .55)' }}
        />
      ) : (
        <div className="absolute inset-0 bg-cocoa/50" />
      )}

        <motion.div
          key={step}
          ref={popRef}
          data-tour-popover
          data-step={step}
          initial={{ opacity: 0 }}
          animate={{ opacity: fullH === null ? 0 : 1, top }}
          transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          style={{ maxHeight: maxH }}
          className="pointer-events-auto absolute inset-x-3 overflow-y-auto rounded-3xl bg-cream p-4 shadow-card"
          role="dialog"
          aria-label={current.title}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wide text-cocoa-300">
                Paso {step + 1} de {TOUR.length}
              </span>
              {current.hu && <span className="ml-2 rounded-full bg-terra-100 px-2 py-0.5 text-[11px] font-extrabold text-terra-600">{current.hu}</span>}
              <h2 className="mt-0.5 text-lg font-extrabold leading-tight">{current.title}</h2>
            </div>
            <div className="flex shrink-0">
              <button onClick={startTour} aria-label="Reiniciar tour" title="Reiniciar tour" className="rounded-full p-1.5 hover:bg-cream-200" data-tour-restart>
                <RotateCcw size={16} />
              </button>
              <button onClick={endTour} aria-label="Salir del tour" title="Salir del tour" className="rounded-full p-1.5 hover:bg-cream-200">
                <X size={18} />
              </button>
            </div>
          </div>
          {!compact && !current.compact && <p className="mt-1 text-sm text-cocoa-700">{current.body}</p>}
          {current.action && (
            <p className={`mt-2 flex items-center gap-2 rounded-2xl bg-honey-100 px-3 py-1.5 text-sm font-bold ${nudge ? 'animate-pulse' : ''}`} data-tour-hint>
              <Hand size={16} className="shrink-0" /> {nudge ? '¿Te ayudo? Pulsa “Hazlo por mí”.' : current.action.hint}
            </p>
          )}
          {note && <p className="mt-2 text-xs font-bold text-sage-600">{note}</p>}
          <div className="mt-3 flex items-center justify-between gap-2">
            <button onClick={endTour} className="rounded-full px-2 py-1 text-xs font-bold text-cocoa-500 hover:bg-cream-200" data-tour-skip>
              Saltar tour
            </button>
            <div className="flex gap-2">
              {step > 0 && (
                <Button size="sm" variant="ghost" onClick={back} disabled={phase !== 'ready'}>
                  Atrás
                </Button>
              )}
              <Button size="sm" onClick={goNext} disabled={phase !== 'ready'} data-tour-next className="whitespace-nowrap">
                {phase !== 'ready' ? '…' : current.action ? 'Hazlo por mí' : step + 1 === TOUR.length ? 'Terminar' : 'Siguiente'}
              </Button>
            </div>
          </div>
        </motion.div>
    </div>
  );
}
