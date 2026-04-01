import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DatePicker, version } from 'antd';
import { TimeFieldProps, TimeSubType } from './types';
import styled from 'styled-components';

const TimeFieldContainer = styled.div`
  width: 100%;
  .ant-picker {
    width: 100%;
  }
`;

const getAntdMajorVersion = (): number => {
  try {
    return parseInt(version.split('.')[0], 10);
  } catch {
    return 5;
  }
};

const isAntd5OrAbove = getAntdMajorVersion() >= 5;

// 兼容 ESM 和 CJS 环境的时间库加载
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let timeLib: any = null;

// 同步尝试加载时间库（CJS 环境下可用）
const loadTimeLibSync = (): any => {
  if (timeLib) return timeLib;

  if (isAntd5OrAbove) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      timeLib = require('dayjs');
    } catch {
      // require 在 ESM 环境中可能失败，后续通过异步 import 兜底
    }
  } else {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      timeLib = require('moment');
    } catch {
      // require 在 ESM 环境中可能失败，后续通过异步 import 兜底
    }
  }
  return timeLib;
};

// 异步加载时间库（ESM 环境下的兜底方案）
const loadTimeLibAsync = async (): Promise<any> => {
  if (timeLib) return timeLib;

  try {
    if (isAntd5OrAbove) {
      const dayjs = await import('dayjs');
      timeLib = dayjs.default || dayjs;
    } else {
      const moment = await import('moment');
      timeLib = moment.default || moment;
    }
  } catch {
    console.warn('Failed to load time library (both sync and async)');
  }
  return timeLib;
};

// 先尝试同步加载
loadTimeLibSync();

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

const getPickerType = (subType?: TimeSubType): 'date' | 'month' | undefined => {
  switch (subType) {
    case 'year-month':
      return 'month';
    default:
      return 'date';
  }
};

export const TimeField: React.FC<TimeFieldProps> = ({
  schema,
  value,
  onChange,
  disabled = false,
}) => {
  // 使用 state 管理时间库引用，确保异步加载完成后能触发重新渲染
  const [lib, setLib] = useState<any>(() => timeLib);

  // 如果同步加载失败，通过异步 import 兜底加载
  useEffect(() => {
    if (lib) return;

    let cancelled = false;
    loadTimeLibAsync().then((loaded) => {
      if (!cancelled && loaded) {
        setLib(loaded);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [lib]);

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
    if (!value || !lib) return null;
    
    try {
      const parsed = lib(value, format);
      if (parsed && typeof parsed.isValid === 'function' && !parsed.isValid()) {
        // 如果严格解析失败，尝试宽松解析
        return lib(value);
      }
      return parsed;
    } catch {
      return null;
    }
  }, [value, format, lib]);

  const handleChange = useCallback(
    (_date: any, dateString: string | string[]) => {
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
        placeholder="请选择"
      />
    </TimeFieldContainer>
  );
};

export default TimeField;
