import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Avatar, Chip, EmptyState, ListGroup, ListRow, Section } from '@/components/ui';
import { useUsers } from '@/services/users';
import type { Role } from '@/types';
import { FilterBar } from './adminUi';

const ROLE_LABEL: Record<Role, string> = { adopter: 'Adoptante', owner: 'Responsable', admin: 'Administrador' };
const ROLE_FILTERS: (Role | 'todos')[] = ['todos', 'adopter', 'owner', 'admin'];
const STATE_FILTERS: ('todos' | 'activo' | 'inactivo')[] = ['todos', 'activo', 'inactivo'];

/** HU-22: lista de usuarios con búsqueda por nombre/correo y filtros de rol/estado. */
export function AdminUsers() {
  const users = useUsers();
  const [q, setQ] = useState('');
  const [role, setRole] = useState<Role | 'todos'>('todos');
  const [state, setState] = useState<'todos' | 'activo' | 'inactivo'>('todos');

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return users.filter((u) => {
      if (query && !u.name.toLowerCase().includes(query) && !u.email.toLowerCase().includes(query)) return false;
      if (role !== 'todos' && u.role !== role) return false;
      if (state === 'activo' && !u.active) return false;
      if (state === 'inactivo' && u.active) return false;
      return true;
    });
  }, [users, q, role, state]);

  return (
    <div data-hu="HU-22">
      <Section title={`Usuarios (${users.length})`} aside={filtered.length !== users.length ? <span className="tabular-nums">{filtered.length} resultados</span> : undefined}>
        <div className="mb-3 space-y-2.5">
          <div className="relative">
            <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-cocoa-400" aria-hidden />
            <input
              className="input !rounded-xl !py-2.5 pl-10"
              placeholder="Buscar por nombre o correo"
              aria-label="Buscar usuario por nombre o correo"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <FilterBar
            value={role}
            onChange={setRole}
            options={ROLE_FILTERS.map((r) => ({ value: r, label: r === 'todos' ? 'Todos los roles' : ROLE_LABEL[r] }))}
          />
          <FilterBar
            value={state}
            onChange={setState}
            options={STATE_FILTERS.map((s) => ({ value: s, label: s === 'todos' ? 'Cualquier estado' : s === 'activo' ? 'Activos' : 'Inactivos' }))}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState emoji="🔍" title="Sin resultados" body="Ningún usuario coincide con la búsqueda o los filtros." />
        ) : (
          <ListGroup>
            {filtered.map((u) => (
              <ListRow
                key={u.id}
                to={`/admin/usuarios/${u.id}`}
                className="!py-2.5"
                leading={<Avatar src={u.avatar} name={u.name} size={40} />}
                title={u.name}
                subtitle={
                  <>
                    <span className="block truncate">{u.email}</span>
                    <span className="block text-xs">{ROLE_LABEL[u.role]}</span>
                  </>
                }
                trailing={
                  <Chip tone={u.active ? 'sage' : 'coral'} className="!px-2.5 !py-0.5 !text-[13px]">
                    {u.active ? 'Activo' : 'Inactivo'}
                  </Chip>
                }
              />
            ))}
          </ListGroup>
        )}
      </Section>
    </div>
  );
}
