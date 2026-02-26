export const loadMermaidScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 检查mermaid是否已经加载
    if (typeof window !== 'undefined' && (window as any).mermaid) {
      resolve();
      return;
    }

    // 使用cdnjs (Cloudflare)CDN
    const mermaidScript = 'https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.9.0/mermaid.min.js';

    addExternalScript(mermaidScript)
      .then(() => {
        // 初始化 mermaid 配置
        (window as any).mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'inherit',
        });
        resolve();
      })
      .catch((error) => {
        console.error('mermaid加载失败:', error);
        reject(error);
      });
  });
};

export function addExternalScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.body.appendChild(script);
  });
}

export default loadMermaidScript;