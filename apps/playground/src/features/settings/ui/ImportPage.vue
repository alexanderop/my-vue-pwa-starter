<script setup lang="ts">
import { useTranslation } from '../../../i18n'
import { Check, CircleAlert, FileText, Upload } from '@lucide/vue'
import { matchError } from '@starter/result'
import {
  noteErrorText,
  type BackupImportError,
  type NotesService,
} from '../../notes'
import BackupStatus from './BackupStatus.vue'
import SettingsGroup from './SettingsGroup.vue'
import SettingsScreen from './SettingsScreen.vue'
import { useBackupTask } from './useBackupTask'

const { service } = defineProps<{ service: NotesService }>()
const emit = defineEmits<{ 'busy-change': [busy: boolean] }>()
const backup = useBackupTask((busy) => emit('busy-change', busy))
const { t } = useTranslation()

const errorMessage = (error: BackupImportError) =>
  matchError(error, {
    BackupFileTooLarge: () => t('settings.import.tooLarge'),
    BackupUnreadable: () => t('settings.import.unreadable'),
    InvalidBackup: () => t('settings.import.invalid'),
    BackupStorageFailed: ({ failure }) => noteErrorText(failure, t),
  })

async function importBackup(event: Event) {
  const input = event.target
  if (!(input instanceof HTMLInputElement)) return
  const file = input.files?.[0]
  if (!file) return
  await backup.run(
    async () => {
      try {
        ;(await service.importBackup(file)).match({
          ok: (count) => {
            backup.outcome.value = () => t('settings.import.imported', count)
          },
          err: (error) => {
            backup.failure.value = () => errorMessage(error)
          },
        })
      } finally {
        input.value = ''
      }
    },
    () => t('settings.import.failed'),
  )
}
</script>
<template>
  <SettingsScreen :title="t('settings.import.title')">
    <div class="intro">
      <h2>{{ t('settings.import.heading') }}</h2>
      <p>{{ t('settings.import.intro') }}</p>
    </div>

    <label class="drop" :class="{ disabled: backup.busy.value }">
      <input
        type="file"
        accept=".json,application/json"
        :aria-label="t('settings.import.choose')"
        :disabled="backup.busy.value"
        @change="importBackup"
      />
      <span class="drop-icon"><Upload :size="26" aria-hidden="true" /></span>
      <span class="drop-title">{{ t('settings.import.chooseTitle') }}</span>
      <span class="drop-hint">{{ t('settings.import.hint') }}</span>
    </label>

    <BackupStatus
      :busy="backup.busy.value"
      :message="backup.message.value"
      :error="backup.error.value"
    />

    <SettingsGroup :label="t('settings.import.goodToKnow')">
      <ul class="notes">
        <li>
          <Check class="ok" :size="18" aria-hidden="true" />
          <span>{{ t('settings.import.copies') }}</span>
        </li>
        <li>
          <CircleAlert class="warn" :size="18" aria-hidden="true" />
          <span>{{ t('settings.import.duplicates') }}</span>
        </li>
        <li>
          <FileText class="info" :size="18" aria-hidden="true" />
          <span>{{ t('settings.import.limits') }}</span>
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
