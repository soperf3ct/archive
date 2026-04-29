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

const getBlurClass = (art) => {
  // 1. Если арт НЕ nsfw, вообще не блюрим
  if (!art.nsfw) {
    return 'opacity-100' // Просто делаем видимым, без блюра
  }

  // Если мы здесь, значит арт nsfw. Проверяем наличие safe_link
  // 2. NSFW + Safe Link = легкий блюр
  if (art.safe_link) {
    return 'opacity-100 blur-sm'
  }

  // 3. NSFW без Safe Link = жесткий блюр
  return 'opacity-100 blur-2xl scale-110'
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
          class="relative bg-slate-800 rounded-xl aspect-[3/4] overflow-hidden border border-slate-700 hover:border-blue-500 transition-all group flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"
        >
          <div class="h-full w-full bg-black relative overflow-hidden" :class="{ 'animate-shimmer': !loadedImages[art.request_id] }">
            <img 
              :src="art.safe_link || art.link"
              @load="handleImageLoad(art.request_id)"
              :class="[
          loadedImages[art.request_id] ? 'opacity-100' : 'opacity-0',
          getBlurClass(art)
          ]"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              @error="(e) => e.target.src = 'https://placehold.co/400x300?text=No+Image'"
            />
          <div v-if="loadedImages[art.request_id] && art.nsfw" class="absolute inset-0 flex flex-col gap-6 items-center justify-center bg-black/20">
            <img src="/warning.png" class="h-[128px] w-[128px]" :class="art.safe_link ? 'invert opacity-90' : 'drop-shadow-[1000px_0_0_#ef4444] -translate-x-[1000px] -mr-px-[1000px]'">
            <span class="text-[14px] font-bold uppercase tracking-widest bg-white/10 px-2 py-1 backdrop-blur-md rounded border border-white/20" :class="art.safe_link 
            ? 'text-white bg-white/10 border-white/20' 
            : 'text-red-500 bg-red-500/10 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.5)]'">
              NSFW CONTENT
            </span>
          </div>
          <div class="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent 
                opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
          <h3 class="text-white text-lg font-bold leading-tight drop-shadow-md">
            {{ art.art_name }}
          </h3>
          </div>
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