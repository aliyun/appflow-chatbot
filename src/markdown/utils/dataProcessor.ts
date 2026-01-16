// 将表格数据转换为Markdown表格格式
export const convertTableDataToMarkdown = (tableData: any): string => {
  try {
    const { column, data } = tableData;

    if (!Array.isArray(column) || !Array.isArray(data)) {
      return '表格数据格式错误';
    }

    if (column.length === 0 || data.length === 0) {
      return '暂无数据';
    }

    // 构建Markdown表格，添加序号列
    let markdown = '';

    // 表头 - 添加序号列
    markdown += '| 序号 | ' + column.join(' | ') + ' |\n';

    // 分隔线 - 序号列居中对齐，其他列默认左对齐
    markdown += '| :---: | ' + column.map(() => '---').join(' | ') + ' |\n';

    // 数据行 - 添加序号
    data.forEach((row, index) => {
      const rowData = column.map(col => {
        const value = row[col];
        return value !== undefined ? String(value) : '-';
      });
      // 序号从1开始
      markdown += '| ' + (index + 1) + ' | ' + rowData.join(' | ') + ' |\n';
    });

    return markdown;
  } catch (error) {
    console.error('转换表格数据失败:', error);
    return '表格数据转换失败';
  }
};

// 检查内容是否为表格数据
const isTableData = (content: string): boolean => {
  try {
    const parsed = JSON.parse(content);
    return parsed && typeof parsed === 'object' &&
      Array.isArray(parsed.column) &&
      Array.isArray(parsed.data);
  } catch {
    return false;
  }
};

// 处理步骤内容
export const processStepContent = (content: any, stepType?: string): string | null => {
  if (!content) return null;

  // 如果是表格类型，转换为Markdown表格格式
  if (stepType === 'ant_table' && isTableData(content)) {
    try {
      const tableData = JSON.parse(content);
      const markdownTable = convertTableDataToMarkdown(tableData);
      return markdownTable;
    } catch (error) {
      console.error('解析表格数据失败:', error);
      return '```json\n' + content + '\n```';
    }
  }

  // 如果是echart类型，包装为echarts代码块
  if (stepType === 'echart') {
    return '```echarts\n' + content + '\n```';
  }

  // 如果是code类型，包装为sql代码块
  if (stepType === 'code') {
    return '```sql\n' + content + '\n```';
  }

  // 如果是JSON格式，格式化显示
  try {
    JSON.parse(content);
    const parsed = JSON.parse(content);
    return '```json\n' + JSON.stringify(parsed, null, 2) + '\n```';
  } catch {
    // 不是JSON，继续其他处理
    console.log('不是JSON');
  }

  return content;
};