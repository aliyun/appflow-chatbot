/**
 * AudioPlayer - 语音消息播放器组件
 * 用于在消息气泡中展示语音消息，支持播放/暂停、进度条、波形动画、时长显示
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';

// ==================== 类型定义 ====================

export interface AudioPlayerProps {
  /** 音频文件URL */
  src: string;
  /** 消息角色，影响配色 */
  role?: 'user' | 'bot';
}

// ==================== 样式组件 ====================

const waveAnimation = keyframes`
  0%, 100% { height: 4px; }
  50% { height: 16px; }
`;

const AudioCard = styled.div<{ $role: 'user' | 'bot' }>`
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${props => props.$role === 'user' ? '#e5effe' : '#e8f4fd'};
  border-radius: 12px;
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

// ==================== 工具函数 ====================

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

// ==================== 组件实现 ====================

/**
 * AudioPlayer - 语音消息播放器
 *
 * 紧凑的播放器组件，包含播放/暂停按钮 + 波形条 + 进度条 + 时长显示。
 * 风格类似钉钉/微信的聊天语音消息，可独立使用无需外层气泡包裹。
 *
 * @example
 * ```tsx
 * <AudioPlayer src="https://example.com/audio.webm" role="user" />
 * ```
 */
export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, role = 'user' }) => {
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

export default AudioPlayer;
