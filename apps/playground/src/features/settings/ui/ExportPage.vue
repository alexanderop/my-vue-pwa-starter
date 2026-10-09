<script setup lang="ts">
import { Download, Lock } from '@lucide/vue'
import { matchError } from '@starter/result'
import { UiButton } from '@starter/ui'
import type { BackupExportError, NotesService } from '../../notes'
import BackupStatus from './BackupStatus.vue'
import SettingsGroup from './SettingsGroup.vue'
import SettingsRow from './SettingsRow.vue'
import SettingsScreen from './SettingsScreen.vue'
import { useBackupTask } from './useBackupTask'

const { service } = defineProps<{ service: NotesService }>()
const emit = defineEmits<{ 'busy-change': [busy: boolean] }>()
const backup = useBackupTask((busy) => emit('busy-change', busy))

const plural = (count: number) => `${count} ${count === 1 ? 'note' : 'notes'}`

const errorMessage = (error: BackupExportError) =>
  matchError(error, {
    CollectionTooLarge: () =>
      'This collection exceeds the backup limit of 5,000 notes or 10 MB. No backup was downloaded. Your notes are unchanged.',
    BackupStorageFailed: ({ failure }) => failure.message,
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
  return backup.run(async () => {
    ;(await service.exportBackup()).match({
      ok: ({ json, count }) => {
        download(json)
        backup.message.value = `Backup download started: ${plural(count)}, including trash. Keep it somewhere safe.`
      },
      err: (error) => {
        backup.error.value = errorMessage(error)
      },
    })
  }, 'The backup could not be downloaded. Please try again.')
}
</script>
<template>
  <SettingsScreen title="Export backup">
    <div class="intro">
      <h2>Back up your notes</h2>
      <p>
        Download one file with every note, including Trash. Keep it somewhere
        safe in case this device is lost.
      </p>
    </div>

    <SettingsGroup>
      <SettingsRow label="Includes" value="All notes and Trash" />
      <SettingsRow label="Format" value="JSON file" />
      <SettingsRow label="Limit" value="5,000 notes or 10 MB" />
    </SettingsGroup>

    <p class="warning">
      <Lock :size="20" aria-hidden="true" />
      <span
        >Backups are plain text. Anyone with the file can read your notes, so
        store it somewhere private.</span
      >
    </p>

    <BackupStatus
      :busy="backup.busy.value"
      :message="backup.message.value"
      :error="backup.error.value"
    />

    <UiButton class="action" :disabled="backup.busy.value" @click="exportBackup"
      ><Download :size="18" aria-hidden="true" />Export backup</UiButton
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
