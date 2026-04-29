// composables/useAppI18n.ts
export const useAppI18n = () => {
  // Используем куки, чтобы язык сохранялся при перезагрузке
  const locale = useCookie('app-locale', { default: () => 'en' })

  const dictionary = {
    en: {
      "title.archive": 'archive', 
      "art.back": 'back',
      "nsfw.title": 'Adult Content Warning',
      "nsfw.warning": 'This content is inappropriate for minors and it can ruin your productivity. Proceed w/ caution.',
      "nsfw.allow": 'Allow',
      "nsfw.permallow": 'Allow all the time'
    },
    ru: {
      "title.archive": 'архив',
      "art.back": 'назад',
      loading: 'Загрузка...'
    }
  }

  // Функция перевода
  const tt = (key: string) => {
    const lang = locale.value as 'en' | 'ru'
    return dictionary[lang][key] || key
  }

  // Функция смены языка
  const setLocale = (newLocale: 'en' | 'ru') => {
    locale.value = newLocale
  }

  return {
    locale,
    tt,
    setLocale
  }
}