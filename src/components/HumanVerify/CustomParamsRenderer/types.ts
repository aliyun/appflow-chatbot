// ============ 上传相关类型定义 ============

/**
 * 上传请求参数
 */
export interface UploadRequestParams {
  /** 事件类型：uploadToken-获取上传凭证，uploadFile-获取文件ID */
  eventType: 'uploadToken' | 'uploadFile';
  /** 文件名 */
  fileName: string;
  /** 文件下载 URL（uploadFile 时需要） */
  content?: string;
}

/**
 * 上传 Token 响应
 */
export interface UploadTokenResponse {
  /** 预签名上传 URL */
  uploadUrl: string;
  /** 文件下载 URL */
  downloadUrl: string;
}

/**
 * 上传文件响应
 */
export interface UploadFileResponse {
  /** 文件 ID */
  fileId: string;
}

/**
 * 上传发送方法类型
 * 用于发送上传相关的事件请求
 */
export type UploadSender = (params: UploadRequestParams) => Promise<string | null>;

/**
 * 文件上传方法类型
 * 用于实际执行文件上传到 OSS
 */
export type FileUploader = (file: Blob, uploadUrl: string) => Promise<void>;

/**
 * 上传配置
 */
export interface UploadConfig {
  /** 上传发送方法 */
  uploadSender?: UploadSender;
  /** 文件上传方法 */
  fileUploader?: FileUploader;
}

// ============ 基础类型定义 ============

// 基础类型
export type BasicParamType = 'string' | 'number' | 'boolean';

// 复合类型
export type ComplexParamType = 'array' | 'object';

// 扩展类型
export type ExtendedParamType = 'time' | 'file';

// 所有参数类型
export type ParamType = BasicParamType | ComplexParamType | ExtendedParamType;

// 时间子类型
export type TimeSubType = 'year-month' | 'year-month-day' | 'datetime';

// 文件子类型
export type FileSubType =
  | 'default'
  | 'jpg'
  | 'png'
  | 'svg'
  | 'doc'
  | 'ppt'
  | 'excel'
  | 'txt'
  | 'markdown'
  | 'zip';

// 枚举展示样式
export type EnumDisplayStyle = 'select' | 'checkbox' | 'radio' | 'multi-select';

/**
 * AssociationPropertyMetadata 类型定义
 * 包含枚举、时间、文件等扩展属性的元数据
 */
export interface AssociationPropertyMetadata {
  /** 子类型（用于 time 和 file 类型），现在是数组 */
  SubType?: (TimeSubType | FileSubType)[];
  /** 枚举值 */
  EnumValues?: (string | number | boolean)[];
  /** 枚举展示样式 */
  EnumDisplayStyle?: EnumDisplayStyle;
}

/**
 * CustomParam 的 Schema 定义
 */
export interface CustomParamSchema {
  Type: ParamType;
  Title?: string;
  Description?: string;
  Required?: string[];
  Properties?: Record<string, CustomParamSchema>;
  Items?: CustomParamSchema;
  // 排序字段（支持小写）
  order?: number;
  // 排序字段（支持大写，兼容实际数据格式）
  Order?: string | number;
  // 关联属性元数据（包含 SubType、EnumValues、EnumDisplayStyle）
  AssociationPropertyMetadata?: AssociationPropertyMetadata;
  AssociationProperty?: string;

  // ============ 以下字段已废弃，保留用于向后兼容 ============
  /** @deprecated 使用 AssociationPropertyMetadata.SubType 代替 */
  TimeSubType?: TimeSubType;
  /** @deprecated 使用 AssociationPropertyMetadata.SubType 代替 */
  FileSubType?: FileSubType;
  /** @deprecated 使用 AssociationPropertyMetadata.EnumValues 代替 */
  EnumValues?: string[];
  /** @deprecated 使用 AssociationPropertyMetadata.EnumDisplayStyle 代替 */
  EnumDisplayStyle?: EnumDisplayStyle;
}

/**
 * CustomParamsRenderer 组件的 Props
 */
export interface CustomParamsRendererProps extends UploadConfig {
  /** CustomParams 的 schema */
  schema: CustomParamSchema;
  /** 表单值 */
  value?: Record<string, any>;
  /** 值变化回调 */
  onChange?: (value: Record<string, any>) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 字段名前缀（用于嵌套场景） */
  namePrefix?: string;
  /** 验证错误信息 */
  errors?: Record<string, string>;
}

/**
 * 单个字段渲染器的 Props
 */
export interface FieldRendererProps extends UploadConfig {
  /** 字段名 */
  name: string;
  /** 字段 Schema */
  schema: CustomParamSchema;
  /** 字段值 */
  value?: any;
  /** 值变化回调 */
  onChange?: (value: any) => void;
  /** 是否必填 */
  required?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 嵌套层级 */
  level?: number;
  /** 验证错误信息 */
  errors?: Record<string, string>;
  /** 字段路径（用于匹配错误信息） */
  fieldPath?: string;
  /** 是否隐藏标签（用于数组项渲染时隐藏 Items 标题） */
  hideLabel?: boolean;
}

/**
 * 数组字段的 Props
 */
export interface ArrayFieldProps extends UploadConfig {
  /** 字段名 */
  name: string;
  /** 字段 Schema */
  schema: CustomParamSchema;
  /** 字段值 */
  value?: any[];
  /** 值变化回调 */
  onChange?: (value: any[]) => void;
  /** 是否必填 */
  required?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 嵌套层级 */
  level?: number;
  /** 验证错误信息 */
  errors?: Record<string, string>;
  /** 字段路径（用于匹配错误信息） */
  fieldPath?: string;
}

/**
 * 对象字段的 Props
 */
export interface ObjectFieldProps extends UploadConfig {
  /** 字段名 */
  name: string;
  /** 字段 Schema */
  schema: CustomParamSchema;
  /** 字段值 */
  value?: Record<string, any>;
  /** 值变化回调 */
  onChange?: (value: Record<string, any>) => void;
  /** 是否必填 */
  required?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 嵌套层级 */
  level?: number;
  /** 验证错误信息 */
  errors?: Record<string, string>;
  /** 字段路径（用于匹配错误信息） */
  fieldPath?: string;
}

/**
 * 时间字段的 Props
 */
export interface TimeFieldProps {
  /** 字段名 */
  name: string;
  /** 字段 Schema */
  schema: CustomParamSchema;
  /** 字段值 */
  value?: string;
  /** 值变化回调 */
  onChange?: (value: string | null) => void;
  /** 是否必填 */
  required?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 文件字段的 Props
 */
export interface FileFieldProps extends UploadConfig {
  /** 字段名 */
  name: string;
  /** 字段 Schema */
  schema: CustomParamSchema;
  /** 字段值 */
  value?: any;
  /** 值变化回调 */
  onChange?: (value: any) => void;
  /** 是否必填 */
  required?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 枚举字段的 Props
 */
export interface EnumFieldProps {
  /** 字段名 */
  name: string;
  /** 字段 Schema */
  schema: CustomParamSchema;
  /** 字段值 */
  value?: any;
  /** 值变化回调 */
  onChange?: (value: any) => void;
  /** 是否必填 */
  required?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 校验错误信息
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * 校验结果
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * 校验 CustomParams 的值
 * @param schema Schema 定义
 * @param value 表单值
 * @param prefix 字段名前缀
 * @returns 校验结果
 */
export const validateCustomParams = (
  schema: CustomParamSchema,
  value: Record<string, any>,
  prefix: string = ''
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!schema?.Properties) {
    return { valid: true, errors: [] };
  }

  const requiredFields = schema?.Required || [];

  Object.entries(schema?.Properties).forEach(([key, fieldSchema]) => {
    const fieldName = prefix ? `${prefix}.${key}` : key;
    const fieldValue = value?.[key];
    const isRequired = requiredFields.includes(key);

    // 检查必填字段
    if (isRequired) {
      if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
        errors.push({
          field: fieldName,
          message: `${fieldSchema?.Title || key} 是必填项`,
        });
      } else if (Array.isArray(fieldValue) && fieldValue.length === 0) {
        // 数组类型的必填检查
        errors.push({
          field: fieldName,
          message: `${fieldSchema?.Title || key} 是必填项`,
        });
      }
    }

    // 递归校验对象类型
    if (fieldSchema?.Type === 'object' && fieldSchema?.Properties && fieldValue) {
      const nestedResult = validateCustomParams(fieldSchema, fieldValue, fieldName);
      errors.push(...nestedResult.errors);
    }

    // 校验数组类型
    if (fieldSchema?.Type === 'array' && fieldSchema?.Items && Array.isArray(fieldValue)) {
      fieldValue.forEach((item, index) => {
        const itemPath = `${fieldName}[${index}]`;

        // 验证对象类型的数组项
        if (fieldSchema?.Items?.Type === 'object' && fieldSchema?.Items?.Properties) {
          const itemResult = validateCustomParams(
            fieldSchema.Items,
            item,
            itemPath
          );
          errors.push(...itemResult.errors);
        }
        // 验证基础类型的数组项 - 只有当数组字段是必填时才验证
        else if (isRequired) {
          if (fieldSchema?.Items?.Type === 'string') {
            if (item === undefined || item === null || item === '') {
              errors.push({
                field: itemPath,
                message: `此项 是必填项`,
              });
            }
          }
          else if (fieldSchema?.Items?.Type === 'number') {
            if (item === undefined || item === null) {
              errors.push({
                field: itemPath,
                message: `此项 是必填项`,
              });
            }
          }
        }
      });
    }

    // 校验时间类型
    if (fieldSchema?.Type === 'time' && isRequired) {
      if (!fieldValue) {
        errors.push({
          field: fieldName,
          message: `${fieldSchema?.Title || key} 是必填项`,
        });
      }
    }

    // 校验文件类型
    if (fieldSchema?.Type === 'file' && isRequired) {
      if (!fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0)) {
        errors.push({
          field: fieldName,
          message: `${fieldSchema?.Title || key} 是必填项`,
        });
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * 根据 Order 字段对属性进行排序
 * 完全兼容没有 Order 字段的历史数据
 * 
 * @param properties - 属性对象
 * @returns 排序后的属性数组 [key, schema][]
 */
export const sortPropertiesByOrder = (
  properties: Record<string, CustomParamSchema>
): [string, CustomParamSchema][] => {
  return Object.entries(properties).sort(([, schemaA], [, schemaB]) => {
    // 读取 Order 字段（支持大小写）
    const orderA = schemaA.Order ?? schemaA.order;
    const orderB = schemaB.Order ?? schemaB.order;

    // 转换为数字（字符串 "12" -> 12）
    const numA = orderA !== undefined ? Number(orderA) : Number.MAX_SAFE_INTEGER;
    const numB = orderB !== undefined ? Number(orderB) : Number.MAX_SAFE_INTEGER;

    // 如果两个都没有 Order，保持原有顺序（返回 0）
    // 这样可以确保历史数据（所有字段都没有 Order）不会被打乱
    if (numA === Number.MAX_SAFE_INTEGER && numB === Number.MAX_SAFE_INTEGER) {
      return 0;
    }

    return numA - numB;
  });
};