<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from '../composables/useToast';
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
const etaCountdownSeconds = ref<Record<string, number>>({});
const { t } = useI18n();
const toast = useToast();
const router = useRouter();
let countdownTimerId: number | null = null;

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

function syncCountdownState() {
  const nextState: Record<string, number> = {};

  for (const booking of props.bookings) {
    if (etaCountdownSeconds.value[booking.id] !== undefined) {
      nextState[booking.id] = etaCountdownSeconds.value[booking.id];
      continue;
    }

    nextState[booking.id] = Math.max(booking.etaMinutes * 60, 0);
  }

  etaCountdownSeconds.value = nextState;
}

function startCountdown() {
  if (countdownTimerId !== null) {
    return;
  }

  countdownTimerId = window.setInterval(() => {
    etaCountdownSeconds.value = Object.fromEntries(
      Object.entries(etaCountdownSeconds.value).map(([id, seconds]) => [id, Math.max(seconds - 1, 0)]),
    );
  }, 1000);
}

function stopCountdown() {
  if (countdownTimerId === null) {
    return;
  }

  window.clearInterval(countdownTimerId);
  countdownTimerId = null;
}

function formatCountdown(totalSeconds: number) {
  const safeSeconds = Math.max(totalSeconds, 0);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

watch(
  () => props.bookings,
  () => {
    syncCountdownState();
  },
  { immediate: true },
);

onMounted(startCountdown);
onBeforeUnmount(stopCountdown);

async function handleQrScan(scannedValue: string) {
  if (!scannerBooking.value) {
    toast.error(t('toast.qrScanFailed'));
    return;
  }

  if (!scannedValue.trim()) {
    toast.error(t('toast.qrScanFailed'));
    return;
  }

  try {
    await router.push({
      path: `/checkin/${scannerBooking.value.pumpId}`,
      query: { token: scannedValue },
    });
    toast.success(t('toast.qrScanSuccess'));
  } catch {
    toast.error(t('toast.qrScanFailed'));
  } finally {
    scannerBooking.value = null;
  }
}
</script>

<template>
  <section class="snapshot-card">
    <h2>{{ t('snapshot.title') }}</h2>

    <div class="snapshot-list">
      <article v-for="booking in bookings" :key="booking.id" class="snapshot-simple-item">
        <div class="snapshot-simple-head">
          <h3 class="snapshot-item-title">{{ fuelLabel(booking.fuelType) }} - {{ booking.pumpName }}</h3>
          <p class="snapshot-simple-wait-label">{{ t('snapshot.estimatedWait') }}</p>
          <p class="snapshot-simple-wait-time">{{ formatCountdown(etaCountdownSeconds[booking.id] ?? 0) }}</p>
        </div>

        <div class="snapshot-simple-stats">
          <p><span>{{ t('snapshot.yourSerial') }}</span><strong>#{{ booking.serial }}</strong></p>
          <p><span>{{ t('snapshot.runningNow') }}</span><strong>#{{ booking.runningSerial }}</strong></p>
          <p><span>{{ t('snapshot.queueAhead') }}</span><strong>{{ queueAhead(booking.serial, booking.runningSerial) }}</strong></p>
          <p><span>{{ t('snapshot.slotsLeftToday') }}</span><strong>{{ booking.remainingSlots }}</strong></p>
        </div>

        <div class="snapshot-item-footer">
          <p class="tiny snapshot-simple-fuel">
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

<style scoped>
.snapshot-simple-item {
  border: 1px solid var(--stroke);
  border-radius: 12px;
  padding: 0.75rem;
  background: #fbfdf9;
}

.snapshot-simple-head {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.snapshot-simple-wait-label {
  margin-top: 0.3rem;
  font-size: 0.76rem;
  color: var(--muted);
}

.snapshot-simple-wait-time {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--brand);
}

.snapshot-simple-stats {
  margin-top: 0.55rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.45rem;
}

.snapshot-simple-stats p {
  margin: 0;
  padding: 0.5rem 0.6rem;
  border-radius: 10px;
  background: #f4f8f2;
}

.snapshot-simple-stats span {
  display: block;
  font-size: 0.74rem;
  color: var(--muted);
  margin-bottom: 0.15rem;
}

.snapshot-simple-fuel {
  margin-top: 0;
  padding: 0.45rem 0.65rem;
  border-radius: 10px;
  background: #eef8f2;
  color: var(--brand);
  border: 1px solid rgba(9, 87, 63, 0.12);
}
</style>
