<script setup>
const { locale, locales, setLocale } = useAppI18n()
</script>

<template>
  <div class="flex gap-2">
    <button 
      v-for="lang in locales" 
      :key="lang.code"
      @click="setLocale(lang.code)"
      :class="['px-3 py-1 rounded text-sm transition', 
               locale === lang.code ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600']"
    >
      {{ lang.name }}
    </button>
  </div>
</template>