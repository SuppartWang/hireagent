# 贡献指南

感谢你考虑为 HireAgent 做出贡献！

## 🐛 提交 Issue

- 在提交新 Issue 之前，请先搜索是否已有类似问题。
- 请尽量提供复现步骤、环境信息（Node.js 版本、操作系统）和相关截图。

## 🔀 提交 Pull Request

1. **Fork** 本仓库并克隆到本地。
2. 从 `main` 分支切出一个新分支：
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. 提交你的修改，并遵循 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/v1.0.0/) 规范：
   ```bash
   git commit -m "feat: 添加 OpenClaw 导出支持"
   ```
4. 确保代码能通过 TypeScript 编译：
   ```bash
   pnpm build
   ```
5. 推送到你的 Fork 并提交 Pull Request。

## 🎨 代码风格

- **前端样式**：使用 Tailwind CSS 原子类；动态类名合并使用 `cn(...)` 工具。
- **命名规范**：变量/函数使用 camelCase，React 组件使用 PascalCase。
- **注释**：核心逻辑请使用中文注释，便于国内开发者理解。
- **国际化**：新增 UI 文案时，请同时补充 `zh-CN.json` 和 `en.json`。

## 🛠 本地开发

```bash
# 1. 启动 PostgreSQL
docker compose up -d

# 2. 安装依赖
pnpm install

# 3. 启动前后端开发服务
pnpm dev
```

## 💬 交流

如有任何问题，欢迎通过 Issue 或 Discussion 与我们联系。
