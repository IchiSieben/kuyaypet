import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
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

export function ScoreBadge({ score, className = '' }: { score: number; className?: string }) {
  const tone = score >= 80 ? 'bg-sage' : score >= 60 ? 'bg-honey' : 'bg-cocoa-500';
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 font-display font-extrabold text-white shadow-soft ${tone} ${className}`}>
      🐾 {score}%
    </span>
  );
}
