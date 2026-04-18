<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import PumpCard from '../components/PumpCard.vue';
import PumpSearchBar from '../components/PumpSearchBar.vue';
import QueueSnapshotCard from '../components/QueueSnapshotCard.vue';
import { pumps, type FuelType } from '../data/mockPumps';
import { useToast } from '../composables/useToast';
import { useI18n } from '../i18n';
import { watchUserBookings } from '../services/bookingService';
import { fetchPumpsFromFirebase, takeSerialFromFirebase } from '../services/pumpService';
import { useAuth } from '../composables/useAuth';

type SerialBooking = {
  id: string;
  pumpId: string;
  createdAtMs: number;
  serial: number;
  fuelType: FuelType;
  pumpName: string;
  pumpLocation: string;
  runningSerial: number;
  remainingSlots: number;
  etaMinutes: number;
};


const query = ref('');
const { t } = useI18n();
const toast = useToast();
const { currentUser, signInWithGoogle } = useAuth();
const activeHomeTab = ref<'queue' | 'search'>('queue');

const bookedSerials = ref<SerialBooking[]>([]);
const availablePumps = ref<typeof pumps>([]);
const isLoadingPumps = ref(true);
const hasPumpLoadError = ref(false);

let hasLoadedPumpListOnce = false;
let stopWatchingBookings: (() => void) | null = null;

function stopBookingListener() {
  if (stopWatchingBookings) {
    stopWatchingBookings();
    stopWatchingBookings = null;
  }
}

const filteredPumps = computed(() => {
  const term = query.value.toLowerCase().trim();
  if (!term) {
    return availablePumps.value;
  }

  return availablePumps.value.filter((pump) => {
    return (
      pump.name.toLowerCase().includes(term) ||
      pump.address.toLowerCase().includes(term) ||
      pump.googleMapLink.toLowerCase().includes(term)
    );
  });
});

function isFuelType(value: string): value is FuelType {
  return value === 'diesel' || value === 'petrol' || value === 'octane';
}

async function loadPumps() {
  isLoadingPumps.value = true;
  hasPumpLoadError.value = false;

  try {
    if (!navigator.onLine) {
      throw new Error('offline');
    }

    const firebasePumps = await fetchPumpsFromFirebase();
    availablePumps.value = firebasePumps.length > 0 ? firebasePumps : pumps;
    if (!hasLoadedPumpListOnce) {
      hasLoadedPumpListOnce = true;
    }
  } catch {
    // Keep app usable with local seed data if backend is unavailable.
    availablePumps.value = pumps;
    hasPumpLoadError.value = availablePumps.value.length === 0;
    toast.error(t('toast.listLoadFailed'));
  } finally {
    isLoadingPumps.value = false;
  }
}

function handleOffline() {
  toast.error(t('toast.offline'));
}

function handleOnline() {
  toast.info(t('toast.online'));
  if (hasPumpLoadError.value) {
    void loadPumps();
  }
}

onMounted(() => {
  void loadPumps();
  window.addEventListener('offline', handleOffline);
  window.addEventListener('online', handleOnline);
});

watch(
  currentUser,
  () => {
    stopBookingListener();
    bookedSerials.value = [];

    if (currentUser.value) {
      activeHomeTab.value = 'queue';
      stopWatchingBookings = watchUserBookings(currentUser.value.uid, (bookings) => {
        bookedSerials.value = bookings;
      });
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  stopBookingListener();
  window.removeEventListener('offline', handleOffline);
  window.removeEventListener('online', handleOnline);
});

async function handleTakeSerial(payload: { serial: number; fuelType: string; pumpId: string }) {
  if (!currentUser.value) {
    try {
      await signInWithGoogle();
      toast.success(t('auth.signInSuccess'));
    } catch {
      toast.info(t('auth.signInToTakeSerial'));
      return;
    }
  }

  if (!navigator.onLine) {
    toast.error(t('toast.takeSerialFailed'));
    return;
  }

  if (!isFuelType(payload.fuelType)) {
    toast.error(t('toast.takeSerialFailed'));
    return;
  }

  const bookingPayload = availablePumps.value.find((item) => item.id === payload.pumpId);
  if (!bookingPayload) {
    toast.error(t('toast.takeSerialFailed'));
    return;
  }

  try {
    const result = await takeSerialFromFirebase(payload.pumpId, payload.fuelType);
    const newBooking: SerialBooking = {
      id: result.bookingId,
      pumpId: payload.pumpId,
      createdAtMs: result.createdAtMs,
      serial: result.serial,
      fuelType: payload.fuelType,
      pumpName: result.pumpName,
      pumpLocation: result.pumpLocation,
      runningSerial: result.runningSerial,
      remainingSlots: result.remainingSlots,
      etaMinutes: result.etaMinutes,
    };

    bookedSerials.value = [newBooking, ...bookedSerials.value.filter((booking) => booking.id !== newBooking.id)];
    toast.success(
      t('toast.takeSerialSuccess', {
        serial: result.serial,
        fuel: t(`fuelTypes.${payload.fuelType}`),
        pump: result.pumpName,
      }),
    );
    void loadPumps();
    return;
  } catch (error) {
    if (error instanceof Error && error.message === 'SERIAL_LIMIT_REACHED') {
      toast.error(t('buttons.serialLimitReached'));
      return;
    }

    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      try {
        await signInWithGoogle();
        toast.success(t('auth.signInSuccess'));
      } catch {
        toast.info(t('auth.signInToTakeSerial'));
      }
      return;
    }

    toast.error(t('toast.takeSerialFailed'));
  }
}
</script>

<template>
  <section class="hero">
    <!-- <p class="kicker">{{ t('home.kicker') }}</p> -->
    <h1>{{ t('home.title') }}</h1>
    <p class="lead">{{ t('home.lead') }}</p>
  </section>

  <section class="home-tabs" role="tablist" :aria-label="t('home.tabs.title')">
    <button
      type="button"
      class="home-tab"
      :class="{ active: activeHomeTab === 'search' }"
      role="tab"
      :aria-selected="activeHomeTab === 'search'"
      @click="activeHomeTab = 'search'"
    >
      {{ t('home.tabs.search') }}
    </button>
    <button
      type="button"
      class="home-tab"
      :class="{ active: activeHomeTab === 'queue' }"
      role="tab"
      :aria-selected="activeHomeTab === 'queue'"
      @click="activeHomeTab = 'queue'"
    >
      {{ t('home.tabs.queue') }}
    </button>
  </section>

  <section v-if="activeHomeTab === 'queue'" class="stack">
    <QueueSnapshotCard v-if="currentUser && bookedSerials.length > 0" :bookings="bookedSerials" />
    <article v-else class="panel">
      <h2>{{ currentUser ? t('home.emptyQueueTitle') : t('auth.queueTitle') }}</h2>
      <p class="hint-text">
        {{ currentUser ? t('home.emptyQueueLead') : t('auth.queueLead') }}
      </p>
      <button v-if="!currentUser" type="button" class="solid-button centered" @click="signInWithGoogle">
        {{ t('auth.signIn') }}
      </button>
    </article>
  </section>

  <section v-else class="stack">
    <PumpSearchBar v-model="query" />

    <article v-if="isLoadingPumps" class="panel">
      <p class="hint-text">{{ t('home.loadingPumps') }}</p>
    </article>

    <article v-else-if="hasPumpLoadError" class="panel">
      <h2>{{ t('home.loadFailed') }}</h2>
      <button type="button" class="solid-button centered" @click="loadPumps">{{ t('home.retryLoad') }}</button>
    </article>

    <div v-else class="card-list">
      <PumpCard
        v-for="pump in filteredPumps"
        :key="pump.id"
        :pump="pump"
        :requires-auth="!currentUser"
        @take-serial="handleTakeSerial"
      />
    </div>
  </section>
</template>
