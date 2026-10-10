<script setup lang="ts">
import { useTranslation } from '../../../i18n'
import { Download, Lock } from '@lucide/vue'
import { matchError } from '@starter/result'
import { UiButton } from '@starter/ui'
import {
  noteErrorText,
  type BackupExportError,
  type NotesService,
} from '../../notes'
import BackupStatus from './BackupStatus.vue'
import SettingsGroup from './SettingsGroup.vue'
import SettingsRow from './SettingsRow.vue'
import SettingsScreen from './SettingsScreen.vue'
import { useBackupTask } from './useBackupTask'

const { service } = defineProps<{ service: NotesService }>()
const emit = defineEmits<{ 'busy-change': [busy: boolean] }>()
const backup = useBackupTask((busy) => emit('busy-change', busy))
const { t } = useTranslation()

const errorMessage = (error: BackupExportError) =>
  matchError(error, {
    CollectionTooLarge: () => t('settings.export.tooLarge'),
    BackupStorageFailed: ({ failure }) => noteErrorText(failure, t),
  })

function download(json: string) {
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `fieldnotes-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function exportBackup() {
  return backup.run(
    async () => {
      ;(await service.exportBackup()).match({
        ok: ({ json, count }) => {
          download(json)
          backup.outcome.value = () => t('settings.export.started', count)
        },
        err: (error) => {
          backup.failure.value = () => errorMessage(error)
        },
      })
    },
    () => t('settings.export.failed'),
  )
}
</script>
<template>
  <SettingsScreen :title="t('settings.export.title')">
    <div class="intro">
      <h2>{{ t('settings.export.heading') }}</h2>
      <p>{{ t('settings.export.intro') }}</p>
    </div>

    <SettingsGroup>
      <SettingsRow
        :label="t('settings.export.includes')"
        :value="t('settings.export.includesValue')"
      />
      <SettingsRow
        :label="t('settings.export.format')"
        :value="t('settings.export.formatValue')"
      />
      <SettingsRow
        :label="t('settings.export.limit')"
        :value="t('settings.export.limitValue')"
      />
    </SettingsGroup>

    <p class="warning">
      <Lock :size="20" aria-hidden="true" />
      <span>{{ t('settings.export.warning') }}</span>
    </p>

    <BackupStatus
      :busy="backup.busy.value"
      :message="backup.message.value"
      :error="backup.error.value"
    />

    <UiButton class="action" :disabled="backup.busy.value" @click="exportBackup"
      ><Download :size="18" aria-hidden="true" />{{
        t('settings.export.action')
      }}</UiButton
    >
  </SettingsScreen>
</template>

<style scoped>
.intro {
  display: grid;
  gap: 8px;
  padding: 4px 4px 0;
}
h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 650;
  letter-spacing: -0.5px;
}
.intro p {
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  color: var(--color-body);
}
.warning {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 0;
  padding: 14px 16px;
  border-radius: var(--radius);
  background: color-mix(
    in srgb,
    var(--color-warning) 12%,
    var(--color-surface)
  );
  color: var(--color-warning);
  font-size: 14px;
  line-height: 1.5;
}
.warning svg {
  flex-shrink: 0;
  margin-top: 1px;
}
.action {
  min-height: 52px;
}
</style>
