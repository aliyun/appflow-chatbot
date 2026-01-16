/**
 * Vite NPM 包构建配置
 * 用于构建发布到 npm 仓库的包
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    react(),
    // 生成类型声明文件
    dts({
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      outDir: 'dist/types',
      entryRoot: 'src',
      rollupTypes: true,
      insertTypesEntry: true,
      tsconfigPath: './tsconfig.json',
    }),
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  build: {
    minify: true,
    target: 'es2015',
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'AppflowChat',
      formats: ['es', 'cjs'],
      fileName: (format) => `appflow-chat.${format === 'es' ? 'esm' : 'cjs'}.js`
    },
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      // 将 React 和其他大型依赖设为外部依赖
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'antd',
        /^antd\//,
        '@ant-design/icons',
        /^@ant-design\/icons\//,
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          antd: 'antd',
          '@ant-design/icons': 'icons',
          'styled-components': 'styled',
          'katex': 'katex',
          'rehype-katex': 'rehypeKatex',
        },
        preserveModules: false,
        exports: 'named',
      }
    },
    sourcemap: false,
    copyPublicDir: false,
  }
})
