/**
 * useTranslation Hook
 */

import { useCallback, useContext } from 'react';
import type { Locale, TranslationKey, TranslationParams } from '../locales/types';
import { LocaleContext } from './LocaleContext';
import { getByPath, interpolate } from './utils';

export interface UseTranslationResult {
  /** 翻译函数 */
  t: (key: TranslationKey, params?: TranslationParams) => string;
  /** 当前 locale 对象 */
  locale: Locale;
  /** 当前语言标识 */
  localeName: string;
}

/**
 * 在 React 组件内消费国际化文案
 *
 * @example
 *   const { t } = useTranslation();
 *   <Input placeholder={t('humanVerify.placeholder.input', { title: '名称' })} />
 */
export function useTranslation(): UseTranslationResult {
  const { locale, localeName } = useContext(LocaleContext);

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams): string => {
      const value = getByPath(locale, key);
      if (typeof value !== 'string') return key;
      return params ? interpolate(value, params) : value;
    },
    [locale]
  );

  return { t, locale, localeName };
}
