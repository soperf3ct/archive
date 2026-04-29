import { format, formatDistanceToNow, parse } from 'date-fns'
import { ru, enUS } from 'date-fns/locale'

export const useArtDate = () => {
  const { locale } = useAppI18n()

  const formatArtDate = (dateStr: string) => {
    if (!dateStr) return ''

    // Выбираем локаль date-fns на основе i18n
    const currentLocale = locale.value === 'ru' ? ru : enUS

    // Парсим нашу строку "28.04.2026"
    const date = parse(dateStr, 'dd.MM.yyyy', new Date())

    // "n дней назад"
    const timeAgo = formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: currentLocale 
    })

    // Локализованная дата (DD.MM.YYYY или MM/DD/YYYY)
    const calendarDate = format(date, 'P', { locale: currentLocale })

    return `${timeAgo} (${calendarDate})`
  }

  return { formatArtDate }
}