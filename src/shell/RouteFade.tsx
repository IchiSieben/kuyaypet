import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * One route transition for the whole app: a short cross-fade on enter, never on exit, so a
 * navigation never waits for the old screen and tests never click a half-gone element.
 * Opacity only (no transform) so shared-element `layoutId` animations measure true positions.
 */
export function RouteFade({ children, skip = false }: { children: ReactNode; skip?: boolean }) {
  return (
    <motion.div
      className="h-full"
      initial={skip ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Screens rendered inside AppLayout (header + bottom nav). They fade inside the layout, not with it. */
export const isTabRoute = (path: string) =>
  /^\/(descubrir|buscar|matches|chats|perfil|notificaciones|responsable)\/?$/.test(path) || /^\/admin(\/|$)/.test(path);
