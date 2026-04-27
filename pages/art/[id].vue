<script setup>
const route = useRoute()
const { tt } = useAppI18n()
// Получаем ID из параметров URL
const artId = route.params.id 
const config = useRuntimeConfig()

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
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-white p-6">
    <NuxtLink to="/" class="text-blue-400 hover:underline mb-8 inline-block">
      ← {{ tt('back') || 'Back' }}
    </NuxtLink>

    <div v-if="pending" class="text-center py-20">
      <div class="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p>Загрузка данных...</p>
    </div>

    <div v-else-if="error" class="bg-red-900/20 border border-red-500 p-4 rounded text-center">
      Ошибка загрузки: {{ error.message }}
    </div>

    <div v-else-if="art" class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-4">{{ art.art_name }}</h1>
      <img :src="art.link" class="w-full rounded-xl shadow-2xl mb-6 border border-slate-700" />
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-800 p-6 rounded-xl border border-slate-700">
        <div>
          <span class="text-slate-400 text-xs uppercase font-bold block mb-1">ID Запроса</span>
          <code class="text-blue-300 bg-slate-900 px-2 py-1 rounded">{{ art.art_uuid }}</code>
        </div>
        <div>
          <span class="text-slate-400 text-xs uppercase font-bold block mb-1">Дата создания</span>
          <p class="text-slate-200">{{ art.creation_date }}</p>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-20">
      <h2 class="text-2xl font-bold text-slate-500">Арт с ID "{{ artId }}" не найден</h2>
      <p class="text-slate-600 mt-2">Проверьте правильность ссылки или обновите страницу.</p>
    </div>
  </div>
</template>

<!-- <script setup>
const route = useRoute()
const { formatArtDate } = useArtDate()
const { data: arts } = await useFetch('https://raw.githubusercontent.com/soperf3ct/archiveartsfetch/refs/heads/main/FETCH_ARCHIVE_DATA.json')

// Ищем конкретный арт по ID из URL
const art = computed(() => arts.value?.find(a => a.art_uuid === route.params.id))
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-white p-6">
    <div v-if="art" class="max-w-5xl mx-auto">
      <NuxtLink to="/" class="inline-block mb-6 text-blue-400 hover:text-blue-300 transition-colors">
        ← Назад в архив
      </NuxtLink>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div class="rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-black flex items-center justify-center">
          <img :src="art.link" class="w-full h-auto max-h-[80vh] object-contain" />
        </div>
        
        <div class="space-y-6">
          <h1 class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            {{ art.art_name }}
          </h1>
          
          <div class="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 space-y-5">
            <div>
              <span class="block text-slate-500 text-xs uppercase font-bold tracking-tighter">Дата создания</span>
              <span class="text-xl text-slate-200">{{ formatArtDate(art.creation_date) }}</span>
            </div>
            
            <div>
              <span class="block text-slate-500 text-xs uppercase font-bold tracking-tighter">Выгрузка на сервер</span>
              <span class="text-lg font-mono text-slate-300">{{ art.request_timestamp }}</span>
            </div>

            <div class="pt-4 border-t border-slate-700">
              <span class="block text-slate-500 text-xs uppercase font-bold tracking-tighter mb-2">ID Запроса</span>
              <code class="text-xs bg-slate-900 px-3 py-2 rounded-lg block break-all text-blue-300">
                {{ art.art_uuid }}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="flex flex-col items-center justify-center h-[60vh]">
      <h2 class="text-2xl mb-4">Арт не найден в архиве</h2>
      <NuxtLink to="/" class="bg-blue-600 px-6 py-2 rounded-full">Вернуться к списку</NuxtLink>
    </div>
  </div>
</template> -->