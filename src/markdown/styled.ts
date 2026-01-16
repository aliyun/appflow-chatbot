import styled from 'styled-components';

export const StyledContentRender = styled.div<{
    color?: string;
    bg_color?: string;
    second_color?: string;
    primary_color?: string;
    loading_color?: string;
}>`
    position: relative;
  
    > p {
        margin-bottom: 16px;
    }
  
    > p:last-child {
        margin-bottom: 0;
    }
  
    @keyframes dots {
        0%, 20% {
            color: ${({ loading_color }) => loading_color};
            text-shadow: ${({ loading_color }) => `.25em 0 0 ${loading_color}, .5em 0 0 ${loading_color}`};
        }
        40% {
            color: ${({ primary_color }) => primary_color};
            text-shadow:  ${({ loading_color }) => `.25em 0 0 ${loading_color}, .5em 0 0 ${loading_color}`};
        }
        60% {
            text-shadow: ${({ primary_color, loading_color }) => `.25em 0 0 ${primary_color}, .5em 0 0 ${loading_color}`};
        }
        80%, 100% {
            text-shadow: ${({ primary_color }) => `.25em 0 0 ${primary_color}, .5em 0 0 ${primary_color}`};
  
        }
    }
  
    @keyframes blink-dots {
        0%,
        80%,
        100% {
            box-shadow: 0 -1em 0 -1.3em #5584ff;
        }
        40% {
            box-shadow: 0 -1em 0 0 #5584ff;
        }
    }

    .prompt-message {
        font-size: 12px;
    }
  
    .prompt-loading {
        margin-left: 2px;
        color: ${({ second_color }) => second_color};
        position: relative;
  
        .dots {
            //text-align: center;
            //font-size: 1.5em;
            //letter-spacing: 2px;
            //animation: dots 1s steps(5, end) infinite;
  
            display: inline-block;
            position: relative;
            text-indent: -9999em;
            animation-delay: -0.16s;
            margin: 0 auto !important;
            transform: scale(0.5);
            top: 0.6em;
            left: 1.5em;
  
            &:before,
            &:after,
            & {
              border-radius: 50%;
              width: 1em;
              height: 1em;
              animation: 1.8s ease-in-out 0s infinite normal none running blink-dots;
            }
            &:before {
              left: -2em;
              animation-delay: -0.32s;
            }
            &:after {
              left: 2em;
            }
            &:before,
            &:after {
              content: '';
              position: absolute;
            }
        }
    }
  
    h1,h2,h3,h4,h5,h6 {
        padding: 10px;
        color: ${({ color }) => color};
        // background: ${({ bg_color }) => bg_color}; // TODO dark mode ?
    }
    
    h1 {
        font-size: 18px;
    }
     
    h2 {
        font-size: 16px;
    }

    h3,h4 {
        font-size: 14px;
    }

    ul,ol {
        padding-left: 2em;
        display: flex;
        flex-direction: column;
        gap: 8px;
        list-style-type: disc;   
    }

    ul ul,
    ol ul {
        list-style-type: circle;
    }
    
    ul ul ul,
    ul ol ul,
    ol ul ul,
    ol ol ul {
        list-style-type: square;
    }

    ol {
       list-style-type: decimal;
    }

    li {
        white-space: normal;
    }

    details {
        font-size: 12px;
        color: rgb(106 105 105);
        white-space: normal;  
    }
    
    details:has(pre:empty) {
        display: none;
    }

    summary {
        margin-left: -4px;
    }

    pre.think {
        font-size: 12px;
        color: #a6a6a6;
        border-left: 1px #a6a6a6 solid;
        display: inline-block;    
        white-space: pre-wrap;
        overflow-wrap: break-word;
        padding-left: 10px;
        margin-top: 8px;
    }

    pre.think > p {
        margin-top: 10px;
    }

    table {
        display: block;
        overflow-x: auto;
        width: max-content;
        max-width: 100%;
    }
        
    th, td {
        border: 1px solid #d9d9d9;
        padding: 12px;
        text-align: center;
        white-space: nowrap;
    }

    /* 用于 coverMath2Markdown 的加载动画 */
    @keyframes cursorImg {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0;
        }
    }

    .prompt-loading-cursor {
        color: #5584ff;
        animation: cursorImg 1s infinite steps(1, start);
    }

    /* KaTeX 数学公式样式 */
    .katex {
        font: inherit;
        text-rendering: auto;
    }

    .katex-display {
        display: block;
        margin: 1em 0;
        text-align: center;
    }

    /* 数学符号和布局样式 */
    .katex .mord,
    .katex .mbin,
    .katex .mrel,
    .katex .mopen,
    .katex .mclose,
    .katex .mpunct,
    .katex .minner {
        font-family: inherit;
    }

    /* 数学布局样式 */
    .katex .vlist-t,
    .katex .vlist-r,
    .katex .vlist {
        display: inline-block;
    }

    .katex .mfrac {
        display: inline-block;
        vertical-align: middle;
    }
  `;
