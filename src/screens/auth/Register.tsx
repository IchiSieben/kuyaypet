import { Lock, Mail, User } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import { register } from '@/services/auth';
import { toast } from '@/services/ui';
import { AuthShell, Field, FormAlert, SocialLogin } from './shared';

export function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState<{ error: string; field?: string } | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const r = register(form);
    if (!r.ok) return setError(r);
    toast({ title: '¡Cuenta creada con éxito!', body: 'Ahora cuéntanos sobre ti para encontrar tu match.', tone: 'success' });
    navigate('/onboarding');
  };

  const bad = (f: string) => !!error && (error.field === f || (!error.field && !form[f as keyof typeof form]));

  return (
    <AuthShell title="Registro de usuario" subtitle="Completa los siguientes datos para crear tu cuenta." hu="HU-01">
      <form onSubmit={submit} noValidate>
        <Card className="space-y-4 p-4">
          <Field id="name" label="Nombre completo" icon={<User size={20} />} value={form.name} onChange={set('name')} autoComplete="name" placeholder="Ej. Valeria Torres" error={bad('name')} />
          <Field id="email" label="Correo electrónico" type="email" icon={<Mail size={20} />} value={form.email} onChange={set('email')} autoComplete="email" placeholder="nombre@correo.com" error={bad('email')} />
          <Field id="password" label="Contraseña" type="password" icon={<Lock size={20} />} value={form.password} onChange={set('password')} autoComplete="new-password" placeholder="Mínimo 8 caracteres" error={bad('password')} />
          <Field id="confirm" label="Confirmar contraseña" type="password" icon={<Lock size={20} />} value={form.confirm} onChange={set('confirm')} autoComplete="new-password" placeholder="Repite tu contraseña" error={bad('confirm')} />
          {error && <FormAlert>{error.error}</FormAlert>}
        </Card>
        <Button type="submit" size="lg" block className="mt-5">
          Registrarse
        </Button>
      </form>
      <SocialLogin verb="regístrate" />
      <p className="mt-8 text-center text-cocoa-500">
        ¿Ya tienes una cuenta?{' '}
        <Link to="/login" className="rounded font-bold text-terra underline underline-offset-4">
          Iniciar sesión
        </Link>
      </p>
    </AuthShell>
  );
}
