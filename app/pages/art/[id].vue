<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useRoute, useRuntimeConfig, useCookie, useFetch } from '#imports'

const route = useRoute()
const { tt } = useAppI18n()
// Получаем ID из параметров URL
const artId = route.params.id 
const config = useRuntimeConfig()
const showModal = ref(false)
const allowNsfw = useCookie('allow-nsfw', { maxAge: 60 * 60 * 24 * 30 })
const allowTempNsfw = ref(false)
const isCopied = ref(false)
const JSON_URL = config.public.apiBase

// Используем useFetch с уникальным ключом, чтобы данные не кешировались неправильно
const { data: rawData, pending, error } = await useFetch(JSON_URL, {
  key: `art-detail-${artId}`
})

const art = computed(() => {
  // 1. Проверяем, есть ли вообще данные
  if (!rawData.value) return null
  
  // 2. Если данные пришли строкой (бывает на GitHub), парсим их
  let list = rawData.value
  if (typeof list === 'string') {
    try { list = JSON.parse(list) } catch (e) { return null }
  }

  // 3. Убеждаемся, что это массив, и ищем нужный объект
  if (Array.isArray(list)) {
    return list.find(item => String(item.art_uuid) === String(artId))
  }
  
  return null
})

// Логика подмены NSFW/SFW картинки
const currentImageUrl = computed(() => {
  if (!art.value) return ''
  
const isAllowed = allowNsfw.value === true || 
                    allowNsfw.value === 'true' || 
                    allowTempNsfw.value === true

  // Если это NSFW и доступ РАЗРЕШЕН (строка 'true' или булево true)
  if (art.value.nsfw && isAllowed) {
    return art.value.link
  }
  
  // Иначе даем safe-версию (если она есть) или откатываемся к оригиналу
  return art.value.safe_link || art.value.link
})

// Состояние загрузки самой картинки (для красивого шиммера)
const loadedImages = ref({})
const handleImageLoad = (id) => {
  loadedImages.value[id] = true
}

watchEffect(() => {
  // Условие теперь такое: если у арта стоит блюр И в куки НЕ записано 'true'
const isAllowed = allowNsfw.value === true || 
                    allowNsfw.value === 'true' || 
                    allowTempNsfw.value === true
  if (art.value?.nsfw && !isAllowed) {
    showModal.value = true
  } else {
    showModal.value = false
  }
})

// Функция, которая вызывается при клике на кнопку в модалке
const confirmAccess = () => {
  allowNsfw.value = true // Записываем в куки
  allowTempNsfw.value = true
  showModal.value = false  // Закрываем окно
}

const temporaryAllow = () => {
  allowTempNsfw.value = true // Разрешаем показ в этой сессии
  showModal.value = false
}

const copyLink = () => {
  navigator.clipboard.writeText(window.location.href)
  // Можно добавить уведомление, если у тебя есть компонент для тостов
  isCopied.value = true
  
  // Через 2 секунды возвращаем текст обратно
  setTimeout(() => {
    isCopied.value = false
  }, 2000)
}
</script>

<template>
<div>
  <div :class="{ 'blur-xl invert opacity-50': showModal && allowNsfw !== true && allowNsfw !== 'true' }">
    <div class="min-h-screen bg-slate-950 text-white font-sans p-6 md:p-10 flex flex-col">
      
      <header class="mb-10 w-full max-w-7xl mx-auto">
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors group">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform group-hover:-translate-x-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          <span>{{ tt('back') || 'back' }}</span>
        </NuxtLink>
      </header>

      <div v-if="pending" class="text-center flex-1 flex flex-col justify-center items-center">
        <div class="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
        <p class="text-slate-400 font-medium">Загрузка данных...</p>
      </div>

      <div v-else-if="error" class="bg-red-900/20 border border-red-500 p-6 rounded-xl text-center max-w-lg mx-auto mt-20">
        <h3 class="text-red-400 font-bold text-xl mb-2">Ошибка загрузки</h3>
        <p class="text-red-200">{{ error.message }}</p>
      </div>

      <main v-else-if="art" class="flex-1 flex items-center justify-center">
        <div class="w-full max-w-7xl flex flex-col lg:flex-row items-center gap-12">
          
          <div class="w-full lg:w-2/3 flex items-center justify-center lg:justify-end">
            <div class="relative group max-h-[80vh] flex justify-center w-full">
              
              <div v-if="!loadedImages[art.art_uuid]" class="absolute inset-0 bg-slate-800 animate-pulse rounded-3xl border border-slate-700/50"></div>

              <img 
                :src="currentImageUrl" 
                @load="handleImageLoad(art.art_uuid)"
                class="max-w-full max-h-[80vh] object-contain rounded-3xl shadow-2xl transition-all duration-500 group-hover:scale-[1.02]"
                :class="[ loadedImages[art.art_uuid] ? 'opacity-100' : 'opacity-0' ]"
              />
            </div>
          </div>

          <div class="w-full flex-1 flex flex-col justify-center gap-8 text-center lg:text-left">
            
            <div class="space-y-2">
              <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
                {{ art.art_name || 'Без названия' }}
              </h1>
              <p v-if="art.nsfw" class="text-xs text-red-500 font-bold uppercase tracking-widest inline-block bg-red-500/10 px-2 py-0.5 rounded">
                NSFW Content
              </p>
            </div>

<div class="flex gap-3">
        <button 
          @click="copyLink"
          class="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-all active:scale-95"
        >
          <Icon 
    :name="isCopied ? 'ph:check-circle-bold' : 'ph:link-bold'" 
    :class="isCopied ? 'text-green-400' : 'text-blue-400'"
    class="transition-colors duration-300"
  />
          <span class="text-sm font-medium">{{ isCopied ? 'Скопировано!' : 'Копировать ссылку' }}</span>
        </button>

        <a 
          v-if="art.twitter_link"
          :href="art.twitter_link" 
          target="_blank"
          class="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-all"
        >
          <Icon name="ri:twitter-x-fill" class="text-white" />
          <span class="text-sm font-medium">Автор</span>
        </a>
      </div>

      <div class="grid grid-cols-2 gap-4 p-5 bg-slate-800/50 rounded-2xl border border-white/5 backdrop-blur-sm">
        <div class="flex flex-col gap-1">
          <span class="text-[10px] uppercase tracking-tighter text-slate-500 font-bold">ID Запроса</span>
          <span class="text-xs text-blue-400 font-mono break-all leading-relaxed">
            {{ art.art_uuid }}
          </span>
        </div>
        
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-1">
            <span class="text-[10px] uppercase tracking-tighter text-slate-500 font-bold">Дата создания</span>
            <span class="text-xs text-white">{{ art.creation_date }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-[10px] uppercase tracking-tighter text-slate-500 font-bold">Добавлено в архив</span>
            <span class="text-xs text-green-400">{{ art.request_timestamp || 'Не указано' }}</span>
          </div>
        </div>
      </div>
    </div>
    </div>
      </main>

      <div v-else class="text-center flex-1 flex flex-col justify-center items-center">
        <h2 class="text-3xl font-bold text-slate-500 mb-4">Арт "{{ artId }}" не найден</h2>
        <p class="text-slate-600">Возможно, он был удален или вы ошиблись в ссылке.</p>
        <NuxtLink to="/" class="mt-8 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-colors">
          Вернуться на главную
        </NuxtLink>
      </div>

    </div>
  </div>
  
  <Transition name="fade">
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div class="bg-slate-800 border border-slate-700 p-8 rounded-2xl max-w-sm text-center shadow-2xl">
        <h2 class="text-2xl font-black text-red-500 tracking-[0.2em] drop-shadow-[0_0_10px_rgba(239,68,68,0.5)] mb-4 uppercase">{{tt('nsfw.title')}}</h2>
        <p class="text-slate-400 mb-6">
          {{ tt('nsfw.warning') }}
        </p>
        <div class="flex flex-col gap-3">
          <button 
            @click="temporaryAllow"
            class="w-full py-3 bg-blue-600 hover:bg-blue-500 text-neutral-300 rounded-xl font-bold transition-colors"
          >
            {{tt('nsfw.allow')}}
          </button>
          <button 
            @click="confirmAccess"
            class="w-full py-3 bg-slate-700 hover:bg-slate-600 text-neutral-400 rounded-xl font-bold transition-colors"
          >
            {{tt('nsfw.permallow')}}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>