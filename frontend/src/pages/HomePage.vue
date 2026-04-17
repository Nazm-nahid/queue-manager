<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import PumpCard from '../components/PumpCard.vue';
import PumpSearchBar from '../components/PumpSearchBar.vue';
import QueueSnapshotCard from '../components/QueueSnapshotCard.vue';
import { pumps } from '../data/mockPumps';
import { useI18n } from '../i18n';


const query = ref('');
const { t } = useI18n();
const route = useRoute();

const selectedPump = computed(() => {
  return pumps.find((pump) => pump.slug === String(route.params.slug));
});

const bookedSerial = ref<number | null>(null);

const estimatedMinutes = computed(() => {
  if (!selectedPump.value || bookedSerial.value === null) {
    return 0;
  }

  const gap = Math.max(bookedSerial.value - selectedPump.value.runningSerial, 0);
  return gap * selectedPump.value.serviceMinutesPerVehicle;
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
</script>

<template>
  <section class="hero">
    <!-- <p class="kicker">{{ t('home.kicker') }}</p> -->
    <h1>{{ t('home.title') }}</h1>
    <p class="lead">{{ t('home.lead') }}</p>
  </section>

  <QueueSnapshotCard
    v-if="bookedSerial !== null && selectedPump"
    :user-serial="bookedSerial"
    :running-serial="selectedPump.runningSerial"
    :remaining-slots="selectedPump.dailySerialLimit - selectedPump.nextSerial"
    :eta-minutes="estimatedMinutes"
  />

  <section class="stack">
    <PumpSearchBar v-model="query" />

    <p class="result-count">{{ t('home.resultCount', { count: filteredPumps.length }) }}</p>

    <div class="card-list">
      <PumpCard v-for="pump in filteredPumps" :key="pump.id" :pump="pump" />
    </div>
  </section>
</template>
