import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Circle, Heart, HeartHandshake, Home, Play, RotateCcw, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HU_STATUS } from '@/data/huStatus';
import { DEMO_IDS, HOME_BY_ROLE, loginAs, useCurrentUser } from '@/services/auth';
import { setGuaranteedMatch } from '@/services/match';
import { useDb } from '@/services/store';
import { confirm, toast, useUi } from '@/services/ui';
import { resetDemo } from '@/services/users';
import { LogoMark } from '@/components/brand/Logo';
import type { Role } from '@/types';
import team from '../../data/team.json';
import { startTour, TOUR } from './Tour';

/** Runtime URL so each mirror (Hostinger / GitHub Pages / localhost) shows its own QR. */
export function publicUrl() {
  const env = import.meta.env.VITE_PUBLIC_URL as string | undefined;
  const here = `${location.origin}${location.pathname}`;
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return env ?? here;
  return here;
}

const ROLE_BTNS: { role: Role; label: string; Icon: typeof Home }[] = [
  { role: 'adopter', label: 'Adoptante', Icon: HeartHandshake },
  { role: 'owner', label: 'Responsable', Icon: Home },
  { role: 'admin', label: 'Admin', Icon: ShieldCheck },
];

function devsFor(hu: string): string {
  const names = (team.integrantes as { nombre: string; hus: string[] }[]).filter((m) => m.hus.includes(hu)).map((m) => m.nombre.split(' ')[0]);
  return names.join(', ');
}

export function PresenterPanel() {
  const open = useUi((s) => s.presenterOpen);
  const guaranteed = useDb((s) => s.demo.guaranteedMatch);
  const tourStep = useUi((s) => s.tourStep);
  const [showCount, setShowCount] = useState(false);
  const user = useCurrentUser();
  const navigate = useNavigate();
  const url = publicUrl();
  const done = HU_STATUS.filter((h) => h.done).length;

  if (!open)
    return (
      <button onClick={() => useUi.setState({ presenterOpen: true })} className="fixed right-4 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-l-2xl bg-cocoa px-2 py-4 font-bold text-cream shadow-card" aria-label="Abrir panel de presentador">
        <ChevronLeft size={18} />
      </button>
    );

  const switchRole = (role: Role) => {
    const r = loginAs(DEMO_IDS[role]);
    if (!r.ok) return toast({ title: r.error, tone: 'error' });
    navigate(HOME_BY_ROLE[role]);
  };

  const goHu = (route: string, role: Role | 'any') => {
    if (role !== 'any' && user?.role !== role) loginAs(DEMO_IDS[role]);
    if (role === 'any' && route !== '/registro' && route !== '/login' && !user) loginAs(DEMO_IDS.adopter);
    navigate(route);
  };

  const reset = async () => {
    const ok = await confirm({ title: '¿Reiniciar la demo?', body: 'Se restauran los datos semilla y se cierra la sesión.', emoji: '↺', confirmLabel: 'Reiniciar', danger: true });
    if (!ok) return;
    resetDemo();
    useUi.setState({ tourStep: null, pinnedPetId: null, celebrationMatchId: null });
    navigate('/');
    toast({ title: 'Demo reiniciada', emoji: '🌱' });
  };

  return (
    <aside className="flex h-[844px] max-h-[calc(100vh-92px)] w-[360px] flex-col rounded-4xl bg-white/85 p-5 shadow-card backdrop-blur" aria-label="Panel de presentador">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LogoMark className="w-20" />
          <div>
            <p className="font-display text-lg font-extrabold leading-none">Modo presentador</p>
            <p className="text-xs text-cocoa-500">Solo visible en escritorio</p>
          </div>
        </div>
        <button onClick={() => useUi.setState({ presenterOpen: false })} aria-label="Ocultar panel" className="rounded-full p-2 hover:bg-cream-200">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-1.5">
        {ROLE_BTNS.map((b) => (
          <button
            key={b.role}
            onClick={() => switchRole(b.role)}
            className={`flex flex-col items-center gap-1 rounded-2xl border-2 px-1 py-2 text-xs font-bold transition ${user?.role === b.role ? 'border-terra bg-terra-100 text-terra-600' : 'border-cream-300 hover:border-terra'}`}
          >
            <b.Icon size={18} />
            {b.label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button onClick={startTour} className="flex items-center justify-center gap-1.5 rounded-2xl bg-terra py-2.5 text-sm font-bold text-white hover:bg-terra-600">
          <Play size={16} /> {tourStep === null ? 'Tour guiado' : `Tour: paso ${tourStep + 1}/${TOUR.length}`}
        </button>
        <button onClick={reset} className="flex items-center justify-center gap-1.5 rounded-2xl bg-cream-200 py-2.5 text-sm font-bold hover:bg-cream-300">
          <RotateCcw size={16} /> Reiniciar demo
        </button>
        <button
          onClick={() => {
            setGuaranteedMatch(!guaranteed);
            toast({ title: guaranteed ? 'Match garantizado desactivado' : 'El próximo “Me gusta” será Match', emoji: '💘' });
          }}
          className={`col-span-2 flex items-center justify-center gap-1.5 rounded-2xl py-2.5 text-sm font-bold transition ${guaranteed ? 'bg-coral text-white' : 'border-2 border-coral text-coral hover:bg-coral-100'}`}
        >
          <Heart size={16} fill={guaranteed ? 'currentColor' : 'none'} /> Match garantizado en la próxima carta {guaranteed ? '✓' : ''}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-3xl bg-cream p-3">
        <div className="rounded-2xl bg-white p-2">
          <QRCodeSVG value={url} size={96} fgColor="#4A2E22" bgColor="#FFFFFF" />
        </div>
        <div className="min-w-0 text-sm">
          <p className="font-bold">Ábrelo en tu celular</p>
          <p className="break-all text-xs text-cocoa-500">{url}</p>
        </div>
      </div>

      <a href="./manual/" target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-center gap-1.5 rounded-2xl border-2 border-sage py-2 text-sm font-bold text-sage-600 hover:bg-sage-100">
        <BookOpen size={16} /> Manual de la demo
      </a>

      <div className="mt-4 flex items-center justify-between">
        <p className="font-display font-bold">Historias de usuario</p>
        <button onClick={() => setShowCount((v) => !v)} className="text-xs font-bold text-sage-600 underline decoration-dotted" title="Mostrar u ocultar el contador">
          {showCount ? `${done}/26 implementadas` : 'Fase 1 en curso'}
        </button>
      </div>
      <ul className="scroll-area mt-2 flex-1 space-y-0.5 pr-1">
        {HU_STATUS.map((h) => {
          const devs = devsFor(h.id);
          return (
            <li key={h.id}>
              <button onClick={() => goHu(h.route, h.role)} className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-sm hover:bg-cream-200">
                {h.done ? <CheckCircle2 size={16} className="shrink-0 text-sage" /> : <Circle size={16} className="shrink-0 text-cocoa-300" />}
                <span className="w-12 shrink-0 font-bold text-terra">{h.id}</span>
                <span className="flex-1 truncate">{h.title}</span>
                {devs ? <span className="truncate text-[10px] text-cocoa-300">{devs}</span> : !h.done && <span className="text-[10px] font-bold text-cocoa-300">F{h.phase}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
