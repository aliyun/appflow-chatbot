/**
 * MessageAttachments - 消息附件展示组件
 * 用于在消息气泡中展示上传的图片、文件和语音消息
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Image } from 'antd';
import {
  FileWordOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  FileOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';

// ==================== 类型定义 ====================

export interface MessageAttachmentsProps {
  /** 消息角色，影响卡片配色 */
  role?: 'user' | 'bot';
  /** 图片URL列表 */
  images?: string[];
  /** 文件列表 */
  files?: { name: string; url: string }[];
  /** 语音消息URL */
  audio?: string;
}

// ==================== 样式组件 ====================

const AttachmentsArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
`;

const ImageCard = styled.div<{ $role: 'user' | 'bot' }>`
  background: ${props => props.$role === 'user' ? '#eef0ff' : '#e8f4fd'};
  border-radius: 8px;
  padding: 8px;
  display: inline-flex;
  flex-direction: column;
  gap: 6px;
  max-width: 180px;
  color: #333;

  .image-preview {
    border-radius: 6px;
    overflow: hidden;
    cursor: pointer;

    .ant-image {
      display: block;
    }

    img {
      max-width: 100%;
      height: auto;
      display: block;
    }
  }
`;

const ImagesRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const FileCard = styled.a<{ $role: 'user' | 'bot' }>`
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${props => props.$role === 'user' ? '#eef0ff' : '#e8f4fd'};
  border-radius: 8px;
  padding: 10px 12px;
  text-decoration: none;
  color: #333;
  transition: background 0.2s;
  max-width: 100%;
  box-sizing: border-box;

  &:hover {
    background: ${props => props.$role === 'user' ? '#e2e5ff' : '#d6ecf8'};
  }

  .file-icon {
    font-size: 28px;
    flex-shrink: 0;
    color: #1677ff;
  }

  .file-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .file-name {
    font-size: 13px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #333;
  }

  .file-meta {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .file-type {
    font-size: 11px;
    padding: 1px 4px;
    border-radius: 3px;
    background: rgba(0, 0, 0, 0.06);
    color: #666;
    text-transform: uppercase;
    font-weight: 500;
  }
`;

// ==================== 语音播放器样式 ====================

const waveAnimation = keyframes`
  0%, 100% { height: 4px; }
  50% { height: 16px; }
`;

const AudioCard = styled.div<{ $role: 'user' | 'bot' }>`
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${props => props.$role === 'user' ? '#eef0ff' : '#e8f4fd'};
  border-radius: 8px;
  padding: 10px 14px;
  max-width: 100%;
  box-sizing: border-box;
  min-width: 200px;
`;

const PlayButton = styled.span<{ $role: 'user' | 'bot' }>`
  font-size: 28px;
  cursor: pointer;
  flex-shrink: 0;
  color: ${props => props.$role === 'user' ? '#667eea' : '#1677ff'};
  display: flex;
  align-items: center;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const AudioBody = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

const WaveformContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  height: 20px;
`;

const WaveBar = styled.div<{ $active: boolean; $playing: boolean; $delay: number }>`
  width: 3px;
  border-radius: 2px;
  background: ${props => props.$active ? '#667eea' : '#c0c8d8'};
  transition: background 0.15s;

  ${props => props.$playing && props.$active ? css`
    animation: ${waveAnimation} 0.6s ease-in-out infinite;
    animation-delay: ${props.$delay}s;
  ` : css`
    height: ${props.$active ? '12px' : `${4 + Math.random() * 10}px`};
  `}
`;

const ProgressBar = styled.div`
  position: relative;
  height: 3px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 2px;
  cursor: pointer;
  overflow: visible;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  background: #667eea;
  border-radius: 2px;
  width: ${props => props.$progress}%;
  transition: width 0.1s linear;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    right: -4px;
    top: 50%;
    transform: translateY(-50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #667eea;
    opacity: 0;
    transition: opacity 0.2s;
  }

  ${ProgressBar}:hover &::after {
    opacity: 1;
  }
`;

const AudioDuration = styled.span`
  font-size: 12px;
  color: #888;
  flex-shrink: 0;
  min-width: 32px;
  text-align: right;
  font-variant-numeric: tabular-nums;
`;

// ==================== 语音播放器组件 ====================

/** 格式化秒数为 m:ss */
function formatDuration(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** 生成固定的波形条高度 */
const WAVE_BARS = Array.from({ length: 20 }, (_, i) => {
  // 用正弦函数生成自然的波形高度
  const base = Math.sin((i / 20) * Math.PI) * 12 + 4;
  return Math.max(4, Math.min(18, base + (Math.random() * 4 - 2)));
});

const AudioPlayer: React.FC<{ src: string; role: 'user' | 'bot' }> = ({ src, role }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => setDuration(audio.duration);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!audio || !bar || !duration) return;

    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
    setCurrentTime(audio.currentTime);
  }, [duration]);

  return (
    <AudioCard $role={role}>
      <audio ref={audioRef} src={src} preload="metadata" />
      <PlayButton $role={role} onClick={togglePlay}>
        {isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
      </PlayButton>
      <AudioBody>
        <WaveformContainer>
          {WAVE_BARS.map((h, i) => {
            const barProgress = (i / WAVE_BARS.length) * 100;
            const isActive = barProgress <= progress;
            return (
              <WaveBar
                key={i}
                $active={isActive}
                $playing={isPlaying}
                $delay={i * 0.05}
                style={!isPlaying || !isActive ? { height: `${h}px` } : undefined}
              />
            );
          })}
        </WaveformContainer>
        <ProgressBar ref={progressRef} onClick={handleProgressClick}>
          <ProgressFill $progress={progress} />
        </ProgressBar>
      </AudioBody>
      <AudioDuration>
        {isPlaying || currentTime > 0 ? formatDuration(currentTime) : formatDuration(duration)}
      </AudioDuration>
    </AudioCard>
  );
};

// ==================== 工具函数 ====================

/** 根据文件名获取文件扩展名 */
function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/** 根据文件扩展名获取对应的图标组件 */
function getFileIcon(ext: string): React.ReactNode {
  switch (ext) {
    case 'doc':
    case 'docx':
      return <FileWordOutlined />;
    case 'pdf':
      return <FilePdfOutlined />;
    case 'xls':
    case 'xlsx':
    case 'csv':
      return <FileExcelOutlined />;
    case 'txt':
    case 'md':
    case 'json':
      return <FileTextOutlined />;
    default:
      return <FileOutlined />;
  }
}

// ==================== 组件实现 ====================

/**
 * MessageAttachments - 消息附件展示组件
 *
 * 在消息气泡中展示上传的图片（缩略图 + 点击预览）和文件（图标 + 文件名 + 类型标签 + 点击下载）。
 *
 * @example
 * ```tsx
 * <MessageAttachments
 *   role="user"
 *   images={['https://example.com/image.png']}
 *   files={[{ name: '文档.docx', url: 'https://example.com/doc.docx' }]}
 * />
 * ```
 */
export const MessageAttachments: React.FC<MessageAttachmentsProps> = ({
  role = 'user',
  images,
  files,
  audio,
}) => {
  const hasImages = images && images.length > 0;
  const hasFiles = files && files.length > 0;
  const hasAudio = !!audio;

  if (!hasImages && !hasFiles && !hasAudio) return null;

  return (
    <AttachmentsArea>
      {/* 语音播放器 */}
      {hasAudio && <AudioPlayer src={audio} role={role} />}

      {/* 图片列表 */}
      {hasImages && (
        <ImagesRow>
          {images.map((url, index) => (
            <ImageCard key={index} $role={role}>
              <div className="image-preview">
                <Image
                  src={url}
                  width={160}
                  style={{ borderRadius: 6, objectFit: 'cover' }}
                  preview={{ mask: '预览' }}
                />
              </div>
            </ImageCard>
          ))}
        </ImagesRow>
      )}

      {/* 文件列表 */}
      {hasFiles && files.map((file, index) => {
        const ext = getFileExtension(file.name);
        return (
          <FileCard
            key={index}
            className="appflow-file-card"
            $role={role}
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="file-icon">{getFileIcon(ext)}</span>
            <div className="file-info">
              <span className="file-name">{file.name}</span>
              <div className="file-meta">
                {ext && <span className="file-type">{ext}</span>}
              </div>
            </div>
          </FileCard>
        );
      })}
    </AttachmentsArea>
  );
};

export default MessageAttachments;
