import { useEffect, useState, type ReactNode } from 'react';
import { ConfirmHost, ToastHost } from '@/components/ui';
import { MatchCelebration } from '@/components/MatchCelebration';
import { PresenterPanel } from './PresenterPanel';
import { TourOverlay } from './Tour';

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

  return (
    <div className="flex h-screen items-center justify-center gap-10 overflow-hidden bg-gradient-to-br from-cream-200 via-cream to-terra-100 p-6">
      <div className="relative shrink-0">
        <div className="relative h-[844px] max-h-[calc(100vh-92px)] w-[390px] rounded-[54px] border-[12px] border-cocoa bg-cocoa shadow-card">
          <div className="absolute left-1/2 top-2 z-[70] h-6 w-28 -translate-x-1/2 rounded-full bg-cocoa" aria-hidden="true" />
          <div className="h-full w-full overflow-hidden rounded-[42px]">{screen}</div>
        </div>
        <p className="mt-3 text-center font-hand text-2xl text-terra">Adopta · Conecta · Transforma ♥</p>
      </div>
      <PresenterPanel />
    </div>
  );
}
