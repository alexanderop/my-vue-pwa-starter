<script setup lang="ts">
import { computed } from 'vue'
import { useTranslation } from '../../../i18n'
const { busy, message } = defineProps<{
  busy: boolean
  message: string
  error: string
}>()
const { t } = useTranslation()
const text = computed(() => (busy ? t('settings.backup.working') : message))
</script>
<template>
  <p
    role="status"
    class="notice"
    :class="{ done: !busy && message }"
    data-testid="backup-status"
  >
    {{ text }}
  </p>
  <p v-if="error" role="alert" class="notice failed">{{ error }}</p>
</template>

<style scoped>
.notice {
  margin: 0;
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  color: var(--color-body);
  font-size: 14px;
  line-height: 1.5;
}
.notice:empty {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  border: 0;
  overflow: hidden;
  clip-path: inset(50%);
}
.done {
  border-color: transparent;
  background: var(--color-success-soft);
  color: var(--color-success);
}
.failed {
  border-color: var(--color-danger);
  color: var(--color-danger);
}
</style>
