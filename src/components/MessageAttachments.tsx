/**
 * MessageAttachments - 消息附件展示组件
 * 用于在消息气泡中展示上传的图片和文件
 */

import React from 'react';
import styled from 'styled-components';
import { Image } from 'antd';
import {
  FileWordOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  FileOutlined,
} from '@ant-design/icons';

// ==================== 类型定义 ====================

export interface MessageAttachmentsProps {
  /** 消息角色，影响卡片配色 */
  role?: 'user' | 'bot';
  /** 图片URL列表 */
  images?: string[];
  /** 文件列表 */
  files?: { name: string; url: string }[];
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
}) => {
  const hasImages = images && images.length > 0;
  const hasFiles = files && files.length > 0;

  if (!hasImages && !hasFiles) return null;

  return (
    <AttachmentsArea>
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
