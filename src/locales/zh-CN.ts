/**
 * 中文词条（默认语言）
 *
 * 该文件作为 Locale 类型的基准结构，所有其他语言文件必须实现相同的 key 结构。
 * 新增文案时优先在此处添加，再补齐其他语言文件。
 */

const zhCN = {
  common: {
    loading: '加载中...',
    confirm: '确定',
    cancel: '取消',
    submit: '提交',
    retry: '重试',
    copy: '复制',
    copied: '已复制',
    placeholderSelect: '请选择',
  },
  humanVerify: {
    requiredAll: '请填写所有必填项',
    submitted: '已提交',
    pending: '待提交',
    placeholder: {
      input: '请输入{title}',
      select: '请选择',
    },
    file: {
      supportAll: '支持所有文件格式',
      supportFormats: '支持 {formats} 格式',
      uploadButton: '选择文件',
      uploading: '上传中',
      upload: '上传',
      defaultFileName: '文件',
      maxSizeError: '文件大小不能超过 {size}',
      uploadFailed: '文件上传失败',
      tokenFailed: '获取上传凭证失败',
      uploaderNotConfigured: '上传功能未配置',
      uploadMethodNotConfigured: '文件上传方法未配置',
      getFileIdFailed: '获取文件ID失败',
    },
  },
  webSearch: {
    title: '搜索结果',
    foundPages: '已搜索到{count}个网页',
  },
  source: {
    title: '参考资料',
    answerFrom: '回答来源：',
    imageFrom: '图片来源：',
  },
  rich: {
    stepLabel: '步骤{index}:',
    emptyContent: '暂无内容',
  },
  markdown: {
    copyCode: '复制代码',
    copied: '已复制！',
    copy: '复制',
    copiedShort: '已复制',
    deepThinking: '深度思考',
    chartLoading: '图表加载中...',
    tableLoading: '表格加载中...',
    tableLoadFailed: '表格数据加载失败，请检查数据格式',
    chartLoadFailed: '图表数据加载失败，请检查数据格式',
    mermaidLoadFailed: 'Mermaid 库加载失败',
    mermaidNotLoaded: 'Mermaid 未正确加载',
    mermaidRenderFailed: 'Mermaid 图表渲染失败',
  },
  message: {
    like: '点赞',
    dislike: '点踩',
    regenerate: '重新生成',
    copy: '复制',
    copied: '已复制',
  },
} as const;

export default zhCN;
