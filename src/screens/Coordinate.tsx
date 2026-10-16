import { motion, useReducedMotion } from 'framer-motion';
import { CalendarDays, Check, Clock, MapPin, MessageSquareText } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, EmptyState, PageHeader } from '@/components/ui';
import { useCurrentUser } from '@/services/auth';
import { ADOPTION_STATUS_LABEL, requestAdoption, useAdoptionsForAdopter } from '@/services/adoptions';
import { ageLabel, SEX_LABEL, usePet, useUser } from '@/services/pets';

function nextSaturday() {
  const d = new Date();
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  return d.toISOString().slice(0, 10);
}

/** HU-10: propose date/time to meet the pet; the owner accepts or rejects (status visible to the adopter). */
export function Coordinate() {
  const { petId } = useParams();
  const pet = usePet(petId);
  const owner = useUser(pet?.ownerId);
  const user = useCurrentUser();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [form, setForm] = useState({ date: nextSaturday(), time: '10:00', place: '', message: '' });
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const open = useAdoptionsForAdopter(user?.id).filter((a) => a.petId === petId && a.status !== 'rechazada').at(-1);

  if (!pet || !user) return <EmptyState emoji="🔍" title="Mascota no encontrada" />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const r = requestAdoption({ adopterId: user.id, petId: pet.id, ...form, message: form.message || `Hola, me interesa adoptar a ${pet.name}. ¿Podemos coordinar una visita?` });
    if (!r.ok) return setError(r.error);
    setSent(true);
  };

  if (sent || open)
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 pt-safe-t text-center" data-hu="HU-10" data-tour="coordinate-done">
        <div className="relative">
          <img src={pet.photos[0]} alt="" className="h-28 w-28 rounded-full object-cover shadow-card ring-4 ring-white" />
          <motion.span
            initial={reduce ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
            className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full bg-sage-600 text-white shadow-raised ring-4 ring-cream"
            aria-hidden
          >
            <Check size={22} strokeWidth={3} />
          </motion.span>
        </div>
        <h1 className="mt-6 text-3xl font-extrabold text-cocoa-900">¡Solicitud enviada!</h1>
        <p className="mt-2 max-w-xs leading-snug text-cocoa-500">
          Tu solicitud de adopción fue enviada a {owner?.name ?? 'el responsable'} de {pet.name}. Te avisaremos cuando responda.
        </p>
        <p className="mt-4 rounded-full bg-honey-100 px-4 py-1.5 text-sm font-bold text-cocoa-700" data-tour="coordinate-status">
          Estado: {open ? ADOPTION_STATUS_LABEL[open.status] : 'Pendiente'}
        </p>
        <div className="mt-10 flex w-full max-w-xs flex-col gap-2">
          <Button block onClick={() => navigate(`/mascota/${pet.id}`, { replace: true })}>
            Volver a la mascota
          </Button>
          <Button variant="ghost" block onClick={() => navigate('/chats')}>
            Ir a mis chats
          </Button>
        </div>
      </div>
    );

  return (
    <form onSubmit={submit} noValidate className="flex h-full flex-col" data-hu="HU-10" data-tour="coordinate-form">
      <div className="scroll-area min-h-0 flex-1 px-4 pb-6 pt-safe-t">
        <PageHeader title="Coordinar adopción" back />
        <Card className="flex items-center gap-4 p-3">
          <img src={pet.photos[0]} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
          <div className="min-w-0">
            <p className="truncate font-display text-xl font-bold text-cocoa-900">{pet.name}</p>
            <p className="mt-0.5 text-sm leading-snug text-cocoa-500">
              {ageLabel(pet.ageMonths)} · {SEX_LABEL[pet.sex]} · {pet.district}
            </p>
          </div>
        </Card>

        <Card className="mt-4 space-y-4 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="date" className="label flex items-center gap-1.5">
                <CalendarDays size={15} className="text-terra" /> Fecha propuesta
              </label>
              <input id="date" type="date" className="input" value={form.date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label htmlFor="time" className="label flex items-center gap-1.5">
                <Clock size={15} className="text-terra" /> Hora propuesta
              </label>
              <input id="time" type="time" className="input" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </div>
          </div>
          <div>
            <label htmlFor="place" className="label flex items-center gap-1.5">
              <MapPin size={15} className="text-terra" /> Lugar (opcional)
            </label>
            <input id="place" className="input" placeholder={`Ej. Parque Kennedy, ${pet.district === 'Miraflores' ? 'Miraflores' : pet.district}`} value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} />
          </div>
          <div>
            <label htmlFor="msg" className="label flex items-center gap-1.5">
              <MessageSquareText size={15} className="text-terra" /> Mensaje (opcional)
            </label>
            <textarea id="msg" rows={3} className="input resize-none" placeholder={`Hola, me interesa adoptar a ${pet.name}. ¿Podemos coordinar una visita?`} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          {error && (
            <p role="alert" className="rounded-2xl bg-coral-100 px-4 py-2.5 text-sm font-semibold text-coral-600">
              {error}
            </p>
          )}
        </Card>
      </div>

      <div className="glass relative z-10 grid shrink-0 grid-cols-2 gap-3 px-4 pb-safe-b pt-3">
        <Button type="button" variant="outline" block onClick={() => navigate(-1)}>
          Cancelar
        </Button>
        <Button type="submit" variant="success" block data-tour="coordinate-submit">
          Enviar solicitud
        </Button>
      </div>
    </form>
  );
}
