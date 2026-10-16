// HU-11 + HU-16: register a pet with a 3-step wizard. Stays "Pendiente" until the admin approves it (ADR-05).
import { ArrowLeft, Camera, Check, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Chip, PageHeader } from '@/components/ui';
import { DISTRICTS } from '@/data/districts';
import { useCurrentUser } from '@/services/auth';
import { processImage, MAX_PET_PHOTOS } from '@/services/media';
import { createPublication, validateNewPet, type NewPetInput } from '@/services/publications';
import { confirm, toast } from '@/services/ui';
import type { Sex, Size, Species } from '@/types';

const PERSONALITY_OPTIONS = ['Cariñoso/a', 'Sociable', 'Guardián/a', 'Curioso/a', 'Tranquilo/a', 'Juguetón/a', 'Dormilón/a'];

const EMPTY: NewPetInput = {
  name: '',
  species: 'perro',
  breed: '',
  ageMonths: 6,
  sex: 'macho',
  size: 'M',
  district: '',
  photos: [],
  personality: [],
  goodWithKids: true,
  goodWithDogs: true,
  goodWithCats: false,
  energy: 3,
  aloneTolerance: 3,
  vaccinated: false,
  sterilized: false,
  dewormed: false,
  about: '',
  story: '',
  specialCare: '',
};

const STEP_FIELDS: (keyof NewPetInput)[][] = [
  ['name', 'species', 'breed', 'ageMonths', 'sex', 'size', 'district'],
  [],
  [],
];

const FIELD_LABEL: Record<string, string> = {
  name: 'Nombre',
  species: 'Especie',
  breed: 'Raza',
  ageMonths: 'Edad',
  sex: 'Sexo',
  size: 'Tamaño',
  district: 'Distrito',
};

const STEP_NAMES = ['Datos', 'Fotos', 'Detalles'];

/** Ordered progress for the three steps: done steps get a check, the current one is marked for assistive tech. */
function Stepper({ step }: { step: number }) {
  return (
    <ol className="mb-5 flex items-start" aria-label="Pasos del registro">
      {STEP_NAMES.map((name, i) => {
        const done = i < step;
        const current = i === step;
        return (
          <li key={name} className="flex flex-1 items-start" aria-current={current ? 'step' : undefined}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full font-display text-sm font-extrabold tabular-nums ${
                  done ? 'bg-sage text-white' : current ? 'bg-terra text-white shadow-raised' : 'bg-white text-cocoa-500 ring-1 ring-cocoa/10'
                }`}
              >
                {done ? <Check size={16} strokeWidth={3} /> : i + 1}
              </span>
              <span className={`text-xs font-bold ${current ? 'text-cocoa-900' : 'text-cocoa-500'}`}>{name}</span>
            </div>
            {i < STEP_NAMES.length - 1 && <span className={`mx-2 mt-4 h-0.5 flex-1 rounded-full ${done ? 'bg-sage' : 'bg-cocoa/10'}`} aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

export function NewPet() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<NewPetInput>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoError, setPhotoError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const up = (patch: Partial<NewPetInput>) => setForm((f) => ({ ...f, ...patch }));
  const toggleTag = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  if (!user) return null;

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setPhotoError('');
    const remaining = MAX_PET_PHOTOS - form.photos.length;
    const batch = Array.from(files).slice(0, Math.max(0, remaining));
    for (const file of batch) {
      const result = await processImage(file);
      if (!result.ok) {
        setPhotoError(result.error);
        continue;
      }
      setForm((f) => ({ ...f, photos: [...f.photos, result.dataUrl] }));
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const goNext = () => {
    if (step === 0) {
      const stepErrors = validateNewPet(form);
      const relevant = Object.fromEntries(Object.entries(stepErrors).filter(([k]) => STEP_FIELDS[0].includes(k as keyof NewPetInput)));
      if (Object.keys(relevant).length > 0) return setErrors(relevant);
    }
    setErrors({});
    setStep((s) => Math.min(2, s + 1));
  };

  const publish = async () => {
    const allErrors = validateNewPet(form);
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setStep(0);
      toast({ title: 'Faltan datos obligatorios', body: Object.keys(allErrors).map((k) => FIELD_LABEL[k] ?? k).join(', '), tone: 'error' });
      return;
    }
    const ok = await confirm({
      title: '¿Publicar mascota?',
      body: `${form.name} quedará "En revisión" hasta que el administrador apruebe la publicación.`,
      emoji: '🐾',
      confirmLabel: 'Publicar',
    });
    if (!ok) return;
    const result = createPublication(user.id, form);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    toast({ title: '¡Mascota registrada!', body: 'Quedará en revisión hasta que el admin la apruebe.', emoji: '🎉', tone: 'success' });
    navigate('/responsable', { replace: true });
  };

  const back = () => (step === 0 ? navigate(-1) : setStep((s) => s - 1));

  return (
    <div className="h-full" data-hu="HU-11">
      <div className="scroll-area h-full">
        <div className="flex min-h-full flex-col">
          <div className="flex-1 px-4">
            <div className="pt-2">
              <div className="flex min-h-11 items-center">
                <button
                  type="button"
                  onClick={back}
                  className="pressable -ml-1 inline-flex h-11 items-center gap-1.5 rounded-full pl-1 pr-3.5 font-display font-bold text-cocoa-700 hover:bg-white/70 hover:text-terra"
                >
                  <span className="surface-3 inline-flex h-9 w-9 items-center justify-center rounded-full">
                    <ArrowLeft size={18} strokeWidth={2.4} />
                  </span>
                  {step === 0 ? 'Volver' : 'Atrás'}
                </button>
              </div>
            </div>
            <PageHeader title="Registrar mascota" subtitle={`Paso ${step + 1} de 3`} className="!pt-1" />
            <Stepper step={step} />
            {step === 0 && (
              <Card className="space-y-4 p-4">
                <div>
                  <label htmlFor="name" className="label">
                    Nombre *
                  </label>
                  <input id="name" className={`input ${errors.name ? 'ring-2 ring-coral' : ''}`} aria-invalid={!!errors.name} value={form.name} onChange={(e) => up({ name: e.target.value })} />
                </div>
                <div>
                  <p className="label">Especie *</p>
                  <div className="flex gap-2">
                    {(['perro', 'gato'] as Species[]).map((s) => (
                      <Chip key={s} active={form.species === s} onClick={() => up({ species: s })}>
                        {s === 'perro' ? '🐶 Perro' : '🐱 Gato'}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="breed" className="label">
                    Raza *
                  </label>
                  <input id="breed" className={`input ${errors.breed ? 'ring-2 ring-coral' : ''}`} aria-invalid={!!errors.breed} value={form.breed} onChange={(e) => up({ breed: e.target.value })} placeholder="Ej. Mestizo, Labrador…" />
                </div>
                <div>
                  <label htmlFor="age" className="label">
                    Edad en meses *
                  </label>
                  <input id="age" type="number" min={0} className={`input tabular-nums ${errors.ageMonths ? 'ring-2 ring-coral' : ''}`} aria-invalid={!!errors.ageMonths} value={form.ageMonths} onChange={(e) => up({ ageMonths: Number(e.target.value) })} />
                </div>
                <div>
                  <p className="label">Sexo *</p>
                  <div className="flex gap-2">
                    {(['macho', 'hembra'] as Sex[]).map((s) => (
                      <Chip key={s} active={form.sex === s} onClick={() => up({ sex: s })}>
                        {s === 'macho' ? 'Macho' : 'Hembra'}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="label">Tamaño *</p>
                  <div className="flex gap-2">
                    {(
                      [
                        ['S', 'Pequeño'],
                        ['M', 'Mediano'],
                        ['L', 'Grande'],
                      ] as [Size, string][]
                    ).map(([s, l]) => (
                      <Chip key={s} active={form.size === s} onClick={() => up({ size: s })}>
                        {l}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="district" className="label">
                    Distrito *
                  </label>
                  <select id="district" className={`input ${errors.district ? 'ring-2 ring-coral' : ''}`} aria-invalid={!!errors.district} value={form.district} onChange={(e) => up({ district: e.target.value })}>
                    <option value="" disabled>
                      Elige un distrito
                    </option>
                    {DISTRICTS.map((d) => (
                      <option key={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                {Object.keys(errors).length > 0 && (
                  <p role="alert" className="rounded-2xl bg-coral-100 px-4 py-2.5 text-sm font-semibold text-coral-600">
                    Completa los campos obligatorios: {Object.keys(errors).map((k) => FIELD_LABEL[k] ?? k).join(', ')}.
                  </p>
                )}
              </Card>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <Card className="p-4">
                  <p className="label">Fotos (máximo {MAX_PET_PHOTOS})</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {form.photos.map((src, i) => (
                      <div key={i} className="relative aspect-square overflow-hidden rounded-2xl bg-cream-200">
                        <img src={src} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          aria-label="Quitar foto"
                          onClick={() => up({ photos: form.photos.filter((_, idx) => idx !== i) })}
                          className="glass pressable absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-cocoa"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {form.photos.length < MAX_PET_PHOTOS && (
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="pressable flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-cocoa/20 bg-cream-100/60 text-cocoa-500 hover:border-terra hover:text-terra"
                        aria-label="Agregar foto"
                      >
                        <Camera size={26} />
                      </button>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
                  {photoError && (
                    <p role="alert" className="mt-3 rounded-2xl bg-coral-100 px-4 py-2.5 text-sm font-semibold text-coral-600">
                      {photoError}
                    </p>
                  )}
                </Card>

                <Card className="space-y-4 p-4">
                  <div>
                    <p className="label">Etiquetas automáticas</p>
                    <div className="flex flex-wrap gap-2">
                      <Chip tone="terra">{form.species === 'perro' ? '🐶 Perro' : '🐱 Gato'}</Chip>
                      <Chip tone="honey">{form.sex === 'macho' ? 'Macho' : 'Hembra'}</Chip>
                      <Chip tone="sage">{form.size === 'S' ? 'Pequeño' : form.size === 'M' ? 'Mediano' : 'Grande'}</Chip>
                      <Chip>{form.ageMonths} meses</Chip>
                    </div>
                  </div>
                  <div>
                    <p className="label">Personalidad</p>
                    <div className="flex flex-wrap gap-2">
                      {PERSONALITY_OPTIONS.map((t) => (
                        <Chip key={t} active={form.personality.includes(t)} onClick={() => up({ personality: toggleTag(form.personality, t) })}>
                          {t}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <Card className="space-y-4 p-4">
                  <div>
                    <label htmlFor="about" className="label">
                      Sobre mí
                    </label>
                    <textarea id="about" rows={3} className="input resize-none" value={form.about} onChange={(e) => up({ about: e.target.value })} />
                  </div>
                  <div>
                    <label htmlFor="story" className="label">
                      Historia (opcional)
                    </label>
                    <textarea id="story" rows={3} className="input resize-none" value={form.story} onChange={(e) => up({ story: e.target.value })} />
                  </div>
                  <div>
                    <label htmlFor="care" className="label">
                      Cuidados especiales (opcional)
                    </label>
                    <textarea id="care" rows={2} className="input resize-none" value={form.specialCare} onChange={(e) => up({ specialCare: e.target.value })} />
                  </div>
                </Card>
                <Card className="space-y-4 p-4">
                  <div>
                    <p className="label">Salud</p>
                    <div className="flex flex-wrap gap-2">
                      <Chip active={form.vaccinated} onClick={() => up({ vaccinated: !form.vaccinated })}>
                        ✓ Vacunada
                      </Chip>
                      <Chip active={form.sterilized} onClick={() => up({ sterilized: !form.sterilized })}>
                        ✓ Esterilizada
                      </Chip>
                      <Chip active={form.dewormed} onClick={() => up({ dewormed: !form.dewormed })}>
                        ✓ Desparasitada
                      </Chip>
                    </div>
                  </div>
                  <div>
                    <p className="label">Se lleva bien con</p>
                    <div className="flex flex-wrap gap-2">
                      <Chip active={form.goodWithKids} onClick={() => up({ goodWithKids: !form.goodWithKids })}>
                        Niños
                      </Chip>
                      <Chip active={form.goodWithDogs} onClick={() => up({ goodWithDogs: !form.goodWithDogs })}>
                        Perros
                      </Chip>
                      <Chip active={form.goodWithCats} onClick={() => up({ goodWithCats: !form.goodWithCats })}>
                        Gatos
                      </Chip>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="energy" className="label">
                      Nivel de energía: <span className="tabular-nums text-terra">{form.energy}/5</span>
                    </label>
                    <input id="energy" type="range" min={1} max={5} value={form.energy} onChange={(e) => up({ energy: Number(e.target.value) })} className="w-full accent-terra" />
                  </div>
                  <div>
                    <label htmlFor="alone" className="label">
                      Tolerancia a quedarse sola/o: <span className="tabular-nums text-terra">{form.aloneTolerance}/5</span>
                    </label>
                    <input id="alone" type="range" min={1} max={5} value={form.aloneTolerance} onChange={(e) => up({ aloneTolerance: Number(e.target.value) })} className="w-full accent-terra" />
                  </div>
                </Card>
              </div>
            )}
            <div className="h-6" aria-hidden />
          </div>

          <div className="glass sticky bottom-0 z-10 px-4 pb-safe-b pt-3">
            {step < 2 ? (
              <Button block onClick={goNext}>
                Continuar
              </Button>
            ) : (
              <Button block variant="success" onClick={publish}>
                Publicar mascota
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
