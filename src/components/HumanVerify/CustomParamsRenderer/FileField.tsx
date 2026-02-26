import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import type { UploadFile, UploadChangeParam } from 'antd/es/upload/interface';
import type { RcFile } from 'antd/es/upload';
import { 
  FileFieldProps, 
  FileSubType, 
  UploadTokenResponse, 
  UploadFileResponse 
} from './types';
import styled from 'styled-components';

// ==================== Styled Components ====================

// 文件上传容器
const FileFieldContainer = styled.div`
  width: 100%;

  .ant-upload-wrapper {
    width: 100%;
  }

  .ant-upload-list-item {
    margin-top: 8px;
  }

  .ant-upload-list-picture-card {
    .ant-upload-list-item-container {
      width: 104px;
      height: 104px;
    }
  }

  .ant-upload-select-picture-card {
    width: 104px;
    height: 104px;
    margin: 0;
    background-color: #fafafa;
    border: 1px dashed #d9d9d9;
    border-radius: 8px;
    cursor: pointer;
    transition: border-color 0.3s;

    &:hover {
      border-color: #1890ff;
    }
  }
`;

// 文件上传提示
const FileHint = styled.div`
  font-size: 12px;
  color: #8f959e;
  margin-top: 8px;
`;

// 图片类型列表
const IMAGE_TYPES: FileSubType[] = ['jpg', 'png', 'svg'];

/**
 * 根据单个文件子类型获取 accept 属性
 */
const getAcceptBySingleSubType = (subType: FileSubType): string => {
  switch (subType) {
    case 'jpg':
      return '.jpg,.jpeg,image/jpeg';
    case 'png':
      return '.png,image/png';
    case 'svg':
      return '.svg,image/svg+xml';
    case 'doc':
      return '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'ppt':
      return '.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'excel':
      return '.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'txt':
      return '.txt,text/plain';
    case 'markdown':
      return '.md,.markdown,text/markdown';
    case 'zip':
      return '.zip,.rar,.7z,.tar,.gz,.bz2,application/zip,application/x-rar-compressed,application/x-7z-compressed';
    case 'default':
    default:
      return '*';
  }
};

/**
 * 根据文件子类型数组获取合并的 accept 属性
 */
const getAcceptBySubTypes = (subTypes?: FileSubType[]): string => {
  if (!subTypes || subTypes.length === 0) {
    return '*';
  }
  
  // 如果包含 default，则接受所有类型
  if (subTypes.includes('default')) {
    return '*';
  }
  
  // 合并所有类型的 accept 值，去重
  const acceptSet = new Set<string>();
  subTypes.forEach(subType => {
    const accept = getAcceptBySingleSubType(subType);
    if (accept !== '*') {
      accept.split(',').forEach(item => acceptSet.add(item.trim()));
    }
  });
  
  return acceptSet.size > 0 ? Array.from(acceptSet).join(',') : '*';
};

/**
 * 根据文件子类型数组获取上传提示文本
 */
const getUploadHintBySubTypes = (subTypes?: FileSubType[]): string => {
  if (!subTypes || subTypes.length === 0) {
    return '支持所有文件格式';
  }
  
  if (subTypes.includes('default')) {
    return '支持所有文件格式';
  }
  
  const hintMap: Record<FileSubType, string> = {
    'jpg': 'JPG',
    'png': 'PNG',
    'svg': 'SVG',
    'doc': 'DOC/DOCX',
    'ppt': 'PPT/PPTX',
    'excel': 'XLS/XLSX',
    'txt': 'TXT',
    'markdown': 'Markdown',
    'zip': 'ZIP/RAR/7Z',
    'default': '所有格式',
  };
  
  const hints = subTypes.map(subType => hintMap[subType] || subType).filter(Boolean);
  return hints.length > 0 ? `支持 ${hints.join('、')} 格式` : '支持所有文件格式';
};

/**
 * 判断是否包含图片类型
 */
const hasImageType = (subTypes?: FileSubType[]): boolean => {
  if (!subTypes || subTypes.length === 0) {
    return false;
  }
  return subTypes.some(subType => IMAGE_TYPES.includes(subType));
};

/**
 * 文件字段组件
 * 根据 SubType 渲染不同的文件上传器
 * 优先从 AssociationPropertyMetadata.SubType 读取，兼容旧的 FileSubType 字段
 */
export const FileField: React.FC<FileFieldProps> = ({
  name,
  schema,
  value,
  onChange,
  required = false,
  disabled = false,
  uploadSender,
  fileUploader,
}) => {
  // 优先从 AssociationPropertyMetadata.SubType 读取，兼容旧的 FileSubType 字段
  const subTypes = useMemo((): FileSubType[] => {
    const subTypeArray = schema.AssociationPropertyMetadata?.SubType;
    if (Array.isArray(subTypeArray) && subTypeArray.length > 0) {
      return subTypeArray as FileSubType[];
    }
    // 兼容旧的 FileSubType 字段（单个值转为数组）
    if (schema.FileSubType) {
      return [schema.FileSubType];
    }
    return [];
  }, [schema]);
  
  const accept = getAcceptBySubTypes(subTypes);
  const hint = getUploadHintBySubTypes(subTypes);
  const isImage = hasImageType(subTypes);

  // 上传状态
  const [uploading, setUploading] = useState(false);

  // 将值转换为 UploadFile 数组
  const getFileList = (): UploadFile[] => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.map((file: any, index: number) => ({
        uid: file.uid || `${index}`,
        name: file.name || `文件${index + 1}`,
        status: 'done' as const,
        url: file.url,
        ...file,
      }));
    }
    if (typeof value === 'object') {
      return [{
        uid: value.uid || '0',
        name: value.name || '文件',
        status: 'done' as const,
        url: value.url,
        ...value,
      }];
    }
    return [];
  };

  const [fileList, setFileList] = useState<UploadFile[]>(getFileList());

  // 当外部 value 变化时，同步更新内部 fileList
  // 这对于数组项删除等场景非常重要，确保组件状态与外部数据保持同步
  useEffect(() => {
    const newFileList = getFileList();
    // 比较 URL 来判断是否需要更新，避免不必要的重渲染
    const currentUrls = fileList.map(f => f.url).sort().join(',');
    const newUrls = newFileList.map(f => f.url).sort().join(',');
    if (currentUrls !== newUrls) {
      setFileList(newFileList);
    }
  }, [value]);

  /**
   * 获取上传凭证
   */
  const getUploadToken = useCallback(async (fileName: string): Promise<UploadTokenResponse | null> => {
    if (!uploadSender) {
      message.error('上传功能未配置');
      return null;
    }

    try {
      const response = await uploadSender({
        eventType: 'uploadToken',
        fileName,
      });

      if (!response) {
        message.error('获取上传凭证失败');
        return null;
      }

      // 解析外层响应
      const parsedResponse = JSON.parse(response);
      
      // 解析 content 字段中的上传凭证
      if (parsedResponse.content) {
        return JSON.parse(parsedResponse.content) as UploadTokenResponse;
      }
      
      // 兼容直接返回 uploadUrl 和 downloadUrl 的情况
      if (parsedResponse.uploadUrl && parsedResponse.downloadUrl) {
        return parsedResponse as UploadTokenResponse;
      }
      
      message.error('获取上传凭证失败');
      return null;
    } catch (error) {
      console.error('获取上传凭证失败:', error);
      message.error('获取上传凭证失败');
      return null;
    }
  }, [uploadSender]);

  /**
   * 获取文件 ID（文件上传专用）
   */
  const getFileId = useCallback(async (fileName: string, downloadUrl: string): Promise<UploadFileResponse | null> => {
    if (!uploadSender) {
      return null;
    }

    try {
      const response = await uploadSender({
        eventType: 'uploadFile',
        fileName,
        content: downloadUrl,
      });

      if (!response) {
        return null;
      }

      // 解析外层响应
      const parsedResponse = JSON.parse(response);
      
      // 解析 content 字段中的文件信息
      if (parsedResponse.content) {
        return JSON.parse(parsedResponse.content) as UploadFileResponse;
      }
      
      // 兼容直接返回 fileId 的情况
      if (parsedResponse.fileId) {
        return parsedResponse as UploadFileResponse;
      }
      
      return null;
    } catch (error) {
      console.error('获取文件ID失败:', error);
      return null;
    }
  }, [uploadSender]);

  /**
   * 图片上传处理
   * 流程：获取预签名URL -> 上传到OSS -> 返回下载URL
   */
  const handleImageUpload = useCallback(async (file: RcFile): Promise<any> => {
    // 1. 获取预签名 URL
    const tokenResponse = await getUploadToken(file.name);
    if (!tokenResponse) {
      throw new Error('获取上传凭证失败');
    }

    // 2. 上传文件到 OSS
    if (!fileUploader) {
      throw new Error('文件上传方法未配置');
    }
    const blob = new Blob([file]);
    await fileUploader(blob, tokenResponse.uploadUrl);

    // 3. 返回文件信息
    return {
      uid: Date.now().toString(),
      name: file.name,
      url: tokenResponse.downloadUrl,
      type: file.type,
      size: file.size,
    };
  }, [getUploadToken, fileUploader]);

  /**
   * 文件上传处理
   * 流程：获取预签名URL -> 上传到OSS -> 获取fileId -> 返回完整信息
   */
  const handleFileUpload = useCallback(async (file: RcFile): Promise<any> => {
    // 1. 获取预签名 URL
    const tokenResponse = await getUploadToken(file.name);
    if (!tokenResponse) {
      throw new Error('获取上传凭证失败');
    }

    // 2. 上传文件到 OSS
    if (!fileUploader) {
      throw new Error('文件上传方法未配置');
    }
    const blob = new Blob([file]);
    await fileUploader(blob, tokenResponse.uploadUrl);

    // 3. 获取 fileId
    const fileResponse = await getFileId(file.name, tokenResponse.downloadUrl);

    // 4. 返回完整文件信息
    return {
      uid: Date.now().toString(),
      name: file.name,
      url: tokenResponse.downloadUrl,
      fileId: fileResponse?.fileId,
      type: file.type,
      size: file.size,
      fileType: file.name.split('.').pop(),
    };
  }, [getUploadToken, fileUploader, getFileId]);

  /**
   * 自定义上传逻辑
   */
  const customRequest = useCallback(
    async (options: any) => {
      const { file, onSuccess, onError } = options;
      
      // 检查上传配置
      if (!uploadSender || !fileUploader) {
        // 如果没有配置上传方法，使用本地预览（降级处理）
        try {
          const url = URL.createObjectURL(file as Blob);
          onSuccess?.({ url }, new XMLHttpRequest());
        } catch (error) {
          onError?.(error as Error);
          message.error('文件上传失败');
        }
        return;
      }

      setUploading(true);
      
      try {
        let result;
        if (isImage) {
          // 图片上传
          result = await handleImageUpload(file as RcFile);
        } else {
          // 文件上传（需要获取 fileId）
          result = await handleFileUpload(file as RcFile);
        }
        
        onSuccess?.(result, new XMLHttpRequest());
      } catch (error) {
        onError?.(error as Error);
        message.error('文件上传失败');
      } finally {
        setUploading(false);
      }
    },
    [uploadSender, fileUploader, isImage, handleImageUpload, handleFileUpload]
  );

  // 处理文件变化
  const handleChange = useCallback(
    (info: UploadChangeParam<UploadFile>) => {
      const { fileList: newFileList } = info;
      setFileList(newFileList);
      
      // 转换为简化的文件信息
      const files = newFileList
        .filter((file: UploadFile) => file.status === 'done')
        .map((file: UploadFile) => {
          const response = file.response as any;
          return {
            name: file.name,
            url: response?.url || file.url,
            // fileId: response?.fileId,
            // type: file.type || response?.type,
            // size: file.size || response?.size,
            // fileType: response?.fileType,
            // status: file.status,
          };
        });
      
      onChange?.(files.length === 1 ? files[0] : files.length > 0 ? files : undefined);
    },
    [onChange]
  );

  // 上传前的校验
  const beforeUpload = useCallback(
    (file: File) => {
      // 文件大小限制（默认 10MB）
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        message.error('文件大小不能超过 10MB');
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    []
  );

  // 上传按钮的加载指示器
  const uploadButton = (
    <div>
      {uploading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>{uploading ? '上传中' : '上传'}</div>
    </div>
  );

  // 图片类型使用卡片式上传
  if (isImage) {
    return (
      <FileFieldContainer>
        <Upload
          listType="picture-card"
          fileList={fileList}
          onChange={handleChange}
          customRequest={customRequest}
          beforeUpload={beforeUpload}
          accept={accept}
          disabled={disabled || uploading}
          maxCount={1}
          showUploadList={{
            showPreviewIcon: false,
            showRemoveIcon: true,
          }}
        >
          {fileList.length < 1 && uploadButton}
        </Upload>
        <FileHint>{hint}</FileHint>
      </FileFieldContainer>
    );
  }

  // 其他类型使用按钮式上传
  return (
    <FileFieldContainer>
      <Upload
        fileList={fileList}
        onChange={handleChange}
        customRequest={customRequest}
        beforeUpload={beforeUpload}
        accept={accept}
        disabled={disabled || uploading}
        maxCount={1}
      >
        <Button 
          icon={uploading ? <LoadingOutlined /> : <UploadOutlined />} 
          disabled={disabled || uploading}
          loading={uploading}
        >
          {uploading ? '上传中' : '选择文件'}
        </Button>
      </Upload>
      <FileHint>{hint}</FileHint>
    </FileFieldContainer>
  );
};

export default FileField;