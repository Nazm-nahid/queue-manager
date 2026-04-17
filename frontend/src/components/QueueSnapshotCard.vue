<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from '../i18n';

const props = defineProps<{
  bookings: Array<{
    id: string;
    serial: number;
    runningSerial: number;
    remainingSlots: number;
    etaMinutes: number;
    fuelType: string;
    pumpName: string;
  }>;
}>();

const activeTab = ref(0);
const { t } = useI18n();

watch(
  () => props.bookings,
  () => {
    if (activeTab.value >= props.bookings.length) {
      activeTab.value = 0;
    }
  },
  { deep: true },
);

const currentBooking = computed(() => props.bookings[activeTab.value]);

const serialGap = computed(() => {
  if (!currentBooking.value) {
    return 0;
  }

  return Math.max(currentBooking.value.serial - currentBooking.value.runningSerial, 0);
});

function fuelLabel(fuelType?: string | null) {
  if (!fuelType) {
    return '';
  }

  if (fuelType === 'diesel' || fuelType === 'petrol' || fuelType === 'octane') {
    return t(`fuelTypes.${fuelType}`);
  }

  return fuelType;
}
</script>

<template>
  <section class="snapshot-card">
    <h2>{{ t('snapshot.title') }}</h2>

    <div class="snapshot-tabs" role="tablist" :aria-label="t('snapshot.title')">
      <button
        v-for="(booking, index) in bookings"
        :key="booking.id"
        type="button"
        class="snapshot-tab"
        :class="{ active: index === activeTab }"
        role="tab"
        :aria-selected="index === activeTab"
        @click="activeTab = index"
      >
        {{ fuelLabel(booking.fuelType) }} - {{ booking.pumpName }}
      </button>
    </div>

    <template v-if="currentBooking">
    <div class="snapshot-grid">
      <p><span>{{ t('snapshot.yourSerial') }}</span><strong>#{{ currentBooking.serial }}</strong></p>
      <p><span>{{ t('snapshot.runningNow') }}</span><strong>#{{ currentBooking.runningSerial }}</strong></p>
      <p><span>{{ t('snapshot.queueAhead') }}</span><strong>{{ serialGap }}</strong></p>
      <p><span>{{ t('snapshot.slotsLeftToday') }}</span><strong>{{ currentBooking.remainingSlots }}</strong></p>
      <p>
        <span>{{ t('snapshot.estimatedWait') }}</span>
        <strong>{{ t('snapshot.minutes', { minutes: currentBooking.etaMinutes }) }}</strong>
      </p>
    </div>

    <p class="tiny snapshot-fuel">
      {{ t('snapshot.selectedFuel') }}: {{ fuelLabel(currentBooking.fuelType) }}
    </p>
    </template>
  </section>
</template>
