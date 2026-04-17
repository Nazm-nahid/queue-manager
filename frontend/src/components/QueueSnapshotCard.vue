<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '../i18n';
import QrScannerModal from './QrScannerModal.vue';

const props = defineProps<{
  bookings: Array<{
    id: string;
    pumpId: string;
    serial: number;
    runningSerial: number;
    remainingSlots: number;
    etaMinutes: number;
    fuelType: string;
    pumpName: string;
  }>;
}>();

const scannerBooking = ref<(typeof props.bookings)[number] | null>(null);
const { t } = useI18n();
const router = useRouter();

function queueAhead(serial: number, runningSerial: number) {
  return Math.max(serial - runningSerial, 0);
}

function fuelLabel(fuelType?: string | null) {
  if (!fuelType) {
    return '';
  }

  if (fuelType === 'diesel' || fuelType === 'petrol' || fuelType === 'octane') {
    return t(`fuelTypes.${fuelType}`);
  }

  return fuelType;
}

function openScanner(booking: (typeof props.bookings)[number]) {
  scannerBooking.value = booking;
}

function closeScanner() {
  scannerBooking.value = null;
}

function handleQrScan(scannedValue: string) {
  if (!scannerBooking.value) {
    return;
  }

  void router.push({
    path: `/checkin/${scannerBooking.value.pumpId}`,
    query: { token: scannedValue },
  });
  scannerBooking.value = null;
}
</script>

<template>
  <section class="snapshot-card">
    <h2>{{ t('snapshot.title') }}</h2>

    <div class="snapshot-list">
      <article v-for="booking in bookings" :key="booking.id" class="snapshot-item">
        <h3 class="snapshot-item-title">{{ fuelLabel(booking.fuelType) }} - {{ booking.pumpName }}</h3>
        <div class="snapshot-grid">
          <p><span>{{ t('snapshot.yourSerial') }}</span><strong>#{{ booking.serial }}</strong></p>
          <p><span>{{ t('snapshot.runningNow') }}</span><strong>#{{ booking.runningSerial }}</strong></p>
          <p><span>{{ t('snapshot.queueAhead') }}</span><strong>{{ queueAhead(booking.serial, booking.runningSerial) }}</strong></p>
          <p><span>{{ t('snapshot.slotsLeftToday') }}</span><strong>{{ booking.remainingSlots }}</strong></p>
          <p>
            <span>{{ t('snapshot.estimatedWait') }}</span>
            <strong>{{ t('snapshot.minutes', { minutes: booking.etaMinutes }) }}</strong>
          </p>
        </div>
        <div class="snapshot-item-footer">
          <p class="tiny snapshot-fuel">
            {{ t('snapshot.selectedFuel') }}: {{ fuelLabel(booking.fuelType) }}
          </p>
          <button type="button" class="ghost-button" @click="openScanner(booking)">
            {{ t('pumpDetail.openCheckin') }}
          </button>
        </div>
      </article>
    </div>

    <QrScannerModal
      :open="scannerBooking !== null"
      :title="t('qrScanner.title')"
      :hint="t('qrScanner.subtitle')"
      @close="closeScanner"
      @scan="handleQrScan"
    />
  </section>
</template>
