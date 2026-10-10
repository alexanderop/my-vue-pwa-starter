<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useDocumentVisibility, useEventListener } from '@starter/composables'
import { onBeforeRouteLeave } from 'vue-router'
import { useTranslation } from '../../../i18n'
import { ArrowUpRight, Pin, Plus, Search, Trash2 } from '@lucide/vue'
import {
  UiButton,
  UiCard,
  UiDialog,
  UiEmptyState,
  UiIconButton,
  UiInput,
  UiTextarea,
  UiToast,
} from '@starter/ui'
import type { Note, NotesService } from '../index'
import type { NoteError } from '../domain/note'
import { noteErrorText } from './noteErrorText'
import { useNotesSearch } from './useNotesSearch'

const { service } = defineProps<{ service: NotesService }>()
const emit = defineEmits<{ 'busy-change': [busy: boolean] }>()
const { t, locale } = useTranslation()
const notes = ref<readonly Note[]>([])
const loading = ref(true)
const pending = ref(false)
const query = useNotesSearch(service)
const trash = ref<readonly Note[]>([])
const showingTrash = ref(false)
const undoNote = ref<Note | null>(null)
const conflict = ref(false)
const latest = ref<Note | null>(null)
const reviewed = ref(false)
const editor = ref<{ original: Note | null } | null>(null)
const title = ref('')
const body = ref('')
// Errors and toasts keep their code, so they re-translate if the language changes.
const error = ref<NoteError | null>(null)
const refreshError = ref<NoteError | null>(null)
const toast = ref<'saved' | 'trashed' | 'deleted' | 'restored' | null>(null)
const fieldError = (field: 'title' | 'body') =>
  error.value && 'field' in error.value && error.value.field === field
    ? noteErrorText(error.value, t)
    : undefined
const deleting = ref<Note | null>(null)
let readVersion = 0
let mounted = true
const dirty = computed(
  () =>
    editor.value !== null &&
    (title.value !== (editor.value.original?.title ?? '') ||
      body.value !== (editor.value.original?.body ?? '')),
)
const busy = computed(() => dirty.value || pending.value)
watch(busy, (value) => emit('busy-change', value), {
  immediate: true,
  flush: 'sync',
})
const filtered = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase()
  return (showingTrash.value ? trash.value : notes.value)
    .filter((note) =>
      `${note.title}\n${note.body}`.toLocaleLowerCase().includes(needle),
    )
    .toSorted(
      (a, b) =>
        Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt,
    )
})
const pinned = computed(() => filtered.value.filter((note) => note.pinned))
const ordinary = computed(() => filtered.value.filter((note) => !note.pinned))
const groups = computed(() =>
  [
    { id: 'pinned', label: t('notes.groups.pinned'), notes: pinned.value },
    {
      id: 'rest',
      label: pinned.value.length
        ? t('notes.groups.rest')
        : t('notes.groups.all'),
      notes: ordinary.value,
    },
  ].filter((group) => group.notes.length),
)
const formatDate = (timestamp: number) =>
  new Intl.DateTimeFormat(locale.value, {
    month: 'short',
    day: 'numeric',
  }).format(timestamp)

async function refresh() {
  const version = ++readVersion
  const result = await service.list()
  if (!mounted || version !== readVersion) return
  loading.value = false
  if (result.isOk()) {
    notes.value = result.value
    refreshError.value = null
    const deleted = await service.listTrash()
    if (deleted.isOk() && mounted && version === readVersion)
      trash.value = deleted.value
  } else refreshError.value = result.error
}
function open(note: Note | null = null) {
  editor.value = { original: note }
  title.value = note?.title ?? ''
  body.value = note?.body ?? ''
  conflict.value = false
  reviewed.value = false
  latest.value = null
  error.value = null
}
function close() {
  if (pending.value) return
  if (dirty.value && !window.confirm(t('notes.editor.discard'))) return
  editor.value = null
  error.value = null
}
async function reviewLatest() {
  const result = await service.exportData()
  if (result.isErr()) {
    error.value = result.error
    return
  }
  latest.value =
    result.value.find((note) => note.id === editor.value?.original?.id) ?? null
  reviewed.value = true
}
async function saveCopy() {
  await save('copy')
}
async function replaceLatest() {
  await save('replace')
}
function revisionBase(mode: 'normal' | 'copy' | 'replace' | Event) {
  if (mode === 'copy') return null
  if (mode === 'replace') return latest.value
  return editor.value?.original ?? null
}
async function focusField(field: 'title' | 'body') {
  await nextTick()
  document.getElementById(`note-${field}`)?.focus()
}
async function save(mode: 'normal' | 'copy' | 'replace' | Event = 'normal') {
  if (!editor.value || pending.value) return
  pending.value = true
  readVersion++
  error.value = null
  const original = revisionBase(mode)
  if (
    mode === 'replace' &&
    (!latest.value || latest.value.deletedAt !== undefined)
  ) {
    pending.value = false
    return
  }
  const draft = { title: title.value, body: body.value }
  const result = original
    ? await service.edit(original, draft)
    : await service.create(draft)
  pending.value = false
  if (result.isErr()) {
    error.value = result.error
    conflict.value = result.error.reason === 'conflict'
    if ('field' in result.error) await focusField(result.error.field)
    return
  }
  notes.value = [
    ...notes.value.filter((note) => note.id !== result.value.id),
    result.value,
  ]
  editor.value = null
  undoNote.value = null
  toast.value = 'saved'
  await refresh()
}
async function pin(note: Note) {
  if (pending.value) return
  pending.value = true
  readVersion++
  const result = await service.setPinned(note, !note.pinned)
  pending.value = false
  if (result.isErr()) {
    refreshError.value = result.error
    return
  }
  notes.value = notes.value.map((item) =>
    item.id === note.id ? result.value : item,
  )
  await refresh()
}
function requestDelete(note: Note) {
  deleting.value = note
  error.value = null
}
async function remove() {
  const note = deleting.value
  if (!note || pending.value) return
  pending.value = true
  readVersion++
  const result = showingTrash.value
    ? await service.remove(note)
    : await service.trash(note)
  pending.value = false
  if (result.isErr()) {
    error.value = result.error
    return
  }
  deleting.value = null
  notes.value = notes.value.filter((item) => item.id !== note.id)
  undoNote.value = !showingTrash.value && result.value ? result.value : null
  toast.value = showingTrash.value ? 'deleted' : 'trashed'
  await refresh()
}
async function restore(note: Note) {
  if (pending.value) return
  pending.value = true
  const result = await service.restore(note)
  pending.value = false
  if (result.isErr()) {
    refreshError.value = result.error
    return
  }
  undoNote.value = null
  toast.value = 'restored'
  await refresh()
}
function shortcut(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault()
    void save()
  }
}
function beforeUnload(event: BeforeUnloadEvent) {
  if (busy.value) {
    event.preventDefault()
    event.returnValue = ''
  }
}
// `focus` and `visibilitychange` both fire on tab switch or PWA resume.
let resumeRefreshing = false
function focusRefresh() {
  if (pending.value || resumeRefreshing) return
  resumeRefreshing = true
  void refresh().finally(() => {
    resumeRefreshing = false
  })
}
useEventListener(window, 'beforeunload', beforeUnload)
useEventListener(window, 'focus', focusRefresh)
const visibility = useDocumentVisibility()
watch(visibility, (value) => {
  if (value === 'visible') focusRefresh()
})
onBeforeRouteLeave(() => {
  if (pending.value) return false
  return !dirty.value || window.confirm(t('notes.editor.discard'))
})
onMounted(() => {
  void refresh()
})
onUnmounted(() => {
  mounted = false
  readVersion++
  emit('busy-change', false)
})
</script>
<template>
  <section class="page notes-page" aria-labelledby="notes-title">
    <div class="page-heading">
      <div>
        <p class="eyebrow">{{ t('notes.eyebrow') }}</p>
        <h1 id="notes-title">{{ t('notes.title') }}</h1>
        <p class="page-description">{{ t('notes.description') }}</p>
      </div>
      <UiButton class="new-note-button" @click="open()"
        ><Plus :size="17" aria-hidden="true" />{{
          t('notes.newNote')
        }}</UiButton
      >
    </div>
    <div class="notes-toolbar">
      <div class="search-field">
        <Search :size="17" aria-hidden="true" /><UiInput
          v-model="query"
          :label="t('notes.search.label')"
          type="search"
          :placeholder="t('notes.search.placeholder')"
        />
      </div>
      <UiButton variant="ghost" @click="showingTrash = !showingTrash">{{
        showingTrash
          ? t('notes.backToNotes')
          : t('notes.trash', { n: trash.length })
      }}</UiButton>
      <span class="note-count">{{ t('notes.count', notes.length) }}</span>
    </div>
    <div v-if="refreshError" class="inline-error" role="alert">
      <span>{{ noteErrorText(refreshError, t) }}</span
      ><UiButton size="sm" variant="secondary" @click="refresh">{{
        t('notes.tryAgain')
      }}</UiButton>
    </div>
    <p v-if="loading" class="loading-state" role="status">
      {{ t('notes.loading') }}
    </p>
    <UiEmptyState
      v-else-if="!notes.length && !showingTrash && !refreshError"
      class="notebook-empty"
      :title="t('notes.empty.title')"
      :description="t('notes.empty.description')"
      ><template #icon
        ><div class="empty-art" aria-hidden="true">
          <div class="paper-back" />
          <div class="paper-front"><i /><i /><i /><i /></div></div></template
      ><UiButton @click="open()"
        >{{ t('notes.empty.action')
        }}<ArrowUpRight :size="16" aria-hidden="true" /></UiButton
      ><span class="empty-footnote">{{
        t('notes.empty.footnote')
      }}</span></UiEmptyState
    >
    <UiEmptyState
      v-else-if="!filtered.length && !refreshError"
      :title="
        showingTrash && !trash.length
          ? t('notes.noResults.trashEmpty')
          : t('notes.noResults.title')
      "
      :description="t('notes.noResults.description')"
      ><template #icon><Search :size="28" aria-hidden="true" /></template
      ><UiButton variant="ghost" @click="query = ''">{{
        t('notes.noResults.clear')
      }}</UiButton></UiEmptyState
    >
    <div v-for="group in groups" :key="group.id" class="note-group">
      <h2 class="section-label">
        <Pin v-if="group.id === 'pinned'" :size="13" aria-hidden="true" />{{
          group.label
        }}<span>{{ group.notes.length }}</span>
      </h2>
      <div class="notes-grid">
        <UiCard v-for="note in group.notes" :key="note.id" class="note-card"
          ><button
            class="note-open"
            :aria-label="t('notes.card.edit', { title: note.title })"
            :disabled="showingTrash"
            @click="open(note)"
          >
            <div class="note-card-top">
              <time :datetime="new Date(note.updatedAt).toISOString()">{{
                formatDate(note.updatedAt)
              }}</time
              ><span v-if="note.pinned" class="note-pinned">{{
                t('notes.card.pinned')
              }}</span>
            </div>
            <h3>{{ note.title }}</h3>
            <p>{{ note.body || t('notes.card.emptyBody') }}</p>
          </button>
          <div class="note-card-footer">
            <div class="note-actions">
              <UiButton
                v-if="showingTrash"
                size="sm"
                variant="secondary"
                @click="restore(note)"
                >{{ t('notes.card.restore') }}</UiButton
              >
              <UiIconButton
                v-else
                :label="
                  t(note.pinned ? 'notes.card.unpin' : 'notes.card.pin', {
                    title: note.title,
                  })
                "
                :class="{ 'is-pinned': note.pinned }"
                :disabled="pending"
                @click="pin(note)"
                ><Pin
                  :size="15"
                  :fill="note.pinned ? 'currentColor' : 'none'" /></UiIconButton
              ><UiIconButton
                :label="t('notes.card.delete', { title: note.title })"
                :disabled="pending"
                @click="requestDelete(note)"
                ><Trash2 :size="15"
              /></UiIconButton>
            </div></div
        ></UiCard>
      </div>
    </div>
    <UiDialog
      :open="editor !== null"
      :title="
        editor?.original
          ? t('notes.editor.editTitle')
          : t('notes.editor.newTitle')
      "
      :description="t('notes.editor.description')"
      :close-label="t('app.closeDialog')"
      @update:open="
        (value) => {
          if (!value) close()
        }
      "
      ><form
        id="note-form"
        class="note-form"
        @submit.prevent="save"
        @keydown="shortcut"
      >
        <UiInput
          id="note-title"
          v-model="title"
          :error="fieldError('title')"
          :label="t('notes.editor.title')"
          :placeholder="t('notes.editor.titlePlaceholder')"
          maxlength="120"
          :disabled="pending"
          autofocus
        /><UiTextarea
          id="note-body"
          v-model="body"
          :error="fieldError('body')"
          :label="t('notes.editor.body')"
          :placeholder="t('notes.editor.bodyPlaceholder')"
          rows="9"
          :disabled="pending"
        />
        <p v-if="error && !('field' in error)" class="form-error" role="alert">
          {{ noteErrorText(error, t) }}
        </p>
        <div v-if="conflict" class="conflict-recovery">
          <p>{{ t('notes.conflict.explanation') }}</p>
          <UiButton variant="secondary" :disabled="pending" @click="saveCopy">{{
            t('notes.conflict.saveCopy')
          }}</UiButton>
          <UiButton variant="ghost" :disabled="pending" @click="reviewLatest">{{
            t('notes.conflict.review')
          }}</UiButton>
          <div v-if="reviewed" class="latest-note">
            <template v-if="latest && latest.deletedAt === undefined"
              ><h3>{{ t('notes.conflict.latest') }}</h3>
              <strong>{{ latest.title }}</strong>
              <p class="latest-body">{{ latest.body }}</p>
              <UiButton
                variant="secondary"
                :disabled="pending"
                @click="replaceLatest"
                >{{ t('notes.conflict.replace') }}</UiButton
              ></template
            >
            <p v-else>{{ t('notes.conflict.deleted') }}</p>
          </div>
        </div>
      </form>
      <template #footer
        ><span class="editor-hint" :class="{ 'is-dirty': dirty }">{{
          dirty ? t('notes.editor.unsaved') : t('notes.editor.stored')
        }}</span
        ><UiButton variant="ghost" :disabled="pending" @click="close">{{
          t('notes.editor.cancel')
        }}</UiButton
        ><UiButton type="submit" form="note-form" :loading="pending">{{
          t('notes.editor.save')
        }}</UiButton></template
      ></UiDialog
    >
    <UiDialog
      :open="deleting !== null"
      :title="
        showingTrash
          ? t('notes.remove.permanentTitle')
          : t('notes.remove.trashTitle')
      "
      :description="
        showingTrash
          ? t('notes.remove.permanentDescription')
          : t('notes.remove.trashDescription')
      "
      :close-label="t('app.closeDialog')"
      @update:open="
        (value) => {
          if (!value && !pending) deleting = null
        }
      "
      ><p class="delete-preview">{{ deleting?.title }}</p>
      <p v-if="error" class="form-error" role="alert">
        {{ noteErrorText(error, t) }}
      </p>
      <template #footer
        ><UiButton
          variant="ghost"
          :disabled="pending"
          @click="deleting = null"
          >{{ t('notes.remove.keep') }}</UiButton
        ><UiButton variant="danger" :loading="pending" @click="remove">{{
          showingTrash
            ? t('notes.remove.permanentAction')
            : t('notes.remove.trashAction')
        }}</UiButton></template
      ></UiDialog
    >
    <div v-if="toast" class="toast-position">
      <UiButton
        v-if="undoNote"
        variant="secondary"
        :disabled="pending"
        @click="restore(undoNote)"
        >{{ t('notes.toast.undo') }}</UiButton
      >
      <UiToast
        :message="t(`notes.toast.${toast}`)"
        :dismiss-label="t('app.dismissNotification')"
        @dismiss="toast = null"
      />
    </div>
  </section>
</template>

<style scoped>
.conflict-recovery {
  display: grid;
  gap: 0.75rem;
}
.latest-note {
  border: 1px solid var(--color-border);
  padding: 1rem;
  border-radius: 1rem;
  min-width: 0;
}
.latest-body {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  max-height: 12rem;
  overflow: auto;
}
</style>
