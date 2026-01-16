export type ParamType = 'string' | 'number' | 'boolean' | 'array' | 'object';

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
}

/**
 * CustomParamsRenderer 组件的 Props
 */
export interface CustomParamsRendererProps {
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
export interface FieldRendererProps {
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
}

/**
 * 数组字段的 Props
 */
export interface ArrayFieldProps {
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
export interface ObjectFieldProps {
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
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};
