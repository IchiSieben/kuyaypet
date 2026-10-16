import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, Button, Card, Chip, EmptyState, PageHeader, Section } from '@/components/ui';
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
        <EmptyState emoji="🔍" title="Usuario no encontrado" action={<Button onClick={() => navigate('/admin/usuarios')}>Volver a usuarios</Button>} />
      </div>
    );

  const isSelf = admin?.id === user.id;

  const save = async () => {
    const invalid = validateUserEdit(user.id, { name, email });
    if (invalid) return setError(invalid);
    setError(null);
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
    <div data-hu="HU-22">
      <PageHeader back="/admin/usuarios" title={user.name} subtitle={user.email} />

      <Card className="flex items-center gap-3 p-4">
        <Avatar src={user.avatar} name={user.name} size={56} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-bold text-cocoa-900">{ROLE_LABEL[user.role]}</p>
          {user.district && <p className="truncate text-sm text-cocoa-500">{user.district}</p>}
        </div>
        <div className="shrink-0" data-hu="HU-25">
          <Chip tone={user.active ? 'sage' : 'coral'} className="!px-2.5 !py-0.5 !text-[13px]">
            {user.active ? 'Activo' : 'Inactiva'}
          </Chip>
        </div>
      </Card>

      <Section title="Editar información" className="mt-6">
        <Card className="space-y-4 p-4">
          <label className="block text-sm font-bold text-cocoa-700">
            Nombre
            <input className="input mt-1.5" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={error?.field === 'name'} />
          </label>
          <label className="block text-sm font-bold text-cocoa-700">
            Correo electrónico
            <input className="input mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={error?.field === 'email'} />
          </label>
          <label className="block text-sm font-bold text-cocoa-700">
            Distrito
            <input className="input mt-1.5" value={district} onChange={(e) => setDistrict(e.target.value)} />
          </label>
          <label className="block text-sm font-bold text-cocoa-500">
            Rol (solo lectura)
            <input className="input mt-1.5 !bg-cream-200" value={ROLE_LABEL[user.role]} disabled readOnly />
          </label>
          {error && (
            <p role="alert" className="text-sm font-bold text-coral-600">
              {error.error}
            </p>
          )}
          <Button block onClick={save}>
            Guardar cambios
          </Button>
        </Card>
      </Section>

      <Section title="Estado de la cuenta">
        <Card className="space-y-3 p-4">
          <p className="text-sm text-cocoa-500">
            Estado actual: <b className={user.active ? 'text-sage-600' : 'text-coral-600'}>{user.active ? 'Activo' : 'Inactiva'}</b>
          </p>
          {isSelf ? (
            <p className="rounded-2xl bg-cream-200 p-3 text-sm text-cocoa-700">No puedes desactivar tu propia cuenta de administrador.</p>
          ) : user.active ? (
            <Button block variant="outline" className="!border-coral/40 !text-coral-600 hover:!bg-coral-100/60" onClick={toggleActive}>
              Desactivar usuario
            </Button>
          ) : (
            <Button block variant="soft" onClick={toggleActive}>
              Reactivar usuario
            </Button>
          )}
        </Card>
      </Section>
    </div>
  );
}
