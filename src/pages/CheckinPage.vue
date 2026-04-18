<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { pumps, type Pump } from '../data/mockPumps';
import { useToast } from '../composables/useToast';
import { useI18n } from '../i18n';
import { saveCheckinToFirebase } from '../services/checkinService';
import { fetchPumpByIdFromFirebase } from '../services/pumpService';
import { useAuth } from '../composables/useAuth';
import { useAuthModal } from '../composables/useAuthModal';

const route = useRoute();
const router = useRouter();
const hasCheckedIn = ref(false);
const showAttendanceModal = ref(false);
const isSubmittingCheckin = ref(false);
const hasTriggeredAutoCheckin = ref(false);
const hasInvalidToken = ref(false);
const token = computed(() => String(route.query.token || 'demo-token'));
const bookingId = computed(() => {
  const value = route.query.bookingId;
  return typeof value === 'string' && value.trim() ? value : null;
});
const pump = ref<Pump | null>(null);
const isLoadingPump = ref(true);
const { t } = useI18n();
const toast = useToast();
const { currentUser } = useAuth();
const { openAuthModal } = useAuthModal();

function parseQrToken(rawToken: string) {
  const trimmed = rawToken.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed) as {
        pump_id?: string | number;
        secret?: string;
      };

      const rawPumpId = parsed.pump_id;
      const hash = parsed.secret;
      if (rawPumpId === undefined || !hash) {
        return null;
      }

      return { pumpId: String(rawPumpId), hash };
    } catch {
      return null;
    }
  }
}

function resolveCandidatePumpIds(rawPumpId: string) {
  const normalized = rawPumpId.trim();
  if (!normalized) {
    return [];
  }

  if (/^\d+$/.test(normalized)) {
    const padded = normalized.padStart(3, '0');
    return [normalized, `pump-${padded}`];
  }

  return [normalized];
}

function isValidQrToken() {
  if (!pump.value) {
    return false;
  }

  const parsedToken = parseQrToken(token.value);
  if (!parsedToken) {
    return false;
  }

  const candidatePumpIds = resolveCandidatePumpIds(parsedToken.pumpId);
  return candidatePumpIds.includes(pump.value.id) && parsedToken.hash === pump.value.qrSecretHash;
}

async function handleSignIn() {
  const signedIn = await openAuthModal();
  if (signedIn) {
    toast.success(t('auth.signInSuccess'));
  }
}

async function loadPump() {
  isLoadingPump.value = true;
  const pumpId = String(route.params.pumpId);

  try {
    const backendPump = await fetchPumpByIdFromFirebase(pumpId);
    const localPumpFallback = pumps.find((item) => item.id === pumpId) || null;
    // If a specific Firestore pump document is missing, keep check-in usable with local seed data.
    if (backendPump && localPumpFallback) {
      pump.value = {
        ...backendPump,
        qrSecretHash: (backendPump as Partial<Pump>).qrSecretHash || localPumpFallback.qrSecretHash,
      };
    } else {
      pump.value = backendPump || localPumpFallback;
    }
  } catch {
    pump.value = pumps.find((item) => item.id === pumpId) || null;
  } finally {
    isLoadingPump.value = false;
  }
}

async function confirmCheckin() {
  if (!pump.value || hasCheckedIn.value || isSubmittingCheckin.value) {
    return;
  }

  if (!currentUser.value) {
    await handleSignIn();
    return;
  }

  if (!isValidQrToken()) {
    hasInvalidToken.value = true;
    toast.error(t('checkin.invalidLead'));
    return;
  }

  isSubmittingCheckin.value = true;

  try {
    await saveCheckinToFirebase(pump.value.id, token.value, bookingId.value ?? undefined);
  } catch {
    // Keep local success for demo mode when firebase is not configured.
  } finally {
    isSubmittingCheckin.value = false;
  }

  hasCheckedIn.value = true;
  showAttendanceModal.value = true;
}

async function closeAttendanceModal() {
  showAttendanceModal.value = false;
  await router.replace('/');
}

onMounted(() => {
  void loadPump();
});

watch(
  [() => pump.value, () => currentUser.value],
  () => {
    if (!pump.value || !currentUser.value || hasTriggeredAutoCheckin.value) {
      return;
    }

    hasTriggeredAutoCheckin.value = true;
    void confirmCheckin();
  },
  { immediate: true },
);
</script>

<template>
  <section v-if="isLoadingPump" class="panel">
    <p class="hint-text">{{ t('home.loadingPumps') }}</p>
  </section>

  <section v-else-if="pump && !hasInvalidToken" class="stack">
    <article class="panel">
      <p class="kicker">{{ t('checkin.kicker') }}</p>
      <h1>{{ pump?.name }}</h1>
      <p class="lead">{{ t('checkin.lead') }}</p>
    </article>

    <article v-if="!currentUser" class="panel auth-required-panel">
      <h2>{{ t('auth.checkinTitle') }}</h2>
      <p class="hint-text">{{ t('auth.checkinLead') }}</p>
      <button type="button" class="solid-button centered" @click="handleSignIn">
        {{ t('auth.signIn') }}
      </button>
    </article>

    <article class="panel">
      <h2>{{ t('checkin.howWorks') }}</h2>
      <ul class="list">
        <li>{{ t('checkin.step1') }}</li>
        <li>{{ t('checkin.step2') }}</li>
        <li>{{ t('checkin.step3') }}</li>
      </ul>

      <button class="solid-button full" @click="confirmCheckin" :disabled="hasCheckedIn || !currentUser || isSubmittingCheckin">
        {{ hasCheckedIn ? t('checkin.confirmed') : t('checkin.confirmArrival') }}
      </button>
    </article>
  </section>

  <section v-else class="panel">
    <h1>{{ t('checkin.invalidTitle') }}</h1>
    <p class="lead">{{ t('checkin.invalidLead') }}</p>
    <router-link to="/" class="solid-button">{{ t('common.backToHome') }}</router-link>
  </section>

  <teleport to="body">
    <div v-if="showAttendanceModal" class="attendance-overlay" @click.self="closeAttendanceModal">
      <article class="panel attendance-modal" role="dialog" aria-modal="true" :aria-label="t('checkin.attendanceRecordedTitle')">
        <h2>{{ t('checkin.attendanceRecordedTitle') }}</h2>
        <p class="lead">{{ t('checkin.attendanceRecordedLead') }}</p>
        <button type="button" class="solid-button full" @click="closeAttendanceModal">
          {{ t('checkin.backToQueue') }}
        </button>
      </article>
    </div>
  </teleport>
</template>

<style scoped>
.attendance-overlay {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(18, 27, 20, 0.58);
  z-index: 70;
  padding: 1rem;
}

.attendance-modal {
  width: min(92vw, 420px);
}
</style>
