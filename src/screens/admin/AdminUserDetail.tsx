import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Avatar, Button, Card, Chip, EmptyState } from '@/components/ui';
import { useCurrentUser } from '@/services/auth';
import { setUserActive } from '@/services/moderation';
import { updateUser, useAdminUser, validateUserEdit } from '@/services/users';
import { confirm, toast } from '@/services/ui';
import type { Role } from '@/types';

const ROLE_LABEL: Record<Role, string> = { adopter: 'Adoptante', owner: 'Responsable', admin: 'Administrador' };

/** HU-22 (editar datos) + HU-25 (desactivar/reactivar) del usuario seleccionado. */
export function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const admin = useCurrentUser();
  const user = useAdminUser(id);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [district, setDistrict] = useState(user?.district ?? '');
  const [error, setError] = useState<{ error: string; field?: string } | null>(null);

  useEffect(() => {
    setName(user?.name ?? '');
    setEmail(user?.email ?? '');
    setDistrict(user?.district ?? '');
    setError(null);
  }, [user?.id]);

  if (!user)
    return (
      <div className="pt-10" data-hu="HU-22">
        <EmptyState emoji="🔍" title="Usuario no encontrado" action={<Link to="/admin/usuarios"><Button>Volver a usuarios</Button></Link>} />
      </div>
    );

  const isSelf = admin?.id === user.id;

  const save = async () => {
    const invalid = validateUserEdit(user.id, { name, email });
    if (invalid) return setError(invalid);
    updateUser(user.id, { name: name.trim(), email: email.trim(), district: district.trim() || undefined });
    toast({ title: 'Cambios guardados', body: `Se actualizó la cuenta de ${name.trim()}.`, tone: 'success' });
  };

  const toggleActive = async () => {
    if (isSelf) return;
    if (user.active) {
      const ok = await confirm({ title: `¿Desactivar a ${user.name}?`, body: 'No podrá iniciar sesión hasta que la reactives.', emoji: '🚫', confirmLabel: 'Desactivar', danger: true });
      if (!ok) return;
      setUserActive(user.id, false);
      toast({ title: `${user.name} fue desactivado`, body: 'La cuenta quedó en estado Inactiva.' });
    } else {
      const ok = await confirm({ title: `¿Reactivar a ${user.name}?`, body: 'Podrá volver a iniciar sesión.', emoji: '✅', confirmLabel: 'Reactivar' });
      if (!ok) return;
      setUserActive(user.id, true);
      toast({ title: `${user.name} fue reactivado`, tone: 'success' });
    }
  };

  return (
    <div className="space-y-4 pt-2" data-hu="HU-22">
      <button onClick={() => navigate('/admin/usuarios')} className="flex items-center gap-1 text-sm font-bold text-terra">
        <ArrowLeft size={16} /> Usuarios
      </button>
      <Card className="flex items-center gap-3 p-4">
        <Avatar src={user.avatar} name={user.name} size={56} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold">{user.name}</p>
          <p className="truncate text-sm text-cocoa-500">{user.email}</p>
        </div>
        <div className="flex flex-col items-end gap-1" data-hu="HU-25">
          <Chip tone="terra">{ROLE_LABEL[user.role]}</Chip>
          <Chip tone={user.active ? 'sage' : 'coral'}>{user.active ? 'Activo' : 'Inactiva'}</Chip>
        </div>
      </Card>

      <Card className="space-y-3 p-4">
        <h2 className="text-lg font-bold">Editar información</h2>
        <label className="block text-sm font-bold">
          Nombre
          <input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={error?.field === 'name'} />
        </label>
        <label className="block text-sm font-bold">
          Correo electrónico
          <input className="input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={error?.field === 'email'} />
        </label>
        <label className="block text-sm font-bold">
          Distrito
          <input className="input mt-1" value={district} onChange={(e) => setDistrict(e.target.value)} />
        </label>
        <label className="block text-sm font-bold text-cocoa-300">
          Rol (solo lectura)
          <input className="input mt-1 bg-cream-200" value={ROLE_LABEL[user.role]} disabled readOnly />
        </label>
        {error && <p className="text-sm font-bold text-coral-600">{error.error}</p>}
        <Button block onClick={save}>
          Guardar cambios
        </Button>
      </Card>

      <Card className="space-y-2 p-4">
        <h2 className="text-lg font-bold">Estado de la cuenta</h2>
        <p className="text-sm text-cocoa-500">
          Estado actual: <b>{user.active ? 'Activo' : 'Inactiva'}</b>
        </p>
        {isSelf ? (
          <p className="rounded-2xl bg-cream-200 p-3 text-sm">No puedes desactivar tu propia cuenta de administrador.</p>
        ) : (
          <Button block variant={user.active ? 'danger' : 'success'} onClick={toggleActive}>
            {user.active ? 'Desactivar usuario' : 'Reactivar usuario'}
          </Button>
        )}
      </Card>
    </div>
  );
}
