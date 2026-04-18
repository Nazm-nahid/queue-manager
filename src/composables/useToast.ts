import { ref } from 'vue';

export type ToastKind = 'success' | 'error' | 'info';

export type ToastItem = {
  id: number;
  message: string;
  kind: ToastKind;
};

const toasts = ref<ToastItem[]>([]);
let toastId = 0;

function removeToast(id: number) {
  toasts.value = toasts.value.filter((toast) => toast.id !== id);
}

function pushToast(message: string, kind: ToastKind = 'info', duration = 3000) {
  const id = ++toastId;
  toasts.value = [...toasts.value, { id, message, kind }];

  if (duration > 0) {
    window.setTimeout(() => {
      removeToast(id);
    }, duration);
  }
}

export function useToast() {
  return {
    toasts,
    removeToast,
    pushToast,
    success: (message: string, duration?: number) => pushToast(message, 'success', duration),
    error: (message: string, duration?: number) => pushToast(message, 'error', duration),
    info: (message: string, duration?: number) => pushToast(message, 'info', duration),
  };
}
