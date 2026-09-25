// HU-12: edit the textual info of an owned pet. Reflects instantly on PetProfile via the reactive store.
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, EmptyState } from '@/components/ui';
import { useCurrentUser } from '@/services/auth';
import { updatePublication } from '@/services/publications';
import { toast } from '@/services/ui';
import { usePet } from '@/services/pets';

export function EditPet() {
  const { id } = useParams();
  const user = useCurrentUser();
  const pet = usePet(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(() => ({
    name: pet?.name ?? '',
    breed: pet?.breed ?? '',
    ageMonths: pet?.ageMonths ?? 0,
    about: pet?.about ?? '',
    story: pet?.story ?? '',
    specialCare: pet?.specialCare ?? '',
  }));
  const [error, setError] = useState('');

  if (!pet || !user || pet.ownerId !== user.id)
    return (
      <div className="h-full pt-10" data-hu="HU-12">
        <EmptyState emoji="🔍" title="Mascota no encontrada" action={<Button onClick={() => navigate('/responsable')}>Volver</Button>} />
      </div>
    );

  const save = () => {
    if (!form.name.trim()) {
      setError('El nombre no puede estar vacío.');
      return;
    }
    const result = updatePublication(pet.id, form);
    if (!result.ok) {
      setError(Object.values(result.errors)[0] ?? 'Revisa los datos.');
      return;
    }
    toast({ title: 'Cambios guardados con éxito', tone: 'success', emoji: '✅' });
    navigate('/responsable', { replace: true });
  };

  return (
    <div className="scroll-area h-full px-5 pb-6 pt-4" data-hu="HU-12">
      <button onClick={() => navigate('/responsable')} className="-ml-2 flex items-center gap-1 rounded-full px-2 py-1 font-semibold text-cocoa-500 hover:bg-cream-200">
        <ArrowLeft size={18} /> Volver
      </button>
      <h1 className="mt-2 text-3xl font-extrabold">Editar información</h1>
      <div className="mt-4 space-y-3.5">
        <div>
          <label htmlFor="name" className="label">
            Nombre *
          </label>
          <input
            id="name"
            className={`input ${!form.name.trim() ? 'ring-2 ring-coral' : ''}`}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="breed" className="label">
            Raza
          </label>
          <input id="breed" className="input" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} />
        </div>
        <div>
          <label htmlFor="age" className="label">
            Edad en meses
          </label>
          <input id="age" type="number" min={0} className="input" value={form.ageMonths} onChange={(e) => setForm({ ...form, ageMonths: Number(e.target.value) })} />
        </div>
        <div>
          <label htmlFor="about" className="label">
            Descripción / Sobre mí
          </label>
          <textarea id="about" rows={3} className="input resize-none" value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} />
        </div>
        <div>
          <label htmlFor="story" className="label">
            Historia
          </label>
          <textarea id="story" rows={3} className="input resize-none" value={form.story} onChange={(e) => setForm({ ...form, story: e.target.value })} />
        </div>
        <div>
          <label htmlFor="care" className="label">
            Cuidados especiales
          </label>
          <textarea id="care" rows={2} className="input resize-none" value={form.specialCare} onChange={(e) => setForm({ ...form, specialCare: e.target.value })} />
        </div>
        {error && (
          <p role="alert" className="rounded-2xl bg-coral-100 px-4 py-2.5 text-sm font-semibold text-coral-600">
            {error}
          </p>
        )}
      </div>
      <div className="mt-6 flex gap-3">
        <Button block variant="outline" onClick={() => navigate('/responsable')}>
          Cancelar
        </Button>
        <Button block variant="success" onClick={save}>
          Guardar cambios
        </Button>
      </div>
    </div>
  );
}
