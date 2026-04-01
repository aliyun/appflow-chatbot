import React, { useCallback, useMemo } from 'react';
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

// ==================== 动态导入时间库 ====================

// 根据 antd 版本动态选择时间库
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let dayjs: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let moment: any = null;

if (isAntd5OrAbove) {
  // antd 5.x 使用 dayjs
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    dayjs = require('dayjs');
  } catch {
    console.warn('dayjs not found, TimeField may not work correctly with antd 5.x');
  }
} else {
  // antd 4.x 使用 moment
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    moment = require('moment');
  } catch {
    console.warn('moment not found, TimeField may not work correctly with antd 4.x');
  }
}

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

/**
 * 将字符串值转换为时间对象（根据 antd 版本使用 dayjs 或 moment）
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseValue = (value: string | null | undefined, format: string): any => {
  if (!value) return null;
  
  if (isAntd5OrAbove && dayjs) {
    return dayjs(value, format);
  } else if (moment) {
    return moment(value, format);
  }
  
  return null;
};

/**
 * 将时间对象格式化为字符串
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatValue = (date: any, format: string): string | null => {
  if (!date) return null;
  
  // dayjs 和 moment 都有 format 方法
  if (typeof date.format === 'function') {
    return date.format(format);
  }
  
  return null;
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

  // 处理值变化
  const handleChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (date: any) => {
      const formattedValue = formatValue(date, format);
      onChange?.(formattedValue);
    },
    [onChange, format]
  );

  // 将字符串值转换为时间对象
  const dateValue = parseValue(value, format);

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