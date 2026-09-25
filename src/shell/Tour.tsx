// Guided tour (coach marks) of the star flow. Each step can switch role, navigate and run an action,
// so the presenter only presses "Siguiente" and the whole story plays out on the projector.
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useNavigate, type NavigateFunction } from 'react-router-dom';
import { Button } from '@/components/ui';
import { DEMO_IDS, loginAs, logout } from '@/services/auth';
import { sendMessage } from '@/services/chat';
import { setGuaranteedMatch } from '@/services/match';
import { db } from '@/services/store';
import { useUi } from '@/services/ui';
import { resetDemo, setTourDone } from '@/services/users';

const TOUR_PET = 'p29'; // Luna, owned by the demo Responsable (Rosa)

interface Step {
  title: string;
  body: string;
  hu?: string;
  target?: string;
  /** Runs when the step is shown. */
  enter?: (nav: NavigateFunction) => void | Promise<void>;
  /** Runs when the presenter presses "Siguiente". */
  next?: (nav: NavigateFunction) => void | Promise<void>;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const click = (tour: string) => (document.querySelector(`[data-tour="${tour}"]`) as HTMLElement | null)?.click();
async function waitFor(tour: string, timeout = 5000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    if (document.querySelector(`[data-tour="${tour}"]`)) return true;
    await wait(120);
  }
  return false;
}

export const TOUR: Step[] = [
  {
    title: '¡Bienvenidos a KuyayPet! 🐾',
    body: 'Un “Tinder para adoptar”: desliza, haz Match por compatibilidad y coordina la adopción. Aquí se crea la cuenta (HU-01) o se entra con cuentas demo.',
    hu: 'HU-01',
    target: 'roles',
    enter: (nav) => {
      logout();
      nav('/');
    },
  },
  {
    title: 'Cuestionario de compatibilidad',
    body: 'Estilo Bumble: una pregunta por pantalla (vivienda, horas solo, actividad, niños, alergias…). Con estas respuestas el motor KuyayMatch calcula el %.',
    hu: 'HU-20',
    target: 'onboarding-q',
    enter: async (nav) => {
      loginAs(DEMO_IDS.adopter);
      await wait(120); // let the splash redirect settle, then go to the questionnaire
      nav('/onboarding');
    },
  },
  {
    title: 'Descubre mascotas',
    body: 'Cartas ordenadas por compatibilidad. Cada una muestra el % y las razones: nada de caja negra. Se desliza con el dedo o con los botones.',
    hu: 'HU-06 · HU-20',
    target: 'top-card',
    enter: (nav) => {
      useUi.setState({ pinnedPetId: TOUR_PET });
      nav('/descubrir');
    },
  },
  {
    title: 'Me gusta 💗',
    body: 'Al dar “Me gusta” se registra el interés y se notifica al responsable. El Match solo ocurre si el responsable también acepta (interés mutuo).',
    hu: 'HU-06',
    target: 'like-btn',
    next: async () => {
      setGuaranteedMatch(true);
      click('like-btn');
      await waitFor('match-chat', 6000);
    },
  },
  {
    title: '¡Es un Match! 🎉',
    body: 'El responsable aceptó (en la demo, simulado con retardo). Queda en “Mis Matches” y se abre el chat vinculado a la mascota.',
    hu: 'HU-07',
    target: 'match-chat',
    next: async () => {
      click('match-chat');
      await waitFor('chat-input');
    },
  },
  {
    title: 'Chat con el responsable',
    body: 'Mensajes en orden cronológico e historial persistente. Las respuestas del responsable están simuladas en esta fase.',
    hu: 'HU-08',
    target: 'chat-messages',
    enter: async () => {
      await wait(400);
      const id = location.hash.split('/chats/')[1];
      const me = db.get().sessionUserId;
      if (id && me) sendMessage(id, me, 'Hola, me encantó Luna 😍 ¿Podemos coordinar una visita para conocerla?');
    },
  },
  {
    title: 'Coordinar la adopción',
    body: 'Desde el chat o el perfil se propone fecha y hora para conocer a la mascota.',
    hu: 'HU-10',
    target: 'coordinate-submit',
    enter: async () => {
      click('chat-coordinate');
      await waitFor('coordinate-submit');
    },
    next: async () => {
      click('coordinate-submit');
      await waitFor('coordinate-done');
    },
  },
  {
    title: 'Solicitud enviada',
    body: 'El adoptante ve el estado: Pendiente → Aceptada / Rechazada. Ahora cambiemos de rol…',
    hu: 'HU-10',
    target: 'coordinate-done',
  },
  {
    title: 'Somos Rosa, la responsable',
    body: 'La campana muestra el contador de notificaciones: alguien mostró interés y envió una solicitud.',
    hu: 'HU-13',
    target: 'bell',
    enter: (nav) => {
      loginAs(DEMO_IDS.owner);
      nav('/responsable');
    },
  },
  {
    title: 'Aceptar la visita',
    body: 'Rosa revisa la solicitud (fecha, hora, mensaje) y la acepta. El adoptante recibe la notificación y un mensaje en el chat.',
    hu: 'HU-10 · HU-13',
    target: 'owner-accept-request',
    next: async () => {
      click('owner-accept-request');
      await wait(300);
      useUi.getState().closeConfirm(true);
      await wait(400);
    },
  },
  {
    title: 'El administrador modera',
    body: 'Toda publicación nueva pasa por revisión: el admin aprueba o rechaza con motivo. Así evitamos ventas encubiertas y perfiles falsos.',
    hu: 'HU-24',
    target: 'admin-approve',
    enter: (nav) => {
      loginAs(DEMO_IDS.admin);
      nav('/admin');
    },
    next: async () => {
      click('admin-approve');
      await wait(300);
      useUi.getState().closeConfirm(true);
      await wait(400);
    },
  },
  {
    title: '¡Adopta · Conecta · Transforma! ♥',
    body: 'Eso es KuyayPet. Escanea el QR del panel para probarlo en tu celular. Hecho por el Equipo KuyayPet · UPCH 2026-2.',
    enter: (nav) => {
      logout();
      nav('/creditos');
    },
  },
];

export function startTour() {
  resetDemo();
  useUi.setState({ tourStep: 0, pinnedPetId: null, celebrationMatchId: null });
}

export function TourOverlay() {
  const step = useUi((s) => s.tourStep);
  const navigate = useNavigate();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [busy, setBusy] = useState(false);
  const current = step !== null ? TOUR[step] : null;

  useEffect(() => {
    if (!current) return;
    let alive = true;
    setRect(null);
    useUi.setState({ toasts: [] }); // keep the stage clean for the audience
    (async () => {
      await current.enter?.(navigate);
      if (current.target) await waitFor(current.target);
      await wait(250);
      if (alive) measure();
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

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
    // Coordinates relative to the phone screen, corrected for the frame's scale.
    const scale = s.width / screen.offsetWidth || 1;
    setRect(new DOMRect((r.left - s.left) / scale, (r.top - s.top) / scale, r.width / scale, r.height / scale));
  };

  useLayoutEffect(() => {
    if (!current) return;
    const on = () => measure();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  });

  const end = () => {
    useUi.setState({ tourStep: null, pinnedPetId: null });
    setTourDone(true);
  };

  const goNext = async () => {
    if (step === null || !current || busy) return;
    setBusy(true);
    await current.next?.(navigate);
    setBusy(false);
    if (step + 1 >= TOUR.length) end();
    else useUi.setState({ tourStep: step + 1 });
  };

  // Keyboard: → next, ← back, Esc ends (for the presenter's clicker / keyboard).
  useEffect(() => {
    if (step === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft' && step > 0 && !busy) useUi.setState({ tourStep: step - 1 });
      else if (e.key === 'Escape') end();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!current || step === null) return null;
  const pad = 8;
  const screenH = document.getElementById('app-screen')?.offsetHeight ?? 844;
  // Big targets (deck card, chat, questionnaire) leave no free side: the card docks at the bottom over the controls.
  const cardBelow = !rect || rect.height > screenH * 0.45 || screenH - (rect.top + rect.height) > rect.top;

  return (
    <div className="absolute inset-0 z-[80]" data-tour-overlay title="Usa Siguiente para avanzar el tour">
      {rect ? (
        <motion.div
          className="absolute rounded-3xl ring-4 ring-honey"
          initial={false}
          animate={{ left: rect.left - pad, top: rect.top - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          style={{ boxShadow: '0 0 0 9999px rgba(40, 22, 14, .55)' }}
        />
      ) : (
        <div className="absolute inset-0 bg-cocoa/50" />
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: cardBelow ? 16 : -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`pointer-events-auto absolute inset-x-3 rounded-3xl bg-cream p-4 shadow-card ${cardBelow ? 'bottom-3' : 'top-3'}`}
          role="dialog"
          aria-label={current.title}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              {current.hu && <span className="rounded-full bg-terra-100 px-2 py-0.5 text-[11px] font-extrabold text-terra-600">{current.hu}</span>}
              <h2 className="mt-1 text-lg font-extrabold">{current.title}</h2>
            </div>
            <button onClick={end} aria-label="Cerrar tour" className="rounded-full p-1.5 hover:bg-cream-200">
              <X size={18} />
            </button>
          </div>
          <p className="mt-1 text-sm text-cocoa-700">{current.body}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs font-bold text-cocoa-300">
              {step + 1} / {TOUR.length}
            </span>
            <div className="flex gap-2">
              {step > 0 && (
                <Button size="sm" variant="ghost" onClick={() => useUi.setState({ tourStep: step - 1 })} disabled={busy}>
                  Atrás
                </Button>
              )}
              <Button size="sm" onClick={goNext} disabled={busy} data-tour-next>
                {busy ? '…' : step + 1 === TOUR.length ? 'Terminar' : 'Siguiente'}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
