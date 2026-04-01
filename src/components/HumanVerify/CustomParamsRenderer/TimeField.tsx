import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { DatePicker, version } from 'antd';
import { TimeFieldProps, TimeSubType } from './types';
import styled from 'styled-components';

// ==================== Styled Components ====================

// 时间选择器容器
const TimeFieldContainer = styled.div`
  width: 100%;

  .ant-picker {
    width: 100%;
  }
`;

// ==================== 版本检测 ====================

/**
 * 检测 antd 版本是否为 5.x 或更高
 * antd 5.x 使用 dayjs，antd 4.x 使用 moment
 */
const getAntdMajorVersion = (): number => {
  try {
    return parseInt(version.split('.')[0], 10);
  } catch {
    return 5; // 默认假设为 5.x
  }
};

const isAntd5OrAbove = getAntdMajorVersion() >= 5;

// ==================== 工具函数 ====================

/**
 * 根据时间子类型获取日期格式
 */
const getDateFormat = (subType?: TimeSubType): string => {
  switch (subType) {
    case 'year-month':
      return 'YYYY-MM';
    case 'year-month-day':
      return 'YYYY-MM-DD';
    case 'datetime':
      return 'YYYY-MM-DD HH:mm:ss';
    default:
      return 'YYYY-MM-DD';
  }
};

/**
 * 根据时间子类型获取 picker 类型
 */
const getPickerType = (subType?: TimeSubType): 'date' | 'month' | undefined => {
  switch (subType) {
    case 'year-month':
      return 'month';
    case 'year-month-day':
    case 'datetime':
    default:
      return 'date';
  }
};

// ==================== 时间库加载器 ====================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TimeLibrary = any;

/**
 * 异步加载时间库
 * antd 5.x 使用 dayjs，antd 4.x 使用 moment
 */
const loadTimeLibrary = async (): Promise<TimeLibrary | null> => {
  if (isAntd5OrAbove) {
    try {
      const dayjs = await import('dayjs');
      return dayjs.default || dayjs;
    } catch {
      console.warn('dayjs not found, TimeField may not work correctly with antd 5.x');
      return null;
    }
  } else {
    try {
      const moment = await import('moment');
      return moment.default || moment;
    } catch {
      console.warn('moment not found, TimeField may not work correctly with antd 4.x');
      return null;
    }
  }
};

/**
 * 时间字段组件
 * 根据 SubType 渲染不同的时间选择器
 * 优先从 AssociationPropertyMetadata.SubType 读取，兼容旧的 TimeSubType 字段
 * 
 * 兼容性说明：
 * - antd 5.x: 使用 dayjs
 * - antd 4.x: 使用 moment
 */
export const TimeField: React.FC<TimeFieldProps> = ({
  schema,
  value,
  onChange,
  disabled = false,
}) => {
  // 时间库状态
  const [timeLib, setTimeLib] = useState<TimeLibrary | null>(null);

  // 异步加载时间库
  useEffect(() => {
    loadTimeLibrary().then(lib => {
      setTimeLib(lib);
    });
  }, []);

  // 优先从 AssociationPropertyMetadata.SubType 读取，取数组第一个元素
  // 兼容旧的 TimeSubType 字段
  const subType = useMemo((): TimeSubType | undefined => {
    const subTypeArray = schema.AssociationPropertyMetadata?.SubType;
    if (Array.isArray(subTypeArray) && subTypeArray.length > 0) {
      return subTypeArray[0] as TimeSubType;
    }
    return schema.TimeSubType;
  }, [schema]);
  
  const format = getDateFormat(subType);
  const picker = getPickerType(subType);
  const showTime = subType === 'datetime';

  // 将字符串值转换为时间对象
  const dateValue = useMemo(() => {
    if (!value || !timeLib) return null;
    
    try {
      const parsed = timeLib(value, format);
      // 检查解析是否有效
      if (parsed && typeof parsed.isValid === 'function' && !parsed.isValid()) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }, [value, format, timeLib]);

  // 处理值变化
  // antd DatePicker onChange 签名: (date: Moment | Dayjs | null, dateString: string) => void
  const handleChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_date: any, dateString: string | string[]) => {
      // 直接使用 antd 提供的 dateString，这是已经格式化好的字符串
      // 这样可以避免手动调用 format 方法，更加可靠
      const stringValue = Array.isArray(dateString) ? dateString[0] : dateString;
      onChange?.(stringValue || null);
    },
    [onChange]
  );

  return (
    <TimeFieldContainer>
      <DatePicker
        value={dateValue}
        onChange={handleChange}
        format={format}
        picker={picker}
        showTime={showTime ? { format: 'HH:mm:ss' } : false}
        disabled={disabled}
        style={{ width: '100%' }}
        placeholder={`请选择`}
      />
    </TimeFieldContainer>
  );
};

export default TimeField;