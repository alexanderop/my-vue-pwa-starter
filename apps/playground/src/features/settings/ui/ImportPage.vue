<script setup lang="ts">
import { Check, CircleAlert, FileText, Upload } from '@lucide/vue'
import { matchError } from '@starter/result'
import type { BackupImportError, NotesService } from '../../notes'
import BackupStatus from './BackupStatus.vue'
import SettingsGroup from './SettingsGroup.vue'
import SettingsScreen from './SettingsScreen.vue'
import { useBackupTask } from './useBackupTask'

const { service } = defineProps<{ service: NotesService }>()
const emit = defineEmits<{ 'busy-change': [busy: boolean] }>()
const backup = useBackupTask((busy) => emit('busy-change', busy))

const plural = (count: number) => `${count} ${count === 1 ? 'note' : 'notes'}`

const errorMessage = (error: BackupImportError) =>
  matchError(error, {
    BackupFileTooLarge: () => 'Choose a backup smaller than 10 MB.',
    BackupUnreadable: () =>
      'This file is not readable JSON. Choose a Fieldnotes backup.',
    InvalidBackup: () =>
      'Choose a valid Fieldnotes version 1 backup with no more than 5,000 notes.',
    BackupStorageFailed: ({ failure }) => failure.message,
  })

async function importBackup(event: Event) {
  const input = event.target
  if (!(input instanceof HTMLInputElement)) return
  const file = input.files?.[0]
  if (!file) return
  await backup.run(async () => {
    try {
      ;(await service.importBackup(file)).match({
        ok: (count) => {
          backup.message.value = `Imported ${plural(count)} as new copies. Existing notes were kept. Trashed notes are in Trash.`
        },
        err: (error) => {
          backup.error.value = errorMessage(error)
        },
      })
    } finally {
      input.value = ''
    }
  }, 'The backup could not be imported. Please try again.')
}
</script>
<template>
  <SettingsScreen title="Import backup">
    <div class="intro">
      <h2>Restore from a backup</h2>
      <p>Bring notes back from a Fieldnotes backup file.</p>
    </div>

    <label class="drop" :class="{ disabled: backup.busy.value }">
      <input
        type="file"
        accept=".json,application/json"
        aria-label="Choose a Fieldnotes backup"
        :disabled="backup.busy.value"
        @change="importBackup"
      />
      <span class="drop-icon"><Upload :size="26" aria-hidden="true" /></span>
      <span class="drop-title">Choose a backup file</span>
      <span class="drop-hint">.json · up to 10 MB</span>
    </label>

    <BackupStatus
      :busy="backup.busy.value"
      :message="backup.message.value"
      :error="backup.error.value"
    />

    <SettingsGroup label="Good to know">
      <ul class="notes">
        <li>
          <Check class="ok" :size="18" aria-hidden="true" />
          <span
            >Notes are added as new copies. Nothing you have is replaced.</span
          >
        </li>
        <li>
          <CircleAlert class="warn" :size="18" aria-hidden="true" />
          <span>Importing the same backup twice creates duplicates.</span>
        </li>
        <li>
          <FileText class="info" :size="18" aria-hidden="true" />
          <span>Up to 5,000 notes and 10 MB per file.</span>
        </li>
      </ul>
    </SettingsGroup>
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
.drop {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 32px 20px;
  border: 2px dashed var(--color-primary);
  border-radius: var(--radius);
  background: var(--color-primary-soft);
  cursor: pointer;
}
.drop:has(input:focus-visible) {
  outline: 3px solid color-mix(in srgb, var(--color-primary) 65%, transparent);
  outline-offset: 3px;
}
.drop.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.drop input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: inherit;
}
.drop-icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-surface);
  color: var(--color-primary);
}
.drop-title {
  color: var(--color-primary);
  font-size: 16px;
  font-weight: 600;
}
.drop-hint {
  color: var(--color-muted);
  font-size: 13px;
}
.notes {
  margin: 0;
  padding: 4px 16px;
  list-style: none;
}
.notes li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  font-size: 15px;
  line-height: 1.45;
}
.notes li + li {
  border-top: 1px solid var(--color-rule);
}
.notes svg {
  flex-shrink: 0;
  margin-top: 2px;
}
.ok {
  color: var(--color-primary);
}
.warn {
  color: var(--color-warning);
}
.info {
  color: var(--color-muted);
}
</style>
