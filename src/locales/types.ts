/**
 * Locale 类型定义
 *
 * 以 zh-CN 词条结构作为类型基准，所有其他语言必须实现相同的 key 结构。
 * - 对象结构（哪些 key、嵌套层级）严格等同 zhCN
 * - 叶子节点的值放宽为 string，避免英文字面量被中文字面量类型卡住
 */

import type zhCN from './zh-CN';

/** 词条对象类型：保留 zhCN 的结构，但叶子节点统一为 string */
export type Locale = DeepStringify<typeof zhCN>;

/** 所有合法的扁平 key 路径，如 'common.loading' | 'humanVerify.placeholder.input' */
export type TranslationKey = DeepKey<typeof zhCN>;

/** 插值参数 */
export type TranslationParams = Record<string, string | number>;

/** 深度可选，用于 LocaleProvider 的 overrides 字段 */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

/** 把所有叶子节点的值类型统一为 string，并去掉 readonly */
type DeepStringify<T> = {
  -readonly [K in keyof T]: T[K] extends object ? DeepStringify<T[K]> : string;
};

/** 递归生成所有叶子节点的扁平路径联合类型 */
type DeepKey<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends object
    ? DeepKey<T[K], `${P}${P extends '' ? '' : '.'}${K}`>
    : `${P}${P extends '' ? '' : '.'}${K}`;
}[keyof T & string];
