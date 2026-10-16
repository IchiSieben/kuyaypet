import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, X } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUi } from '@/services/ui';

type Variant = 'primary' | 'like' | 'success' | 'outline' | 'ghost' | 'soft' | 'danger';
type Size = 'sm' | 'md' | 'lg';

// Each variant defines rest / hover / active / focus. Filled buttons get a subtle top highlight
// (shadow-inset) so they read as a physical surface rather than a flat tinted box.
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-terra text-white shadow-raised hover:bg-terra-600 hover:shadow-card focus-visible:shadow-glow',
  like: 'bg-coral text-white shadow-raised hover:bg-coral-600 hover:shadow-card focus-visible:shadow-glow-coral',
  success: 'bg-sage text-white shadow-raised hover:bg-sage-600 hover:shadow-card',
  outline: 'border border-cocoa/15 bg-white/80 text-cocoa shadow-hairline backdrop-blur hover:border-terra/60 hover:bg-white hover:text-terra',
  ghost: 'text-cocoa-700 hover:bg-cocoa/[.06]',
  soft: 'bg-terra-100 text-terra-600 hover:bg-terra-50 hover:shadow-soft',
  danger: 'bg-coral-600 text-white shadow-raised hover:bg-coral',
};
const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-12 px-5 text-base gap-2',
  lg: 'h-14 px-6 text-lg gap-2',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', block, icon, className = '', children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`pressable inline-flex select-none items-center justify-center rounded-full font-display font-bold disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none ${VARIANTS[variant]} ${SIZES[size]} ${block ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
});

export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`surface-2 rounded-3xl ${className}`}>{children}</div>;
}

export function Chip({
  children,
  active,
  onClick,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  tone?: 'neutral' | 'terra' | 'sage' | 'coral' | 'honey';
  className?: string;
}) {
  const tones = {
    neutral: 'bg-white/70 text-cocoa-700 border-cocoa/10',
    terra: 'bg-terra-100/80 text-terra-600 border-terra/10',
    sage: 'bg-sage-100/80 text-sage-600 border-sage/10',
    coral: 'bg-coral-100/80 text-coral-600 border-coral/10',
    honey: 'bg-honey-100/80 text-cocoa-700 border-honey/20',
  };
  const cls = `inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold ${onClick ? 'pressable hover:border-terra/50' : ''} ${
    active ? 'border-terra bg-terra text-white shadow-soft' : tones[tone]
  } ${className}`;
  if (onClick)
    return (
      <button type="button" aria-pressed={active} onClick={onClick} className={cls}>
        {children}
      </button>
    );
  return <span className={cls}>{children}</span>;
}

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-40 flex flex-col justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-cocoa-900/45 backdrop-blur-xs" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="scroll-area relative max-h-[88%] rounded-t-5xl bg-cream p-5 pb-8 shadow-float ring-1 ring-white/70"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320, mass: 0.9 }}
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-cocoa/15" />
            {title && (
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">{title}</h2>
                <button onClick={onClose} aria-label="Cerrar" className="pressable rounded-full bg-cocoa/[.06] p-2 hover:bg-cocoa/10">
                  <X size={20} />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Global confirmation modal, driven by ui.confirm(). */
export function ConfirmHost() {
  const confirm = useUi((s) => s.confirmState);
  const close = useUi((s) => s.closeConfirm);
  return (
    <AnimatePresence>
      {confirm && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-cocoa-900/50 backdrop-blur-xs" onClick={() => close(false)} />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="relative w-full max-w-sm rounded-4xl bg-cream p-6 text-center shadow-float ring-1 ring-white/70"
            initial={{ scale: 0.92, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 340 }}
          >
            <div className="mb-2 text-4xl">{confirm.emoji ?? '🐾'}</div>
            <h2 id="confirm-title" className="text-xl font-bold">
              {confirm.title}
            </h2>
            {confirm.body && <p className="mt-2 text-cocoa-500">{confirm.body}</p>}
            <div className="mt-5 flex gap-3">
              <Button variant="outline" block onClick={() => close(false)}>
                {confirm.cancelLabel ?? 'Cancelar'}
              </Button>
              <Button variant={confirm.danger ? 'danger' : 'primary'} block onClick={() => close(true)}>
                {confirm.confirmLabel ?? 'Confirmar'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ToastHost() {
  const toasts = useUi((s) => s.toasts);
  const dismiss = useUi((s) => s.dismissToast);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            layout
            onClick={() => (t.onClick ? t.onClick() : dismiss(t.id))}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 360 }}
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl px-4 py-3 text-left shadow-float ring-1 ring-white/15 backdrop-blur ${
              t.tone === 'error' ? 'bg-coral-600/95 text-white' : t.tone === 'success' ? 'bg-sage/95 text-white' : 'bg-cocoa-900/90 text-cream'
            }`}
          >
            <span className="text-xl leading-none">{t.emoji ?? (t.tone === 'error' ? '⚠️' : t.tone === 'success' ? '✅' : '🐾')}</span>
            <span className="flex-1">
              <span className="block font-bold">{t.title}</span>
              {t.body && <span className="block text-sm opacity-90">{t.body}</span>}
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function EmptyState({ emoji, title, body, action }: { emoji: string; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-12 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/70 text-4xl shadow-soft ring-1 ring-cocoa/5">{emoji}</div>
      <h3 className="text-xl font-bold">{title}</h3>
      {body && <p className="mt-1.5 max-w-xs text-cocoa-500">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Avatar({ src, name, size = 40 }: { src?: string; name: string; size?: number }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('');
  return src ? (
    <img src={src} alt="" width={size} height={size} className="shrink-0 rounded-full bg-cream-200 object-cover ring-1 ring-cocoa/10" style={{ width: size, height: size }} />
  ) : (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-terra-100 font-bold text-terra-600"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   v0.5 layout primitives. Every screen is built from these so the
   app reads as one system: a large-title header, grouped sections,
   inset lists, stat tiles and skeletons. See docs/v05-design.md.
   ───────────────────────────────────────────────────────────── */

/** Round icon button. `glass` floats over photos, `surface` sits on the paper. Always needs a label. */
export const IconButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { label: string; tone?: 'glass' | 'surface' | 'dark'; size?: 'sm' | 'md' }
>(function IconButton({ label, tone = 'surface', size = 'md', className = '', children, ...rest }, ref) {
  const tones = {
    glass: 'glass text-cocoa hover:bg-white/90',
    surface: 'surface-3 text-cocoa-700 hover:text-terra hover:shadow-card',
    dark: 'glass-dark text-white hover:bg-cocoa-900/70',
  };
  const sizes = { sm: 'h-9 w-9', md: 'h-11 w-11' };
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={`pressable inline-flex shrink-0 items-center justify-center rounded-full ${tones[tone]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
});

/**
 * Large-title page header. `back` renders a labelled "Volver" control (navigate(-1) unless a path is given).
 * The title is the screen's single h1; `subtitle` is one plain sentence, never a label strip.
 */
export function PageHeader({
  title,
  subtitle,
  back,
  action,
  aside,
  className = '',
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  back?: boolean | string;
  action?: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  const navigate = useNavigate();
  return (
    <header className={`pb-4 pt-2 ${className}`}>
      {(back || action) && (
        <div className="mb-3 flex min-h-11 items-center justify-between gap-3">
          {back ? (
            <button
              type="button"
              onClick={() => (typeof back === 'string' ? navigate(back) : navigate(-1))}
              className="pressable -ml-1 inline-flex h-11 items-center gap-1.5 rounded-full pl-1 pr-3.5 font-display font-bold text-cocoa-700 hover:bg-white/70 hover:text-terra"
            >
              <span className="surface-3 inline-flex h-9 w-9 items-center justify-center rounded-full">
                <ArrowLeft size={18} strokeWidth={2.4} />
              </span>
              Volver
            </button>
          ) : (
            <span />
          )}
          {action}
        </div>
      )}
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold text-cocoa-900">{title}</h1>
          {subtitle && <p className="mt-1 text-[0.95rem] leading-snug text-cocoa-500">{subtitle}</p>}
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>
    </header>
  );
}

/** A titled group of content. The title is an h2; `aside` is a quiet trailing link or count. */
export function Section({
  title,
  aside,
  children,
  className = '',
  ...rest
}: { title?: ReactNode; aside?: ReactNode; children: ReactNode; className?: string } & Record<`data-${string}`, string | undefined>) {
  return (
    <section className={`mt-6 first:mt-0 ${className}`} {...rest}>
      {(title || aside) && (
        <div className="mb-2.5 flex items-baseline justify-between gap-3 px-1">
          {title && <h2 className="text-lg font-bold text-cocoa-900">{title}</h2>}
          {aside && <div className="text-sm font-semibold text-cocoa-500">{aside}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

/** Inset grouped list (one card, hairline separators). Children should be <ListRow>s. */
export function ListGroup({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <ul className={`surface-2 divide-y divide-cocoa/[.07] overflow-hidden rounded-3xl ${className}`}>{children}</ul>;
}

/** One row of a ListGroup. Becomes a link (`to`) or a button (`onClick`); otherwise static. */
export function ListRow({
  leading,
  title,
  subtitle,
  trailing,
  to,
  onClick,
  chevron,
  className = '',
}: {
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  to?: string;
  onClick?: () => void;
  chevron?: boolean;
  className?: string;
}) {
  const body = (
    <>
      {leading && <span className="shrink-0">{leading}</span>}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-bold text-cocoa-900">{title}</span>
        {subtitle && <span className="mt-0.5 block text-sm leading-snug text-cocoa-500">{subtitle}</span>}
      </span>
      {trailing && <span className="shrink-0 text-sm text-cocoa-500">{trailing}</span>}
      {(chevron ?? !!(to || onClick)) && <ChevronRight size={18} className="shrink-0 text-cocoa-300" aria-hidden />}
    </>
  );
  const cls = `flex w-full items-center gap-3 px-4 py-3.5 text-left ${className}`;
  const interactive = 'pressable hover:bg-white/80 active:bg-cream-100';
  return (
    <li>
      {to ? (
        <Link to={to} className={`${cls} ${interactive}`}>
          {body}
        </Link>
      ) : onClick ? (
        <button type="button" onClick={onClick} className={`${cls} ${interactive}`}>
          {body}
        </button>
      ) : (
        <div className={cls}>{body}</div>
      )}
    </li>
  );
}

/** KPI tile: the number is the content, the label is a short plain phrase under it. */
export function StatTile({
  value,
  label,
  tone = 'neutral',
  icon,
  className = '',
}: {
  value: ReactNode;
  label: ReactNode;
  tone?: 'neutral' | 'terra' | 'sage' | 'coral' | 'honey';
  icon?: ReactNode;
  className?: string;
}) {
  const tones = {
    neutral: 'text-cocoa-900',
    terra: 'text-terra-600',
    sage: 'text-sage-600',
    coral: 'text-coral-600',
    honey: 'text-honey-600',
  };
  return (
    <div className={`surface-2 rounded-3xl p-4 ${className}`}>
      {icon && <div className={`mb-2 ${tones[tone]}`}>{icon}</div>}
      <div className={`font-display text-3xl font-extrabold leading-none tabular-nums ${tones[tone]}`}>{value}</div>
      <div className="mt-1.5 text-sm font-semibold leading-snug text-cocoa-500">{label}</div>
    </div>
  );
}

/** Loading placeholder with the shimmer token. Purely visual: hidden from assistive tech. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`skeleton ${className}`} />;
}

export function ScoreBadge({ score, className = '' }: { score: number; className?: string }) {
  const tone = score >= 80 ? 'bg-sage' : score >= 60 ? 'bg-honey' : 'bg-cocoa-500';
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 font-display font-extrabold text-white shadow-soft ${tone} ${className}`}>
      🐾 {score}%
    </span>
  );
}
