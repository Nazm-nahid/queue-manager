<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import PumpCard from '../components/PumpCard.vue';
import PumpSearchBar from '../components/PumpSearchBar.vue';
import QueueSnapshotCard from '../components/QueueSnapshotCard.vue';
import { pumps, type FuelType } from '../data/mockPumps';
import { useToast } from '../composables/useToast';
import { useI18n } from '../i18n';

type SerialBooking = {
  id: string;
  pumpId: string;
  serial: number;
  fuelType: FuelType;
  pumpName: string;
  runningSerial: number;
  remainingSlots: number;
  etaMinutes: number;
};


const query = ref('');
const { t } = useI18n();
const toast = useToast();
const activeHomeTab = ref<'queue' | 'search'>('queue');

const bookedSerials = ref<SerialBooking[]>([]);
const availablePumps = ref<typeof pumps>([]);
const isLoadingPumps = ref(true);
const hasPumpLoadError = ref(false);

let hasLoadedPumpListOnce = false;

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

    await new Promise<void>((resolve) => {
      window.setTimeout(() => resolve(), 220);
    });

    availablePumps.value = pumps;
    if (!hasLoadedPumpListOnce) {
      hasLoadedPumpListOnce = true;
      toast.success(t('toast.listLoadSuccess'));
    }
  } catch {
    availablePumps.value = [];
    hasPumpLoadError.value = true;
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

onBeforeUnmount(() => {
  window.removeEventListener('offline', handleOffline);
  window.removeEventListener('online', handleOnline);
});

function handleTakeSerial(payload: { serial: number; fuelType: string; pumpId: string }) {
  if (!navigator.onLine) {
    toast.error(t('toast.takeSerialFailed'));
    return;
  }

  const pump = availablePumps.value.find((item) => item.id === payload.pumpId);
  if (!pump || !isFuelType(payload.fuelType)) {
    toast.error(t('toast.takeSerialFailed'));
    return;
  }

  const fuelQueue = pump.fuelQueues[payload.fuelType];
  if (fuelQueue.nextSerial > fuelQueue.dailySerialLimit) {
    toast.error(t('buttons.serialLimitReached'));
    return;
  }

  const gap = Math.max(payload.serial - fuelQueue.runningSerial, 0);
  const newBooking: SerialBooking = {
    id: `${payload.pumpId}-${payload.fuelType}-${payload.serial}-${Date.now()}`,
    pumpId: payload.pumpId,
    serial: payload.serial,
    fuelType: payload.fuelType,
    pumpName: pump.name,
    runningSerial: fuelQueue.runningSerial,
    remainingSlots: fuelQueue.dailySerialLimit - fuelQueue.nextSerial,
    etaMinutes: gap * fuelQueue.serviceMinutesPerVehicle,
  };

  bookedSerials.value = [newBooking, ...bookedSerials.value];
  fuelQueue.nextSerial += 1;
  toast.success(
    t('toast.takeSerialSuccess', {
      serial: payload.serial,
      fuel: t(`fuelTypes.${payload.fuelType}`),
      pump: pump.name,
    }),
  );
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
    <QueueSnapshotCard v-if="bookedSerials.length > 0" :bookings="bookedSerials" />
    <article v-else class="panel">
      <h2>{{ t('home.emptyQueueTitle') }}</h2>
      <p class="hint-text">{{ t('home.emptyQueueLead') }}</p>
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
      <PumpCard v-for="pump in filteredPumps" :key="pump.id" :pump="pump" @take-serial="handleTakeSerial" />
    </div>
  </section>
</template>
