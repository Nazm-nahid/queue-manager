<script setup lang="ts">
import { useI18n } from '../i18n';

const model = defineModel<string>({ required: true });
const { t } = useI18n();
</script>

<template>
  <label class="search-shell">
    <span class="search-label">{{ t('search.label') }}</span>
    <input
      v-model="model"
      type="search"
      :placeholder="t('search.placeholder')"
      class="search-input"
    />
  </label>
</template>
