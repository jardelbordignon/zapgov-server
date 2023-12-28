import { en } from './locales/en'
import { pt } from './locales/pt'
import { LocaleType } from './locales/type'

export type Lang = 'en' | 'pt'

export class I18n {
  private locales = { en, pt }
  private lang: Lang = 'pt'

  setLang(lang: Lang) {
    if (!(lang in this.locales)) return
    this.lang = lang
  }

  t<T extends Partial<LocaleType>>(
    expression: keyof T,
    data?: string | string[]
  ): string {
    const expr = (this.locales[this.lang] as T)[expression] as string
    if (!data) return expr
    if (typeof data === 'string') {
      return expr.replace('.v.', data)
    }
    return data.reduce((acc, v) => acc.replace('.v.', v), expr)
  }
}
