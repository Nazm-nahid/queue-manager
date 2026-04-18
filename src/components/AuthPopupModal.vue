<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '../composables/useAuth';
import { useAuthModal } from '../composables/useAuthModal';
import { useI18n } from '../i18n';

type AuthMode = 'sign-in' | 'sign-up';

const { t } = useI18n();
const { isAuthModalOpen, closeAuthModal, resolveAuthModal } = useAuthModal();
const { signInWithGoogle, signInWithEmailPassword, signUpWithEmailPassword } = useAuth();

const mode = ref<AuthMode>('sign-in');
const email = ref('');
const password = ref('');
const isSubmitting = ref(false);
const errorMessage = ref('');

async function handleGoogleSignIn() {
  errorMessage.value = '';
  isSubmitting.value = true;

  try {
    await signInWithGoogle();
    resolveAuthModal();
  } catch {
    errorMessage.value = t('auth.genericError');
  } finally {
    isSubmitting.value = false;
  }
}

async function handleEmailAuth() {
  errorMessage.value = '';
  isSubmitting.value = true;

  try {
    if (mode.value === 'sign-up') {
      await signUpWithEmailPassword(email.value.trim(), password.value);
    } else {
      await signInWithEmailPassword(email.value.trim(), password.value);
    }
    resolveAuthModal();
  } catch {
    errorMessage.value = t('auth.genericError');
  } finally {
    isSubmitting.value = false;
  }
}

function switchMode(nextMode: AuthMode) {
  mode.value = nextMode;
  errorMessage.value = '';
}
</script>

<template>
  <div v-if="isAuthModalOpen" class="auth-popup-root" role="dialog" aria-modal="true" :aria-label="t('auth.title')">
    <div class="auth-popup-backdrop" @click="closeAuthModal" />

    <article class="auth-popup-card panel">
      <button type="button" class="auth-popup-close" @click="closeAuthModal">x</button>
      <p class="kicker">{{ t('auth.kicker') }}</p>
      <h2>{{ t('auth.title') }}</h2>

      <div class="auth-popup-mode">
        <button
          type="button"
          class="lang-button"
          :class="{ active: mode === 'sign-in' }"
          @click="switchMode('sign-in')"
        >
          {{ t('auth.signIn') }}
        </button>
        <button
          type="button"
          class="lang-button"
          :class="{ active: mode === 'sign-up' }"
          @click="switchMode('sign-up')"
        >
          {{ t('auth.createAccount') }}
        </button>
      </div>

      <form class="auth-popup-form" @submit.prevent="handleEmailAuth">
        <label class="tiny" for="auth-email">{{ t('auth.email') }}</label>
        <input id="auth-email" v-model="email" class="input" type="email" required autocomplete="email" />

        <label class="tiny" for="auth-password">{{ t('auth.password') }}</label>
        <input
          id="auth-password"
          v-model="password"
          class="input"
          type="password"
          minlength="6"
          required
          autocomplete="current-password"
        />

        <button type="submit" class="solid-button full" :disabled="isSubmitting">
          {{ isSubmitting ? t('auth.waiting') : mode === 'sign-up' ? t('auth.createAccount') : t('auth.signIn') }}
        </button>
      </form>

      <p class="tiny auth-divider">{{ t('auth.orContinueWithGoogle') }}</p>
      <button type="button" class="ghost-button full" :disabled="isSubmitting" @click="handleGoogleSignIn">
        {{ t('auth.googleButton') }}
      </button>

      <p v-if="errorMessage" class="auth-error">{{ errorMessage }}</p>
    </article>
  </div>
</template>

<style scoped>
.auth-popup-root {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 1rem;
}

.auth-popup-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
}

.auth-popup-card {
  position: relative;
  width: min(460px, 100%);
  z-index: 1;
}

.auth-popup-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  border: none;
  background: transparent;
  font-size: 1rem;
  cursor: pointer;
}

.auth-popup-mode {
  display: flex;
  gap: 0.5rem;
  margin: 0.8rem 0;
}

.auth-popup-form {
  display: grid;
  gap: 0.45rem;
}

.input {
  width: 100%;
  border: 1px solid var(--stroke);
  border-radius: 10px;
  padding: 0.6rem 0.7rem;
}

.auth-divider {
  text-align: center;
  margin: 0.8rem 0;
}
</style>
