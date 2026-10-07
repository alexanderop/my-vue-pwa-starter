<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import {
  ArrowUpRight,
  FileText,
  NotebookPen,
  Pin,
  Plus,
  Search,
  Trash2,
} from '@lucide/vue'
import {
  UiBadge,
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

const props = defineProps<{ service: NotesService }>()
const emit = defineEmits<{ 'busy-change': [busy: boolean] }>()
const notes = ref<readonly Note[]>([])
const loading = ref(true)
const pending = ref(false)
const query = ref('')
const editor = ref<{ original: Note | null } | null>(null)
const title = ref('')
const body = ref('')
const error = ref('')
const refreshError = ref('')
const toast = ref('')
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
  return notes.value
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
    { label: 'Pinned', notes: pinned.value },
    {
      label: pinned.value.length ? 'Everything else' : 'Your notes',
      notes: ordinary.value,
    },
  ].filter((group) => group.notes.length),
)
const formatDate = (timestamp: number) =>
  new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(
    timestamp,
  )

async function refresh() {
  const version = ++readVersion
  const result = await props.service.list()
  if (!mounted || version !== readVersion) return
  loading.value = false
  if (result.ok) {
    notes.value = result.value
    refreshError.value = ''
  } else refreshError.value = result.error.message
}
function open(note: Note | null = null) {
  editor.value = { original: note }
  title.value = note?.title ?? ''
  body.value = note?.body ?? ''
  error.value = ''
}
function close() {
  if (pending.value) return
  if (dirty.value && !window.confirm('Discard your unsaved changes?')) return
  editor.value = null
  error.value = ''
}
async function save() {
  if (!editor.value || pending.value) return
  pending.value = true
  readVersion++
  error.value = ''
  const original = editor.value.original
  const draft = { title: title.value, body: body.value }
  const result = original
    ? await props.service.edit(original, draft)
    : await props.service.create(draft)
  pending.value = false
  if (!result.ok) {
    error.value = result.error.message
    return
  }
  notes.value = [
    ...notes.value.filter((note) => note.id !== result.value.id),
    result.value,
  ]
  editor.value = null
  toast.value = 'Note saved.'
  await refresh()
}
async function pin(note: Note) {
  if (pending.value) return
  pending.value = true
  readVersion++
  const result = await props.service.setPinned(note, !note.pinned)
  pending.value = false
  if (!result.ok) {
    refreshError.value = result.error.message
    return
  }
  notes.value = notes.value.map((item) =>
    item.id === note.id ? result.value : item,
  )
  await refresh()
}
function requestDelete(note: Note) {
  deleting.value = note
  error.value = ''
}
async function remove() {
  const note = deleting.value
  if (!note || pending.value) return
  pending.value = true
  readVersion++
  const result = await props.service.remove(note)
  pending.value = false
  if (!result.ok) {
    error.value = result.error.message
    return
  }
  deleting.value = null
  notes.value = notes.value.filter((item) => item.id !== note.id)
  toast.value = 'Note deleted.'
  await refresh()
}
function beforeUnload(event: BeforeUnloadEvent) {
  if (busy.value) {
    event.preventDefault()
    event.returnValue = ''
  }
}
function focusRefresh() {
  if (!pending.value) void refresh()
}
onBeforeRouteLeave(() => {
  if (pending.value) return false
  return !dirty.value || window.confirm('Discard your unsaved changes?')
})
onMounted(() => {
  void refresh()
  window.addEventListener('beforeunload', beforeUnload)
  window.addEventListener('focus', focusRefresh)
})
onUnmounted(() => {
  mounted = false
  readVersion++
  emit('busy-change', false)
  window.removeEventListener('beforeunload', beforeUnload)
  window.removeEventListener('focus', focusRefresh)
})
</script>
<template>
  <section class="page notes-page" aria-labelledby="notes-title">
    <div class="page-heading">
      <div>
        <p class="eyebrow">A PLACE TO BEGIN</p>
        <h1 id="notes-title">Make room for a thought.</h1>
        <p class="page-description">
          Ideas, reminders, and the things worth keeping.
        </p>
      </div>
      <UiButton class="new-note-button" @click="open()"
        ><Plus :size="17" aria-hidden="true" />New note</UiButton
      >
    </div>
    <div class="notes-toolbar">
      <div class="search-field">
        <Search :size="17" aria-hidden="true" /><UiInput
          v-model="query"
          label="Search notes"
          type="search"
          placeholder="Find a thought…"
        />
      </div>
      <span class="note-count"
        >{{ notes.length }} {{ notes.length === 1 ? 'note' : 'notes' }}</span
      >
    </div>
    <div v-if="refreshError" class="inline-error" role="alert">
      <span>{{ refreshError }}</span
      ><UiButton size="sm" variant="secondary" @click="refresh"
        >Try again</UiButton
      >
    </div>
    <p v-if="loading" class="loading-state" role="status">
      Opening your notebook…
    </p>
    <UiEmptyState
      v-else-if="!notes.length && !refreshError"
      class="notebook-empty"
      title="Good things start with a blank page."
      description="A passing idea. A small reminder. Something just for you. Give it a place to land."
      ><template #icon
        ><div class="empty-art" aria-hidden="true">
          <div class="paper-back" />
          <div class="paper-front">
            <NotebookPen :size="30" stroke-width="1.3" /><i /><i /><i />
          </div>
          <span class="sparkle sparkle-one">✦</span
          ><span class="sparkle sparkle-two">✧</span>
        </div></template
      ><UiButton variant="secondary" @click="open()"
        >Write your first note<ArrowUpRight
          :size="16"
          aria-hidden="true" /></UiButton
      ><span class="empty-footnote"
        >Saved on your device. Always yours.</span
      ></UiEmptyState
    >
    <UiEmptyState
      v-else-if="!filtered.length && !refreshError"
      title="No thoughts found."
      description="Try a different word, or start a new note."
      ><template #icon><Search :size="28" aria-hidden="true" /></template
      ><UiButton variant="ghost" @click="query = ''"
        >Clear search</UiButton
      ></UiEmptyState
    >
    <div v-for="group in groups" :key="group.label" class="note-group">
      <h2 class="section-label">
        <Pin v-if="group.label === 'Pinned'" :size="13" aria-hidden="true" />{{
          group.label
        }}<span>{{ group.notes.length }}</span>
      </h2>
      <div class="notes-grid">
        <UiCard v-for="note in group.notes" :key="note.id" class="note-card"
          ><button
            class="note-open"
            :aria-label="`Edit ${note.title}`"
            @click="open(note)"
          >
            <div class="note-card-top">
              <FileText :size="16" aria-hidden="true" /><UiBadge
                v-if="note.pinned"
                >Pinned</UiBadge
              >
            </div>
            <h3>{{ note.title }}</h3>
            <p>{{ note.body || 'A little space to come back to.' }}</p>
          </button>
          <div class="note-card-footer">
            <time :datetime="new Date(note.updatedAt).toISOString()">{{
              formatDate(note.updatedAt)
            }}</time>
            <div class="note-actions">
              <UiIconButton
                :label="`${note.pinned ? 'Unpin' : 'Pin'} ${note.title}`"
                :disabled="pending"
                @click="pin(note)"
                ><Pin
                  :size="15"
                  :fill="note.pinned ? 'currentColor' : 'none'" /></UiIconButton
              ><UiIconButton
                :label="`Delete ${note.title}`"
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
      :title="editor?.original ? 'Edit note' : 'New note'"
      description="A little space for whatever is on your mind."
      @update:open="
        (value) => {
          if (!value) close()
        }
      "
      ><form id="note-form" class="note-form" @submit.prevent="save">
        <UiInput
          v-model="title"
          label="Title"
          placeholder="Give your thought a name"
          maxlength="120"
          :disabled="pending"
          autofocus
        /><UiTextarea
          v-model="body"
          label="Note"
          placeholder="Start anywhere…"
          rows="9"
          :disabled="pending"
        />
        <p v-if="error" class="form-error" role="alert">{{ error }}</p>
      </form>
      <template #footer
        ><span class="editor-hint">{{
          dirty ? 'Unsaved changes' : 'Stored on this device'
        }}</span
        ><UiButton variant="ghost" :disabled="pending" @click="close"
          >Cancel</UiButton
        ><UiButton type="submit" form="note-form" :loading="pending"
          >Save note</UiButton
        ></template
      ></UiDialog
    >
    <UiDialog
      :open="deleting !== null"
      title="Delete this note?"
      description="This removes the note from this device. You cannot undo this."
      @update:open="
        (value) => {
          if (!value && !pending) deleting = null
        }
      "
      ><p class="delete-preview">{{ deleting?.title }}</p>
      <p v-if="error" class="form-error" role="alert">{{ error }}</p>
      <template #footer
        ><UiButton variant="ghost" :disabled="pending" @click="deleting = null"
          >Keep note</UiButton
        ><UiButton variant="danger" :loading="pending" @click="remove"
          >Delete note</UiButton
        ></template
      ></UiDialog
    >
    <div v-if="toast" class="toast-position">
      <UiToast :message="toast" @dismiss="toast = ''" />
    </div>
  </section>
</template>
