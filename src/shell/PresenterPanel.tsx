import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Circle, Columns2, GitBranch, Heart, HeartHandshake, Home, ListChecks, Play, RotateCcw, ShieldCheck } from 'lucide-react';
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
import { abortTour, startTour, TOUR } from './Tour';
import { splitUrl } from './SplitStage';

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
      <button onClick={() => useUi.setState({ presenterOpen: true })} className="pressable fixed right-4 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-l-2xl bg-cocoa-900 px-2 py-4 font-bold text-cream shadow-float" aria-label="Abrir panel de presentador">
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
    abortTour();
    resetDemo();
    navigate('/');
    toast({ title: 'Demo reiniciada', emoji: '🌱' });
  };

  return (
    <aside className="glass flex h-[844px] max-h-[calc(100vh-92px)] w-[360px] flex-col rounded-4xl p-5" aria-label="Panel de presentador">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LogoMark className="w-20" />
          <div>
            <p className="font-display text-lg font-extrabold leading-none">Modo presentador</p>
            <p className="mt-0.5 text-xs text-cocoa-500">Solo visible en escritorio</p>
          </div>
        </div>
        <button onClick={() => useUi.setState({ presenterOpen: false })} aria-label="Ocultar panel" className="pressable rounded-full p-2 text-cocoa-500 hover:bg-cocoa/[.06]">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Role switch: a segmented control, the active segment is a raised white pill. */}
      <div className="mt-4 grid grid-cols-3 gap-1 rounded-2xl bg-cocoa/[.06] p-1">
        {ROLE_BTNS.map((b) => {
          const active = user?.role === b.role;
          return (
            <button
              key={b.role}
              onClick={() => switchRole(b.role)}
              aria-pressed={active}
              className={`pressable flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-xs font-bold ${active ? 'bg-white text-terra-600 shadow-soft' : 'text-cocoa-500 hover:text-cocoa'}`}
            >
              <b.Icon size={18} />
              {b.label}
            </button>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button onClick={startTour} className="pressable flex items-center justify-center gap-1.5 rounded-2xl bg-terra py-2.5 text-sm font-bold text-white shadow-raised hover:bg-terra-600">
          <Play size={16} /> {tourStep === null ? 'Tour guiado' : `Tour: paso ${tourStep + 1}/${TOUR.length}`}
        </button>
        <button onClick={reset} className="pressable flex items-center justify-center gap-1.5 rounded-2xl bg-white/80 py-2.5 text-sm font-bold shadow-hairline hover:bg-white">
          <RotateCcw size={16} /> Reiniciar demo
        </button>
        <button
          onClick={() => {
            setGuaranteedMatch(!guaranteed);
            toast({ title: guaranteed ? 'Match garantizado desactivado' : 'El próximo “Me gusta” será Match', emoji: '💘' });
          }}
          aria-pressed={guaranteed}
          className={`pressable col-span-2 flex items-center justify-center gap-1.5 rounded-2xl py-2.5 text-sm font-bold ${guaranteed ? 'bg-coral text-white shadow-raised' : 'bg-coral-100/70 text-coral-600 shadow-hairline hover:bg-coral-100'}`}
        >
          <Heart size={16} fill={guaranteed ? 'currentColor' : 'none'} /> Match garantizado en la próxima carta {guaranteed ? '✓' : ''}
        </button>
        <a href={splitUrl()} className="pressable col-span-2 flex items-center justify-center gap-1.5 rounded-2xl bg-sage-100/70 py-2 text-sm font-bold text-sage-600 shadow-hairline hover:bg-sage-100">
          <Columns2 size={16} /> Pantalla dividida: Adoptante | Responsable
        </a>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-3xl bg-white/60 p-3 shadow-hairline">
        <div className="rounded-2xl bg-white p-2 shadow-soft">
          <QRCodeSVG value={url} size={88} fgColor="#4A2E22" bgColor="#FFFFFF" />
        </div>
        <div className="min-w-0 text-sm">
          <p className="font-bold">Ábrelo en tu celular</p>
          <p className="break-all text-xs text-cocoa-500">{url}</p>
          <a href="./manual/" target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-sage-600 hover:underline">
            <BookOpen size={14} /> Manual de la demo
          </a>
        </div>
      </div>

      {/* Project: live views of the team repo (HU catalog and sprint board). */}
      <div className="mt-3 grid grid-cols-2 gap-2" aria-label="Proyecto">
        <button onClick={() => navigate('/historias')} className="pressable flex items-center justify-center gap-1.5 rounded-2xl bg-white/80 py-2 text-sm font-bold shadow-hairline hover:bg-white">
          <ListChecks size={16} className="text-terra" /> Historias (repo)
        </button>
        <button onClick={() => navigate('/sprints')} className="pressable flex items-center justify-center gap-1.5 rounded-2xl bg-white/80 py-2 text-sm font-bold shadow-hairline hover:bg-white">
          <GitBranch size={16} className="text-terra" /> Sprints
        </button>
      </div>

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
              <button onClick={() => goHu(h.route, h.role)} className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-sm hover:bg-white/80 hover:shadow-hairline">
                {h.done ? <CheckCircle2 size={16} className="shrink-0 text-sage" /> : <Circle size={16} className="shrink-0 text-cocoa-300" />}
                <span className="w-12 shrink-0 font-display font-bold text-terra">{h.id}</span>
                <span className="flex-1 truncate">{h.title}</span>
                {devs ? <span className="truncate text-2xs text-cocoa-300">{devs}</span> : !h.done && <span className="text-2xs font-bold text-cocoa-300">F{h.phase}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
