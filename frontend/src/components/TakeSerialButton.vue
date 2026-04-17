<script setup lang="ts">
import { useI18n } from '../i18n';

defineProps<{
  disabled?: boolean;
}>();

const emit = defineEmits<{
  takeSerial: [];
}>();

const { t } = useI18n();
</script>

<template>
  <button class="solid-button full" :disabled="disabled" @click="emit('takeSerial')">
    {{ disabled ? t('buttons.serialLimitReached') : t('buttons.takeSerial') }}
  </button>
</template>
