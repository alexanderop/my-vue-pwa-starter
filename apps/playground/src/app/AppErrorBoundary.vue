<script setup lang="ts">
import { nextTick, onErrorCaptured, ref, useTemplateRef } from 'vue'
import { useTranslation } from '../i18n'
import { UiButton } from '@starter/ui'
defineSlots<{ default(): unknown }>()
const { t } = useTranslation()
const failed = ref(false)
const heading = useTemplateRef<HTMLElement>('recovery-heading')
const copyStatus = ref('')
const diagnostics = JSON.stringify(
  {
    app: 'Fieldnotes',
    version: __APP_VERSION__,
    failure: 'Unexpected interface error',
  },
  null,
  2,
)
onErrorCaptured(() => {
  failed.value = true
  void nextTick(() => heading.value?.focus())
  return false
})
function reload() {
  window.location.reload()
}
async function copyDiagnostics() {
  try {
    await navigator.clipboard.writeText(diagnostics)
    copyStatus.value = t('app.recovery.copied')
  } catch {
    copyStatus.value = t('app.recovery.copyUnavailable')
  }
}
</script>
<template>
  <section v-if="failed" role="alert" aria-labelledby="recovery-title">
    <h1 id="recovery-title" ref="recovery-heading" tabindex="-1">
      {{ t('app.recovery.title') }}
    </h1>
    <p>{{ t('app.recovery.body') }}</p>
    <UiButton @click="reload">{{ t('app.recovery.reload') }}</UiButton>
    <UiButton variant="secondary" @click="copyDiagnostics">{{
      t('app.recovery.copy')
    }}</UiButton>
    <p role="status">{{ copyStatus }}</p>
    <details>
      <summary>{{ t('app.recovery.diagnostics') }}</summary>
      <pre>{{ diagnostics }}</pre>
    </details>
  </section>
  <slot v-else />
</template>
<style scoped>
section {
  max-width: 42rem;
  margin: 10vh auto;
  padding: 24px;
  color: var(--color-foreground);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
}
p {
  line-height: 1.7;
}
button {
  margin: 8px 8px 8px 0;
}
pre {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
