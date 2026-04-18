<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from '../composables/useToast';
import { useAuth } from '../composables/useAuth';
import { useAuthModal } from '../composables/useAuthModal';
import { useI18n } from '../i18n';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();
const { currentUser } = useAuth();
const { openAuthModal } = useAuthModal();

const isSubmitting = ref(false);
const errorMessage = ref('');

const redirectPath = computed(() => {
  const redirect = route.query.redirect;
  return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/';
});

async function handleSubmit() {
  errorMessage.value = '';

  isSubmitting.value = true;

  try {
    const signedIn = await openAuthModal();
    if (signedIn) {
      toast.success(t('auth.signInSuccess'));
      await router.replace(redirectPath.value);
      return;
    }

    errorMessage.value = t('auth.genericError');
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <section class="auth-shell">
    <article class="auth-card panel">
      <p class="kicker">{{ t('auth.kicker') }}</p>
      <h1>{{ t('auth.title') }}</h1>
      <p class="lead auth-lead">{{ t('auth.lead') }}</p>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <p class="auth-note auth-google-note">{{ t('auth.googleHint') }}</p>

        <p v-if="errorMessage" class="auth-error">{{ errorMessage }}</p>

        <button type="submit" class="solid-button full" :disabled="isSubmitting">
          {{ isSubmitting ? t('auth.waiting') : t('auth.signIn') }}
        </button>
      </form>

      <p v-if="currentUser" class="auth-note">{{ t('auth.signedInAs', { email: currentUser.email || '' }) }}</p>
    </article>
  </section>
</template>