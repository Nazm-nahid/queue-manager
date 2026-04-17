<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { Pump } from '../data/mockPumps';
import { useI18n } from '../i18n';
import QrScannerModal from './QrScannerModal.vue';

const props = defineProps<{ pump: Pump }>();
const { t } = useI18n();
const router = useRouter();
const isScannerOpen = ref(false);

function handleSerial(pumpId: string | number) {
  alert("Your serial is: " + pumpId);
}

function openScanner() {
  isScannerOpen.value = true;
}

function handleQrScan(scannedValue: string) {
  void router.push({
    path: `/checkin/${props.pump.id}`,
    query: { token: scannedValue },
  });
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
        <button type="button" class="ghost-button centered" @click="openScanner">
          {{ t('pumpDetail.openCheckin') }}
        </button>
      </div>
    </div>

    <QrScannerModal
      :open="isScannerOpen"
      :title="t('qrScanner.title')"
      :hint="t('qrScanner.subtitle')"
      @close="isScannerOpen = false"
      @scan="handleQrScan"
    />
  </article>
</template>
