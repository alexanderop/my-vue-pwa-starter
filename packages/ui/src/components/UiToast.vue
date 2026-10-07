<script setup lang="ts">
import { X } from '@lucide/vue'
import UiIconButton from './UiIconButton.vue'
withDefaults(defineProps<{ message: string; tone?: 'status' | 'error' }>(), {
  tone: 'status',
})
defineEmits<{ dismiss: [] }>()
</script>
<template>
  <div
    class="ui-toast"
    :class="`ui-toast--${tone}`"
    :role="tone === 'error' ? 'alert' : 'status'"
  >
    <span>{{ message }}</span
    ><UiIconButton label="Dismiss notification" @click="$emit('dismiss')"
      ><X :size="16"
    /></UiIconButton>
  </div>
</template>
