<script setup lang="ts">
import { BrowserMultiFormatReader } from '@zxing/browser';
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useI18n } from '../i18n';

const props = defineProps<{
  open: boolean;
  title: string;
  hint?: string;
}>();

const emit = defineEmits<{
  close: [];
  scan: [value: string];
}>();

const { t } = useI18n();
const videoEl = ref<HTMLVideoElement | null>(null);
const status = ref<'idle' | 'starting' | 'scanning' | 'error'>('idle');
const errorMessage = ref('');

let reader: BrowserMultiFormatReader | null = null;
let controls: { stop: () => void } | null = null;
let hasScanned = false;

function stopScanner() {
  try {
    controls?.stop();
  } catch {
    // ignore stop errors
  }
  controls = null;
  reader = null;
  hasScanned = false;
  status.value = 'idle';
}

async function startScanner() {
  stopScanner();
  if (!props.open) return;

  status.value = 'starting';
  errorMessage.value = '';

  await nextTick();

  if (!videoEl.value) return;

  try {
    reader = new BrowserMultiFormatReader();
    controls = await reader.decodeFromConstraints(
      {
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
        },
      },
      videoEl.value,
      (result, error) => {
        if (result && !hasScanned) {
          hasScanned = true;
          const text = result.getText().trim();
          stopScanner();
          emit('scan', text);
          emit('close');
          return;
        }

        if (error && error.name !== 'NotFoundException') {
          errorMessage.value = error.message || t('qrScanner.cameraUnavailable');
          status.value = 'error';
        }
      },
    );

    status.value = 'scanning';
  } catch (error) {
    status.value = 'error';
    errorMessage.value = error instanceof Error ? error.message : t('qrScanner.cameraUnavailable');
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      void startScanner();
    } else {
      stopScanner();
    }
  },
  { immediate: true },
);

onBeforeUnmount(stopScanner);
</script>

<template>
  <teleport to="body">
    <div v-if="open" class="scanner-overlay" @click.self="emit('close')">
      <div class="scanner-modal" role="dialog" aria-modal="true" :aria-label="title">
        <div class="scanner-header">
          <div>
            <p class="kicker">{{ t('pumpDetail.kicker') }}</p>
            <h2>{{ title }}</h2>
            <p class="tiny">{{ hint || t('qrScanner.hint') }}</p>
          </div>
          <button type="button" class="scanner-close" @click="emit('close')">
            {{ t('qrScanner.close') }}
          </button>
        </div>

        <div class="scanner-stage">
          <video ref="videoEl" class="scanner-video" autoplay muted playsinline></video>
          <div class="scanner-frame" aria-hidden="true"></div>
          <div class="scanner-glow" aria-hidden="true"></div>
        </div>

        <div class="scanner-footer">
          <p v-if="status === 'starting'" class="tiny">{{ t('qrScanner.scanning') }}</p>
          <p v-else-if="status === 'error'" class="scanner-error">{{ errorMessage }}</p>
          <p v-else class="tiny">{{ t('qrScanner.pointCamera') }}</p>
          <button type="button" class="ghost-button full" @click="emit('close')">
            {{ t('qrScanner.close') }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.scanner-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(12, 22, 18, 0.72);
  backdrop-filter: blur(10px);
}

.scanner-modal {
  width: min(92vw, 480px);
  border-radius: 24px;
  background: linear-gradient(180deg, #f9fffb 0%, #f0f6f1 100%);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.26);
  overflow: hidden;
}

.scanner-header,
.scanner-footer {
  padding: 1rem 1rem 0.95rem;
}

.scanner-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.scanner-close {
  border: 1px solid var(--stroke);
  background: #fff;
  border-radius: 999px;
  padding: 0.45rem 0.75rem;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  color: var(--ink);
}

.scanner-stage {
  position: relative;
  min-height: 320px;
  margin: 0 1rem;
  border-radius: 22px;
  overflow: hidden;
  background: #081310;
  border: 1px solid rgba(9, 87, 63, 0.18);
}

.scanner-video {
  width: 100%;
  height: 100%;
  min-height: 320px;
  object-fit: cover;
}

.scanner-frame {
  position: absolute;
  inset: 17%;
  border: 2px solid rgba(255, 255, 255, 0.92);
  border-radius: 20px;
  box-shadow: 0 0 0 999px rgba(4, 11, 9, 0.38);
}

.scanner-glow {
  position: absolute;
  inset: 21%;
  border-radius: 18px;
  border: 1px solid rgba(255, 159, 28, 0.85);
  box-shadow: 0 0 40px rgba(255, 159, 28, 0.28);
  animation: pulse 1.7s ease-in-out infinite;
}

.scanner-error {
  margin: 0;
  color: #a32626;
  font-size: 0.9rem;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.65;
    transform: scale(0.985);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>