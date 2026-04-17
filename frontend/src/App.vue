<script setup lang="ts">
import { watch } from 'vue';
import { useRoute } from 'vue-router';
import { setLocale, useI18n } from './i18n';
import type { TranslationKey } from './i18n/translations';
import ToastStack from './components/ToastStack.vue';

const route = useRoute();
const { locale, t } = useI18n();

watch(
  [() => route.meta.titleKey as TranslationKey | undefined, locale],
  ([titleKey]) => {
    if (titleKey) {
      document.title = t(titleKey);
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="header-top">
        <router-link to="/" class="brand-link">
          <img src="/logo.png" alt="Serial Koto" class="brand-logo" />
          <span>{{ t('app.brandName') }}</span>
        </router-link>
        <div class="lang-switch" role="group" aria-label="language switch">
          <button
            type="button"
            class="lang-button"
            :class="{ active: locale === 'bn' }"
            @click="setLocale('bn')"
          >
            {{ t('app.langBangla') }}
          </button>
          <button
            type="button"
            class="lang-button"
            :class="{ active: locale === 'en' }"
            @click="setLocale('en')"
          >
            {{ t('app.langEnglish') }}
          </button>
        </div>
      </div>
      <!-- <p class="brand-tag">{{ t('app.brandTag') }}</p> -->
    </header>

    <main class="app-content">
      <router-view />
    </main>

    <ToastStack />
  </div>
</template>
