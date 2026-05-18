/**
 * 英文词条
 */

import type { Locale } from './types';

const enUS: Locale = {
  common: {
    loading: 'Loading...',
    confirm: 'OK',
    cancel: 'Cancel',
    submit: 'Submit',
    retry: 'Retry',
    copy: 'Copy',
    copied: 'Copied',
    placeholderSelect: 'Please select',
  },
  humanVerify: {
    requiredAll: 'Please fill in all required fields',
    submitted: 'Submitted',
    pending: 'Pending',
    placeholder: {
      input: 'Please enter {title}',
      select: 'Please select',
    },
    file: {
      supportAll: 'Supports all file formats',
      supportFormats: 'Supports {formats} formats',
      uploadButton: 'Select File',
      uploading: 'Uploading',
      upload: 'Upload',
      defaultFileName: 'File',
      maxSizeError: 'File size cannot exceed {size}',
      uploadFailed: 'File upload failed',
      tokenFailed: 'Failed to get upload credentials',
      uploaderNotConfigured: 'Upload feature is not configured',
      uploadMethodNotConfigured: 'File upload method is not configured',
      getFileIdFailed: 'Failed to get file ID',
    },
  },
  webSearch: {
    title: 'Search Results',
    foundPages: 'Found {count} web pages',
  },
  source: {
    title: 'References',
    answerFrom: 'Sources:',
    imageFrom: 'Images:',
  },
  rich: {
    stepLabel: 'Step {index}:',
    emptyContent: 'No content',
  },
  markdown: {
    copyCode: 'Copy code',
    copied: 'Copied!',
    copy: 'Copy',
    copiedShort: 'Copied',
    deepThinking: 'Deep Thinking',
    chartLoading: 'Loading chart...',
    tableLoading: 'Loading table...',
    tableLoadFailed: 'Failed to load table data, please check the data format',
    chartLoadFailed: 'Failed to load chart data, please check the data format',
    mermaidLoadFailed: 'Failed to load Mermaid library',
    mermaidNotLoaded: 'Mermaid is not loaded correctly',
    mermaidRenderFailed: 'Mermaid chart rendering failed',
  },
  message: {
    like: 'Like',
    dislike: 'Dislike',
    regenerate: 'Regenerate',
    copy: 'Copy',
    copied: 'Copied',
  },
};

export default enUS;
