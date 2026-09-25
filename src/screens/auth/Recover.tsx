// HU-15: recuperar contraseña. El correo es SIMULADO (bandeja en el propio store, nunca se envía de verdad).
import { KeyRound, Lock, Mail, MailCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Sheet } from '@/components/ui';
import { confirmPasswordReset, requestPasswordReset } from '@/services/auth';
import { useDb } from '@/services/store';
import { toast } from '@/services/ui';
import { AuthShell, Field } from './shared';

export function Recover() {
  const navigate = useNavigate();
  const outbox = useDb((s) => s.demo.outbox);
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [error, setError] = useState('');
  const [inboxOpen, setInboxOpen] = useState(false);

  const lastMailForMe = outbox.filter((m) => m.to.toLowerCase() === email.trim().toLowerCase()).at(-1);

  const submitEmail = (e: FormEvent) => {
    e.preventDefault();
    const r = requestPasswordReset(email);
    if (!r.ok) return setError(r.error);
    setError('');
    setStep('code');
    setInboxOpen(true);
    toast({ title: 'Enlace de recuperación enviado', body: 'Correo simulado: revisa la bandeja de abajo.', emoji: '📧' });
  };

  const submitCode = (e: FormEvent) => {
    e.preventDefault();
    const r = confirmPasswordReset(email, code, password, confirmPw);
    if (!r.ok) return setError(r.error);
    toast({ title: 'Contraseña actualizada', body: 'Ya puedes iniciar sesión con tu nueva contraseña.', tone: 'success' });
    navigate('/login', { replace: true });
  };

  return (
    <AuthShell title="Recuperar contraseña" subtitle={step === 'email' ? 'Te enviaremos un código para restablecerla.' : 'Ingresa el código que recibiste y tu nueva contraseña.'} hu="HU-15">
      {step === 'email' ? (
        <form onSubmit={submitEmail} noValidate className="space-y-3.5">
          <Field id="recover-email" label="Correo electrónico" type="email" icon={<Mail size={20} />} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="nombre@correo.com" error={!!error} />
          {error && (
            <p role="alert" className="rounded-2xl bg-coral-100 px-4 py-2.5 text-sm font-semibold text-coral-600">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" block>
            Enviar enlace de recuperación
          </Button>
        </form>
      ) : (
        <form onSubmit={submitCode} noValidate className="space-y-3.5">
          <p className="rounded-2xl bg-honey-100 px-4 py-2.5 text-xs text-cocoa-700">
            <b>Correo simulado.</b> Nadie recibe un correo real: revisa el código en{' '}
            <button type="button" onClick={() => setInboxOpen(true)} className="font-bold text-terra underline underline-offset-2">
              la bandeja de entrada simulada
            </button>
            .
          </p>
          <Field id="recover-code" label="Código de 6 dígitos" type="text" inputMode="numeric" icon={<KeyRound size={20} />} value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" error={!!error} />
          <Field id="recover-password" label="Nueva contraseña" type="password" icon={<Lock size={20} />} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="Mínimo 8 caracteres" error={!!error} />
          <Field id="recover-confirm" label="Confirmar contraseña" type="password" icon={<Lock size={20} />} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} autoComplete="new-password" placeholder="Repite tu contraseña" error={!!error} />
          {error && (
            <p role="alert" className="rounded-2xl bg-coral-100 px-4 py-2.5 text-sm font-semibold text-coral-600">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" block>
            Cambiar contraseña
          </Button>
        </form>
      )}

      <Sheet open={inboxOpen} onClose={() => setInboxOpen(false)} title="Bandeja de correo simulada">
        <p className="-mt-2 mb-3 text-xs text-cocoa-500">
          <MailCheck size={14} className="mr-1 inline" />
          Estos correos <b>no se envían de verdad</b>: viven solo en esta demo, para que puedas ver el flujo completo.
        </p>
        {lastMailForMe ? (
          <div className="rounded-2xl border-2 border-cream-300 bg-white p-4">
            <p className="text-xs text-cocoa-300">Para: {lastMailForMe.to}</p>
            <p className="font-bold">{lastMailForMe.subject}</p>
            <p className="mt-2 text-sm text-cocoa-700">{lastMailForMe.body}</p>
            {lastMailForMe.code && (
              <button
                type="button"
                onClick={() => {
                  setCode(lastMailForMe.code!);
                  setInboxOpen(false);
                }}
                className="mt-3 w-full rounded-full bg-terra-100 py-2 text-center font-bold text-terra-600"
              >
                Usar código {lastMailForMe.code}
              </button>
            )}
          </div>
        ) : (
          <p className="text-center text-sm text-cocoa-500">Todavía no hay correos para esta dirección.</p>
        )}
      </Sheet>
    </AuthShell>
  );
}
