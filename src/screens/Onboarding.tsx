import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Check, LocateFixed } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Chip, IconButton } from '@/components/ui';
import { DISTRICTS, districtByName } from '@/data/districts';
import { useCurrentUser } from '@/services/auth';
import { saveAdopterProfile } from '@/services/users';
import { toast } from '@/services/ui';
import type { AdopterProfile, AgePref, Size, Species } from '@/types';

type Option<T> = { value: T; emoji: string; label: string; hint?: string };

const DEFAULT: AdopterProfile = {
  district: 'Miraflores',
  location: { lat: -12.1211, lng: -77.0297 },
  radiusKm: 10,
  housing: 'departamento',
  homeSize: 'mediana',
  hoursAlone: '3-5',
  activity: 'moderado',
  experience: 'he_tenido',
  kids: 'no',
  otherPets: 'ninguna',
  allergies: false,
  prefs: { species: [], sizes: [], ages: [], sex: 'cualquiera' },
};

function Options<T extends string | boolean>({ options, value, onChange }: { options: Option<T>[]; value: T; onChange: (v: T) => void }) {
  const reduce = useReducedMotion();
  return (
    <div className="grid gap-2.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <motion.button
            key={String(o.value)}
            type="button"
            whileTap={reduce ? undefined : { scale: 0.98 }}
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={`flex items-center gap-4 rounded-3xl p-3.5 text-left transition-shadow duration-base ease-out ${
              active ? 'bg-terra-100/70 shadow-soft ring-2 ring-terra' : 'surface-2 ring-1 ring-transparent hover:shadow-card'
            }`}
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cream-100 text-3xl">{o.emoji}</span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-lg font-bold leading-tight text-cocoa-900">{o.label}</span>
              {o.hint && <span className="mt-0.5 block text-sm leading-snug text-cocoa-500">{o.hint}</span>}
            </span>
            <span
              aria-hidden
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors duration-base ${active ? 'bg-terra text-white' : 'border border-cocoa/20 bg-white/60'}`}
            >
              {active && <Check size={14} strokeWidth={3.5} />}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

export function Onboarding() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const [p, setP] = useState<AdopterProfile>(user?.profile ?? DEFAULT);
  const [step, setStep] = useState(0);
  const [locating, setLocating] = useState(false);
  const reduce = useReducedMotion();
  const up = (patch: Partial<AdopterProfile>) => setP((x) => ({ ...x, ...patch }));

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast({ title: 'Tu navegador no permite geolocalización', tone: 'error' });
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        up({ location: { lat: pos.coords.latitude, lng: pos.coords.longitude }, district: 'Mi ubicación actual' });
        toast({ title: 'Ubicación detectada', emoji: '📍' });
      },
      () => {
        setLocating(false);
        toast({ title: 'No pudimos obtener tu ubicación', body: 'Elige tu distrito de la lista.', tone: 'error' });
      },
      { timeout: 8000 },
    );
  };

  const steps: { q: string; sub?: string; body: React.ReactNode }[] = [
    {
      q: '¿Dónde vives?',
      sub: 'Para mostrarte mascotas cerca de ti.',
      body: (
        <Card className="space-y-4 p-4">
          <Button variant="soft" block icon={<LocateFixed size={18} />} onClick={useMyLocation} disabled={locating}>
            {locating ? 'Buscando…' : 'Usar mi ubicación actual'}
          </Button>
          <div>
            <label htmlFor="district" className="label">
              O elige tu distrito
            </label>
            <select id="district" className="input" value={DISTRICTS.some((d) => d.name === p.district) ? p.district : ''} onChange={(e) => up({ district: e.target.value, location: districtByName(e.target.value) })}>
              <option value="" disabled>
                {p.district}
              </option>
              {DISTRICTS.map((d) => (
                <option key={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="radius" className="label">
              Distancia máxima: <span className="tabular-nums text-terra-600">{p.radiusKm} km</span>
            </label>
            <input id="radius" type="range" min={1} max={20} value={p.radiusKm} onChange={(e) => up({ radiusKm: Number(e.target.value) })} className="w-full accent-terra" />
          </div>
        </Card>
      ),
    },
    {
      q: '¿Cómo es tu hogar?',
      body: (
        <Options
          value={p.housing}
          onChange={(housing) => up({ housing })}
          options={[
            { value: 'departamento', emoji: '🏢', label: 'Departamento' },
            { value: 'casa_sin_patio', emoji: '🏠', label: 'Casa sin patio' },
            { value: 'casa_con_patio', emoji: '🏡', label: 'Casa con patio o jardín' },
          ]}
        />
      ),
    },
    {
      q: '¿Qué tan amplio es?',
      body: (
        <Options
          value={p.homeSize}
          onChange={(homeSize) => up({ homeSize })}
          options={[
            { value: 'pequena', emoji: '🛋️', label: 'Pequeño', hint: 'Hasta 60 m²' },
            { value: 'mediana', emoji: '🪴', label: 'Mediano', hint: '60 – 120 m²' },
            { value: 'grande', emoji: '🌳', label: 'Grande', hint: 'Más de 120 m²' },
          ]}
        />
      ),
    },
    {
      q: '¿Cuántas horas estaría sola tu mascota?',
      sub: 'En un día normal de semana.',
      body: (
        <Options
          value={p.hoursAlone}
          onChange={(hoursAlone) => up({ hoursAlone })}
          options={[
            { value: '0-2', emoji: '🏡', label: '0 a 2 horas', hint: 'Casi siempre hay alguien' },
            { value: '3-5', emoji: '🕒', label: '3 a 5 horas' },
            { value: '6-8', emoji: '💼', label: '6 a 8 horas', hint: 'Jornada de oficina' },
            { value: '8+', emoji: '🌙', label: 'Más de 8 horas' },
          ]}
        />
      ),
    },
    {
      q: '¿Cuál es tu estilo de vida?',
      body: (
        <Options
          value={p.activity}
          onChange={(activity) => up({ activity })}
          options={[
            { value: 'sedentario', emoji: '📚', label: 'Tranquilo', hint: 'Series, libros y siestas' },
            { value: 'moderado', emoji: '🚶', label: 'Moderado', hint: 'Paseos diarios por el parque' },
            { value: 'muy_activo', emoji: '🏃', label: 'Muy activo', hint: 'Corro, hago trekking, playa' },
          ]}
        />
      ),
    },
    {
      q: '¿Tienes experiencia con mascotas?',
      body: (
        <Options
          value={p.experience}
          onChange={(experience) => up({ experience })}
          options={[
            { value: 'primera', emoji: '🌱', label: 'Sería mi primera mascota' },
            { value: 'he_tenido', emoji: '🐕', label: 'Ya he tenido mascotas' },
            { value: 'experto', emoji: '🏅', label: 'Tengo mucha experiencia', hint: 'Rescates, adiestramiento…' },
          ]}
        />
      ),
    },
    {
      q: '¿Quiénes viven contigo?',
      body: (
        <Card className="space-y-5 p-4">
          <div>
            <p className="label">Niños en casa</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['no', 'No hay niños'],
                  ['mayores_6', 'Mayores de 6 años'],
                  ['pequenos', 'Niños pequeños'],
                ] as const
              ).map(([v, l]) => (
                <Chip key={v} active={p.kids === v} onClick={() => up({ kids: v })}>
                  {l}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="label">Otras mascotas</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['ninguna', 'Ninguna'],
                  ['perro', '🐶 Perro'],
                  ['gato', '🐱 Gato'],
                  ['ambos', 'Perro y gato'],
                ] as const
              ).map(([v, l]) => (
                <Chip key={v} active={p.otherPets === v} onClick={() => up({ otherPets: v })}>
                  {l}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="label">¿Alguien tiene alergia a perros o gatos?</p>
            <div className="flex gap-2">
              <Chip active={!p.allergies} onClick={() => up({ allergies: false })}>
                No
              </Chip>
              <Chip active={p.allergies} onClick={() => up({ allergies: true })}>
                Sí, prefiero hipoalergénicos
              </Chip>
            </div>
          </div>
        </Card>
      ),
    },
    {
      q: '¿Qué compañero buscas?',
      sub: 'Déjalo vacío si te da igual. Son preferencias suaves.',
      body: (
        <Card className="space-y-5 p-4">
          <div>
            <p className="label">Especie</p>
            <div className="flex gap-2">
              {(['perro', 'gato'] as Species[]).map((s) => (
                <Chip key={s} active={p.prefs.species.includes(s)} onClick={() => up({ prefs: { ...p.prefs, species: toggle(p.prefs.species, s) } })}>
                  {s === 'perro' ? '🐶 Perro' : '🐱 Gato'}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="label">Tamaño</p>
            <div className="flex gap-2">
              {(
                [
                  ['S', 'Pequeño'],
                  ['M', 'Mediano'],
                  ['L', 'Grande'],
                ] as [Size, string][]
              ).map(([s, l]) => (
                <Chip key={s} active={p.prefs.sizes.includes(s)} onClick={() => up({ prefs: { ...p.prefs, sizes: toggle(p.prefs.sizes, s) } })}>
                  {l}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="label">Edad</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['cachorro', 'Cachorro'],
                  ['joven', 'Joven'],
                  ['adulto', 'Adulto'],
                  ['senior', 'Senior'],
                ] as [AgePref, string][]
              ).map(([a, l]) => (
                <Chip key={a} active={p.prefs.ages.includes(a)} onClick={() => up({ prefs: { ...p.prefs, ages: toggle(p.prefs.ages, a) } })}>
                  {l}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="label">Sexo</p>
            <div className="flex gap-2">
              {(
                [
                  ['cualquiera', 'Me da igual'],
                  ['hembra', 'Hembra'],
                  ['macho', 'Macho'],
                ] as const
              ).map(([s, l]) => (
                <Chip key={s} active={p.prefs.sex === s} onClick={() => up({ prefs: { ...p.prefs, sex: s } })}>
                  {l}
                </Chip>
              ))}
            </div>
          </div>
        </Card>
      ),
    },
  ];

  const last = step === steps.length - 1;
  const finish = () => {
    if (!user) return;
    saveAdopterProfile(user.id, p);
    toast({ title: '¡Preferencias guardadas!', body: 'Calculamos tu compatibilidad con cada mascota.', emoji: '✨' });
    navigate('/descubrir', { replace: true });
  };

  return (
    <div className="flex h-full flex-col" data-hu="HU-20" data-tour="onboarding">
      <div className="flex items-center gap-3 px-4 pb-2 pt-safe-t">
        <IconButton label="Atrás" size="sm" onClick={() => (step === 0 ? navigate(-1) : setStep((s) => s - 1))} className="!shadow-none">
          <ArrowLeft size={20} />
        </IconButton>
        <div
          className="flex flex-1 gap-1.5"
          role="progressbar"
          aria-label={`Pregunta ${step + 1} de ${steps.length}`}
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-valuenow={step + 1}
        >
          {steps.map((_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-slow ease-out ${i <= step ? 'bg-terra' : 'bg-cocoa/10'}`} />
          ))}
        </div>
        <span className="w-12 shrink-0 text-right text-sm font-semibold tabular-nums text-cocoa-500">
          {step + 1}/{steps.length}
        </span>
      </div>
      <div className="scroll-area relative min-h-0 flex-1 px-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            data-tour="onboarding-q"
            initial={{ x: reduce ? 0 : 32, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: reduce ? 0 : -32, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="pb-6 pt-4"
          >
            <h1 className="text-3xl font-extrabold leading-tight text-cocoa-900">{steps[step].q}</h1>
            {steps[step].sub && <p className="mt-1.5 text-[0.95rem] leading-snug text-cocoa-500">{steps[step].sub}</p>}
            <div className="mt-5">{steps[step].body}</div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="glass relative z-10 shrink-0 px-4 pb-safe-b pt-3">
        <Button size="lg" block onClick={() => (last ? finish() : setStep((s) => s + 1))}>
          {last ? '¡Ver mis mascotas compatibles!' : 'Continuar'}
        </Button>
      </div>
    </div>
  );
}
