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
</script>
<template>
  <div
    class="ui-toast"
    :class="`ui-toast--${tone}`"
    :role="tone === 'error' ? 'alert' : 'status'"
  >
    <span>{{ message }}</span
    ><UiIconButton :label="dismissLabel" @click="$emit('dismiss')"
      ><X :size="16"
    /></UiIconButton>
  </div>
</template>
