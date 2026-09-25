import { Lock, Mail } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { canAccess, HOME_BY_ROLE, login } from '@/services/auth';
import { toast } from '@/services/ui';
import { AuthShell, Field, SocialLogin } from './shared';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const r = login(email, password);
    if (!r.ok) return setError(r.error);
    toast({ title: `¡Hola de nuevo, ${r.user.name.split(' ')[0]}!`, tone: 'success' });
    navigate(from && canAccess(r.user.role, from) ? from : (r.user.role === 'adopter' && !r.user.profile ? '/onboarding' : HOME_BY_ROLE[r.user.role]), { replace: true });
  };

  return (
    <AuthShell title="Iniciar sesión" subtitle="Qué bueno verte otra vez 🐾" hu="HU-01">
      <form onSubmit={submit} noValidate className="space-y-3.5">
        <Field id="email" label="Correo electrónico" type="email" icon={<Mail size={20} />} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="nombre@correo.com" error={!!error} />
        <Field id="password" label="Contraseña" type="password" icon={<Lock size={20} />} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="Tu contraseña" error={!!error} />
        {error && (
          <p role="alert" className="rounded-2xl bg-coral-100 px-4 py-2.5 text-sm font-semibold text-coral-600">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" block>
          Entrar
        </Button>
        <p className="text-center">
          <Link to="/recuperar" className="text-sm font-semibold text-terra underline underline-offset-4">
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
        <p className="rounded-2xl bg-honey-100 px-4 py-2.5 text-xs text-cocoa-700">
          <b>Cuentas demo</b> (contraseña <code>kuyay2026</code>): adoptante@kuyaypet.pe · responsable@kuyaypet.pe · admin@kuyaypet.pe
        </p>
      </form>
      <SocialLogin verb="entra" />
      <p className="mt-6 text-center text-cocoa-500">
        ¿No tienes cuenta?{' '}
        <Link to="/registro" className="font-bold text-terra underline underline-offset-4">
          Regístrate
        </Link>
      </p>
    </AuthShell>
  );
}
