<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { Pump } from '../data/mockPumps';
import { useI18n } from '../i18n';
import FuelTypeModal from './FuelTypeModal.vue';
import QrScannerModal from './QrScannerModal.vue';

const props = defineProps<{ pump: Pump }>();
const emit = defineEmits<{
  'take-serial': [{ serial: number; fuelType: string; pumpId: string }];
}>();
const { t } = useI18n();
const router = useRouter();
const isScannerOpen = ref(false);
const isFuelPickerOpen = ref(false);
const selectedFuelType = ref<string | null>(null);
const issuedSerial = ref<number | null>(null);

function handleSerial() {
  isFuelPickerOpen.value = true;
}

function openScanner() {
  isScannerOpen.value = true;
}

function handleQrScan(scannedValue: string) {
  void router.push({
    path: `/checkin/${props.pump.id}`,
    query: { token: scannedValue },
  });
}

function fuelLabel(fuelType: string) {
  return t(`fuelTypes.${fuelType as 'diesel' | 'petrol' | 'octane'}`);
}

function handleFuelSelect(fuelType: string) {
  selectedFuelType.value = fuelType;
  issuedSerial.value = props.pump.nextSerial;
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
      <p class="pump-text">
        {{ t('pump.running') }}: {{ pump.runningSerial }} {{ t('number') }}
      </p>
      <p class="pump-text">
        {{ t('pump.next') }} {{ pump.nextSerial }} {{ t('people') }}
      </p>
      <p class="pump-text">{{ t('pump.slotsLeft') }}: {{ pump.dailySerialLimit - pump.nextSerial }} {{ t('ti') }}</p>

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
        <button type="button" class="ghost-button centered" @click="openScanner">
          {{ t('pumpDetail.openCheckin') }}
        </button>
      </div>
    </div>

    <QrScannerModal
      :open="isScannerOpen"
      :title="t('qrScanner.title')"
      :hint="t('qrScanner.subtitle')"
      @close="isScannerOpen = false"
      @scan="handleQrScan"
    />

    <FuelTypeModal
      :open="isFuelPickerOpen"
      :pump-name="pump.name"
      @close="isFuelPickerOpen = false"
      @select="handleFuelSelect"
    />
  </article>
</template>
