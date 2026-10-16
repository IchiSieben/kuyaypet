// HU-12: edit the textual info of an owned pet. Reflects instantly on PetProfile via the reactive store.
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, EmptyState, PageHeader } from '@/components/ui';
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
    <div className="h-full" data-hu="HU-12">
      <div className="scroll-area h-full">
        <div className="flex min-h-full flex-col">
          <div className="flex-1 px-4">
            <PageHeader
              back="/responsable"
              title="Editar información"
              subtitle={`${pet.breed} · ${pet.district}`}
              aside={pet.photos[0] ? <img src={pet.photos[0]} alt="" className="h-14 w-14 rounded-2xl bg-cream-200 object-cover shadow-soft" /> : undefined}
            />
            <Card className="space-y-4 p-4">
              <div>
                <label htmlFor="name" className="label">
                  Nombre *
                </label>
                <input
                  id="name"
                  className={`input ${!form.name.trim() ? 'ring-2 ring-coral' : ''}`}
                  aria-invalid={!form.name.trim()}
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
                <input id="age" type="number" min={0} className="input tabular-nums" value={form.ageMonths} onChange={(e) => setForm({ ...form, ageMonths: Number(e.target.value) })} />
              </div>
            </Card>
            <Card className="mt-4 space-y-4 p-4">
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
            </Card>
            <div className="h-6" aria-hidden />
          </div>

          <div className="glass sticky bottom-0 z-10 grid grid-cols-2 gap-3 px-4 pb-safe-b pt-3">
            <Button block variant="outline" onClick={() => navigate('/responsable')}>
              Cancelar
            </Button>
            <Button block variant="success" onClick={save}>
              Guardar cambios
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
