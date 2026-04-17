<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '../i18n';

const props = defineProps<{
  userSerial: number;
  runningSerial: number;
  remainingSlots: number;
  etaMinutes: number;
}>();

const serialGap = computed(() => Math.max(props.userSerial - props.runningSerial, 0));
const { t } = useI18n();
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
  </section>
</template>
