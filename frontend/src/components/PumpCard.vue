<script setup lang="ts">
import { computed, ref } from 'vue';
import type { FuelType, Pump } from '../data/mockPumps';
import { useI18n } from '../i18n';
import FuelTypeModal from './FuelTypeModal.vue';

const props = defineProps<{ pump: Pump }>();
const emit = defineEmits<{
  'take-serial': [{ serial: number; fuelType: string; pumpId: string }];
}>();
const { t } = useI18n();
const isFuelPickerOpen = ref(false);
const selectedFuelType = ref<FuelType | null>(null);
const issuedSerial = ref<number | null>(null);
const activeFuelTab = ref<FuelType>('petrol');

const fuelTabs = computed(() => [
  { key: 'petrol' as const, label: t('fuelTypes.petrol'), description: t('fuelTypes.petrolDesc') },
  { key: 'diesel' as const, label: t('fuelTypes.diesel'), description: t('fuelTypes.dieselDesc') },
  { key: 'octane' as const, label: t('fuelTypes.octane'), description: t('fuelTypes.octaneDesc') },
]);

const activeFuelInfo = computed(() => fuelTabs.value.find((fuel) => fuel.key === activeFuelTab.value));
const activeFuelQueue = computed(() => props.pump.fuelQueues[activeFuelTab.value]);

function handleSerial() {
  isFuelPickerOpen.value = true;
}

function fuelLabel(fuelType: FuelType) {
  return t(`fuelTypes.${fuelType}`);
}

function isFuelType(value: string): value is FuelType {
  return value === 'diesel' || value === 'petrol' || value === 'octane';
}

function handleFuelSelect(fuelType: string) {
  if (!isFuelType(fuelType)) return;

  selectedFuelType.value = fuelType;
  activeFuelTab.value = fuelType;
  issuedSerial.value = props.pump.fuelQueues[fuelType].nextSerial;
  isFuelPickerOpen.value = false;

  emit('take-serial', {
    serial: issuedSerial.value,
    fuelType,
    pumpId: props.pump.id,
  });
}
</script>

<template>
  <article class="pump-card">
    <div class="pump-body">
      <h3 class="pump-title">{{ pump.name }}</h3>
      <p class="pump-text">{{ pump.address }}</p>
      <div class="fuel-tabs" role="tablist" :aria-label="t('fuelPicker.title')">
        <button
          v-for="fuel in fuelTabs"
          :key="fuel.key"
          type="button"
          class="fuel-tab"
          :class="{ active: activeFuelTab === fuel.key }"
          role="tab"
          :aria-selected="activeFuelTab === fuel.key"
          @click="activeFuelTab = fuel.key"
        >
          {{ fuel.label }}
        </button>
      </div>
      <p class="pump-text">
        {{ t('pump.running') }}: {{ activeFuelQueue.runningSerial }} {{ t('number') }}
      </p>
      <p class="pump-text">
        {{ t('pump.next') }} {{ activeFuelQueue.nextSerial }} {{ t('people') }}
      </p>
      <p class="pump-text">
        {{ t('pump.slotsLeft') }}: {{ activeFuelQueue.dailySerialLimit - activeFuelQueue.nextSerial }} {{ t('ti') }}
      </p>

      <div v-if="selectedFuelType && issuedSerial !== null" class="serial-status-card serial-chip-row">
        <div class="status-item">
          <span class="status-label">{{ t('fuelPicker.selectedFuel') }}</span>
          <div class="status-value serial-number">{{ fuelLabel(selectedFuelType) }}</div>
        </div>
        <div class="status-item">
          <span class="status-label">{{ t('snapshot.yourSerial') }}</span>
          <div class="status-value wait-time">#{{ issuedSerial }}</div>
        </div>
      </div>

      <div class="pump-actions">
        <a :href="pump.googleMapLink" target="_blank" rel="noopener noreferrer" class="ghost-button">
          {{ t('pump.viewMaps') }}
        </a>
        <button @click="handleSerial" class="solid-button">{{ t('buttons.takeSerial') }}</button>
      </div>
    </div>

    <FuelTypeModal
      :open="isFuelPickerOpen"
      :pump-name="pump.name"
      @close="isFuelPickerOpen = false"
      @select="handleFuelSelect"
    />
  </article>
</template>

<style scoped>
.fuel-tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
  margin-top: 0.4rem;
  margin-bottom: 0.4rem;
}

.fuel-tab {
  border: 1px solid var(--stroke);
  border-radius: 10px;
  padding: 0.5rem 0.4rem;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--muted);
  background: #f5faf3;
  cursor: pointer;
}

.fuel-tab.active {
  color: #f4fff9;
  background: var(--brand);
  border-color: var(--brand);
}

.fuel-tab-info {
  margin-top: 0.55rem;
  color: var(--muted);
  font-size: 0.86rem;
  line-height: 1.45;
  min-height: 2.5rem;
}
</style>
