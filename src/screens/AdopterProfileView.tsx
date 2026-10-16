// HU-13: read-only profile of an adopter, opened from a notification (owner/admin only).
import { MapPin, MessageCircle } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Avatar,
  Button,
  Card,
  Chip,
  EmptyState,
  PageHeader,
  ScoreBadge,
  Section,
} from "@/components/ui";
import { findDirectThread } from "@/services/chat";
import { usePet, useMatch, useUser } from "@/services/pets";

const HOUSING_LABEL: Record<string, string> = {
  departamento: "Departamento",
  casa_sin_patio: "Casa sin patio",
  casa_con_patio: "Casa con patio o jardín",
};
const ACTIVITY_LABEL: Record<string, string> = {
  sedentario: "Tranquilo",
  moderado: "Moderado",
  muy_activo: "Muy activo",
};
const EXPERIENCE_LABEL: Record<string, string> = {
  primera: "Primera mascota",
  he_tenido: "Ya ha tenido mascotas",
  experto: "Mucha experiencia",
};

export function AdopterProfileView() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const adopter = useUser(id);
  const petId = params.get("petId") ?? undefined;
  const pet = usePet(petId);
  const match = useMatch(adopter?.profile, pet);

  if (!adopter)
    return (
      <div className="h-full pt-10" data-hu="HU-13">
        <EmptyState
          emoji="🔍"
          title="Adoptante no encontrado"
          action={<Button onClick={() => navigate(-1)}>Volver</Button>}
        />
      </div>
    );

  const thread = pet
    ? findDirectThread(pet.id, adopter.id, pet.ownerId)
    : undefined;

  return (
    <div className="h-full" data-hu="HU-13">
      <div className="scroll-area h-full">
        <div className="flex min-h-full flex-col">
          <div className="flex-1 px-4">
            <PageHeader
              back
              title={adopter.name}
              subtitle={
                adopter.district ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={14} className="text-terra" />{" "}
                    {adopter.district}
                  </span>
                ) : undefined
              }
              aside={
                <Avatar src={adopter.avatar} name={adopter.name} size={64} />
              }
            />

            {pet && match && (
              <Card className="flex items-center gap-3.5 p-4">
                <img
                  src={pet.photos[0]}
                  alt=""
                  className="h-16 w-16 rounded-2xl bg-cream-200 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-cocoa-500">
                    Compatibilidad con
                  </p>
                  <p className="truncate font-display text-lg font-bold text-cocoa-900">
                    {pet.name}
                  </p>
                </div>
                <ScoreBadge score={match.score} />
              </Card>
            )}

            <Section title="Cuestionario de adopción" className="!mt-6">
              {adopter.profile ? (
                <Card className="space-y-4 p-4">
                  <div className="flex flex-wrap gap-2">
                    <Chip tone="terra">
                      {HOUSING_LABEL[adopter.profile.housing] ??
                        adopter.profile.housing}
                    </Chip>
                    <Chip tone="sage">
                      {ACTIVITY_LABEL[adopter.profile.activity] ??
                        adopter.profile.activity}
                    </Chip>
                    <Chip tone="honey">
                      {EXPERIENCE_LABEL[adopter.profile.experience] ??
                        adopter.profile.experience}
                    </Chip>
                  </div>
                  <ul className="space-y-1.5 text-sm text-cocoa-700">
                    <li>
                      Horas sola/o al día:{" "}
                      <span className="font-bold tabular-nums">
                        {adopter.profile.hoursAlone}
                      </span>
                    </li>
                    <li>
                      Niños en casa:{" "}
                      {adopter.profile.kids === "no"
                        ? "No"
                        : adopter.profile.kids === "mayores_6"
                          ? "Mayores de 6 años"
                          : "Niños pequeños"}
                    </li>
                    <li>
                      Otras mascotas:{" "}
                      {adopter.profile.otherPets === "ninguna"
                        ? "Ninguna"
                        : adopter.profile.otherPets}
                    </li>
                    <li>Alergias: {adopter.profile.allergies ? "Sí" : "No"}</li>
                  </ul>
                </Card>
              ) : (
                <p className="surface-1 rounded-3xl px-4 py-5 text-center text-sm font-semibold text-cocoa-500">
                  Aún no completa el cuestionario de adopción.
                </p>
              )}
            </Section>
            <div className="h-6" aria-hidden />
          </div>

          <div className="glass sticky bottom-0 z-10 px-4 pb-safe-b pt-3">
            {thread ? (
              <Button
                block
                variant="primary"
                icon={<MessageCircle size={18} />}
                onClick={() => navigate(`/chats/${thread.id}`)}
              >
                Abrir chat
              </Button>
            ) : (
              <p className="py-2 text-center text-sm font-semibold text-cocoa-500">
                Todavía no hay un chat con este adoptante.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
