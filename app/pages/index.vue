<script setup>
import LangSwitcher from '~/components/LangSwitcher.vue'
const { tt, locale, setLocale } = useAppI18n()
const { formatArtDate } = useArtDate()
const config = useRuntimeConfig()
const allowNsfw = useCookie('allow-nsfw')

const JSON_URL = config.public.apiBase

// Загружаем данные
const { data: rawData, pending, error } = await useFetch(JSON_URL, {
  lazy: true, // Это не даст странице блокироваться (белый экран исчезнет)
  server: false // Если данные нужны только на клиенте
})

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

const loadedImages = ref({}) // Объект для хранения статуса загрузки

const handleImageLoad = (id) => {
  loadedImages.value[id] = true
}
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-white p-8">
    <header class="flex justify-between items-center mb-10">
      <h1 class="text-3xl font-bold uppercase tracking-widest text-blue-500">
        {{ tt('title.archive') }}
      </h1>
      <LangSwitcher />
    </header>

    <div class="flex flex-wrap justify-center gap-6 w-full mx-auto max-w-7xl">
      
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
          class="bg-slate-800 rounded-xl aspect-[3/4] overflow-hidden border border-slate-700 hover:border-blue-500 transition-all group flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"
        >
          <div class="h-120 bg-black relative overflow-hidden" :class="{ 'animate-shimmer': !loadedImages[art.request_id] }">
            <img 
              :src="art.safe_link" 
              @load="handleImageLoad(art.request_id)"
              :class="[
          loadedImages[art.request_id] ? 'opacity-100' : 'opacity-0',
          {
        // СОСТОЯНИЕ 2: Максимальное скрытие (куки НЕТ)
        'filter blur-2xl invert opacity-50': art.nsfw && allowNsfw !== true,
        
        // СОСТОЯНИЕ 3: Легкое скрытие (куки ЕСТЬ)
        // Мы добавляем легкий блюр, когда доступ разрешен.
        'filter blur-sm opacity-100': art.nsfw && allowNsfw === true
      }
          ]"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              @error="(e) => e.target.src = 'https://placehold.co/400x300?text=No+Image'"
            />
          <div v-if="loadedImages[art.request_id] && art.nsfw" class="absolute inset-0 flex flex-col gap-6 items-center justify-center bg-black/20">
            <img src="/warning.png" class="h-[128px] w-[128px] invert opacity-90">
            <span class="text-[14px] font-bold uppercase tracking-widest bg-white/10 px-2 py-1 backdrop-blur-md rounded border border-white/20">
              NSFW CONTENT
            </span>
          </div>
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
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-shimmer {
  position: relative;
  overflow: hidden;
  background-color: #1e293b; /* Цвет фона (slate-800) */
}

.animate-shimmer::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.05),
    transparent
  );
  animation: shimmer 1.5s infinite;
}
</style>