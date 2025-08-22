# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 🛠️ 开发命令

### 基础命令
- `npm run dev` - 启动开发服务器（热重载，端口 3000）
- `npm run build` - 构建生产版本扩展（输出到 `dist/`）
- `npm run test` - 监视模式运行测试
- `npm run test:run` - 运行一次测试（用于 CI）
- `npm run test:coverage` - 生成测试覆盖率报告
- `npm run ci` - 完整 CI 流程（类型检查 + 代码检查 + 测试 + 构建）

### 代码质量
- `npm run lint` - 检查 ESLint 规则
- `npm run lint:fix` - 自动修复 ESLint 错误
- `npm run format` - 使用 Prettier 格式化代码
- `npm run type-check` - 仅运行 TypeScript 类型检查

### 浏览器安装
构建后，将 `dist/` 文件夹作为未打包的扩展加载到：
- Chrome: `chrome://extensions/` → 开发者模式 → 加载已解压的扩展程序
- Firefox: `about:debugging` → 此 Firefox → 加载临时附加组件 → 选择 `manifest.json`
- Edge: `edge://extensions/` → 开发者模式 → 加载已解压的扩展程序

## 🏗️ 架构概览

### 技术栈
- **前端**: React 18 + TypeScript + Tailwind CSS
- **动画**: Framer Motion 用于流畅交互
- **状态管理**: Zustand 带持久化
- **构建工具**: Vite + CRXJS（Chrome 扩展优化）
- **测试**: Vitest + Testing Library
- **国际化**: react-i18next 多语言支持

### 核心架构模式

**状态管理（Zustand）**
- 集中式存储位于 `src/stores/useAppStore.ts`
- 带有自动同步到 chrome.storage 的持久化存储
- 类型安全的操作和选择器
- UI 响应性的乐观更新

**组件架构**
- 基于功能的组件组织（`/SearchEngine`、`/QuickLaunch` 等）
- 使用 `LazyComponents.tsx` 进行性能懒加载
- 优雅故障处理的错误边界
- TypeScript 的一致属性接口

**数据同步系统**
- 支持 WebDAV 和本地同步的基于提供程序的架构
- 冲突解决策略（最新、合并、手动）
- 事件驱动的同步状态管理
- 设备识别和多设备支持

### 关键文件和职责

**核心应用**
- `src/App.tsx` - 主应用组件和布局
- `src/stores/useAppStore.ts` - 全局状态管理
- `src/types/index.ts` - 主要 TypeScript 类型定义

**同步系统**（复杂的多文件架构）
- `src/utils/sync/syncManager.ts` - 主同步协调器和冲突解决
- `src/utils/sync/webdav.ts` - WebDAV 提供程序实现
- `src/utils/sync/localSync.ts` - 本地导入/导出功能
- `src/hooks/useSync.ts` - React 集成和状态管理
- `src/types/sync.ts` - 同步特定的类型定义

**构建配置**
- `vite.config.ts` - 带有 CRXJS 插件的 Vite 构建配置（扩展支持）
- `public/manifest.json` - 浏览器扩展清单（Manifest V3）
- `tailwind.config.js` - 带有 Claude 风格设计标记的自定义主题

### 扩展特定考虑事项

**浏览器 API 使用**
- 使用 Manifest V3 实现现代浏览器兼容性
- Chrome 存储 API 用于持久数据（由 Zustand 处理）
- 无后台脚本 - 完全客户端架构
- 通过 Tailwind 内联样式符合 CSP

**性能优化**
- 按功能和供应商块进行代码分割（见 `vite.config.ts`）
- 网站图标的图像优化和缓存
- 带有清理工具的内存泄漏预防
- 非关键组件的懒加载

**安全和隐私**
- 用户提供的 URL 和设置的输入清理
- 快速启动项的 URL 验证
- 外部 API 调用的速率限制
- 生产构建中无敏感数据记录

## 🎨 设计系统

**主题架构**
- 基于时间自动切换的明暗主题
- Claude 风格调色板（暖白色、微妙灰色）
- 通过 Tailwind 工具的一致间距比例
- 带有键盘导航的无障碍优先设计

**动画模式**
- Framer Motion 用于页面过渡和微交互
- 尊重无障碍的 `prefers-reduced-motion`
- 一致的时序函数和缓动曲线
- 使用 `transform` 和 `opacity` 的性能优化动画

## 🔄 数据流

**设置管理**
1. 用户与设置 UI 组件交互
2. 操作分发到 Zustand 存储
3. 存储更新自动持久化到 chrome.storage
4. UI 基于存储更改响应式重新渲染

**同步操作**
1. 用户启动同步或自动同步触发
2. `SyncManager` 协调操作
3. 特定于提供程序的同步逻辑处理数据传输
4. 如需要进行冲突检测和解决
5. UI 通过事件监听器和存储更新进行更新

**快速启动管理**
- 带有乐观更新的拖放重新排序
- 带有缓存的自动图标获取
- 实时搜索和过滤
- 基于类别的组织

## 🧪 测试策略

**单元测试**（`src/**/__tests__/`）
- 使用 Testing Library 的组件测试
- 使用 Vitest 的工具函数测试
- 使用 `jest-webextension-mock` 模拟浏览器 API
- 覆盖率阈值强制执行

**集成测试**
- 同步系统端到端测试
- 用户工作流测试（搜索、快速启动、设置）
- 跨浏览器兼容性验证

## 🔧 常见开发任务

**添加新的快速启动类别**
1. 更新 `src/types/index.ts` 中的 `QuickLaunchItem` 类型
2. 修改 `src/components/QuickLaunch/QuickLaunchGrid.tsx` 中的类别逻辑
3. 在设置 UI 中添加类别选择

**添加新的同步提供程序**
1. 创建实现同步接口的提供程序类
2. 在 `src/types/sync.ts` 中添加提供程序类型
3. 在 `SyncManager.initializeProviders()` 中注册
4. 在 `SyncSettings.tsx` 中添加 UI 配置

**国际化**
1. 在 `src/locales/{lang}.json` 中添加翻译键
2. 在组件中使用 `useTranslation()` 钩子
3. 更新设置中的语言选择器

## 🌐 中文化配置

**默认设置**
- 默认语言：简体中文（zh）
- 默认搜索引擎：百度
- 预设中国本地化网站（B站、微博、知乎、淘宝等）
- 24小时时间格式

**多语言文件**
- `src/locales/zh.json` - 简体中文翻译（主要）
- `src/locales/en.json` - 英文翻译（备用）
- `src/locales/i18n.ts` - 国际化配置（默认中文）