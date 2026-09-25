import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Card, Chip, EmptyState } from '@/components/ui';
import { useUsers } from '@/services/users';
import type { Role } from '@/types';

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
    <div className="space-y-4 pt-2" data-hu="HU-22">
      <h2 className="text-lg font-bold">Usuarios ({users.length})</h2>
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-cocoa-300" />
        <input
          className="input pl-10"
          placeholder="Buscar por nombre o correo"
          aria-label="Buscar usuario por nombre o correo"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {ROLE_FILTERS.map((r) => (
          <Chip key={r} active={role === r} onClick={() => setRole(r)}>
            {r === 'todos' ? 'Todos los roles' : ROLE_LABEL[r]}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {STATE_FILTERS.map((s) => (
          <Chip key={s} active={state === s} onClick={() => setState(s)}>
            {s === 'todos' ? 'Cualquier estado' : s === 'activo' ? 'Activos' : 'Inactivos'}
          </Chip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState emoji="🔍" title="Sin resultados" body="Ningún usuario coincide con la búsqueda o los filtros." />
      ) : (
        <ul className="space-y-2">
          {filtered.map((u) => (
            <li key={u.id}>
              <Link to={`/admin/usuarios/${u.id}`}>
                <Card className="flex items-center gap-3 p-3">
                  <Avatar src={u.avatar} name={u.name} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{u.name}</p>
                    <p className="truncate text-xs text-cocoa-500">{u.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Chip tone="terra">{ROLE_LABEL[u.role]}</Chip>
                    <Chip tone={u.active ? 'sage' : 'coral'}>{u.active ? 'Activo' : 'Inactivo'}</Chip>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
