// Ephemeral UI state (not persisted): toasts, confirm dialog, match celebration, typing indicators.
import { create } from 'zustand';

export interface Toast {
  id: number;
  title: string;
  body?: string;
  emoji?: string;
  tone?: 'info' | 'success' | 'error';
  onClick?: () => void;
}

export interface ConfirmOptions {
  title: string;
  body?: string;
  emoji?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface UiState {
  toasts: Toast[];
  confirmState: (ConfirmOptions & { resolve: (ok: boolean) => void }) | null;
  celebrationMatchId: string | null;
  typing: Record<string, boolean>;
  presenterOpen: boolean;
  tourStep: number | null;
  /** Bumped on every (re)start so the tour re-enters step 0 even if it was already there. */
  tourRun: number;
  /** Presenter/tour: force this pet to be the next card in the deck. */
  pinnedPetId: string | null;
  pushToast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: number) => void;
  closeConfirm: (ok: boolean) => void;
}

let toastId = 0;

export const useUi = create<UiState>()((set, get) => ({
  toasts: [],
  confirmState: null,
  celebrationMatchId: null,
  typing: {},
  presenterOpen: true,
  tourStep: null,
  tourRun: 0,
  pinnedPetId: null,
  pushToast: (t) => {
    const id = ++toastId;
    set((s) => ({ toasts: [...s.toasts.slice(-2), { ...t, id }] }));
    setTimeout(() => get().dismissToast(id), 3800);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  closeConfirm: (ok) => {
    const c = get().confirmState;
    set({ confirmState: null });
    c?.resolve(ok);
  },
}));

export const toast = (t: Omit<Toast, 'id'>) => useUi.getState().pushToast(t);

export function confirm(opts: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => useUi.setState({ confirmState: { ...opts, resolve } }));
}
