import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFilePdf,
  faFileImage,
  faFileExcel,
  faFilePowerpoint,
  faFileWord,
  faFileArchive,
  faFileCode,
  faFileVideo,
  faFileAudio,
  faFile,
  faFileLines
} from '@fortawesome/free-solid-svg-icons';

// Styled Components
const FileDisplayContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  padding: 8px 12px;

  @media (max-width: 500px) {
    flex-direction: column;
    text-align: center;
  }
`;

const FileIconWrapper = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  min-width: 48px;
  color: ${props => props.$color};
  background-color: #e8f4fc;
  border-radius: 8px;
  margin-right: 12px;

  @media (max-width: 500px) {
    margin-right: 0;
    margin-bottom: 10px;
  }
`;

const FileInfo = styled.div`
  flex: 1;
`;

const FileName = styled.div`
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 4px;
  color: #2d3436;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FileDetails = styled.div`
  display: flex;
  font-size: 14px;
  color: #636e72;

  @media (max-width: 500px) {
    justify-content: center;
  }
`;

const FileSize = styled.span`
  margin-right: 12px;
`;

const FileType = styled.span`
  background-color: rgba(0, 0, 0, 0.08);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

interface Iprops {
  fileInfo: any;
}

export const FileDisplay: React.FC<Iprops> = ({
  fileInfo
}) => {
  const { name, size, type = 'doc' } = fileInfo;

  const getFileIcon = () => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return faFilePdf;
      case 'image':
      case 'img':
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return faFileImage;
      case 'excel':
      case 'xlsx':
      case 'xls':
      case 'csv':
        return faFileExcel;
      case 'powerpoint':
      case 'ppt':
      case 'pptx':
        return faFilePowerpoint;
      case 'word':
      case 'doc':
      case 'docx':
        return faFileWord;
      case 'archive':
      case 'zip':
      case 'rar':
      case 'tar':
      case '7z':
        return faFileArchive;
      case 'code':
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
      case 'html':
      case 'css':
      case 'json':
      case 'py':
      case 'java':
      case 'cpp':
        return faFileCode;
      case 'video':
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'webm':
        return faFileVideo;
      case 'audio':
      case 'mp3':
      case 'wav':
      case 'ogg':
        return faFileAudio;
      case 'md':
      case 'markdown':
      case 'txt':
      case 'text':
        return faFileLines;
      default:
        return faFile;
    }
  };

  const getFileTypeColor = () => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return '#e74c3c'; // 红色
      case 'image':
      case 'img':
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '#3498db'; // 蓝色
      case 'excel':
      case 'xlsx':
      case 'xls':
      case 'csv':
        return '#27ae60'; // 绿色
      case 'powerpoint':
      case 'ppt':
      case 'pptx':
        return '#e67e22'; // 橙色
      case 'word':
      case 'doc':
      case 'docx':
        return '#2980b9'; // 深蓝色
      case 'archive':
      case 'zip':
      case 'rar':
      case 'tar':
      case '7z':
        return '#8e44ad'; // 紫色
      case 'code':
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
      case 'html':
      case 'css':
      case 'json':
      case 'py':
      case 'java':
      case 'cpp':
        return '#f1c40f'; // 黄色
      case 'video':
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'webm':
        return '#e84393'; // 粉色
      case 'audio':
      case 'mp3':
      case 'wav':
      case 'ogg':
        return '#00cec9'; // 青色
      case 'md':
      case 'markdown':
      case 'txt':
      case 'text':
        return '#636e72'; // 深灰色
      default:
        return '#7f8c8d'; // 灰色
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes/1024).toFixed(1) + ' KB';
    return (bytes/1048576).toFixed(1) + ' MB';
  };

  return (
    <FileDisplayContainer>
      <FileIconWrapper $color={getFileTypeColor()}>
        <FontAwesomeIcon icon={getFileIcon()} style={{ fontSize: '24px' }} />
      </FileIconWrapper>
      <FileInfo>
        <FileName>{name}</FileName>
        <FileDetails>
          <FileSize>{formatSize(size)}</FileSize>
          <FileType>{type.toUpperCase()}</FileType>
        </FileDetails>
      </FileInfo>
    </FileDisplayContainer>
  );
};

export default FileDisplay;
