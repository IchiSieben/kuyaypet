// Split-screen presenter mode (desktop): Adoptante | Responsable side by side, each phone a real,
// independent session of the app (iframe with ?as=<role>). What one does shows up in the other.
import { LogOut, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { resetDemo } from '@/services/users';

export const IS_SPLIT_STAGE = new URLSearchParams(location.search).has('split');

export const splitUrl = () => `${location.pathname}?split=1#/`;

const PHONES = [
  { role: 'adopter', label: 'Adoptante', who: 'Valeria', home: '/descubrir' },
  { role: 'owner', label: 'Responsable', who: 'Rosa', home: '/responsable' },
] as const;

export function SplitStage() {
  const [run, setRun] = useState(0);
  const reset = () => {
    resetDemo();
    setRun((n) => n + 1); // reload both phones on the fresh seed
  };
  return (
    <div className="flex h-screen flex-col items-center overflow-hidden bg-gradient-to-br from-cream-200 via-cream to-terra-100 p-4" data-split-stage>
      <header className="flex w-full max-w-[860px] items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-cocoa">Pantalla dividida</h1>
          <p className="text-sm text-cocoa-500">Dos sesiones reales: lo que hace una aparece en la otra al instante.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={reset} className="flex items-center gap-1.5 rounded-2xl bg-white px-3 py-2 text-sm font-bold shadow-soft hover:bg-cream-200">
            <RotateCcw size={16} /> Reiniciar demo
          </button>
          <a href={`${location.pathname}#/`} className="flex items-center gap-1.5 rounded-2xl bg-terra px-3 py-2 text-sm font-bold text-white hover:bg-terra-600">
            <LogOut size={16} /> Salir
          </a>
        </div>
      </header>
      <div className="mt-3 flex min-h-0 flex-1 items-start justify-center gap-12">
        {PHONES.map((p) => (
          <figure key={p.role} className="flex h-full flex-col items-center">
            <figcaption className="mb-2 rounded-full bg-white px-4 py-1 text-sm font-extrabold text-terra shadow-soft">
              {p.label} · {p.who}
            </figcaption>
            <div className="relative h-[844px] max-h-[calc(100vh-130px)] w-[390px] rounded-[54px] border-[12px] border-cocoa bg-cocoa shadow-card">
              <div className="absolute left-1/2 top-2 z-10 h-6 w-28 -translate-x-1/2 rounded-full bg-cocoa" aria-hidden="true" />
              <div className="h-full w-full overflow-hidden rounded-[42px] bg-cream pt-8">
                <iframe key={run} title={`${p.label} (${p.who})`} src={`${location.pathname}?as=${p.role}#${p.home}`} className="h-full w-full border-0" data-split-phone={p.role} />
              </div>
            </div>
          </figure>
        ))}
      </div>
    </div>
  );
}
