<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '../i18n';

const props = defineProps<{
  userSerial: number;
  runningSerial: number;
  remainingSlots: number;
  etaMinutes: number;
  fuelType?: string | null;
}>();

const serialGap = computed(() => Math.max(props.userSerial - props.runningSerial, 0));
const { t } = useI18n();

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
    <div class="snapshot-grid">
      <p><span>{{ t('snapshot.yourSerial') }}</span><strong>#{{ userSerial }}</strong></p>
      <p><span>{{ t('snapshot.runningNow') }}</span><strong>#{{ runningSerial }}</strong></p>
      <p><span>{{ t('snapshot.queueAhead') }}</span><strong>{{ serialGap }}</strong></p>
      <p><span>{{ t('snapshot.slotsLeftToday') }}</span><strong>{{ remainingSlots }}</strong></p>
      <p>
        <span>{{ t('snapshot.estimatedWait') }}</span>
        <strong>{{ t('snapshot.minutes', { minutes: etaMinutes }) }}</strong>
      </p>
    </div>

    <p v-if="fuelType" class="tiny snapshot-fuel">
      {{ t('snapshot.selectedFuel') }}: {{ fuelLabel(fuelType) }}
    </p>
  </section>
</template>
