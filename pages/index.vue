<script setup>
import LangSwitcher from '~/components/LangSwitcher.vue'
const { tt, locale, setLocale } = useAppI18n()
const { formatArtDate } = useArtDate()
const config = useRuntimeConfig()

const JSON_URL = config.public.apiBase

// Загружаем данные
const { data: rawData, pending, error } = await useFetch(JSON_URL)

// Превращаем сырые данные в чистый массив артов с проверкой
const arts = computed(() => {
  if (!rawData.value) return []
  
  // Если GitHub отдал строку вместо объекта, парсим её
  let data = rawData.value
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    } catch (e) {
      console.error("Ошибка парсинга JSON:", e)
      return []
    }
  }
  
  return Array.isArray(data) ? data : []
})

</script>

<template>
  <div class="min-h-screen bg-slate-900 text-white p-8">
    <header class="flex justify-between items-center mb-10">
      <h1 class="text-3xl font-bold uppercase tracking-widest text-blue-500">
        {{ tt('title.archive') }}
      </h1>
      <LangSwitcher />
    </header>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      
      <template v-if="pending">
        <div v-for="i in 8" :key="i" class="relative overflow-hidden bg-slate-800 rounded-xl h-120 border border-slate-700">
          <div class="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          <div class="h-40 bg-slate-700/50"></div>
          <div class="p-4 space-y-3">
            <div class="h-4 bg-slate-700/50 rounded w-3/4"></div>
            <div class="h-3 bg-slate-700/50 rounded w-1/2"></div>
          </div>
        </div>
      </template>

      <div v-else-if="error" class="col-span-full text-center p-10 bg-red-900/20 border border-red-500 rounded-xl">
        <p>Ошибка загрузки данных. Проверьте консоль.</p>
      </div>

      <template v-else-if="arts.length > 0">
        <NuxtLink 
          v-for="art in arts" 
          :key="art.art_uuid"
          :to="`/art/${art.art_uuid}`"
          class="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-blue-500 transition-all group"
        >
          <div class="h-120 bg-black relative overflow-hidden">
            <img 
              :src="art.link" 
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              @error="(e) => e.target.src = 'https://placehold.co/400x300?text=No+Image'"
            />
          </div>
          <div class="p-4">
            <h3 class="font-bold truncate group-hover:text-blue-400 transition-colors">
              {{ art.art_name || 'Без названия' }}
            </h3>
            <p class="text-xs text-slate-400 mt-2">
              {{ formatArtDate(art.creation_date) }}
            </p>
          </div>
        </NuxtLink>
      </template>

      <div v-else class="col-span-full text-center py-20 text-slate-500">
        Архив пуст или формат данных неверен.
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes shimmer {
  100% { transform: translateX(100%); }
}
.animate-shimmer {
  animation: shimmer 2s infinite;
}
</style>