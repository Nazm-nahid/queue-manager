<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '../i18n';

const props = defineProps<{
  open: boolean;
  pumpName: string;
}>();

const emit = defineEmits<{
  close: [];
  select: [fuelType: string];
}>();

const { t } = useI18n();

const fuelOptions = computed(() => [
  { key: 'diesel', label: t('fuelTypes.diesel'), description: t('fuelTypes.dieselDesc') },
  { key: 'petrol', label: t('fuelTypes.petrol'), description: t('fuelTypes.petrolDesc') },
  { key: 'octane', label: t('fuelTypes.octane'), description: t('fuelTypes.octaneDesc') },
]);
</script>

<template>
  <teleport to="body">
    <div v-if="open" class="scanner-overlay" @click.self="emit('close')">
      <div class="scanner-modal fuel-modal" role="dialog" aria-modal="true" :aria-label="t('fuelPicker.title')">
        <div class="scanner-header">
          <div>
            <p class="kicker">{{ t('fuelPicker.kicker') }}</p>
            <h2>{{ t('fuelPicker.title') }}</h2>
            <p class="tiny">{{ t('fuelPicker.subtitle', { pump: pumpName }) }}</p>
          </div>
          <button type="button" class="scanner-close" @click="emit('close')">
            {{ t('qrScanner.close') }}
          </button>
        </div>

        <div class="fuel-grid">
          <button
            v-for="fuel in fuelOptions"
            :key="fuel.key"
            type="button"
            class="fuel-card"
            @click="emit('select', fuel.key)"
          >
            <span class="fuel-badge">{{ fuel.label }}</span>
            <strong>{{ t('fuelPicker.choose') }}</strong>
            <small>{{ fuel.description }}</small>
          </button>
        </div>

        <div class="scanner-footer">
          <button type="button" class="ghost-button full" @click="emit('close')">
            {{ t('fuelPicker.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.scanner-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(12, 22, 18, 0.72);
  backdrop-filter: blur(10px);
}

.scanner-modal {
  width: min(92vw, 520px);
  border-radius: 24px;
  background: linear-gradient(180deg, #f9fffb 0%, #f0f6f1 100%);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.26);
  overflow: hidden;
}

.scanner-header,
.scanner-footer {
  padding: 1rem 1rem 0.95rem;
}

.scanner-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.scanner-close {
  border: 1px solid var(--stroke);
  background: #fff;
  border-radius: 999px;
  padding: 0.45rem 0.75rem;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  color: var(--ink);
}

.fuel-modal {
  width: min(92vw, 520px);
}

.fuel-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 0.75rem;
  padding: 0 1rem 1rem;
}

.fuel-card {
  text-align: left;
  border: 1px solid var(--stroke);
  background: #ffffff;
  border-radius: 18px;
  padding: 1rem;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(13, 41, 29, 0.06);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.fuel-card strong {
  color: var(--ink);
  font-size: 1rem;
}

.fuel-card small {
  color: var(--muted);
  line-height: 1.45;
}

.fuel-badge {
  align-self: flex-start;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  background: #e8f5ec;
  color: var(--brand);
  font-size: 0.8rem;
  font-weight: 700;
}
</style>