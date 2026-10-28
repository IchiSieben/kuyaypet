import { useEffect, useState, type ReactNode } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import { ConfirmHost, ToastHost } from '@/components/ui';
import { useUi } from '@/services/ui';
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

/** HU-02: on desktop these routes use the full width instead of the phone frame. */
const UNFRAMED_ROUTES = ['/buscar', '/mascota/:id'];

/** Mobile: the app fills the screen. Desktop/projector: the app lives inside a phone frame + presenter panel.
 * The frame uses `transform` so that `position: fixed` children (sheets, toasts) stay inside the phone. */
export function DeviceFrame({ children }: { children: ReactNode }) {
  const desktop = useIsDesktop();
  const { pathname } = useLocation();
  const touring = useUi((s) => s.tourStep !== null);
  const [panelOpen, setPanelOpen] = useState(false);
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

  // "Presentation mode" = every other route, the guided tour and split stage keep the phone frame + presenter panel.
  if (!touring && UNFRAMED_ROUTES.some((path) => matchPath(path, pathname))) {
    return (
      <div className="unframed h-[100dvh] w-full">
        {screen}
        <div className={panelOpen ? 'fixed right-4 top-4 z-[65]' : undefined}>
          <PresenterPanel open={panelOpen} onOpenChange={setPanelOpen} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center gap-10 overflow-hidden bg-gradient-to-br from-cream-200 via-cream to-terra-100 p-6">
      <div className="relative shrink-0">
        <div data-testid="device-frame" className="relative h-[844px] max-h-[calc(100vh-92px)] w-[390px] rounded-[54px] border-[12px] border-cocoa bg-cocoa shadow-card">
          <div className="absolute left-1/2 top-2 z-[70] h-6 w-28 -translate-x-1/2 rounded-full bg-cocoa" aria-hidden="true" />
          <div className="h-full w-full overflow-hidden rounded-[42px] bg-cream pt-8">{screen}</div>
        </div>
        <p className="mt-3 text-center font-hand text-2xl text-terra">Adopta · Conecta · Transforma ♥</p>
      </div>
      <PresenterPanel />
    </div>
  );
}
