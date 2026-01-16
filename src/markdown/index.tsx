import React, { useMemo } from 'react';
import ReactMarkdown, { Options } from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { Image } from 'antd';
import { ASyntaxHighLight } from './components/SyntaxHighlight';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import { StyledContentRender } from './styled';
import FileDisplay from './components/FileDisplay';
import Chart from './components/Chart';
import { convertTableDataToMarkdown } from './utils/dataProcessor';
import Loading from './components/Loading';
import Error from './components/Error';

export interface MarkdownViewProps {
  /** Markdown 内容 */
  content: any;
  /** 状态 */
  status?: string;
  /** 完整数据 */
  fullData?: any;
  /** 事件类型 */
  eventType?: string;
  /** 等待消息提示 */
  waitingMessage?: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({
  content,
  waitingMessage = '',
}) => {

  // markdown扩展配置
  const markdownOptions: Options = useMemo(() => ({
    remarkPlugins: [remarkMath, remarkGfm, remarkBreaks],
    rehypePlugins: [rehypeKatex, rehypeRaw],
    components: {
      // 自定义组件渲染
      img: ({ node, ...props }: any) => {
        return (
          <Image
            style={{
              maxWidth: '200px',
              maxHeight: '150px',
              objectFit: 'contain',
            }}
            src={props.src} 
            alt={props.alt} 
          />
        );
      },
      code: ({ node, className, ...props }: any) => {
        // 元信息中解析语言类型
        const languageType = /language-(\w+)/.exec(node?.properties?.className || '')?.[0];
        const langFromMeta = node?.position?.start?.line === 2 ? 'language-file' : null;
        const finalLang = languageType || langFromMeta;

        // 文件信息块特殊处理
        if (finalLang === 'language-file') {
          // 解析原始文本内容
          const content = String(props.children).replace(/\n$/, '');
          const fileInfo = parseFileInfo(content);
          return <FileDisplay fileInfo={fileInfo} />;
        }

        // ant_table信息块特殊处理
        if (finalLang === 'language-ant_table') {
          try {
            // 解析原始文本内容
            const content = String(props?.children).replace(/\n$/, '');
            const tableData = JSON.parse(content);
            const markdownTable = convertTableDataToMarkdown(tableData);
            return <MarkdownView content={markdownTable} />;
          } catch (error) {
            // 检查是否是流式输出导致的解析错误
            if (!isValidJSON(String(props?.children))) {
              return (
                <Loading text={'表格加载中...'} />
              );
            }
            // 真实错误的处理
            console.error("ant_table数据解析错误:", error);
            return <Error text={'表格数据加载失败，请检查数据格式'} />;
          }
        }

        // echarts图表信息块特殊处理
        if (finalLang === 'language-echarts') {
          try {
            // 确保children是字符串
            const codeContent = Array.isArray(props.children) ? props.children.join('') : props.children.toString();

            // 检查是否是完整的JSON字符串
            if (!isValidJSON(codeContent)) {
              return <Loading />;
            }

            const chartContent = JSON.parse(codeContent);

            // 检查图表配置是否完整
            let chartOptions;
            try {
              if (typeof chartContent?.option === 'string') {
                chartOptions = JSON.parse(chartContent?.option);
              } else {
                chartOptions = chartContent?.option;
              }

              // 检查图表配置是否有必要的属性
              if (!chartOptions || Object.keys(chartOptions).length === 0) {
                return <Loading />;
              }

              return (
                <div style={{ minWidth: '300px' }}>
                  <Chart options={chartOptions} />
                </div>
              );
            } catch (configError) {
              // 图表配置解析错误
              console.error("图表配置解析错误:", configError);
              return <Error text={'图表数据加载失败，请检查数据格式'} />;
            }
          } catch (error: any) {
            // 如果是流式输出导致的json解析错误，显示加载状态
            if (!isValidJSON(String(props.children))) {
              return <Loading />;
            }

            // 其他真实错误的处理
            console.error("图表数据解析错误:", error);
            return <Error text={'图表数据加载失败，请检查数据格式'} />;
          }
        }

        return <ASyntaxHighLight>{props.children}</ASyntaxHighLight>;
      },
      p: (paragraph: any) => {
        const { node }: any = paragraph || {};
        if (node?.children[0]?.tagName === 'img') {
          const image = node.children[0];
          const isSlice = (Array.isArray(paragraph?.children) || typeof paragraph?.children?.slice === 'function');

          return (
            <>
              <Image
                style={{
                  maxWidth: '200px',
                  maxHeight: '150px',
                  objectFit: 'contain',
                }}
                src={image.properties.src}
                className="max-w-full h-auto align-middle border-none rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out mt-2 mb-2"
                alt={image.properties.alt}
              />
              {isSlice && <p>
                {paragraph?.children?.slice(1)}
              </p>}
            </>
          );
        }
        return (
          <p>
            {paragraph?.children}
          </p>
        );
      },
      a: ({ children, href }) => (
        <a href={href} target="_blank">
          {children}
        </a>
      ),
    },
  }), []);

  // 检查是否是完整的JSON字符串
  const isValidJSON = (str: string) => {
    try {
      const firstChar = str?.trim()[0];
      const lastChar = str?.trim()[str?.trim().length - 1];
      return (firstChar === '{' && lastChar === '}') || (firstChar === '[' && lastChar === ']');
    } catch {
      return false;
    }
  };

  // 将think标签转换为details标签
  const convertThinkToDetails = (content: string) => {
    return content?.replace(
      /<think>([\s\S]*?)<\/think>/g,
      '<details open><summary>深度思考</summary><pre class="think">$1</pre></details>'
    );
  };

  // 将数学公式转换为markdown
  const coverMath2Markdown = (v: string) => {
    if (!v) {
      return `<span><span class="prompt-message">${waitingMessage}</span><span class="prompt-loading-cursor">...</span></span>`;
    }
    
    const mathContent = `${v?.replace(/\\\[.*?\\\]/gims, (str) => {
      const line = str.split(/[\r\n]/g);

      if (line[0].trim() === '\\[') {
        return '$$' + str.slice(2, -2) + '$$';
      } else {
        return '$' + str.slice(2, -2) + '$';
      }
    })
    .replace(/\\\(.*?\\\)/gims, (str) => {
      return '$' + str.slice(2, -2) + '$';
    })}`

    return convertThinkToDetails(mathContent);
  }

  // 解析文件信息
  const parseFileInfo = (content: string) => {
    const lines = content.split('\n');
    const fileInfo = {
      name: '',
      size: '',
      type: 'unknown'
    };

    lines.forEach(line => {
      const [key, value] = line.split(':').map(part => part.trim());

      if (key && value) {
        if (key.toLowerCase() === '名称') fileInfo.name = value;
        if (key.toLowerCase() === '大小') fileInfo.size = value;
        if (key.toLowerCase() === '类型') fileInfo.type = value;
      }
    });

    return fileInfo;
  };
  
  return (
    <StyledContentRender>
      <ReactMarkdown {...markdownOptions}>
        {`${coverMath2Markdown(content)}`}
      </ReactMarkdown>
    </StyledContentRender>
  );
};

export default MarkdownView;
