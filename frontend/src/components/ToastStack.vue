<script setup lang="ts">
import { useToast } from '../composables/useToast';

const { toasts, removeToast } = useToast();
</script>

<template>
  <teleport to="body">
    <section class="toast-stack" aria-live="polite" aria-atomic="true">
      <article
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="`toast-${toast.kind}`"
        role="status"
      >
        <p>{{ toast.message }}</p>
        <button type="button" class="toast-close" @click="removeToast(toast.id)" aria-label="Close notification">
          x
        </button>
      </article>
    </section>
  </teleport>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  right: 1rem;
  top: 1rem;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  width: min(92vw, 360px);
}

.toast {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.65rem;
  border-radius: 12px;
  padding: 0.7rem 0.8rem;
  border: 1px solid var(--stroke);
  background: #ffffff;
  color: var(--ink);
  box-shadow: 0 10px 24px rgba(8, 28, 20, 0.18);
}

.toast p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.35;
}

.toast-success {
  border-color: rgba(9, 87, 63, 0.28);
  background: #eaf8f0;
}

.toast-error {
  border-color: rgba(163, 38, 38, 0.32);
  background: #fff1f1;
}

.toast-info {
  border-color: rgba(9, 87, 63, 0.2);
  background: #f2f7f1;
}

.toast-close {
  border: none;
  background: transparent;
  font: inherit;
  font-size: 1rem;
  line-height: 1;
  color: var(--muted);
  cursor: pointer;
  padding: 0.05rem;
}
</style>
