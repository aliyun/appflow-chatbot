#!/usr/bin/env node

/**
 * NPM 官方仓库发布脚本
 * 
 * 功能：
 * 1. 临时修改 package.json 中的包名为 'appflow-chat'
 * 2. 发布到 NPM 官方仓库（跳过 prepublishOnly）
 * 3. 恢复原始的 package.json
 * 
 * 使用方式：
 * npm run publish:npm
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.resolve(rootDir, 'package.json');

// NPM 官方仓库的包名
const NPM_PACKAGE_NAME = 'ali-appflow-chat';

async function main() {
  console.log('🚀 开始发布到 NPM 官方仓库...\n');

  // 1. 读取原始 package.json
  const originalPackageContent = fs.readFileSync(packageJsonPath, 'utf-8');
  const packageJson = JSON.parse(originalPackageContent);
  const originalName = packageJson.name;

  console.log(`📦 原始包名: ${originalName}`);
  console.log(`📦 NPM 包名: ${NPM_PACKAGE_NAME}`);
  console.log(`📦 版本号: ${packageJson.version}\n`);

  try {
    // 2. 修改包名和发布配置
    packageJson.name = NPM_PACKAGE_NAME;
    // 移除阿里内部仓库配置
    delete packageJson.publishConfig;
    // 移除 prepublishOnly，避免重复构建
    delete packageJson.scripts.prepublishOnly;

    // 写入修改后的 package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log('✅ 已临时修改 package.json\n');

    // 3. 发布到 NPM 官方仓库（使用 --ignore-scripts 跳过脚本，指定官方 registry）
    console.log('📤 正在发布到 NPM 官方仓库...\n');
    execSync('npm publish --access public --ignore-scripts --registry https://registry.npmjs.org', {
      stdio: 'inherit',
      cwd: rootDir,
    });

    console.log('\n✅ 发布成功！');
    console.log(`\n📦 包已发布: https://www.npmjs.com/package/${NPM_PACKAGE_NAME}`);
    console.log(`\n安装命令: npm install ${NPM_PACKAGE_NAME}`);

  } catch (error) {
    console.error('\n❌ 发布失败:', error.message);
    process.exitCode = 1;
  } finally {
    // 4. 恢复原始 package.json
    fs.writeFileSync(packageJsonPath, originalPackageContent);
    console.log('\n🔄 已恢复原始 package.json');
  }
}

main();
