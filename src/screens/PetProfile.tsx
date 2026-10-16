import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, BookOpen, CalendarCheck, Check, ChevronLeft, ChevronRight, Flag, Heart, MapPin, MessageCircle, Syringe, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Avatar, Button, Card, Chip, EmptyState, ScoreBadge, Sheet } from '@/components/ui';
import { FavoriteButton, StatusBadge } from '@/components/PetCard';
import { formatKm } from '@/lib/match';
import { WEIGHTS } from '@/lib/match/weights';
import { useCurrentUser } from '@/services/auth';
import { ensureGroupThread, findDirectThread, joinGroup } from '@/services/chat';
import { recordSwipe } from '@/services/match';
import { ADOPTION_STATUS_LABEL, formatDate, useAdoptionsForAdopter } from '@/services/adoptions';
import { createReport } from '@/services/moderation';
import { ageLabel, SEX_LABEL, SIZE_LABEL, SPECIES_LABEL, useMatch, usePet, useUser } from '@/services/pets';
import { useDb } from '@/services/store';
import { toast } from '@/services/ui';
import type { MatchFactor } from '@/types';

const FACTOR_LABEL: Record<MatchFactor, string> = {
  distance: 'Distancia',
  housing: 'Vivienda',
  lifestyle: 'Estilo de vida',
  time: 'Tiempo disponible',
  home: 'Tamaño del hogar',
  experience: 'Experiencia',
  preferences: 'Preferencias',
};

function BreakdownBar({ factor, value }: { factor: MatchFactor; value: number }) {
  const max = WEIGHTS[factor];
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const tone = pct >= 70 ? 'bg-sage' : pct >= 40 ? 'bg-honey' : 'bg-coral';
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-semibold text-cocoa-500">
        <span>{FACTOR_LABEL[factor]}</span>
        <span>
          {Math.round(value)}/{max}
        </span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-cocoa/[.08]">
        <motion.div
          className={`h-full rounded-full ${tone}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

const REPORT_REASONS = ['Fotos no corresponden a la mascota', 'Información incompleta o falsa', 'Posible venta encubierta', 'Contenido inapropiado'];

export function PetProfile() {
  const { id } = useParams();
  const pet = usePet(id);
  const owner = useUser(pet?.ownerId);
  const user = useCurrentUser();
  const navigate = useNavigate();
  const match = useMatch(user?.profile, pet);
  const [photo, setPhoto] = useState(0);
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetail, setReportDetail] = useState('');
  const myInteraction = useDb((s) => s.interactions.find((i) => i.adopterId === user?.id && i.petId === id));
  const myMatch = useDb((s) => s.matches.find((m) => m.adopterId === user?.id && m.petId === id));
  const myInterest = useDb((s) => s.interests.find((i) => i.adopterId === user?.id && i.petId === id));
  const adoption = useAdoptionsForAdopter(user?.id)
    .filter((a) => a.petId === id)
    .at(-1);

  if (!pet)
    return (
      <div className="h-full pt-10" data-hu="HU-03">
        <EmptyState emoji="🔍" title="Este perfil ya no está disponible" action={<Button onClick={() => navigate(-1)}>Volver</Button>} />
      </div>
    );

  const isAdopter = user?.role === 'adopter';
  const available = pet.status === 'disponible' && pet.approval === 'aprobada';
  const thread = myMatch ? findDirectThread(pet.id, myMatch.adopterId, myMatch.ownerId) : undefined;
  const photos = pet.photos.length ? pet.photos : [];

  const sendReport = () => {
    if (!user || !reportReason.trim()) return;
    createReport({ reporterId: user.id, targetType: 'mascota', targetId: pet.id, reason: reportReason.trim(), detail: reportDetail.trim() });
    toast({ title: 'Gracias por avisarnos', body: 'El equipo de KuyayPet revisará esta publicación.', emoji: '🚩' });
    setReporting(false);
    setReportReason('');
    setReportDetail('');
  };

  const joinPetChat = () => {
    if (!user) return;
    const thread = ensureGroupThread(pet.id);
    joinGroup(thread.id, user.id);
    navigate(`/chats/${thread.id}`);
  };

  const swipe = (kind: 'like' | 'dislike') => {
    if (!user) return;
    recordSwipe(user, pet.id, kind);
    toast(kind === 'like' ? { title: `Te gusta ${pet.name}`, body: 'Avisamos a su responsable.', emoji: '💗' } : { title: 'Anotado', body: `No te mostraremos a ${pet.name} en Descubrir.`, emoji: '👋' });
  };

  const health = [
    pet.vaccinated && 'Vacunas al día',
    pet.dewormed && 'Desparasitad' + (pet.sex === 'macho' ? 'o' : 'a'),
    pet.sterilized && 'Esterilizad' + (pet.sex === 'macho' ? 'o' : 'a'),
    pet.hypoallergenic && 'Hipoalergénic' + (pet.sex === 'macho' ? 'o' : 'a'),
  ].filter(Boolean) as string[];
  const social = [pet.goodWithKids && 'niños', pet.goodWithDogs && 'perros', pet.goodWithCats && 'gatos'].filter(Boolean) as string[];

  return (
    <div className="flex h-full flex-col" data-hu="HU-03">
      <div className="scroll-area flex-1 pb-4">
        {/* carousel */}
        <div className="relative aspect-[4/3.6] bg-cocoa">
          <AnimatePresence mode="wait">
            <motion.img key={photo} src={photos[photo]} alt={`Foto ${photo + 1} de ${pet.name}`} className="h-full w-full object-cover" initial={{ opacity: 0.4, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0.4 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} />
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cocoa-900/40 to-transparent" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3 pt-safe-t">
            <button onClick={() => navigate(-1)} aria-label="Volver" className="pressable rounded-full bg-white/90 p-2 shadow-raised backdrop-blur">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              {user && (
                <button onClick={() => setReporting(true)} aria-label="Reportar esta publicación" className="pressable rounded-full bg-white/90 p-2 shadow-raised backdrop-blur">
                  <Flag size={18} className="text-coral-600" />
                </button>
              )}
              <FavoriteButton pet={pet} />
            </div>
          </div>
          {photos.length > 1 && (
            <>
              <button aria-label="Foto anterior" onClick={() => setPhoto((p) => (p - 1 + photos.length) % photos.length)} className="pressable absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/75 p-1.5 shadow-soft backdrop-blur hover:bg-white">
                <ChevronLeft size={20} />
              </button>
              <button aria-label="Foto siguiente" onClick={() => setPhoto((p) => (p + 1) % photos.length)} className="pressable absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/75 p-1.5 shadow-soft backdrop-blur hover:bg-white">
                <ChevronRight size={20} />
              </button>
              <div className="absolute inset-x-0 bottom-9 flex justify-center gap-1.5">
                {photos.map((_, i) => (
                  <button key={i} aria-label={`Ver foto ${i + 1}`} onClick={() => setPhoto(i)} className={`h-1.5 rounded-full shadow-sm transition-all duration-slow ease-out ${i === photo ? 'w-6 bg-white' : 'w-1.5 bg-white/60'}`} />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="relative -mt-7 space-y-4 rounded-t-5xl bg-cream px-5 pt-5 shadow-[0_-12px_30px_-16px_rgba(46,26,18,.45)]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-4xl font-extrabold leading-none">{pet.name}</h1>
              <p className="mt-1.5 text-cocoa-500">
                {SPECIES_LABEL[pet.species]} · {pet.breed}
              </p>
              <p className="mt-1 flex items-center gap-1 text-sm text-cocoa-700">
                <MapPin size={15} className="text-terra" /> {pet.district}, Lima{match && ` · ${formatKm(match.distanceKm)}`}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              {match && available && <ScoreBadge score={match.score} className="text-lg" />}
              <StatusBadge pet={pet} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              ['Edad', ageLabel(pet.ageMonths)],
              ['Sexo', SEX_LABEL[pet.sex]],
              ['Tamaño', SIZE_LABEL[pet.size]],
            ].map(([k, v]) => (
              <div key={k} className="surface-2 rounded-2xl py-2.5">
                <p className="text-xs font-bold text-cocoa-400">{k}</p>
                <p className="font-display text-lg font-bold leading-tight">{v}</p>
              </div>
            ))}
          </div>

          {pet.personality.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {pet.personality.map((t) => (
                <Chip key={t} tone="terra">
                  {t}
                </Chip>
              ))}
            </div>
          )}

          {match && available && (
            <Card className="p-4 ring-1 ring-sage/15">
              <h2 className="flex items-center gap-2 text-lg font-bold" data-hu="HU-20">
                💞 ¿Por qué hacemos match?
              </h2>
              <div className="mt-3 space-y-2.5">
                {(Object.keys(match.breakdown) as MatchFactor[]).map((factor) => (
                  <BreakdownBar key={factor} factor={factor} value={match.breakdown[factor]} />
                ))}
              </div>
              <ul className="mt-3 space-y-1.5">
                {match.reasons.map((r) => (
                  <li key={r.factor} className="flex gap-2 text-sm">
                    <Check size={18} className="shrink-0 text-sage" /> <span>{r.text}</span>
                  </li>
                ))}
                {match.warnings.map((w) => (
                  <li key={w.factor + w.text} className="rounded-xl bg-honey-100/80 px-2.5 py-1.5 text-sm ring-1 ring-honey/20">
                    {w.text}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-cocoa-300">Calculado con tus respuestas del cuestionario · pesos heurísticos</p>
            </Card>
          )}

          {pet.about && (
            <section>
              <h2 className="text-xl font-bold">Sobre mí</h2>
              <p className="mt-1 leading-relaxed text-cocoa-700">{pet.about}</p>
            </section>
          )}
          {pet.story && (
            <section>
              <h2 className="text-xl font-bold">Mi historia</h2>
              <p className="mt-1 leading-relaxed text-cocoa-700">{pet.story}</p>
            </section>
          )}
          {(health.length > 0 || social.length > 0 || pet.specialCare) && (
            <Card className="space-y-2 p-4">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Syringe size={18} className="text-terra" /> Información adicional
              </h2>
              {health.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {health.map((h) => (
                    <Chip key={h} tone="sage">
                      ✓ {h}
                    </Chip>
                  ))}
                </div>
              )}
              {social.length > 0 && <p className="text-sm">Se lleva bien con {social.join(', ').replace(/, ([^,]*)$/, ' y $1')}.</p>}
              {pet.specialCare && <p className="text-sm"><b>Cuidados especiales:</b> {pet.specialCare}</p>}
            </Card>
          )}

          {owner && (
            <Card className="flex items-center gap-3 p-4">
              <Avatar src={owner.avatar} name={owner.name} size={48} />
              <div className="flex-1">
                <p className="text-xs font-bold text-cocoa-300">{owner.kind === 'albergue' ? 'Albergue responsable' : 'Responsable'}</p>
                <p className="font-bold">{owner.name}</p>
                {owner.district && <p className="text-xs text-cocoa-500">{owner.district}</p>}
              </div>
            </Card>
          )}

          {adoption && (
            <Card className="flex items-center gap-3 p-4" >
              <CalendarCheck className="text-terra" />
              <div className="flex-1 text-sm" data-hu="HU-10">
                <p className="font-bold">Tu solicitud de adopción</p>
                <p className="text-cocoa-500">
                  {formatDate(adoption.date)} · {adoption.time}
                </p>
              </div>
              <Chip tone={adoption.status === 'aceptada' ? 'sage' : adoption.status === 'rechazada' ? 'coral' : 'honey'}>{ADOPTION_STATUS_LABEL[adoption.status]}</Chip>
            </Card>
          )}

          <Link to="/guia" className="flex items-center gap-2 text-sm font-semibold text-terra underline underline-offset-4">
            <BookOpen size={16} /> Guía de adopción responsable (Ley 30407 y 31807)
          </Link>

          {isAdopter && (
            <button
              onClick={joinPetChat}
              className="pressable flex w-full items-center justify-center gap-2 rounded-2xl bg-white/70 py-3 text-sm font-bold text-cocoa-700 shadow-hairline hover:bg-white"
              data-hu="HU-09"
            >
              <MessageCircle size={16} /> Unirme al chat de la mascota
            </button>
          )}
        </div>
      </div>

      {isAdopter && (
        <div className="glass relative z-10 shrink-0 space-y-2 p-3 pb-safe-b">
          {!available ? (
            <p className="rounded-2xl bg-cocoa/[.06] p-3 text-center text-sm font-semibold">
              {pet.status === 'adoptada' ? `🎉 ${pet.name} ya encontró un hogar. No se aceptan nuevas solicitudes.` : 'Este perfil ya no está disponible para adopción.'}
            </p>
          ) : (
            <>
              {!myInteraction && (
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" icon={<X size={18} />} onClick={() => swipe('dislike')}>
                    No me gusta
                  </Button>
                  <Button variant="like" icon={<Heart size={18} fill="currentColor" />} onClick={() => swipe('like')}>
                    Me gusta
                  </Button>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={myMatch ? 'primary' : 'soft'}
                  icon={<MessageCircle size={18} />}
                  onClick={() => (thread ? navigate(`/chats/${thread.id}`) : toast({ title: 'El chat se habilita con el Match', body: myInterest ? 'Tu interés está pendiente de respuesta del responsable.' : 'Dale “Me gusta” para mostrar tu interés.', emoji: '💬' }))}
                >
                  {myMatch ? 'Chatear' : 'Contactar'}
                </Button>
                <Button variant="success" icon={<CalendarCheck size={18} />} data-tour="coordinate-btn" onClick={() => navigate(`/coordinar/${pet.id}`)}>
                  Coordinar
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      <Sheet open={reporting} onClose={() => setReporting(false)} title={`Reportar a ${pet.name}`}>
        <p className="mb-3 text-sm text-cocoa-500">Cuéntanos qué está mal con esta publicación. El equipo de KuyayPet la revisará.</p>
        <div className="mb-3 flex flex-wrap gap-2">
          {REPORT_REASONS.map((r) => (
            <Chip key={r} active={reportReason === r} onClick={() => setReportReason(r)}>
              {r}
            </Chip>
          ))}
        </div>
        <textarea rows={3} className="input resize-none" placeholder="Detalle (opcional)" value={reportDetail} onChange={(e) => setReportDetail(e.target.value)} aria-label="Detalle del reporte" />
        <Button block variant="danger" className="mt-3" disabled={!reportReason.trim()} onClick={sendReport}>
          Enviar reporte
        </Button>
      </Sheet>
    </div>
  );
}
