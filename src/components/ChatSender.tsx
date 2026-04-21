/**
 * ChatSender - 聊天输入框组件
 * 封装 @ant-design/x 的 Sender + Attachments，集成文件上传、语音输入、联网搜索、模型选择等能力
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Sender, Attachments } from '@ant-design/x';
import type { AttachmentsProps } from '@ant-design/x';
import { Select, Switch, Button, Tooltip, Badge } from 'antd';
import {
  PaperClipOutlined,
  PictureOutlined,
  GlobalOutlined,
  DeleteOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import type { ModelInfo, ModelCapabilities } from '../services/ChatService';

/** Attachments 组件的 ref 类型 */
interface AttachmentsRefType {
  nativeElement: HTMLDivElement | null;
  upload: (file: File) => void;
}

/** 附件文件项类型（兼容 antd Upload fileList 项） */
interface AttachmentFileItem {
  uid: string;
  name: string;
  status?: 'uploading' | 'done' | 'error' | 'removed';
  thumbUrl?: string;
  url?: string;
}

// ==================== 类型定义 ====================

/** 附件信息（上传完成后携带下载URL） */
export interface ChatAttachment {
  /** 文件唯一标识 */
  uid: string;
  /** 文件名 */
  name: string;
  /** 上传状态 */
  status: 'uploading' | 'done' | 'error';
  /** 文件类型：image 或 file */
  type: 'image' | 'file';
  /** 上传后的下载URL */
  url?: string;
  /** 本地预览URL（图片） */
  thumbUrl?: string;
  /** 原始文件对象 */
  originFile?: File;
}

/** 提交时的消息数据 */
export interface ChatSenderSubmitData {
  /** 文本内容 */
  text: string;
  /** 图片URL列表 */
  images: string[];
  /** 文件URL列表 */
  files: string[];
  /** 选中的模型ID */
  modelId?: string;
  /** 是否启用联网搜索 */
  webSearch: boolean;
}

export interface ChatSenderProps {
  /** 是否处于加载状态（AI正在回复） */
  loading?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 输入框占位文本 */
  placeholder?: string;
  /** 提交方式：'enter' 回车发送 | 'shiftEnter' Shift+回车发送 */
  submitType?: 'enter' | 'shiftEnter';

  // ==================== 模型相关 ====================

  /** 可用模型列表 */
  models?: ModelInfo[];
  /** 当前选中的模型ID */
  modelId?: string;
  /** 默认选中的模型ID（非受控） */
  defaultModelId?: string;
  /** 模型切换回调 */
  onModelChange?: (modelId: string) => void;

  // ==================== 能力配置 ====================

  /**
   * 模型能力配置，控制功能按钮的显隐
   * 如果不传，所有功能按钮都显示
   */
  capabilities?: ModelCapabilities;

  // ==================== 事件回调 ====================

  /** 提交消息回调 */
  onSubmit?: (data: ChatSenderSubmitData) => void;
  /** 取消当前请求 */
  onCancel?: () => void;
  /** 清除会话回调 */
  onClear?: () => void;
  /** 文件上传方法，返回下载URL */
  onUpload?: (file: File) => Promise<string>;

  // ==================== 样式 ====================

  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

// ==================== 样式组件 ====================

const SenderWrapper = styled.div`
  .appflow-chat-sender-prefix {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .appflow-chat-sender-actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .appflow-chat-sender-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 0;
  }

  .appflow-chat-sender-footer-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .appflow-chat-sender-footer-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .appflow-chat-sender-web-search {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #666;
  }

  .appflow-chat-sender-model-select {
    min-width: 120px;
  }
`;

// ==================== 工具函数 ====================

function generateUid(): string {
  return `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

// ==================== 组件实现 ====================

/**
 * ChatSender - 聊天输入框组件
 *
 * 集成了文本输入、文件/图片上传、语音输入、联网搜索、模型选择等功能。
 * 根据模型能力自动控制功能按钮的显隐。
 *
 * @example
 * ```tsx
 * <ChatSender
 *   loading={isLoading}
 *   models={config.models}
 *   capabilities={chatService.getModelCapabilities(modelId)}
 *   onSubmit={({ text, images, files, modelId, webSearch }) => {
 *     chatService.chat({ text, images, files, modelId, webSearch });
 *   }}
 *   onCancel={() => chatService.cancel()}
 *   onClear={() => chatService.clear()}
 *   onUpload={(file) => chatService.upload(file)}
 * />
 * ```
 */
export const ChatSender: React.FC<ChatSenderProps> = ({
  loading = false,
  disabled = false,
  placeholder = '',
  submitType = 'enter',
  models = [],
  modelId: controlledModelId,
  defaultModelId,
  onModelChange,
  capabilities,
  onSubmit,
  onCancel,
  onClear,
  onUpload,
  className,
  style,
}) => {
  // ==================== 状态管理 ====================

  const [inputValue, setInputValue] = useState('');
  const [internalModelId, setInternalModelId] = useState<string | undefined>(
    defaultModelId || models[0]?.id
  );
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [headerOpen, setHeaderOpen] = useState(false);

  const attachmentsRef = useRef<AttachmentsRefType>(null);

  // 受控/非受控模型ID
  const currentModelId = controlledModelId ?? internalModelId;

  // ==================== 能力判断 ====================

  const hasImageCapability = capabilities?.image ?? true;
  const hasFileCapability = capabilities?.file ?? true;
  const hasAudioCapability = capabilities?.audio ?? false;
  const hasWebSearchCapability = capabilities?.webSearch ?? false;

  const hasUploadCapability = hasImageCapability || hasFileCapability;
  const hasAttachments = attachments.length > 0;
  const uploadingCount = attachments.filter(a => a.status === 'uploading').length;
  const isUploading = uploadingCount > 0;

  // ==================== 文件上传处理 ====================

  const handleFileUpload = useCallback(async (file: File) => {
    if (!onUpload) return;

    const uid = generateUid();
    const fileType = isImageFile(file) ? 'image' : 'file';

    // 检查能力限制
    if (fileType === 'image' && !hasImageCapability) return;
    if (fileType === 'file' && !hasFileCapability) return;

    const newAttachment: ChatAttachment = {
      uid,
      name: file.name,
      status: 'uploading',
      type: fileType,
      thumbUrl: fileType === 'image' ? URL.createObjectURL(file) : undefined,
      originFile: file,
    };

    setAttachments(prev => [...prev, newAttachment]);
    setHeaderOpen(true);

    try {
      const downloadUrl = await onUpload(file);
      setAttachments(prev =>
        prev.map(a => a.uid === uid ? { ...a, status: 'done' as const, url: downloadUrl } : a)
      );
    } catch {
      setAttachments(prev =>
        prev.map(a => a.uid === uid ? { ...a, status: 'error' as const } : a)
      );
    }
  }, [onUpload, hasImageCapability, hasFileCapability]);

  // ==================== 提交处理 ====================

  const handleSubmit = useCallback((text: string) => {
    if (!text.trim() && !hasAttachments) return;
    if (isUploading) return;

    const images = attachments
      .filter(a => a.type === 'image' && a.status === 'done' && a.url)
      .map(a => a.url!);

    const files = attachments
      .filter(a => a.type === 'file' && a.status === 'done' && a.url)
      .map(a => a.url!);

    onSubmit?.({
      text: text.trim(),
      images,
      files,
      modelId: currentModelId,
      webSearch: webSearchEnabled,
    });

    // 清空状态
    setInputValue('');
    setAttachments([]);
    setHeaderOpen(false);
  }, [attachments, hasAttachments, isUploading, currentModelId, webSearchEnabled, onSubmit]);

  // ==================== 模型切换 ====================

  const handleModelChange = useCallback((value: string) => {
    setInternalModelId(value);
    onModelChange?.(value);
  }, [onModelChange]);

  // ==================== 粘贴文件 ====================

  const handlePasteFile = useCallback((firstFile: File) => {
    handleFileUpload(firstFile);
  }, [handleFileUpload]);

  // ==================== Attachments 配置 ====================

  const attachmentItems: AttachmentFileItem[] = useMemo(() => {
    return attachments.map(a => ({
      uid: a.uid,
      name: a.name,
      status: a.status === 'done' ? 'done' as const : a.status === 'error' ? 'error' as const : 'uploading' as const,
      thumbUrl: a.thumbUrl,
      url: a.url,
    }));
  }, [attachments]);

  // 文件类型限制
  const acceptTypes = useMemo(() => {
    const types: string[] = [];
    if (hasImageCapability) {
      types.push('image/*');
    }
    if (hasFileCapability) {
      const fileConfig = capabilities?.fileConfig;
      if (fileConfig?.supportFileTypes?.length) {
        types.push(...fileConfig.supportFileTypes.map(t => `.${t}`));
      } else {
        types.push('.pdf', '.doc', '.docx', '.txt', '.csv', '.xlsx', '.xls', '.md', '.json');
      }
    }
    return types.join(',');
  }, [hasImageCapability, hasFileCapability, capabilities?.fileConfig]);

  // ==================== 渲染：Header（附件区域） ====================

  const renderHeader = useMemo(() => {
    if (!hasUploadCapability) return undefined;

    return (
      <Sender.Header
        title="附件"
        open={headerOpen}
        onOpenChange={setHeaderOpen}
        closable
        styles={{
          content: { padding: 4 },
        }}
      >
        <Attachments
          ref={attachmentsRef as any}
          items={attachmentItems as AttachmentsProps['items']}
          beforeUpload={() => false}
          onRemove={(file) => {
            setAttachments(prev => {
              const updated = prev.filter(a => a.uid !== file.uid);
              if (updated.length === 0) {
                setHeaderOpen(false);
              }
              return updated;
            });
          }}
          placeholder={{
            icon: <CloudUploadOutlined />,
            title: '拖拽文件到此处',
            description: '支持图片和文件',
          }}
        />
      </Sender.Header>
    );
  }, [hasUploadCapability, headerOpen, attachmentItems]);

  // ==================== 渲染：Footer（模型选择 + 联网搜索 + 清除） ====================

  const renderFooter = useMemo(() => {
    const hasFooterContent = models.length > 1 || hasWebSearchCapability || onClear;
    if (!hasFooterContent) return undefined;

    return (
      <div className="appflow-chat-sender-footer">
        <div className="appflow-chat-sender-footer-left">
          {/* 模型选择 */}
          {models.length > 1 && (
            <Select
              className="appflow-chat-sender-model-select"
              size="small"
              value={currentModelId}
              onChange={handleModelChange}
              options={models.map(m => ({ label: m.name, value: m.id }))}
              variant="borderless"
              popupMatchSelectWidth={false}
            />
          )}

          {/* 联网搜索开关 */}
          {hasWebSearchCapability && (
            <div className="appflow-chat-sender-web-search">
              <GlobalOutlined />
              <Switch
                size="small"
                checked={webSearchEnabled}
                onChange={setWebSearchEnabled}
              />
              <span>联网搜索</span>
            </div>
          )}
        </div>

        <div className="appflow-chat-sender-footer-right">
          {/* 清除会话 */}
          {onClear && (
            <Tooltip title="清除会话">
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                onClick={onClear}
                disabled={loading}
              />
            </Tooltip>
          )}
        </div>
      </div>
    );
  }, [models, currentModelId, handleModelChange, hasWebSearchCapability, webSearchEnabled, onClear, loading]);

  // ==================== 渲染：Actions（上传按钮） ====================

  const renderActions = useCallback((
    oriNode: React.ReactNode,
    info: { components: { SendButton: React.ComponentType<any>; ClearButton: React.ComponentType<any>; LoadingButton: React.ComponentType<any> } }
  ) => {
    const { SendButton, LoadingButton } = info.components;

    return (
      <div className="appflow-chat-sender-actions">
        {/* 上传按钮 */}
        {hasUploadCapability && (
          <Tooltip title={hasAttachments ? `${attachments.length} 个附件` : '上传文件'}>
            <Badge count={attachments.length} size="small" offset={[-4, 4]}>
              <Button
                type="text"
                size="small"
                icon={hasImageCapability && !hasFileCapability ? <PictureOutlined /> : <PaperClipOutlined />}
                disabled={disabled || loading}
                onClick={() => {
                  // 触发文件选择
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = acceptTypes;
                  input.multiple = true;
                  input.onchange = (e) => {
                    const fileList = (e.target as HTMLInputElement).files;
                    if (fileList) {
                      Array.from(fileList).forEach(handleFileUpload);
                    }
                  };
                  input.click();
                }}
              />
            </Badge>
          </Tooltip>
        )}

        {/* 发送/停止按钮 */}
        {loading ? (
          <LoadingButton />
        ) : (
          <SendButton disabled={disabled || isUploading || (!inputValue.trim() && !hasAttachments)} />
        )}
      </div>
    );
  }, [
    hasUploadCapability, hasImageCapability, hasFileCapability,
    hasAttachments, attachments.length, acceptTypes,
    disabled, loading, isUploading, inputValue, handleFileUpload,
  ]);

  // ==================== 主渲染 ====================

  return (
    <SenderWrapper className={`appflow-chat-sender ${className || ''}`} style={style}>
      <Sender
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSubmit}
        loading={loading}
        disabled={disabled}
        placeholder={isUploading ? '文件上传中...' : placeholder}
        submitType={submitType}
        onCancel={onCancel}
        onPasteFile={hasUploadCapability ? handlePasteFile : undefined}
        allowSpeech={hasAudioCapability}
        header={renderHeader}
        footer={renderFooter}
        actions={renderActions}
        autoSize={{ minRows: 1, maxRows: 6 }}
        readOnly={isUploading}
      />
    </SenderWrapper>
  );
};

export default ChatSender;
