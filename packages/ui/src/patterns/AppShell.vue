<template>
  <div class="ui-app-shell">
    <a href="#main-content" class="ui-skip-link">Skip to content</a>
    <header class="ui-app-header"><slot name="header" /></header>
    <main id="main-content" class="ui-app-main" tabindex="-1"><slot /></main>
    <div class="ui-app-navigation"><slot name="navigation" /></div>
  </div>
</template>
