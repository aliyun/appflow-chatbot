// 检查脚本是否可访问
export const checkScriptAccessible = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // 创建一个临时的script标签来测试
    const script = document.createElement('script');
    const timeout = setTimeout(() => {
      cleanup();
      resolve(false);
    }, 5000); // 5秒超时

    const cleanup = () => {
      clearTimeout(timeout);
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      // 清理可能加载的echarts，避免影响后续加载
      if ((window as any).echarts && testingUrl === url) {
        delete (window as any).echarts;
      }
    };

    const testingUrl = url;

    script.onload = () => {
      cleanup();
      resolve(true);
    };

    script.onerror = () => {
      cleanup();
      resolve(false);
    };

    // 设置脚本属性
    // 添加时间戳避免缓存
    script.src = url + '?test=' + Date.now();
    script.async = true;

    // 添加到head中进行测试
    document.head.appendChild(script);
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
