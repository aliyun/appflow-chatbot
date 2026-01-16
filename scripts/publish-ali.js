#!/usr/bin/env node

/**
 * 阿里内部 NPM 仓库发布脚本
 * 
 * 功能：
 * 1. 发布到阿里内部 NPM 仓库（跳过 prepublishOnly，因为构建已在 publish:ali 命令中完成）
 * 
 * 使用方式：
 * npm run publish:ali
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.resolve(rootDir, 'package.json');

async function main() {
  console.log('🚀 开始发布到阿里内部 NPM 仓库...\n');

  // 读取 package.json 获取包信息
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  console.log(`📦 包名: ${packageJson.name}`);
  console.log(`📦 版本号: ${packageJson.version}`);
  console.log(`📦 仓库: ${packageJson.publishConfig?.registry || 'https://registry.anpm.alibaba-inc.com'}\n`);

  try {
    // 发布到阿里内部 NPM 仓库（使用 --ignore-scripts 跳过 prepublishOnly）
    console.log('📤 正在发布到阿里内部 NPM 仓库...\n');
    execSync('tnpm publish --ignore-scripts', {
      stdio: 'inherit',
      cwd: rootDir,
    });

    console.log('\n✅ 发布成功！');
    console.log(`\n📦 包已发布: ${packageJson.name}@${packageJson.version}`);
    console.log(`\n安装命令: tnpm install ${packageJson.name}`);

  } catch (error) {
    console.error('\n❌ 发布失败:', error.message);
    process.exitCode = 1;
  }
}

main();
