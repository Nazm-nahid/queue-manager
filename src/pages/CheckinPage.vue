<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { pumps, type Pump } from '../data/mockPumps';
import { useToast } from '../composables/useToast';
import { useI18n } from '../i18n';
import { saveCheckinToFirebase } from '../services/checkinService';
import { fetchPumpByIdFromFirebase } from '../services/pumpService';
import { useAuth } from '../composables/useAuth';
import { useAuthModal } from '../composables/useAuthModal';

const route = useRoute();
const hasCheckedIn = ref(false);
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
    // If a specific Firestore pump document is missing, keep check-in usable with local seed data.
    pump.value = backendPump || pumps.find((item) => item.id === pumpId) || null;
  } catch {
    pump.value = pumps.find((item) => item.id === pumpId) || null;
  } finally {
    isLoadingPump.value = false;
  }
}

async function confirmCheckin() {
  if (!pump.value) {
    return;
  }

  if (!currentUser.value) {
    await handleSignIn();
    return;
  }

  try {
    await saveCheckinToFirebase(pump.value.id, token.value, bookingId.value ?? undefined);
  } catch {
    // Keep local success for demo mode when firebase is not configured.
  }

  hasCheckedIn.value = true;
  toast.success(t('checkin.confirmed'));
}

onMounted(() => {
  void loadPump();
});
</script>

<template>
  <section v-if="isLoadingPump" class="panel">
    <p class="hint-text">{{ t('home.loadingPumps') }}</p>
  </section>

  <section v-else-if="pump" class="stack">
    <article class="panel">
      <p class="kicker">{{ t('checkin.kicker') }}</p>
      <h1>{{ pump?.name }}</h1>
      <p class="lead">{{ t('checkin.lead') }}</p>
      <p class="tiny">{{ t('checkin.token') }}: {{ token }}</p>
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

      <button class="solid-button full" @click="confirmCheckin" :disabled="hasCheckedIn || !currentUser">
        {{ hasCheckedIn ? t('checkin.confirmed') : t('checkin.confirmArrival') }}
      </button>
    </article>

    <p v-if="hasCheckedIn" class="success-text">{{ t('checkin.success') }}</p>
  </section>

  <section v-else class="panel">
    <h1>{{ t('checkin.invalidTitle') }}</h1>
    <p class="lead">{{ t('checkin.invalidLead') }}</p>
    <router-link to="/" class="solid-button">{{ t('common.backToHome') }}</router-link>
  </section>
</template>
