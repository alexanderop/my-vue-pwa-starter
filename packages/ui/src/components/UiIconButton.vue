<script setup lang="ts">
import UiButton from './UiButton.vue'
withDefaults(
  defineProps<{
    label: string
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    disabled?: boolean
  }>(),
  { variant: 'ghost' },
)
</script>
<template>
  <UiButton
    size="icon"
    :variant="variant"
    :disabled="disabled"
    :aria-label="label"
    :title="label"
    ><slot name="icon"><slot /></slot
  ></UiButton>
</template>
