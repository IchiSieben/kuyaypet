import { lazy, Suspense, useMemo, useState } from 'react';
import { LocateFixed, SlidersHorizontal, X } from 'lucide-react';
import { Button, Chip, EmptyState, PageHeader, Sheet, Skeleton } from '@/components/ui';
import { PetCard } from '@/components/PetCard';
import { formatKm } from '@/lib/match';
import { DISTRICTS, districtByName } from '@/data/districts';
import { isAvailable, usePets } from '@/services/pets';
import { breedsOf, EMPTY_FILTERS, filterPets, nearbyPets, type PetFilters } from '@/services/search';
import { toast } from '@/services/ui';
import type { GeoPoint, Sex, Size, Species } from '@/types';

function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

// Leaflet only loads when someone opens the map view (ADR-14).
const PetMap = lazy(() => import('@/components/PetMap'));

/** HU-02 (grilla) + HU-04 (filtros) + HU-05 (cercanía). */
export function Browse() {
  const pets = usePets();
  const available = useMemo(() => pets.filter(isAvailable), [pets]);
  const breeds = useMemo(() => breedsOf(available), [available]);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draft, setDraft] = useState<PetFilters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<PetFilters>(EMPTY_FILTERS);

  const [district, setDistrict] = useState('');
  const [radiusKm, setRadiusKm] = useState(10);
  const [locating, setLocating] = useState(false);
  const [origin, setOrigin] = useState<GeoPoint | null>(null);
  const [originLabel, setOriginLabel] = useState('');
  const [searched, setSearched] = useState(false);
  const [view, setView] = useState<'lista' | 'mapa'>('lista');

  const filtered = useMemo(() => filterPets(available, applied), [available, applied]);

  const results = useMemo(() => {
    if (!origin) return filtered.map((pet) => ({ pet, distanceKm: undefined as number | undefined }));
    return nearbyPets(filtered, origin, radiusKm).map((r) => ({ pet: r.pet, distanceKm: r.distanceKm }));
  }, [filtered, origin, radiusKm]);

  const openFilters = () => {
    setDraft(applied);
    setFiltersOpen(true);
  };
  const applyFilters = () => {
    setApplied(draft);
    setFiltersOpen(false);
  };
  const clearFilters = () => {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: 'Tu navegador no permite geolocalización', body: 'Elige tu distrito de la lista.', tone: 'error' });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setOriginLabel('tu ubicación actual');
        setDistrict('');
        setSearched(true);
        toast({ title: 'Ubicación detectada', emoji: '📍' });
      },
      () => {
        setLocating(false);
        toast({ title: 'No pudimos obtener tu ubicación', body: 'Elige tu distrito de la lista y usa “Buscar”.', tone: 'error' });
      },
      { timeout: 8000 },
    );
  };

  const runSearch = () => {
    if (district) {
      setOrigin(districtByName(district));
      setOriginLabel(district);
    }
    if (!district && !origin) {
      toast({ title: 'Elige un distrito o usa tu ubicación actual', tone: 'error' });
      return;
    }
    setSearched(true);
  };

  const clearLocation = () => {
    setOrigin(null);
    setOriginLabel('');
    setDistrict('');
    setSearched(false);
  };

  const activeCount =
    applied.species.length + applied.breeds.length + applied.sex.length + applied.sizes.length + (applied.ageMin != null ? 1 : 0) + (applied.ageMax != null ? 1 : 0);

  const emptyMessage = origin
    ? 'No se encontraron mascotas cercanas'
    : 'No hay mascotas que cumplan estos criterios. Prueba con otros filtros.';

  return (
    <div className="px-4 pb-8" data-hu="HU-02">
      <PageHeader
        title="Mascotas disponibles"
        subtitle="Cada mascota merece una segunda oportunidad ♥"
      />

      <div className="surface-2 mb-5 space-y-4 rounded-3xl p-4" data-hu="HU-05">
        <p className="font-display text-lg font-bold text-cocoa-900">📍 Buscar por cercanía</p>
        <Button variant="soft" block size="sm" icon={<LocateFixed size={16} />} onClick={useMyLocation} disabled={locating}>
          {locating ? 'Buscando…' : 'Usar mi ubicación actual'}
        </Button>
        <div>
          <label htmlFor="browse-district" className="label">
            O elige tu distrito
          </label>
          <select id="browse-district" className="input" value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option value="">Selecciona un distrito…</option>
            {DISTRICTS.map((d) => (
              <option key={d.name}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="browse-radius" className="label">
            Radio de búsqueda: <span className="tabular-nums text-terra-600">{radiusKm} km</span>
          </label>
          <input id="browse-radius" type="range" min={1} max={20} value={radiusKm} onChange={(e) => setRadiusKm(Number(e.target.value))} className="w-full accent-terra" />
        </div>
        <div className="flex gap-2">
          <Button block size="sm" onClick={runSearch}>
            Buscar
          </Button>
          {origin && (
            <Button variant="outline" size="sm" className="whitespace-nowrap" icon={<X size={16} />} onClick={clearLocation}>
              Limpiar ubicación
            </Button>
          )}
        </div>
        {origin && searched && <p className="text-sm text-cocoa-500">Mostrando mascotas cerca de {originLabel || 'tu ubicación'}.</p>}
        {origin && (
          <div className="surface-1 flex rounded-full p-1 text-sm font-bold ring-1 ring-cocoa/[.06]" role="group" aria-label="Vista de resultados">
            {(['lista', 'mapa'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                aria-pressed={view === v}
                className={`pressable flex-1 rounded-full py-2 font-display ${view === v ? 'surface-3 text-terra-600' : 'text-cocoa-500 hover:text-cocoa-900'}`}
              >
                {v === 'lista' ? 'Lista' : 'Mapa'}
              </button>
            ))}
          </div>
        )}
        {origin && view === 'mapa' && (
          <Suspense fallback={<Skeleton className="h-72 w-full rounded-3xl" />}>
            <PetMap center={origin} radiusKm={radiusKm} pets={results.map((r) => r.pet)} distances={new Map(results.map((r) => [r.pet.id, r.distanceKm ?? 0]))} />
          </Suspense>
        )}
      </div>

      {results.length === 0 ? (
        <>
          <div className="flex justify-end px-1">
            <Button variant={activeCount ? 'primary' : 'outline'} size="sm" icon={<SlidersHorizontal size={16} />} onClick={openFilters}>
              Filtros{activeCount ? ` (${activeCount})` : ''}
            </Button>
          </div>
          <EmptyState emoji="🐾" title={emptyMessage} body={origin ? 'Prueba con un radio más amplio o cambia de distrito.' : 'Vuelve pronto: los albergues publican nuevas mascotas cada semana.'} />
        </>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <p className="text-sm font-semibold tabular-nums text-cocoa-500">
              {results.length} {results.length === 1 ? 'mascota' : 'mascotas'}
            </p>
            <Button variant={activeCount ? 'primary' : 'outline'} size="sm" icon={<SlidersHorizontal size={16} />} onClick={openFilters}>
              Filtros{activeCount ? ` (${activeCount})` : ''}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {results.map(({ pet, distanceKm }) => (
              <PetCard key={pet.id} pet={pet} distance={distanceKm != null ? formatKm(distanceKm) : undefined} />
            ))}
          </div>
        </>
      )}

      <Sheet open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filtros">
        <div className="space-y-6" data-hu="HU-04">
          <div>
            <p className="label">Especie</p>
            <div className="flex flex-wrap gap-2">
              {(['perro', 'gato'] as Species[]).map((s) => (
                <Chip key={s} active={draft.species.includes(s)} onClick={() => setDraft((d) => ({ ...d, species: toggle(d.species, s) }))}>
                  {s === 'perro' ? '🐶 Perro' : '🐱 Gato'}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="label">Raza</p>
            <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
              {breeds.map((b) => (
                <Chip key={b} active={draft.breeds.includes(b)} onClick={() => setDraft((d) => ({ ...d, breeds: toggle(d.breeds, b) }))}>
                  {b}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="label">Edad (en meses)</p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                aria-label="Edad mínima en meses"
                placeholder="Mín."
                className="input"
                value={draft.ageMin ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, ageMin: e.target.value === '' ? null : Number(e.target.value) }))}
              />
              <span className="text-cocoa-500">a</span>
              <input
                type="number"
                min={0}
                aria-label="Edad máxima en meses"
                placeholder="Máx."
                className="input"
                value={draft.ageMax ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, ageMax: e.target.value === '' ? null : Number(e.target.value) }))}
              />
            </div>
          </div>
          <div>
            <p className="label">Sexo</p>
            <div className="flex gap-2">
              {(['macho', 'hembra'] as Sex[]).map((s) => (
                <Chip key={s} active={draft.sex.includes(s)} onClick={() => setDraft((d) => ({ ...d, sex: toggle(d.sex, s) }))}>
                  {s === 'macho' ? 'Macho' : 'Hembra'}
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
                <Chip key={s} active={draft.sizes.includes(s)} onClick={() => setDraft((d) => ({ ...d, sizes: toggle(d.sizes, s) }))}>
                  {l}
                </Chip>
              ))}
            </div>
          </div>
          <div className="glass sticky -bottom-8 -mx-5 -mb-8 flex gap-2 px-5 pb-6 pt-3">
            <Button
              variant="outline"
              block
              onClick={() => {
                clearFilters();
                setFiltersOpen(false);
              }}
            >
              Limpiar filtros
            </Button>
            <Button block onClick={applyFilters}>
              Aplicar filtros
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
