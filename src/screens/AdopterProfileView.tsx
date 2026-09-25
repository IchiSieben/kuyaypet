// HU-13: read-only profile of an adopter, opened from a notification (owner/admin only).
import { ArrowLeft, MapPin, MessageCircle } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Avatar, Button, Card, Chip, EmptyState, ScoreBadge } from '@/components/ui';
import { findDirectThread } from '@/services/chat';
import { usePet, useMatch, useUser } from '@/services/pets';

const HOUSING_LABEL: Record<string, string> = { departamento: 'Departamento', casa_sin_patio: 'Casa sin patio', casa_con_patio: 'Casa con patio o jardín' };
const ACTIVITY_LABEL: Record<string, string> = { sedentario: 'Tranquilo', moderado: 'Moderado', muy_activo: 'Muy activo' };
const EXPERIENCE_LABEL: Record<string, string> = { primera: 'Primera mascota', he_tenido: 'Ya ha tenido mascotas', experto: 'Mucha experiencia' };

export function AdopterProfileView() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const adopter = useUser(id);
  const petId = params.get('petId') ?? undefined;
  const pet = usePet(petId);
  const match = useMatch(adopter?.profile, pet);

  if (!adopter)
    return (
      <div className="h-full pt-10" data-hu="HU-13">
        <EmptyState emoji="🔍" title="Adoptante no encontrado" action={<Button onClick={() => navigate(-1)}>Volver</Button>} />
      </div>
    );

  const thread = pet ? findDirectThread(pet.id, adopter.id, pet.ownerId) : undefined;

  return (
    <div className="scroll-area h-full px-5 pb-6 pt-4" data-hu="HU-13">
      <button onClick={() => navigate(-1)} className="-ml-2 flex items-center gap-1 rounded-full px-2 py-1 font-semibold text-cocoa-500 hover:bg-cream-200">
        <ArrowLeft size={18} /> Volver
      </button>

      <div className="mt-4 flex items-center gap-3">
        <Avatar src={adopter.avatar} name={adopter.name} size={64} />
        <div>
          <h1 className="text-2xl font-extrabold">{adopter.name}</h1>
          {adopter.district && (
            <p className="flex items-center gap-1 text-sm text-cocoa-500">
              <MapPin size={14} className="text-terra" /> {adopter.district}
            </p>
          )}
        </div>
      </div>

      {pet && match && (
        <Card className="mt-4 flex items-center gap-3 p-4">
          <img src={pet.photos[0]} alt="" className="h-14 w-14 rounded-2xl object-cover" />
          <div className="flex-1">
            <p className="text-xs font-bold text-cocoa-300">Compatibilidad con</p>
            <p className="font-bold">{pet.name}</p>
          </div>
          <ScoreBadge score={match.score} />
        </Card>
      )}

      {adopter.profile ? (
        <Card className="mt-4 space-y-3 p-4">
          <h2 className="text-lg font-bold">Cuestionario de adopción</h2>
          <div className="flex flex-wrap gap-2">
            <Chip tone="terra">{HOUSING_LABEL[adopter.profile.housing] ?? adopter.profile.housing}</Chip>
            <Chip tone="sage">{ACTIVITY_LABEL[adopter.profile.activity] ?? adopter.profile.activity}</Chip>
            <Chip tone="honey">{EXPERIENCE_LABEL[adopter.profile.experience] ?? adopter.profile.experience}</Chip>
          </div>
          <ul className="space-y-1 text-sm text-cocoa-700">
            <li>Horas sola/o al día: {adopter.profile.hoursAlone}</li>
            <li>Niños en casa: {adopter.profile.kids === 'no' ? 'No' : adopter.profile.kids === 'mayores_6' ? 'Mayores de 6 años' : 'Niños pequeños'}</li>
            <li>Otras mascotas: {adopter.profile.otherPets === 'ninguna' ? 'Ninguna' : adopter.profile.otherPets}</li>
            <li>Alergias: {adopter.profile.allergies ? 'Sí' : 'No'}</li>
          </ul>
        </Card>
      ) : (
        <p className="mt-4 rounded-2xl bg-white p-3 text-sm text-cocoa-500">Aún no completa el cuestionario de adopción.</p>
      )}

      <div className="mt-5">
        {thread ? (
          <Button block variant="primary" icon={<MessageCircle size={18} />} onClick={() => navigate(`/chats/${thread.id}`)}>
            Abrir chat
          </Button>
        ) : (
          <p className="rounded-2xl bg-cream-200 p-3 text-center text-sm text-cocoa-500">Todavía no hay un chat con este adoptante.</p>
        )}
      </div>
    </div>
  );
}
