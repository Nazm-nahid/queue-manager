<script setup lang="ts">
import type { Pump } from '../data/mockPumps';
import { useI18n } from '../i18n';

defineProps<{ pump: Pump }>();
const { t } = useI18n();

function handleSerial(pumpId: string | number) {
  alert("Your serial is: " + pumpId);
}
</script>

<template>
  <article class="pump-card">
    <div class="pump-body">
      <h3 class="pump-title">{{ pump.name }}</h3>
      <p class="pump-text">{{ pump.address }}</p>
      <p class="pump-text">
        {{ t('pump.running') }}: {{ pump.runningSerial }} {{ t('number') }}
      </p>
      <p class="pump-text">
        {{ t('pump.next') }} {{ pump.nextSerial }} {{ t('people') }}
      </p>
      <p class="pump-text">{{ t('pump.slotsLeft') }}: {{ pump.dailySerialLimit - pump.nextSerial }} {{ t('ti') }}</p>

      <div class="pump-actions">
        <a :href="pump.googleMapLink" target="_blank" rel="noopener noreferrer" class="ghost-button">
          {{ t('pump.viewMaps') }}
        </a>
        <button @click="handleSerial(pump.id)" class="solid-button">{{ t('buttons.takeSerial') }}</button>
        <router-link :to="`/checkin/${pump.id}`" class="ghost-button centered">
          {{ t('pumpDetail.openCheckin') }}
        </router-link>
      </div>
    </div>
  </article>
</template>
