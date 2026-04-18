<script setup lang="ts">
import { watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { setLocale, useI18n } from './i18n';
import type { TranslationKey } from './i18n/translations';
import ToastStack from './components/ToastStack.vue';
import { useAuth } from './composables/useAuth';
import { useToast } from './composables/useToast';

const route = useRoute();
const router = useRouter();
const { locale, t } = useI18n();
const toast = useToast();
const { currentUser, signInWithGoogle, signOut } = useAuth();

watch(
  [() => route.meta.titleKey as TranslationKey | undefined, locale],
  ([titleKey]) => {
    if (titleKey) {
      document.title = t(titleKey);
    }
  },
  { immediate: true },
);

async function handleSignOut() {
  try {
    await signOut();
    toast.success(t('auth.signOutSuccess'));
    await router.push('/');
  } catch {
    toast.error(t('auth.signOutFailed'));
  }
}

async function handleSignIn() {
  try {
    await signInWithGoogle();
    toast.success(t('auth.signInSuccess'));
  } catch {
    toast.error(t('auth.genericError'));
  }
}
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="header-top">
        <router-link to="/" class="brand-link">
          <img src="/logo.png" alt="Serial Koto" class="brand-logo" />
          <span>{{ t('app.brandName') }}</span>
        </router-link>
        <div class="header-actions">
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

          <button v-if="!currentUser" type="button" class="ghost-button header-auth-button" @click="handleSignIn">
            {{ t('auth.signIn') }}
          </button>
          <button v-else type="button" class="ghost-button header-auth-button" @click="handleSignOut">
            {{ t('auth.signOut') }}
          </button>
        </div>
      </div>
      <p v-if="currentUser" class="brand-tag">{{ t('auth.signedInAs', { email: currentUser.email || '' }) }}</p>
      <!-- <p class="brand-tag">{{ t('app.brandTag') }}</p> -->
    </header>

    <main class="app-content">
      <router-view />
    </main>

    <ToastStack />
  </div>
</template>
