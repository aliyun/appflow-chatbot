/**
 * ChatSender - 聊天输入框组件
 */

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Sender, Attachments } from '@ant-design/x';
import type { AttachmentsProps } from '@ant-design/x';
import { Select, Switch, Button, Tooltip } from 'antd';
import {
  PaperClipOutlined,
  PictureOutlined,
  GlobalOutlined,
  CloudUploadOutlined,
  AudioOutlined,
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
  /** 文件列表（包含文件名和URL） */
  files: { name: string; url: string }[];
  /** 语音文件URL（录音上传后的下载地址） */
  audio?: string;
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

  /** 可用模型列表，传入且长度>1时显示模型选择下拉框 */
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
   * 不传时默认所有功能关闭
   */
  capabilities?: ModelCapabilities;

  // ==================== 事件回调 ====================

  /** 提交消息回调 */
  onSubmit?: (data: ChatSenderSubmitData) => void;
  /** 取消当前请求 */
  onCancel?: () => void;
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
  .appflow-chat-sender-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 0;
  }

  .appflow-chat-sender-footer-left {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .appflow-chat-sender-footer-right {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .appflow-chat-sender-model-select {
    min-width: 100px;
  }

  .appflow-chat-sender-separator {
    width: 1px;
    height: 16px;
    background: #e0e0e0;
    margin: 0 2px;
  }

  .appflow-chat-sender-web-search {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #666;
    padding: 2px 6px;
    height: 28px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
    user-select: none;

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }
  }
`;

// ==================== 录音中波形图标 ====================

/** 录音中的波形动画图标（复用 @ant-design/x 的 RecordingIcon 设计） */
const RecordingIcon: React.FC = () => {
  const SIZE = 1000;
  const COUNT = 4;
  const RECT_WIDTH = 140;
  const RECT_RADIUS = RECT_WIDTH / 2;
  const RECT_HEIGHT_MIN = 250;
  const RECT_HEIGHT_MAX = 500;
  const DURATION = 0.8;

  return (
    <svg
      width="1em"
      height="1em"
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      {Array.from({ length: COUNT }).map((_, index) => {
        const dest = (SIZE - RECT_WIDTH * COUNT) / (COUNT - 1);
        const x = index * (dest + RECT_WIDTH);
        const yMin = SIZE / 2 - RECT_HEIGHT_MIN / 2;
        const yMax = SIZE / 2 - RECT_HEIGHT_MAX / 2;
        return (
          <rect
            key={index}
            fill="currentColor"
            rx={RECT_RADIUS}
            ry={RECT_RADIUS}
            height={RECT_HEIGHT_MIN}
            width={RECT_WIDTH}
            x={x}
            y={yMin}
          >
            <animate
              attributeName="height"
              values={`${RECT_HEIGHT_MIN}; ${RECT_HEIGHT_MAX}; ${RECT_HEIGHT_MIN}`}
              keyTimes="0; 0.5; 1"
              dur={`${DURATION}s`}
              begin={`${(DURATION / COUNT) * index}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="y"
              values={`${yMin}; ${yMax}; ${yMin}`}
              keyTimes="0; 0.5; 1"
              dur={`${DURATION}s`}
              begin={`${(DURATION / COUNT) * index}s`}
              repeatCount="indefinite"
            />
          </rect>
        );
      })}
    </svg>
  );
};

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
  const [speechRecording, setSpeechRecording] = useState(false);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [headerOpen, setHeaderOpen] = useState(false);

  const attachmentsRef = useRef<AttachmentsRefType>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const speechRecordingRef = useRef(false);

  // 受控/非受控模型ID
  const currentModelId = controlledModelId ?? internalModelId;

  // ==================== 能力判断 ====================

  const hasImageCapability = capabilities?.image ?? false;
  const hasFileCapability = capabilities?.file ?? false;
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
      .map(a => ({ name: a.name, url: a.url! }));

    onSubmit?.({
      text: text.trim(),
      images,
      files,
      audio: undefined,
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
          accept={acceptTypes}
          multiple
          customRequest={({ file }) => {
            if (file instanceof File) {
              handleFileUpload(file);
            }
          }}
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

  // ==================== 触发文件选择 ====================

  const triggerFileSelect = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = acceptTypes;
    input.multiple = true;
    input.onchange = (event) => {
      const fileList = (event.target as HTMLInputElement).files;
      if (fileList) {
        Array.from(fileList).forEach(handleFileUpload);
      }
    };
    input.click();
  }, [acceptTypes, handleFileUpload]);

  // ==================== 语音录音管理 ====================
  // 使用 MediaRecorder 录制音频文件，录音结束后上传并发送

  const stopMediaStream = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;
  }, []);

  const toggleSpeechRecording = useCallback(async () => {
    if (speechRecordingRef.current) {
      // 停止录音 — MediaRecorder.onstop 中会处理上传和发送
      mediaRecorderRef.current?.stop();
      speechRecordingRef.current = false;
      setSpeechRecording(false);
    } else {
      // 开始录音
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        audioChunksRef.current = [];

        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          // 停止麦克风流
          stopMediaStream();

          const chunks = audioChunksRef.current;
          if (chunks.length === 0 || !onUpload) return;

          // 合并音频 chunks 为 Blob
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          const audioFile = new File(
            [audioBlob],
            `recording_${Date.now()}.webm`,
            { type: 'audio/webm' }
          );

          try {
            // 上传音频文件
            const audioUrl = await onUpload(audioFile);

            // 发送语音消息（audio 优先级最高，服务端会忽略 text/images/files）
            onSubmit?.({
              text: '',
              images: [],
              files: [],
              audio: audioUrl,
              modelId: currentModelId,
              webSearch: false,
            });
          } catch (err) {
            console.error('语音上传失败:', err);
          }
        };

        mediaRecorder.onerror = () => {
          speechRecordingRef.current = false;
          setSpeechRecording(false);
          stopMediaStream();
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        speechRecordingRef.current = true;
        setSpeechRecording(true);
      } catch (err) {
        console.error('无法获取麦克风权限:', err);
        speechRecordingRef.current = false;
        setSpeechRecording(false);
      }
    }
  }, [onUpload, onSubmit, inputValue, currentModelId, webSearchEnabled, stopMediaStream]);

  // 组件卸载时停止录音和麦克风流
  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop();
      stopMediaStream();
    };
  }, [stopMediaStream]);

  // ==================== 渲染：Footer（功能栏） ====================
  // 布局：左侧 [模型选择] [联网搜索]   右侧 [文件上传] [语音] [发送/停止]

  const renderFooter = useCallback((info: any) => {
    const { SendButton, LoadingButton } = info.components;

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
            <div
              className="appflow-chat-sender-web-search"
              onClick={() => setWebSearchEnabled(prev => !prev)}
            >
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
          {/* 文件上传按钮 */}
          {hasUploadCapability && (
            <Tooltip title="上传文件">
              <Button
                type="text"
                size="small"
                icon={hasImageCapability && !hasFileCapability ? <PictureOutlined /> : <PaperClipOutlined />}
                disabled={disabled || loading}
                onClick={triggerFileSelect}
              />
            </Tooltip>
          )}

          {/* 分隔线 */}
          {hasUploadCapability && hasAudioCapability && (
            <div className="appflow-chat-sender-separator" />
          )}

          {/* 语音按钮 */}
          {hasAudioCapability && (
            <Tooltip title={speechRecording ? '停止录音' : '语音输入'}>
              <Button
                type="text"
                size="small"
                icon={speechRecording ? <RecordingIcon /> : <AudioOutlined />}
                disabled={disabled}
                onClick={toggleSpeechRecording}
              />
            </Tooltip>
          )}

          {/* 发送/停止按钮 */}
          {loading ? (
            <LoadingButton />
          ) : (
            <SendButton disabled={disabled || isUploading || (!inputValue.trim() && !hasAttachments)} />
          )}
        </div>
      </div>
    );
  }, [
    hasUploadCapability, hasImageCapability, hasFileCapability,
    hasAttachments, attachments.length, triggerFileSelect,
    models, currentModelId, handleModelChange,
    hasWebSearchCapability, webSearchEnabled,
    hasAudioCapability, speechRecording, toggleSpeechRecording,
    disabled, loading, isUploading, inputValue,
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
        allowSpeech={false}
        header={renderHeader}
        footer={renderFooter}
        actions={false}
        autoSize={{ minRows: 1, maxRows: 6 }}
        readOnly={isUploading}
      />
    </SenderWrapper>
  );
};

export default ChatSender;
