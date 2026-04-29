<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup>
// Здесь можно подключать глобальные шрифты или логику, 
// но для работы страниц сейчас достаточно пустого скрипта
</script>

<style>
/* Переходы страниц, которые мы настроили */
.page-enter-active,
.page-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
  filter: blur(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  filter: blur(10px);
}

/* Глобальные стили для фона, чтобы не было белых вспышек при переходе */
body {
  @apply bg-slate-900;
  margin: 0;
}
</style>