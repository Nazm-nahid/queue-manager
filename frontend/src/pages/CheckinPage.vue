<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { pumps } from '../data/mockPumps';
import { useI18n } from '../i18n';

const route = useRoute();
const hasCheckedIn = ref(false);
const token = computed(() => String(route.query.token || 'demo-token'));
const { t } = useI18n();

const pump = computed(() => {
  return pumps.find((item) => item.id === String(route.params.pumpId));
});

function confirmCheckin() {
  hasCheckedIn.value = true;
}
</script>

<template>
  <section v-if="pump" class="stack">
    <article class="panel">
      <p class="kicker">{{ t('checkin.kicker') }}</p>
      <h1>{{ pump.name }}</h1>
      <p class="lead">{{ t('checkin.lead') }}</p>
      <p class="tiny">{{ t('checkin.token') }}: {{ token }}</p>
    </article>

    <article class="panel">
      <h2>{{ t('checkin.howWorks') }}</h2>
      <ul class="list">
        <li>{{ t('checkin.step1') }}</li>
        <li>{{ t('checkin.step2') }}</li>
        <li>{{ t('checkin.step3') }}</li>
      </ul>

      <button class="solid-button full" @click="confirmCheckin" :disabled="hasCheckedIn">
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
