import { Eye, EyeOff } from 'lucide-react';
import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, Chip, ListGroup, ListRow, PageHeader, Sheet } from '@/components/ui';
import { LogoMark } from '@/components/brand/Logo';
import { HOME_BY_ROLE, loginWithGoogleProfile } from '@/services/auth';
import { GOOGLE_CLIENT_ID, SIMULATED_GOOGLE_ACCOUNTS, signInWithRealGoogle, type GoogleProfile } from '@/services/google';
import { toast } from '@/services/ui';

export function AuthShell({ title, subtitle, children, hu }: { title: string; subtitle: string; children: ReactNode; hu: string }) {
  return (
    <div className="scroll-area h-full px-4 pb-8 pt-3" data-hu={hu}>
      <PageHeader
        back="/"
        title={title}
        subtitle={subtitle}
        action={<LogoMark className="w-24" />}
        className="pb-5"
      />
      {children}
    </div>
  );
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: ReactNode;
  error?: boolean;
}

export function Field({ label, icon, error, type, id, className = '', ...rest }: FieldProps) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div>
      <label htmlFor={id} className="label">
        {label} <span className="text-coral">*</span>
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-cocoa-300">{icon}</span>
        <input id={id} type={isPassword && show ? 'text' : type} aria-invalid={error || undefined} className={`input pl-11 ${isPassword ? 'pr-12' : ''} ${className}`} {...rest} />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="pressable absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-cocoa-500 hover:text-cocoa"
            aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {show ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
}

/** Inline form error. Always role="alert" so assistive tech and the e2e suite can find it. */
export function FormAlert({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-2xl bg-coral-100 px-4 py-2.5 text-sm font-semibold text-coral-600">
      {children}
    </p>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export function SocialLogin({ verb }: { verb: string }) {
  const navigate = useNavigate();
  const [picker, setPicker] = useState(false);

  const finish = (p: GoogleProfile) => {
    const r = loginWithGoogleProfile(p);
    setPicker(false);
    if (!r.ok) return toast({ title: r.error, tone: 'error' });
    toast({ title: `¡Bienvenid@, ${r.user.name.split(' ')[0]}!`.replace('@', 'o/a'), body: 'Sesión iniciada con Google.', tone: 'success' });
    navigate(r.user.role === 'adopter' && !r.user.profile ? '/onboarding' : HOME_BY_ROLE[r.user.role]);
  };

  const onGoogle = async () => {
    const real = await signInWithRealGoogle();
    if (real) finish(real);
    else setPicker(true);
  };

  return (
    <>
      <div className="my-6 flex items-center gap-3 text-sm text-cocoa-500">
        <span className="h-px flex-1 bg-cocoa/10" /> o {verb} con <span className="h-px flex-1 bg-cocoa/10" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" icon={<GoogleG />} onClick={onGoogle}>
          Google
        </Button>
        <Button variant="outline" onClick={() => toast({ title: 'Apple llegará en la Fase 2', body: 'Por ahora usa correo o Google.', emoji: '🍎' })}>
          Apple
        </Button>
      </div>
      <Sheet open={picker} onClose={() => setPicker(false)} title="Elige una cuenta">
        <p className="-mt-2 mb-4 flex flex-wrap items-center gap-2 text-sm text-cocoa-500">
          <GoogleG />
          <span>Continuar en KuyayPet</span>
          <Chip tone="honey" className="px-2 py-0 text-xs">
            Simulado{GOOGLE_CLIENT_ID ? '' : ' (sin Client ID)'}
          </Chip>
        </p>
        <ListGroup>
          {SIMULATED_GOOGLE_ACCOUNTS.map((a) => (
            <ListRow key={a.email} leading={<Avatar src={a.picture} name={a.name} size={40} />} title={a.name} subtitle={a.email} chevron={false} onClick={() => finish(a)} />
          ))}
        </ListGroup>
      </Sheet>
    </>
  );
}
