/**
 * i18n 模块统一导出
 */

export { LocaleProvider, LocaleContext } from './LocaleContext';
export type { LocaleProviderProps, LocaleContextValue } from './LocaleContext';

export { useTranslation } from './useTranslation';
export type { UseTranslationResult } from './useTranslation';

export {
  translate,
  setGlobalLocale,
  getGlobalLocale,
  getGlobalLocaleName,
} from './translate';
