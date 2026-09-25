import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Chip, EmptyState, Sheet } from '@/components/ui';
import { approvePublication, rejectPublication, updatePublication, usePublication } from '@/services/moderation';
import { useDb } from '@/services/store';
import { confirm, toast } from '@/services/ui';
import type { ApprovalStatus } from '@/types';

const APPROVAL_LABEL: Record<ApprovalStatus, string> = { pendiente: 'Pendiente', aprobada: 'Aprobada', rechazada: 'Rechazada' };
const REASONS = ['Fotos no corresponden a la mascota', 'Información incompleta o falsa', 'Posible venta encubierta', 'Contenido inapropiado'];

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
  const [reason, setReason] = useState('');

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
        <EmptyState emoji="🔍" title="Publicación no encontrada" action={<Link to="/admin/publicaciones"><Button>Volver</Button></Link>} />
      </div>
    );

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

  const doReject = () => {
    if (!reason.trim()) return;
    rejectPublication(pet.id, reason.trim());
    toast({ title: `Publicación de ${pet.name} rechazada`, body: 'Se notificó al responsable con el motivo.' });
    setRejecting(false);
    setReason('');
  };

  return (
    <div className="space-y-4 pt-2" data-hu="HU-23">
      <button onClick={() => navigate('/admin/publicaciones')} className="flex items-center gap-1 text-sm font-bold text-terra">
        <ArrowLeft size={16} /> Publicaciones
      </button>
      <Card className="flex items-center gap-3 p-3">
        <img src={pet.photos[0]} alt="" className="h-16 w-16 rounded-2xl object-cover" />
        <div className="min-w-0 flex-1">
          <p className="font-bold">{pet.name}</p>
          <p className="text-xs text-cocoa-500">Por {owner?.name}</p>
        </div>
        <Chip tone={pet.approval === 'aprobada' ? 'sage' : pet.approval === 'rechazada' ? 'coral' : 'honey'}>{APPROVAL_LABEL[pet.approval]}</Chip>
      </Card>

      <Card className="space-y-3 p-4">
        <h2 className="text-lg font-bold">Editar publicación</h2>
        <label className="block text-sm font-bold">
          Nombre
          <input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block text-sm font-bold">
          Raza
          <input className="input mt-1" value={breed} onChange={(e) => setBreed(e.target.value)} />
        </label>
        <label className="block text-sm font-bold">
          Sobre mí
          <textarea rows={3} className="input mt-1 resize-none" value={about} onChange={(e) => setAbout(e.target.value)} />
        </label>
        <label className="block text-sm font-bold">
          Historia
          <textarea rows={2} className="input mt-1 resize-none" value={story} onChange={(e) => setStory(e.target.value)} />
        </label>
        <label className="block text-sm font-bold">
          Cuidados especiales
          <textarea rows={2} className="input mt-1 resize-none" value={specialCare} onChange={(e) => setSpecialCare(e.target.value)} />
        </label>
        <Button block onClick={save}>
          Guardar cambios
        </Button>
      </Card>

      {pet.approval === 'pendiente' && (
        <div className="grid grid-cols-2 gap-2" data-hu="HU-24">
          <Button variant="outline" onClick={() => setRejecting(true)}>
            Rechazar
          </Button>
          <Button variant="success" onClick={approve}>
            Aprobar
          </Button>
        </div>
      )}
      {pet.rejectionReason && <p className="rounded-2xl bg-cream-200 p-3 text-sm"><b>Motivo de rechazo:</b> {pet.rejectionReason}</p>}

      <Sheet open={rejecting} onClose={() => setRejecting(false)} title={`Rechazar a ${pet.name}`}>
        <p className="mb-3 text-sm text-cocoa-500">El motivo se enviará al responsable.</p>
        <div className="mb-3 flex flex-wrap gap-2">
          {REASONS.map((r) => (
            <Chip key={r} active={reason === r} onClick={() => setReason(r)}>
              {r}
            </Chip>
          ))}
        </div>
        <textarea rows={3} className="input resize-none" placeholder="Escribe el motivo del rechazo" value={reason} onChange={(e) => setReason(e.target.value)} aria-label="Motivo del rechazo" />
        <Button block variant="danger" className="mt-3" disabled={!reason.trim()} onClick={doReject}>
          Rechazar publicación
        </Button>
      </Sheet>
    </div>
  );
}
