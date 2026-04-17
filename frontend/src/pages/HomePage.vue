<script setup lang="ts">
import { computed, ref } from 'vue';
import PumpCard from '../components/PumpCard.vue';
import PumpSearchBar from '../components/PumpSearchBar.vue';
import QueueSnapshotCard from '../components/QueueSnapshotCard.vue';
import { pumps } from '../data/mockPumps';
import { useI18n } from '../i18n';

type SerialBooking = {
  id: string;
  pumpId: string;
  serial: number;
  fuelType: string;
  pumpName: string;
  runningSerial: number;
  remainingSlots: number;
  etaMinutes: number;
};


const query = ref('');
const { t } = useI18n();
const activeHomeTab = ref<'queue' | 'search'>('queue');

const bookedSerials = ref<SerialBooking[]>([]);

const filteredPumps = computed(() => {
  const term = query.value.toLowerCase().trim();
  if (!term) {
    return pumps;
  }

  return pumps.filter((pump) => {
    return (
      pump.name.toLowerCase().includes(term) ||
      pump.address.toLowerCase().includes(term) ||
      pump.googleMapLink.toLowerCase().includes(term)
    );
  });
});

function handleTakeSerial(payload: { serial: number; fuelType: string; pumpId: string }) {
  const pump = pumps.find((item) => item.id === payload.pumpId);
  if (!pump) {
    return;
  }

  const gap = Math.max(payload.serial - pump.runningSerial, 0);
  const newBooking: SerialBooking = {
    id: `${payload.pumpId}-${payload.fuelType}-${payload.serial}-${Date.now()}`,
    pumpId: payload.pumpId,
    serial: payload.serial,
    fuelType: payload.fuelType,
    pumpName: pump.name,
    runningSerial: pump.runningSerial,
    remainingSlots: pump.dailySerialLimit - pump.nextSerial,
    etaMinutes: gap * pump.serviceMinutesPerVehicle,
  };

  bookedSerials.value = [newBooking, ...bookedSerials.value];
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

    <p class="result-count">{{ t('home.resultCount', { count: filteredPumps.length }) }}</p>

    <div class="card-list">
      <PumpCard v-for="pump in filteredPumps" :key="pump.id" :pump="pump" @take-serial="handleTakeSerial" />
    </div>
  </section>
</template>
