<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from '../composables/useToast';
import { useI18n } from '../i18n';
import QrScannerModal from './QrScannerModal.vue';

const props = defineProps<{
  bookings: Array<{
    id: string;
    pumpId: string;
    createdAtMs: number;
    serial: number;
    runningSerial: number;
    remainingSlots: number;
    etaMinutes: number;
    fuelType: string;
    pumpName: string;
    pumpLocation: string;
  }>;
}>();

const scannerBooking = ref<(typeof props.bookings)[number] | null>(null);
const nowMs = ref(Date.now());
const { t } = useI18n();
const toast = useToast();
const router = useRouter();
let countdownTimerId: number | null = null;

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

function startCountdown() {
  if (countdownTimerId !== null) {
    return;
  }

  countdownTimerId = window.setInterval(() => {
    nowMs.value = Date.now();
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

function remainingEtaSeconds(booking: (typeof props.bookings)[number]) {
  const totalSeconds = Math.max(booking.etaMinutes * 60, 0);
  const elapsedSeconds = Math.max(Math.floor((nowMs.value - booking.createdAtMs) / 1000), 0);
  return Math.max(totalSeconds - elapsedSeconds, 0);
}

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
          <h3 class="snapshot-item-title">{{ booking.pumpName }}</h3>
          <h4 class="snapshot-item-subtitle">
            <svg
              class="location-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M12 22C12 22 19 15.2 19 10A7 7 0 1 0 5 10C5 15.2 12 22 12 22Z"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle cx="12" cy="10" r="2.6" stroke="currentColor" stroke-width="1.8" />
            </svg>
            {{ booking.pumpLocation }}
          </h4>
        </div>
        <div class="snapshot-simple-stats">
          <div>
            <p class="snapshot-simple-wait-label">{{ t('snapshot.estimatedWait') }}</p>
            <p class="snapshot-simple-wait-time">{{ formatCountdown(remainingEtaSeconds(booking)) }} {{ t('snapshot.minutes') }}</p>
          </div>
          <div>
            <p class="tiny snapshot-simple-fuel">
            {{ fuelLabel(booking.fuelType) }}
          </p>
          </div>

        </div>

        <div class="snapshot-simple-stats">
          <p><span>{{ t('snapshot.yourSerial') }}</span><strong>#{{ booking.serial }}</strong></p>
          <p><span>{{ t('snapshot.runningNow') }}</span><strong>#{{ booking.runningSerial }}</strong></p>
        </div>

        <div class="snapshot-item-footer">
          <button type="button" class="solid-button w-full" @click="openScanner(booking)">
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
  background-color: var(--brand-background);
  padding: 0.5rem;
  border-radius: 12px;
}

.snapshot-item-subtitle {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--muted);
}

.location-icon {
  width: 0.95rem;
  height: 0.95rem;
  flex: 0 0 auto;
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
  color: var(--accent);
  text-align: center;
}

.w-full {
  width: 100%;
}
</style>
