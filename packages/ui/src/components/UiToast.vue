<script setup lang="ts">
import { X } from '@lucide/vue'
import UiIconButton from './UiIconButton.vue'
const {
  message,
  tone = 'status',
  dismissLabel,
} = defineProps<{
  message: string
  tone?: 'status' | 'error'
  dismissLabel: string
}>()
defineEmits<{ dismiss: [] }>()
defineSlots<{ action?(): unknown }>()
</script>
<template>
  <div
    class="ui-toast"
    :class="`ui-toast--${tone}`"
    :role="tone === 'error' ? 'alert' : 'status'"
  >
    <span>{{ message }}</span>
    <div class="ui-toast__actions">
      <slot name="action" /><UiIconButton
        :label="dismissLabel"
        @click="$emit('dismiss')"
        ><X :size="16"
      /></UiIconButton>
    </div>
  </div>
</template>
