import { useEffect, useState, type ReactNode } from 'react';
import { ConfirmHost, ToastHost } from '@/components/ui';
import { MatchCelebration } from '@/components/MatchCelebration';
import { PresenterPanel } from './PresenterPanel';
import { TourOverlay } from './Tour';
import { IS_SPLIT_STAGE, SplitStage } from './SplitStage';

function useIsDesktop() {
  const query = '(min-width: 1024px)';
  const [desktop, setDesktop] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setDesktop(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return desktop;
}

/** Mobile: the app fills the screen. Desktop/projector: the app lives inside a phone frame + presenter panel.
 * The frame uses `transform` so that `position: fixed` children (sheets, toasts) stay inside the phone. */
export function DeviceFrame({ children }: { children: ReactNode }) {
  const desktop = useIsDesktop();
  const screen = (
    <div id="app-screen" className="paper relative flex h-full w-full flex-col overflow-hidden" style={{ transform: 'translateZ(0)' }}>
      {children}
      <MatchCelebration />
      <ToastHost />
      <ConfirmHost />
      <TourOverlay />
    </div>
  );

  if (!desktop) return <div className="h-[100dvh] w-full">{screen}</div>;
  if (IS_SPLIT_STAGE) return <SplitStage />;

  return (
    <div className="stage relative flex h-screen items-center justify-center gap-10 overflow-hidden p-6">
      {/* Ambient light: two soft blobs behind the phone so the frame sits in a space, not on a gradient. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-40 top-1/2 h-[720px] w-[720px] -translate-y-1/2 rounded-full bg-terra-100/70 blur-3xl" />
        <div className="absolute -right-32 -top-32 h-[560px] w-[560px] rounded-full bg-honey-100/60 blur-3xl" />
        <div className="absolute bottom-[-200px] left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-sage-100/40 blur-3xl" />
      </div>
      <div className="relative shrink-0">
        {/* Phone body: dark cocoa shell with a hairline bezel highlight and a long, soft contact shadow. */}
        <div className="relative h-[844px] max-h-[calc(100vh-92px)] w-[390px] rounded-[58px] bg-cocoa-900 p-[11px] shadow-float ring-1 ring-white/30">
          <div className="pointer-events-none absolute inset-0 rounded-[58px] ring-1 ring-inset ring-white/10" aria-hidden="true" />
          <div className="absolute left-1/2 top-[22px] z-[70] h-[26px] w-[110px] -translate-x-1/2 rounded-full bg-cocoa-900 shadow-inset" aria-hidden="true" />
          <div className="h-full w-full overflow-hidden rounded-[48px] bg-cream pt-8">{screen}</div>
        </div>
        <p className="mt-4 text-center font-hand text-2xl text-terra">Adopta · Conecta · Transforma ♥</p>
      </div>
      <PresenterPanel />
    </div>
  );
}
