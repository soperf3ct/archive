// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,

  runtimeConfig: {
    public: {
      // Ссылка по умолчанию
      apiBase: 'https://raw.githubusercontent.com/soperf3ct/archiveartsfetch/main/FETCH_ARCHIVE_DATA.json'
    }
  },

  nitro: {
    preset: 'github-pages'
  },

  app: {
    baseURL: '/archive/',
    pageTransition: { 
      name: 'page', 
      mode: 'out-in' // Сначала старая страница исчезает, потом новая появляется
    }
  },

  modules: ['@nuxtjs/tailwindcss', '@nuxt/icon'],
})