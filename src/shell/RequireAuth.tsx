import { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { canAccess, HOME_BY_ROLE, INACTIVITY_MS, logout, touchActivity, useCurrentUser } from '@/services/auth';
import { db } from '@/services/store';
import { toast } from '@/services/ui';

/** Control de acceso (UML): private routes need a session; the session expires after inactivity (HU-21). */
export function RequireAuth() {
  const user = useCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    // Expired while the tab was closed?
    if (Date.now() - db.get().lastActivity > INACTIVITY_MS) {
      logout();
      toast({ title: 'Sesión cerrada por inactividad', body: 'Vuelve a iniciar sesión para continuar.', emoji: '⏰' });
      return;
    }
    let last = 0;
    const onActivity = () => {
      const now = Date.now();
      if (now - last > 5000) {
        last = now;
        touchActivity();
      }
    };
    const events = ['pointerdown', 'keydown', 'touchstart', 'wheel'] as const;
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    const timer = setInterval(() => {
      if (Date.now() - db.get().lastActivity > INACTIVITY_MS) {
        logout();
        toast({ title: 'Sesión cerrada por inactividad', body: 'Por tu seguridad cerramos la sesión.', emoji: '⏰' });
        navigate('/login', { replace: true });
      }
    }, 20000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      clearInterval(timer);
    };
  }, [user, navigate]);

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!canAccess(user.role, location.pathname)) return <Navigate to={HOME_BY_ROLE[user.role]} replace />;
  return <Outlet />;
}
