import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Chip, EmptyState, PageHeader, Section } from '@/components/ui';
import { approvePublication, rejectPublication, updatePublication, usePublication } from '@/services/moderation';
import { ageLabel, SPECIES_LABEL } from '@/services/pets';
import { useDb } from '@/services/store';
import { confirm, toast } from '@/services/ui';
import type { ApprovalStatus } from '@/types';
import { ActionBar, RejectSheet } from './adminUi';

const APPROVAL_LABEL: Record<ApprovalStatus, string> = { pendiente: 'Pendiente', aprobada: 'Aprobada', rechazada: 'Rechazada' };
const APPROVAL_TONE: Record<ApprovalStatus, 'honey' | 'sage' | 'coral'> = { pendiente: 'honey', aprobada: 'sage', rechazada: 'coral' };

/** HU-23: ver/editar campos de texto de una publicación. HU-24: aprobar/rechazar también desde aquí. */
export function AdminPublicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pet = usePublication(id);
  const owner = useDb((s) => s.users.find((u) => u.id === pet?.ownerId));
  const [name, setName] = useState(pet?.name ?? '');
  const [breed, setBreed] = useState(pet?.breed ?? '');
  const [about, setAbout] = useState(pet?.about ?? '');
  const [story, setStory] = useState(pet?.story ?? '');
  const [specialCare, setSpecialCare] = useState(pet?.specialCare ?? '');
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    setName(pet?.name ?? '');
    setBreed(pet?.breed ?? '');
    setAbout(pet?.about ?? '');
    setStory(pet?.story ?? '');
    setSpecialCare(pet?.specialCare ?? '');
  }, [pet?.id]);

  if (!pet)
    return (
      <div className="pt-10" data-hu="HU-23">
        <EmptyState emoji="🔍" title="Publicación no encontrada" action={<Button onClick={() => navigate('/admin/publicaciones')}>Volver</Button>} />
      </div>
    );

  const isPending = pet.approval === 'pendiente';

  const save = () => {
    if (!name.trim()) return toast({ title: 'El nombre no puede estar vacío', tone: 'error' });
    updatePublication(pet.id, { name: name.trim(), breed: breed.trim(), about: about.trim(), story: story.trim() || undefined, specialCare: specialCare.trim() || undefined });
    toast({ title: 'Cambios guardados', body: `Se actualizó la publicación de ${name.trim()}.`, tone: 'success' });
  };

  const approve = async () => {
    const ok = await confirm({ title: `¿Aprobar a ${pet.name}?`, body: 'La publicación será visible para todos los adoptantes.', emoji: '✅', confirmLabel: 'Aprobar' });
    if (!ok) return;
    approvePublication(pet.id);
    toast({ title: `Publicación de ${pet.name} aprobada`, tone: 'success' });
  };

  const doReject = (reason: string) => {
    rejectPublication(pet.id, reason);
    toast({ title: `Publicación de ${pet.name} rechazada`, body: 'Se notificó al responsable con el motivo.' });
    setRejecting(false);
  };

  return (
    <div data-hu="HU-23">
      <PageHeader back="/admin/publicaciones" title={pet.name} subtitle={`Por ${owner?.name ?? ''}`} />

      <div className="relative overflow-hidden rounded-3xl bg-cream-200 ring-1 ring-cocoa/10">
        <img src={pet.photos[0]} alt="" className="h-52 w-full object-cover" />
        <Chip tone={APPROVAL_TONE[pet.approval]} className="absolute left-3 top-3 !bg-white/90 !py-0.5 shadow-soft">
          {APPROVAL_LABEL[pet.approval]}
        </Chip>
      </div>
      <p className="mt-2 px-1 text-sm text-cocoa-500">
        {SPECIES_LABEL[pet.species]} · {pet.breed} · {ageLabel(pet.ageMonths)}
      </p>

      {pet.rejectionReason && (
        <p className="mt-3 rounded-2xl bg-coral-100/70 p-3 text-sm text-cocoa-900">
          <b>Motivo de rechazo:</b> {pet.rejectionReason}
        </p>
      )}

      <Section title="Editar publicación" className="mt-6">
        <Card className="space-y-4 p-4">
          <label className="block text-sm font-bold text-cocoa-700">
            Nombre
            <input className="input mt-1.5" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block text-sm font-bold text-cocoa-700">
            Raza
            <input className="input mt-1.5" value={breed} onChange={(e) => setBreed(e.target.value)} />
          </label>
          <label className="block text-sm font-bold text-cocoa-700">
            Sobre mí
            <textarea rows={3} className="input mt-1.5 resize-none" value={about} onChange={(e) => setAbout(e.target.value)} />
          </label>
          <label className="block text-sm font-bold text-cocoa-700">
            Historia
            <textarea rows={2} className="input mt-1.5 resize-none" value={story} onChange={(e) => setStory(e.target.value)} />
          </label>
          <label className="block text-sm font-bold text-cocoa-700">
            Cuidados especiales
            <textarea rows={2} className="input mt-1.5 resize-none" value={specialCare} onChange={(e) => setSpecialCare(e.target.value)} />
          </label>
          <Button block variant={isPending ? 'outline' : 'primary'} onClick={save}>
            Guardar cambios
          </Button>
        </Card>
      </Section>

      {isPending && (
        <ActionBar>
          <div className="grid grid-cols-2 gap-2" data-hu="HU-24">
            <Button variant="outline" onClick={() => setRejecting(true)}>
              Rechazar
            </Button>
            <Button variant="success" onClick={approve}>
              Aprobar
            </Button>
          </div>
        </ActionBar>
      )}

      <RejectSheet name={pet.name} open={rejecting} onClose={() => setRejecting(false)} onConfirm={doReject} />
    </div>
  );
}
