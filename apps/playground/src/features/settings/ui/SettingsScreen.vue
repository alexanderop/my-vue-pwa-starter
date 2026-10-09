<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ChevronLeft } from '@lucide/vue'
defineProps<{ title: string }>()
defineSlots<{ default(): unknown }>()
</script>
<template>
  <section class="screen">
    <header class="screen-header">
      <RouterLink :to="{ name: 'settings' }" class="back"
        ><ChevronLeft :size="22" aria-hidden="true" />Settings</RouterLink
      >
      <h1>{{ title }}</h1>
      <span />
    </header>
    <div class="screen-body"><slot /></div>
  </section>
</template>

<style scoped>
.screen {
  width: min(560px, calc(100% - 40px));
  margin: 0 auto;
  padding: 14px 0 35px;
}
.screen-header {
  position: sticky;
  top: var(--ui-app-header-height);
  z-index: 10;
  background: var(--color-background);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--color-foreground);
  padding-bottom: 8px;
}
.back {
  display: inline-flex;
  align-items: center;
  justify-self: start;
  gap: 2px;
  min-height: 44px;
  margin-left: -8px;
  padding: 0 8px;
  border-radius: var(--radius);
  color: var(--color-primary);
  font-size: 16px;
  text-decoration: none;
}
h1 {
  max-width: none;
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.2px;
  line-height: 1.3;
  text-align: center;
}
.screen-body {
  display: grid;
  gap: 24px;
}
</style>
