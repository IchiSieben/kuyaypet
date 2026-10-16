// HU-15: recuperar contraseña. El correo es SIMULADO (bandeja en el propio store, nunca se envía de verdad).
import { KeyRound, Lock, Mail, MailCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Sheet } from '@/components/ui';
import { confirmPasswordReset, requestPasswordReset } from '@/services/auth';
import { useDb } from '@/services/store';
import { toast } from '@/services/ui';
import { AuthShell, Field, FormAlert } from './shared';

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
        <form onSubmit={submitEmail} noValidate>
          <Card className="space-y-4 p-4">
            <Field id="recover-email" label="Correo electrónico" type="email" icon={<Mail size={20} />} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="nombre@correo.com" error={!!error} />
            {error && <FormAlert>{error}</FormAlert>}
          </Card>
          <Button type="submit" size="lg" block className="mt-5">
            Enviar enlace de recuperación
          </Button>
        </form>
      ) : (
        <form onSubmit={submitCode} noValidate>
          <p className="surface-1 mb-4 rounded-2xl px-4 py-3 text-sm leading-relaxed text-cocoa-700">
            <b>Correo simulado.</b> Nadie recibe un correo real: revisa el código en{' '}
            <button type="button" onClick={() => setInboxOpen(true)} className="rounded font-bold text-terra underline underline-offset-2">
              la bandeja de entrada simulada
            </button>
            .
          </p>
          <Card className="space-y-4 p-4">
            <Field id="recover-code" label="Código de 6 dígitos" type="text" inputMode="numeric" autoComplete="one-time-code" className="tabular-nums tracking-widest" icon={<KeyRound size={20} />} value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" error={!!error} />
            <Field id="recover-password" label="Nueva contraseña" type="password" icon={<Lock size={20} />} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="Mínimo 8 caracteres" error={!!error} />
            <Field id="recover-confirm" label="Confirmar contraseña" type="password" icon={<Lock size={20} />} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} autoComplete="new-password" placeholder="Repite tu contraseña" error={!!error} />
            {error && <FormAlert>{error}</FormAlert>}
          </Card>
          <Button type="submit" size="lg" block className="mt-5">
            Cambiar contraseña
          </Button>
        </form>
      )}

      <Sheet open={inboxOpen} onClose={() => setInboxOpen(false)} title="Bandeja de correo simulada">
        <p className="-mt-2 mb-4 flex items-start gap-2 text-sm leading-snug text-cocoa-500">
          <MailCheck size={16} className="mt-0.5 shrink-0" />
          <span>
            Estos correos <b>no se envían de verdad</b>: viven solo en esta demo, para que puedas ver el flujo completo.
          </span>
        </p>
        {lastMailForMe ? (
          <Card className="p-4">
            <p className="text-sm text-cocoa-500">Para: {lastMailForMe.to}</p>
            <p className="mt-1 font-display text-lg font-bold text-cocoa-900">{lastMailForMe.subject}</p>
            <p className="mt-2 text-sm leading-relaxed text-cocoa-700">{lastMailForMe.body}</p>
            {lastMailForMe.code && (
              <Button
                type="button"
                block
                className="mt-4"
                onClick={() => {
                  setCode(lastMailForMe.code!);
                  setInboxOpen(false);
                }}
              >
                Usar código {lastMailForMe.code}
              </Button>
            )}
          </Card>
        ) : (
          <p className="py-4 text-center text-sm text-cocoa-500">Todavía no hay correos para esta dirección.</p>
        )}
      </Sheet>
    </AuthShell>
  );
}
