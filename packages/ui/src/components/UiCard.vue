<script setup lang="ts">
withDefaults(defineProps<{ element?: 'article' | 'section' | 'div' }>(), {
  element: 'article',
})
</script>
<template>
  <component :is="element" class="ui-card"><slot /></component>
</template>
