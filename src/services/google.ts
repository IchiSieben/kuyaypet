// Google login. Real Google Identity Services when VITE_GOOGLE_CLIENT_ID exists (frontend only: the ID token
// is decoded but NOT verified, because there is no backend in this phase). Otherwise a simulated account picker.
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

export interface GoogleProfile {
  name: string;
  email: string;
  picture?: string;
}

interface GisWindow {
  google?: {
    accounts: {
      id: {
        initialize: (cfg: { client_id: string; callback: (r: { credential: string }) => void }) => void;
        prompt: (cb?: (n: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
      };
    };
  };
}

function loadGis(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as GisWindow).google?.accounts) return resolve();
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('No se pudo cargar Google'));
    document.head.appendChild(s);
  });
}

function decodeJwt(token: string): GoogleProfile {
  const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(
    atob(payload)
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join(''),
  );
  const data = JSON.parse(json) as { name: string; email: string; picture?: string };
  return { name: data.name, email: data.email, picture: data.picture };
}

/** Resolves with the Google profile, or null if GIS is unavailable (caller falls back to the simulated picker). */
export async function signInWithRealGoogle(): Promise<GoogleProfile | null> {
  if (!GOOGLE_CLIENT_ID) return null;
  try {
    await loadGis();
  } catch {
    return null;
  }
  const gis = (window as GisWindow).google!;
  return new Promise((resolve) => {
    gis.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: (r) => resolve(decodeJwt(r.credential)) });
    gis.accounts.id.prompt((n) => {
      if (n.isNotDisplayed() || n.isSkippedMoment()) resolve(null);
    });
  });
}

export const SIMULATED_GOOGLE_ACCOUNTS: GoogleProfile[] = [
  { name: 'Camila Rojas', email: 'camila.rojas.demo@gmail.com', picture: 'img/people/u-adopter-03.webp' },
  { name: 'Diego Huamán', email: 'diego.huaman.demo@gmail.com', picture: 'img/people/u-adopter-04.webp' },
];
