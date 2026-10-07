<script setup lang="ts">
import { ref, useId } from 'vue'
import { X } from '@lucide/vue'
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from 'reka-ui'
import UiIconButton from './UiIconButton.vue'
const open = defineModel<boolean>('open', { default: false })
defineProps<{ title: string; description?: string }>()
const descriptionId = useId()
const returnFocus = ref<HTMLElement>()
function captureFocus() {
  if (document.activeElement instanceof HTMLElement)
    returnFocus.value = document.activeElement
}
function restoreFocus(event: Event) {
  if (returnFocus.value?.isConnected) {
    event.preventDefault()
    returnFocus.value.focus()
  }
}
</script>
<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="ui-dialog-overlay" />
      <DialogContent
        class="ui-dialog"
        :aria-describedby="description ? descriptionId : undefined"
        @open-auto-focus="captureFocus"
        @close-auto-focus="restoreFocus"
      >
        <div class="ui-dialog__handle" aria-hidden="true" />
        <header class="ui-dialog__header">
          <div>
            <DialogTitle class="ui-dialog__title">{{ title }}</DialogTitle
            ><DialogDescription
              v-if="description"
              :id="descriptionId"
              class="ui-dialog__description"
              >{{ description }}</DialogDescription
            >
          </div>
          <DialogClose as-child
            ><UiIconButton label="Close dialog"><X :size="20" /></UiIconButton
          ></DialogClose>
        </header>
        <div class="ui-dialog__body"><slot /></div>
        <footer v-if="$slots.footer" class="ui-dialog__footer">
          <slot name="footer" />
        </footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
