import React from 'react';
import { Image } from 'antd';

interface IProps {
  src?: string;
  alt?: string;
  className?: string;
}

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogv', '.mov', '.m4v'];
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'];

// OSS 等签名链接会带上 query/hash，取扩展名前需要先剥离
const getExtension = (src: string) => {
  const path = src.split(/[?#]/)[0].toLowerCase();
  const dotIndex = path.lastIndexOf('.');
  return dotIndex === -1 ? '' : path.slice(dotIndex);
};

export const MediaRender: React.FC<IProps> = ({ src, alt, className }) => {
  const extension = getExtension(src || '');

  if (VIDEO_EXTENSIONS.includes(extension)) {
    return (
      <video
        src={src}
        className={className}
        controls
        playsInline
        preload="metadata"
        style={{
          display: 'block',
          maxWidth: '100%',
          maxHeight: '600px',
          borderRadius: '8px',
          marginTop: '8px',
          marginBottom: '8px',
        }}
      />
    );
  }

  if (AUDIO_EXTENSIONS.includes(extension)) {
    return (
      <audio
        src={src}
        className={className}
        controls
        preload="metadata"
        style={{
          display: 'block',
          maxWidth: '100%',
          marginTop: '8px',
          marginBottom: '8px',
        }}
      />
    );
  }

  return (
    <Image
      style={{
        maxWidth: '100%',
        maxHeight: '600px',
      }}
      src={src}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      preview={{ zIndex: 1100 }}
    />
  );
};

export default MediaRender;
