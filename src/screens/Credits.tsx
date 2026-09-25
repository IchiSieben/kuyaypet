import { ArrowLeft, Code2, Link2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LogoMark } from '@/components/brand/Logo';
import { Avatar, Card } from '@/components/ui';
import team from '../../data/team.json';

export function Credits() {
  const navigate = useNavigate();
  return (
    <div className="scroll-area h-full px-5 pb-8 pt-4" data-hu="creditos">
      <button onClick={() => navigate(-1)} className="-ml-2 flex items-center gap-1 rounded-full px-2 py-1 font-semibold text-cocoa-500 hover:bg-cream-200">
        <ArrowLeft size={18} /> Volver
      </button>
      <div className="mx-auto mt-2 w-44">
        <LogoMark />
      </div>
      <h1 className="mt-3 text-center text-3xl font-extrabold">Equipo KuyayPet</h1>
      <p className="text-center text-sm text-cocoa-500">{team.curso}</p>
      <p className="text-center text-sm text-cocoa-500">Docente asesor: {team.docente}</p>
      <ul className="mt-5 space-y-3">
        {team.integrantes.map((m) => (
          <li key={m.nombre}>
            <Card className="flex items-center gap-3 p-3.5">
              <Avatar src={m.foto || undefined} name={m.nombre} size={52} />
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-bold leading-tight">{m.nombre}</p>
                <p className="text-sm text-cocoa-500">{m.rol}</p>
                <p className="mt-0.5 text-xs text-cocoa-300">{m.hus.length ? `HU: ${m.hus.join(', ')}` : 'HU por asignar'}</p>
              </div>
              <div className="flex gap-1">
                {m.github && (
                  <a href={m.github} target="_blank" rel="noreferrer" aria-label={`GitHub de ${m.nombre}`} className="rounded-full p-2 hover:bg-cream-200">
                    <Code2 size={18} />
                  </a>
                )}
                {m.linkedin && (
                  <a href={m.linkedin} target="_blank" rel="noreferrer" aria-label={`LinkedIn de ${m.nombre}`} className="rounded-full p-2 hover:bg-cream-200">
                    <Link2 size={18} />
                  </a>
                )}
              </div>
            </Card>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-center font-hand text-2xl text-terra">Adopta · Conecta · Transforma ♥</p>
      <p className="mt-2 text-center text-xs text-cocoa-300">
        Prototipo académico. Fotos de mascotas: Dog CEO y The Cat API; retratos: randomuser.me. Personas y albergues son ficticios.
      </p>
    </div>
  );
}
