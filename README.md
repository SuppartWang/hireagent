# HireAgent

> **AI Agent 配置共享市场** — 发现、分享并一键部署社区创作的最优 Agent 配置到 Claude、OpenClaw 等工具。

[中文](#) | [English](#)

---

## ✨ 核心特性

- **🤖 智能体广场** — 浏览、搜索、筛选由社区上传的 AI Agent，支持综合排名、最新发布、最高评分、最多使用、本周热门多种排序。
- **📤 一键导出** — 支持 Claude Desktop JSON、OpenClaw 配置、通用 JSON、YAML 和系统提示词文本，快速将配置应用到你的工具链。
- **🏆 创作者激励** — 积分与徽章体系：Agent 被使用、获得五星好评、被推荐到首页均可获得积分，自动升级徽章等级。
- **🌍 中英双语** — 原生支持简体中文与英文，Agent 信息可同时维护双语版本。
- **🔒 开源透明** — 完整前后端开源，使用 MIT 协议，欢迎 Fork 和二次开发。

---

## 📸 截图

*（截图占位区：建议上传 1280×800 的广场页和详情页截图）*

---

## 🚀 快速开始

### 环境要求

- Node.js 20+
- pnpm
- Docker & Docker Compose（用于本地 PostgreSQL）

### 1. 克隆仓库

```bash
git clone https://github.com/yourusername/hireagent.git
cd hireagent
```

### 2. 启动数据库

```bash
docker compose up -d
```

### 3. 安装依赖

```bash
pnpm install
```

### 4. 配置环境变量

```bash
cp apps/api/.env.example apps/api/.env
# 编辑 apps/api/.env，填入 JWT_SECRET 等必要变量
```

### 5. 启动开发服务

```bash
pnpm dev
```

- 前端：`http://localhost:5173`
- 后端 API：`http://localhost:3001`

---

## 🏗 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + Vite + TypeScript + Tailwind CSS |
| 路由 | react-router-dom v6 |
| 状态 | zustand |
| 国际化 | i18next + react-i18next |
| 后端 | Fastify 4 + TypeScript |
| 数据库 | PostgreSQL 16 |
| 构建 | pnpm workspace |

---

## 📁 项目结构

```
.
├── apps/
│   ├── api/          # Fastify 后端服务
│   └── web/          # React 前端应用
├── packages/
│   └── shared/       # 共享类型与常量
├── docs/             # 产品与技术文档
├── docker-compose.yml
└── pnpm-workspace.yaml
```

---

## 🌐 部署

- **前端**：可部署到 GitHub Pages（已配置 GitHub Actions 工作流）。
- **后端**：支持 Docker Compose 自托管，或部署到 Render、Railway 等 PaaS 平台。

详见 [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)。

---

## 🤝 贡献

我们欢迎所有形式的贡献！请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解如何提交 Issue 和 Pull Request。

---

## 📄 许可证

[HireAgent](./LICENSE) © 由 HireAgent 团队与社区贡献者维护，基于 [MIT License](./LICENSE) 开源。
