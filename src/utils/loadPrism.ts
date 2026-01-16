/**
 * Prism.js CDN 动态加载工具
 * 用于代码语法高亮
 */

// Prism CDN 基础路径
const PRISM_CDN_BASE = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0';

// 已加载的语言缓存
const loadedLanguages = new Set<string>(['javascript', 'css', 'markup', 'clike']);

// Prism 加载 Promise 缓存
let prismLoadPromise: Promise<any> | null = null;

/**
 * 加载 Prism.js 核心库和基础样式
 */
export async function loadPrism(): Promise<any> {
  // 如果已经加载过，直接返回
  if (typeof window !== 'undefined' && (window as any).Prism) {
    return (window as any).Prism;
  }

  // 如果正在加载，返回现有的 Promise
  if (prismLoadPromise) {
    return prismLoadPromise;
  }

  prismLoadPromise = new Promise((resolve, reject) => {
    // 加载 CSS 主题
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${PRISM_CDN_BASE}/themes/prism-coldark-cold.min.css`;
    document.head.appendChild(link);

    // 加载行号插件 CSS
    const lineNumbersCSS = document.createElement('link');
    lineNumbersCSS.rel = 'stylesheet';
    lineNumbersCSS.href = `${PRISM_CDN_BASE}/plugins/line-numbers/prism-line-numbers.min.css`;
    document.head.appendChild(lineNumbersCSS);

    // 加载 Prism 核心 JS
    const script = document.createElement('script');
    script.src = `${PRISM_CDN_BASE}/prism.min.js`;
    script.onload = () => {
      // 加载行号插件
      const lineNumbersScript = document.createElement('script');
      lineNumbersScript.src = `${PRISM_CDN_BASE}/plugins/line-numbers/prism-line-numbers.min.js`;
      lineNumbersScript.onload = () => {
        // 加载自动加载器（用于按需加载语言）
        const autoloaderScript = document.createElement('script');
        autoloaderScript.src = `${PRISM_CDN_BASE}/plugins/autoloader/prism-autoloader.min.js`;
        autoloaderScript.onload = () => {
          const Prism = (window as any).Prism;
          if (Prism && Prism.plugins && Prism.plugins.autoloader) {
            // 配置自动加载器的语言路径
            Prism.plugins.autoloader.languages_path = `${PRISM_CDN_BASE}/components/`;
          }
          resolve(Prism);
        };
        autoloaderScript.onerror = reject;
        document.head.appendChild(autoloaderScript);
      };
      lineNumbersScript.onerror = reject;
      document.head.appendChild(lineNumbersScript);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return prismLoadPromise;
}

/**
 * 加载指定语言的语法支持
 */
export async function loadPrismLanguage(language: string): Promise<void> {
  const Prism = await loadPrism();

  // 如果语言已加载，直接返回
  if (loadedLanguages.has(language) || Prism.languages[language]) {
    loadedLanguages.add(language);
    return;
  }

  // 语言别名映射
  const languageAliases: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'rb': 'ruby',
    'sh': 'bash',
    'shell': 'bash',
    'yml': 'yaml',
    'md': 'markdown',
    'html': 'markup',
    'xml': 'markup',
    'svg': 'markup',
  };

  const actualLanguage = languageAliases[language] || language;

  // 如果使用自动加载器，它会自动处理
  if (Prism.plugins && Prism.plugins.autoloader) {
    loadedLanguages.add(language);
    return;
  }

  // 手动加载语言
  return new Promise((resolve, _reject) => {
    const script = document.createElement('script');
    script.src = `${PRISM_CDN_BASE}/components/prism-${actualLanguage}.min.js`;
    script.onload = () => {
      loadedLanguages.add(language);
      resolve();
    };
    script.onerror = () => {
      // 语言加载失败不影响基本功能
      console.warn(`Failed to load Prism language: ${actualLanguage}`);
      resolve();
    };
    document.head.appendChild(script);
  });
}

/**
 * 高亮代码
 */
export async function highlightCode(code: string, language: string = 'javascript'): Promise<string> {
  const Prism = await loadPrism();

  // 尝试加载语言
  await loadPrismLanguage(language);

  // 获取语法定义
  const grammar = Prism.languages[language] || Prism.languages.javascript;

  // 高亮代码
  return Prism.highlight(code, grammar, language);
}

/**
 * 高亮元素
 */
export async function highlightElement(element: HTMLElement): Promise<void> {
  const Prism = await loadPrism();
  Prism.highlightElement(element);
}

/**
 * 高亮所有代码块
 */
export async function highlightAll(): Promise<void> {
  const Prism = await loadPrism();
  Prism.highlightAll();
}
