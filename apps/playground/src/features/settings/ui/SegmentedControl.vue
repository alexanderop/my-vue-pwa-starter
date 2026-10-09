<script setup lang="ts" generic="T extends string">
import type { Component } from 'vue'

defineProps<{
  legend: string
  name: string
  options: readonly { id: T; label: string; icon?: Component }[]
  modelValue: T
}>()
defineEmits<{ 'update:modelValue': [id: T] }>()
</script>
<template>
  <fieldset class="segmented">
    <legend class="sr-only">{{ legend }}</legend>
    <label v-for="option in options" :key="option.id">
      <input
        type="radio"
        :name="name"
        :value="option.id"
        :checked="modelValue === option.id"
        @change="$emit('update:modelValue', option.id)"
      />
      <component
        :is="option.icon"
        v-if="option.icon"
        :size="18"
        aria-hidden="true"
      />
      {{ option.label }}
    </label>
  </fieldset>
</template>

<style scoped>
.segmented {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px;
  min-width: 0;
  margin: 0;
  padding: 4px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: color-mix(
    in srgb,
    var(--color-muted) 10%,
    var(--color-background)
  );
}
label {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 44px;
  border: 1px solid transparent;
  border-radius: calc(var(--radius) - 2px);
  color: var(--color-muted);
  font-size: 14px;
  font-weight: 500;
}
label:has(input:checked) {
  border-color: var(--color-border);
  background: var(--color-surface);
  box-shadow: var(--shadow);
  color: var(--color-foreground);
  font-weight: 600;
}
label:has(input:focus-visible) {
  outline: 3px solid color-mix(in srgb, var(--color-primary) 65%, transparent);
  outline-offset: 2px;
}
input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}
</style>
