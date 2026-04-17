<script setup lang="ts">
import { computed, ref } from 'vue';
import PumpCard from '../components/PumpCard.vue';
import PumpSearchBar from '../components/PumpSearchBar.vue';
import QueueSnapshotCard from '../components/QueueSnapshotCard.vue';
import { pumps, type Pump } from '../data/mockPumps';
import { useI18n } from '../i18n';


const query = ref('');
const { t } = useI18n();

const bookedSerial = ref<number | null>(null);
const bookedFuelType = ref<string | null>(null);
const bookedPump = ref<Pump | null>(null);

const estimatedMinutes = computed(() => {
  if (!bookedPump.value || bookedSerial.value === null) {
    return 0;
  }

  const gap = Math.max(bookedSerial.value - bookedPump.value.runningSerial, 0);
  return gap * bookedPump.value.serviceMinutesPerVehicle;
});

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
  bookedSerial.value = payload.serial;
  bookedFuelType.value = payload.fuelType;
  bookedPump.value = pumps.find((pump) => pump.id === payload.pumpId) ?? null;
}
</script>

<template>
  <section class="hero">
    <!-- <p class="kicker">{{ t('home.kicker') }}</p> -->
    <h1>{{ t('home.title') }}</h1>
    <p class="lead">{{ t('home.lead') }}</p>
  </section>

  <QueueSnapshotCard
    v-if="bookedSerial !== null && bookedPump"
    :user-serial="bookedSerial"
    :running-serial="bookedPump.runningSerial"
    :remaining-slots="bookedPump.dailySerialLimit - bookedPump.nextSerial"
    :eta-minutes="estimatedMinutes"
    :fuel-type="bookedFuelType"
  />

  <section class="stack">
    <PumpSearchBar v-model="query" />

    <p class="result-count">{{ t('home.resultCount', { count: filteredPumps.length }) }}</p>

    <div class="card-list">
      <PumpCard v-for="pump in filteredPumps" :key="pump.id" :pump="pump" @take-serial="handleTakeSerial" />
    </div>
  </section>
</template>
