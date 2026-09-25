// Info (UML): guía de adopción responsable (HU-14). Accesible con o sin sesión.
import { ArrowLeft, ChevronDown, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui';

interface GuideSection {
  id: string;
  title: string;
  emoji: string;
  keywords: string[];
  body: string[];
}

const SECTIONS: GuideSection[] = [
  {
    id: 'requisitos',
    title: 'Requisitos para adoptar',
    emoji: '📋',
    keywords: ['requisito', 'edad', 'documento', 'dni', 'mayoria'],
    body: [
      'Ser mayor de edad y presentar tu documento de identidad al responsable o albergue.',
      'Contar con un lugar estable donde viva la mascota y con el acuerdo de todas las personas del hogar.',
      'Estar dispuesto/a a una breve conversación o visita previa con quien publica a la mascota: es parte del cuidado responsable, no un trámite burocrático.',
      'Comprometerte a los cuidados básicos: alimentación, espacio, tiempo y atención veterinaria.',
    ],
  },
  {
    id: 'hogar',
    title: 'Preparar tu hogar',
    emoji: '🏡',
    keywords: ['hogar', 'casa', 'departamento', 'preparar', 'espacio'],
    body: [
      'Asegura ventanas, balcones y rejas, sobre todo si adoptas un gato o un cachorro curioso.',
      'Ten listos desde el primer día: cama o espacio de descanso, comederos, bebedero, correa y arnés (perros) o arenero (gatos).',
      'Retira plantas tóxicas, cables sueltos y productos de limpieza al alcance.',
      'Dale unos días de adaptación tranquila antes de presentarlo a toda la familia, visitas u otras mascotas.',
    ],
  },
  {
    id: 'salud',
    title: 'Vacunas y salud',
    emoji: '💉',
    keywords: ['vacuna', 'salud', 'veterinario', 'desparasitacion', 'antirrabica'],
    body: [
      'Revisa la cartilla de vacunación de la mascota antes de llevártela; en el perfil se indica si ya tiene vacunas y desparasitación al día.',
      'Programa un control veterinario dentro de las primeras semanas, aunque llegue con sus vacunas vigentes.',
      'El esquema de vacunas (incluida la antirrábica) y desparasitación varía según edad y estado de salud: consúltalo siempre con un médico veterinario o un centro autorizado por el MINSA.',
    ],
  },
  {
    id: 'esterilizacion',
    title: 'Esterilización',
    emoji: '🩺',
    keywords: ['esterilizacion', 'castracion', 'reproduccion'],
    body: [
      'La esterilización ayuda a controlar la sobrepoblación de mascotas abandonadas y suele mejorar la salud y conducta del animal.',
      'Muchas mascotas en KuyayPet ya están esterilizadas; revisa el perfil de la mascota para confirmarlo.',
      'La edad y el procedimiento adecuado dependen de cada animal: coordina la evaluación con un médico veterinario de confianza.',
    ],
  },
  {
    id: 'legal',
    title: 'Marco legal en Perú',
    emoji: '⚖️',
    keywords: ['ley', 'legal', '30407', '31807', 'maltrato', 'normativa'],
    body: [
      'La Ley N.º 30407, Ley de Protección y Bienestar Animal, establece el deber de brindar un trato digno a los animales y sanciona el maltrato y abandono.',
      'La Ley N.º 31807 regula la adopción e identificación de animales de compañía, promoviendo la adopción responsable frente a la compra.',
      'Esta guía es informativa y no reemplaza el texto oficial de las normas: para el detalle exacto de artículos y procedimientos, consulta la norma completa o a un profesional (veterinario, municipalidad o especialista legal).',
    ],
  },
  {
    id: 'seguimiento',
    title: 'Seguimiento post-adopción',
    emoji: '🤝',
    keywords: ['seguimiento', 'despues', 'adaptacion', 'contrato'],
    body: [
      'Es normal que la mascota necesite días o semanas para adaptarse; mantén rutinas y paciencia.',
      'Algunos responsables o albergues piden mantenerse en contacto (fotos, mensajes) las primeras semanas; revísalo con quien te la entrega, en persona o por el chat de KuyayPet.',
      'Si surge un problema de salud o convivencia, contacta primero al responsable original y, de ser necesario, a un veterinario.',
    ],
  },
  {
    id: 'faq',
    title: 'Preguntas frecuentes',
    emoji: '❓',
    keywords: ['pregunta', 'frecuente', 'faq', 'costo', 'devolucion'],
    body: [
      '¿La adopción tiene costo? En KuyayPet la adopción en sí es gratuita; algunos responsables pueden pedir cubrir gastos veterinarios ya realizados (vacunas, esterilización). Siempre se conversa antes por el chat.',
      '¿Puedo devolver a la mascota si no funciona? Conversa primero con el responsable original; el bienestar del animal es la prioridad y casi siempre hay una solución conversada.',
      '¿Qué pasa si veo maltrato o algo sospechoso? Repórtalo desde el perfil de la mascota o del usuario; el equipo de moderación de KuyayPet lo revisa.',
    ],
  },
];

function highlight(text: string, query: string) {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig'));
  return parts.map((part, i) => (part.toLowerCase() === query.toLowerCase() ? <mark key={i} className="rounded bg-honey-100 px-0.5">{part}</mark> : part));
}

export function Guide() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>('requisitos');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SECTIONS;
    return SECTIONS.filter((s) => s.keywords.some((k) => k.includes(q) || q.includes(k)) || s.title.toLowerCase().includes(q) || s.body.some((b) => b.toLowerCase().includes(q)));
  }, [query]);

  return (
    <div className="scroll-area h-full px-5 pb-8 pt-4" data-hu="HU-14">
      <button onClick={() => navigate(-1)} className="-ml-2 flex items-center gap-1 rounded-full px-2 py-1 font-semibold text-cocoa-500 hover:bg-cream-200">
        <ArrowLeft size={18} /> Volver
      </button>
      <h1 className="mt-3 text-3xl font-extrabold">Guía de adopción responsable</h1>
      <p className="text-cocoa-500">Información general para adoptar con responsabilidad en Lima. Ante dudas específicas, consulta siempre a un veterinario o al MINSA.</p>

      <div className="mt-4 flex items-center gap-2 rounded-2xl border-2 border-cream-300 bg-white px-3.5 py-2.5 focus-within:border-terra">
        <Search size={18} className="text-cocoa-300" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar (ej. vacunas, contrato, seguimiento)…"
          aria-label="Buscar en la guía"
          className="w-full bg-transparent outline-none placeholder:text-cocoa-300"
        />
      </div>

      {results.length === 0 ? (
        <p className="mt-6 text-center text-cocoa-500">No encontramos resultados para “{query}”. Prueba con otra palabra.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {results.map((s) => {
            const isOpen = open === s.id || (!!query.trim() && results.length <= 3);
            return (
              <Card key={s.id} className="overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : s.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                >
                  <span className="text-2xl">{s.emoji}</span>
                  <span className="flex-1 font-bold">{highlight(s.title, query)}</span>
                  <ChevronDown size={18} className={`text-cocoa-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="space-y-2 px-4 pb-4 text-sm leading-relaxed text-cocoa-700">
                    {s.body.map((p, i) => (
                      <p key={i}>{highlight(p, query)}</p>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
      <p className="mt-6 text-center text-xs text-cocoa-300">Contenido informativo elaborado para fines académicos. No reemplaza asesoría veterinaria o legal profesional.</p>
    </div>
  );
}
