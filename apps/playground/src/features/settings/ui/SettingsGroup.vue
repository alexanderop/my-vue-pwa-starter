<script setup lang="ts">
defineProps<{ label?: string | undefined }>()
defineSlots<{ default(): unknown }>()
</script>
<template>
  <section class="group">
    <h2 v-if="label">{{ label }}</h2>
    <div class="card"><slot /></div>
  </section>
</template>

<style scoped>
.group {
  display: grid;
  gap: 10px;
}
h2 {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: var(--color-muted);
}
.card {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  box-shadow: var(--shadow);
}
</style>
