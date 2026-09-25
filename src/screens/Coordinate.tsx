import { motion } from 'framer-motion';
import { ArrowLeft, CalendarDays, Clock, MapPin, MessageSquareText } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, EmptyState } from '@/components/ui';
import { useCurrentUser } from '@/services/auth';
import { requestAdoption } from '@/services/adoptions';
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
  const [form, setForm] = useState({ date: nextSaturday(), time: '10:00', place: '', message: '' });
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  if (!pet || !user) return <EmptyState emoji="🔍" title="Mascota no encontrada" />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const r = requestAdoption({ adopterId: user.id, petId: pet.id, ...form, message: form.message || `Hola, me interesa adoptar a ${pet.name}. ¿Podemos coordinar una visita?` });
    if (!r.ok) return setError(r.error);
    setSent(true);
  };

  if (sent)
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center" data-hu="HU-10" data-tour="coordinate-done">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }} className="flex h-24 w-24 items-center justify-center rounded-full bg-sage-100 text-5xl">
          ✅
        </motion.div>
        <h1 className="mt-5 text-3xl font-extrabold">¡Solicitud enviada!</h1>
        <p className="mt-2 text-cocoa-500">
          Tu solicitud de adopción fue enviada a {owner?.name ?? 'el responsable'} de {pet.name}. Te avisaremos cuando responda.
        </p>
        <p className="mt-3 rounded-full bg-honey-100 px-4 py-1 text-sm font-bold">Estado: Pendiente</p>
        <div className="mt-8 flex w-full max-w-xs flex-col gap-2">
          <Button onClick={() => navigate(`/mascota/${pet.id}`, { replace: true })}>Volver a la mascota</Button>
          <Button variant="ghost" onClick={() => navigate('/chats')}>
            Ir a mis chats
          </Button>
        </div>
      </div>
    );

  return (
    <div className="scroll-area h-full px-5 pb-6 pt-4" data-hu="HU-10" data-tour="coordinate-form">
      <button onClick={() => navigate(-1)} className="-ml-2 flex items-center gap-1 rounded-full px-2 py-1 font-semibold text-cocoa-500 hover:bg-cream-200">
        <ArrowLeft size={18} /> Volver
      </button>
      <h1 className="mt-2 text-3xl font-extrabold">Coordinar adopción</h1>
      <div className="mt-4 flex items-center gap-3 rounded-3xl bg-white p-3 shadow-soft">
        <img src={pet.photos[0]} alt="" className="h-16 w-16 rounded-2xl object-cover" />
        <div>
          <p className="font-display text-xl font-bold">{pet.name}</p>
          <p className="text-sm text-cocoa-500">
            {ageLabel(pet.ageMonths)} · {SEX_LABEL[pet.sex]} · {pet.district}
          </p>
        </div>
      </div>
      <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="date" className="label flex items-center gap-1">
              <CalendarDays size={15} /> Fecha propuesta
            </label>
            <input id="date" type="date" className="input" value={form.date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <label htmlFor="time" className="label flex items-center gap-1">
              <Clock size={15} /> Hora propuesta
            </label>
            <input id="time" type="time" className="input" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </div>
        </div>
        <div>
          <label htmlFor="place" className="label flex items-center gap-1">
            <MapPin size={15} /> Lugar (opcional)
          </label>
          <input id="place" className="input" placeholder={`Ej. Parque Kennedy, ${pet.district === 'Miraflores' ? 'Miraflores' : pet.district}`} value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} />
        </div>
        <div>
          <label htmlFor="msg" className="label flex items-center gap-1">
            <MessageSquareText size={15} /> Mensaje (opcional)
          </label>
          <textarea id="msg" rows={3} className="input resize-none" placeholder={`Hola, me interesa adoptar a ${pet.name}. ¿Podemos coordinar una visita?`} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        </div>
        {error && (
          <p role="alert" className="rounded-2xl bg-coral-100 px-4 py-2.5 text-sm font-semibold text-coral-600">
            {error}
          </p>
        )}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" variant="success" data-tour="coordinate-submit">
            Enviar solicitud
          </Button>
        </div>
      </form>
    </div>
  );
}
