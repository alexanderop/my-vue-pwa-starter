<script setup lang="ts">
import type { Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { RouterLink } from 'vue-router'
import { ChevronRight } from '@lucide/vue'

export type Tone = 'primary' | 'success' | 'warning' | 'pin' | 'muted'

// A row with `to` is a link to a detail screen. Without it, a plain row.
defineProps<{
  label: string
  icon?: Component
  tone?: Tone
  description?: string
  value?: string | undefined
  to?: RouteLocationRaw
}>()
</script>
<template>
  <component
    :is="to ? RouterLink : 'div'"
    v-bind="to ? { to } : {}"
    class="row"
    :class="{ link: to }"
  >
    <span
      v-if="icon"
      class="tile"
      :style="{ '--tone': `var(--color-${tone ?? 'muted'})` }"
      ><component :is="icon" :size="18" aria-hidden="true"
    /></span>
    <span class="text"
      ><span class="label">{{ label }}</span
      ><span v-if="description" class="description">{{
        description
      }}</span></span
    >
    <span v-if="value" class="value">{{ value }}</span>
    <ChevronRight v-if="to" class="chevron" :size="18" aria-hidden="true" />
  </component>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 56px;
  padding: 8px 16px;
  color: var(--color-foreground);
  text-decoration: none;
}
.row + .row {
  border-top: 1px solid var(--color-rule);
}
.link:hover {
  background: color-mix(in srgb, var(--color-muted) 7%, var(--color-surface));
}
.link:focus-visible {
  outline-offset: -3px;
}
.tile {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius);
  background: var(--tone);
  color: var(--color-surface);
}
.text {
  display: grid;
  flex: 1;
  gap: 2px;
  min-width: 0;
}
.label {
  font-size: 16px;
  overflow-wrap: anywhere;
}
.description {
  font-size: 13px;
  line-height: 1.45;
  color: var(--color-muted);
}
.value {
  font-size: 14px;
  color: var(--color-muted);
  text-align: right;
  overflow-wrap: anywhere;
}
.chevron {
  flex-shrink: 0;
  color: var(--color-muted);
}
</style>
