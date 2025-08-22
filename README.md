# 现代化新标签页扩展

一个美观、可定制、功能丰富的现代化浏览器新标签页扩展。使用 React、TypeScript 和 Tailwind CSS 构建。

## ✨ 功能特色

### 🎨 **精美背景**
- 必应每日壁纸自动更新
- 支持自定义图片上传
- 纯色和渐变色背景
- 模糊和透明度控制

### 🔍 **智能搜索**
- 多搜索引擎支持（谷歌、必应、DuckDuckGo、百度）
- 自定义搜索引擎支持
- 键盘快捷键
- 搜索建议

### ⚡ **快速启动**
- 可定制应用快捷方式
- 拖拽重新排序
- 热门网站集成
- 分类管理

### 🌤️ **天气与时间**
- 实时天气信息
- 多种时间格式
- 基于位置的更新
- 天气状况图标

### 🔧 **个性化定制**
- 明亮/暗色/自动主题模式
- 无障碍功能
- 减少动画支持
- 高对比度模式

### 🔄 **同步与备份**
- WebDAV 同步
- 本地备份/恢复
- 跨设备设置同步
- 数据导出/导入

### 🌐 **多语言支持**
- 中文和英文界面
- 便捷的本地化系统
- 准备支持 RTL 语言

## 🚀 安装使用

### 开发环境设置

1. **克隆仓库**
   ```bash
   git clone https://github.com/your-username/new-tab-extension.git
   cd new-tab-extension
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **构建生产版本**
   ```bash
   npm run build
   ```

### 浏览器安装

#### Chrome/Edge
1. 打开 `chrome://extensions/` 或 `edge://extensions/`
2. 启用"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `dist` 文件夹

#### Firefox
1. 打开 `about:debugging`
2. 点击"此 Firefox"
3. 点击"加载临时附加组件"
4. 从 `dist` 文件夹中选择 `manifest.json` 文件

## 🛠️ 开发

### 项目结构

```
src/
├── components/          # React 组件
│   ├── Background/      # 背景图片组件
│   ├── QuickLaunch/     # 快速启动网格
│   ├── SearchEngine/    # 搜索功能
│   ├── Settings/        # 设置模态框和表单
│   └── __tests__/       # 组件测试
├── hooks/              # 自定义 React hooks
├── locales/            # 国际化
├── stores/             # 状态管理 (Zustand)
├── styles/             # CSS 和样式
├── types/              # TypeScript 类型定义
├── utils/              # 工具函数
└── test/               # 测试工具
```

### 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run test` - 监视模式运行测试
- `npm run test:run` - 运行一次测试
- `npm run test:coverage` - 生成覆盖率报告
- `npm run lint` - 运行 ESLint
- `npm run lint:fix` - 修复 ESLint 错误
- `npm run format` - 使用 Prettier 格式化代码
- `npm run type-check` - 运行 TypeScript 类型检查
- `npm run ci` - 运行所有检查（CI 流水线）

### 技术栈

- **前端**: React 18, TypeScript, Tailwind CSS
- **动画**: Framer Motion
- **状态管理**: Zustand
- **国际化**: React i18next
- **构建工具**: Vite
- **测试**: Vitest, Testing Library
- **代码质量**: ESLint, Prettier
- **浏览器 API**: Chrome 扩展 API

## 🧪 测试

项目包含全面的测试：

### 单元测试
```bash
npm run test
```

### 覆盖率报告
```bash
npm run test:coverage
```

### 浏览器兼容性测试
- Chrome (Manifest V3)
- Firefox (WebExtensions)
- Edge (基于 Chromium)

## 🔒 安全

### 安全功能
- 内容安全策略 (CSP)
- URL 验证和清理
- 输入清理
- 速率限制
- 隐私优先设计

### 安全审计
```bash
npm audit
```

## ♿ 无障碍

- WCAG 2.1 AA 合规
- 键盘导航支持
- 屏幕阅读器兼容
- 高对比度模式
- 减少动画支持
- 焦点管理

## 🌍 国际化

当前支持的语言：
- 中文 (zh)
- 英文 (en)

添加新语言：
1. 在 `src/locales/` 中创建新的 JSON 文件
2. 为所有键添加翻译
3. 在 `src/locales/i18n.ts` 中导入

## 📊 性能

### 优化功能
- 代码分割和懒加载
- 图片优化和缓存
- 内存泄漏防护
- 包大小优化
- 渐进式加载

### 性能监控
- 内存使用跟踪
- 包大小分析
- Lighthouse 审计

## 🔧 配置

### 环境变量
在根目录创建 `.env` 文件：

```env
VITE_WEATHER_API_KEY=你的_openweather_api_密钥
VITE_BING_API_KEY=你的_bing_api_密钥
```

### 构建配置
查看 `vite.config.ts` 了解构建自定义选项。

## 📱 浏览器支持

| 浏览器 | 最低版本 | 状态 |
|---------|----------|------|
| Chrome | 88+ | ✅ 支持 |
| Firefox | 89+ | ✅ 支持 |
| Edge | 88+ | ✅ 支持 |
| Safari | - | ⏳ 计划中 |

## 🤝 贡献

我们欢迎贡献！请查看我们的[贡献指南](CONTRIBUTING.md)了解详细信息。

### 开发流程
1. Fork 仓库
2. 创建功能分支
3. 进行更改
4. 添加测试
5. 运行测试套件
6. 提交拉取请求

### 代码标准
- 遵循 TypeScript 最佳实践
- 编写全面的测试
- 使用语义化提交消息
- 遵循无障碍指南

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详细信息。

## 🙏 致谢

- [必应图片 API](https://www.bing.com) 提供精美的每日壁纸
- [OpenWeather](https://openweathermap.org) 提供天气数据
- [Lucide](https://lucide.dev) 提供精美图标
- [Tailwind CSS](https://tailwindcss.com) 提供实用优先的样式

## 📞 支持

- 📧 邮箱: your-email@example.com
- 🐛 问题: [GitHub Issues](https://github.com/your-username/new-tab-extension/issues)
- 💬 讨论: [GitHub Discussions](https://github.com/your-username/new-tab-extension/discussions)

## 🗺️ 路线图

### 版本 1.1
- [ ] Safari 支持
- [ ] 更多搜索引擎
- [ ] 小部件系统
- [ ] 高级主题

### 版本 1.2
- [ ] 笔记功能
- [ ] 日历集成
- [ ] 待办事项列表
- [ ] RSS 订阅阅读器

### 版本 2.0
- [ ] 移动配套应用
- [ ] 云同步服务
- [ ] 高级分析
- [ ] 插件系统

---

**用 ❤️ 打造更好的浏览体验**