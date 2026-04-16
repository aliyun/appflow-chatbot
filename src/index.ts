/**
 * Appflow Chat - NPM 包入口文件
 * 
 * 使用方式：
 * import { chatService, MarkdownRenderer, BubbleContent } from '@alicloud/appflow-chat';
 */

// ==================== 服务导出 ====================
export { chatService } from './services/ChatService';
export { default as ChatService } from './services/ChatService';

// ==================== 服务类型导出 ====================
export type {
  SetupConfig,
  ChatConfig,
  ModelInfo,
  ModelCapabilities,
  ChatMessage,
  ChatStreamCallbacks,
  ChatStream,
  HistoryMessage,
  ChatSession,
} from './services/ChatService';

// ==================== UI 组件导出（简化接口，包含默认交互） ====================
export { MarkdownRenderer } from './components/MarkdownRenderer';
export { MessageBubble } from './components/MessageBubble';
export { RichMessageBubble } from './components/RichMessageBubble';
export { DocReferences } from './components/DocReferences';
export { WebSearchPanel } from './components/WebSearchPanel';

// ==================== UI 组件类型导出 ====================
export type { MarkdownRendererProps } from './components/MarkdownRenderer';
export type {
  MessageBubbleProps,
  HumanVerifySubmitData,
  HumanVerifyData,
  HistoryCardData
} from './components/MessageBubble';
export type { RichMessageBubbleProps } from './components/RichMessageBubble';
export type { DocReferencesProps, DocReferenceItem } from './components/DocReferences';
export type { WebSearchPanelProps, WebSearchItem } from './components/WebSearchPanel';

// ==================== Core 组件导出（纯展示组件，供高级定制） ====================
export { BubbleContent } from './core/BubbleContent';
export { RichBubbleContent } from './core/RichBubbleContent';
export { SourceContent } from './core/SourceContent';
export { WebSearchContent } from './core/WebSearchContent';

// ==================== Core 组件类型导出 ====================
export type { BubbleContentProps } from './core/BubbleContent';
export type { RichBubbleContentProps } from './core/RichBubbleContent';
export type { SourceContentProps, SourceItem } from './core/SourceContent';
export type { WebSearchContentProps } from './core/WebSearchContent';

// ==================== Context 导出 ====================
export { useRichBubbleContext, RichBubbleProvider } from './context/RichBubble';
export type { RichBubbleContextValue } from './context/RichBubble';

// ==================== Markdown 组件导出 ====================
export { MarkdownView } from './markdown';
export type { MarkdownViewProps } from './markdown';

// ==================== HumanVerify 组件导出 ====================
export { HumanVerify } from './components/HumanVerify';
export { HistoryCard, convertSchemaToUpperCase } from './components/HumanVerify';
export { CustomParamsRenderer, useCustomParamsRenderer, validateCustomParams } from './components/HumanVerify';

// ==================== HumanVerify 组件类型导出 ====================
export type { HumanVerifyProps } from './components/HumanVerify';
export type { HistoryCardProps } from './components/HumanVerify';
export type {
  CustomParamSchema,
  CustomParamsRendererProps,
  ValidationResult,
  ValidationError,
} from './components/HumanVerify';

// ==================== A2UI 组件导出 ====================
export { A2UISurface, A2UIStaticViewer } from './components/A2UIRenderer';

// ==================== A2UI 组件类型导出 ====================
export type { A2UISurfaceProps, A2UIStaticViewerProps, A2UIMessage } from './components/A2UIRenderer';

// ==================== 工具函数导出 ====================
export { loadEchartsScript } from './utils/loadEcharts';
export { loadMermaidScript } from './utils/loadMermaid';

// ==================== 国际化（i18n）导出 ====================
export {
  LocaleProvider,
  LocaleContext,
  useTranslation,
  translate,
  setGlobalLocale,
  getGlobalLocale,
  getGlobalLocaleName,
} from './i18n';
export type {
  LocaleProviderProps,
  LocaleContextValue,
  UseTranslationResult,
} from './i18n';

// ==================== 国际化词条导出 ====================
export { zhCN, enUS } from './locales';
export type {
  Locale,
  TranslationKey,
  TranslationParams,
  DeepPartial,
} from './locales';
