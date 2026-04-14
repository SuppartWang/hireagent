# HireAgent — Agent Guide

> HireAgent 是一个 AI 智能体（Agent）市场平台。用户可以浏览、发布、评价和“雇佣”社区创作的 AI Agent，并一键导出配置到 Claude Desktop 等工具。项目采用 pnpm workspace 管理的 TypeScript  monorepo 架构。

---

## 项目概览

- **产品定位**：AI 智能体市场（Agent Marketplace），支持中文/英文双语。
- **核心功能**：
  - 智能体广场（搜索、筛选、排序、 Featured / Trending）
  - 用户注册/登录（JWT）
  - 智能体发布与编辑（含 MCP 配置、系统提示词、能力标签）
  - 评价与打分（1-5 星）
  - 导出功能（Claude Desktop JSON、OpenClaw 配置、通用 JSON、YAML、系统提示词文本）
  - 在线试用（TryAgent 页面，模拟对话风格预览）
  - 积分与徽章体系（创作者通过被使用、获五星好评、被推荐等获得积分）
  - 管理员后台（推荐/取消推荐、重新计算排名、平台统计）

---

## 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | React 18 + Vite + TypeScript |
| **样式** | Tailwind CSS 3 + `clsx` + `tailwind-merge` |
| **路由** | `react-router-dom` v6 |
| **状态管理** | `zustand`（`authStore`、`uiStore`） |
| **国际化** | `i18next` + `react-i18next`（`zh-CN` 为主，`en` 为辅） |
| **HTTP 客户端** | `axios`（带请求/响应拦截器处理 Token 与 401） |
| **后端** | Fastify 4 + TypeScript (`tsx` 运行/热重载) |
| **数据库** | PostgreSQL 16 (`pg` 原生驱动) |
| **包管理/构建** | pnpm workspace + `concurrently` |

---

## 仓库结构

```
.
├── apps/
│   ├── api/                 # Fastify 后端服务
│   │   ├── src/
│   │   │   ├── index.ts            # 服务入口：注册插件、路由、启动 cron
│   │   │   ├── config/
│   │   │   │   ├── env.ts          # Zod 校验的环境变量
│   │   │   │   └── db.ts           # pg Pool 初始化
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts         # 注册 / 登录 / 当前用户
│   │   │   │   ├── agents.ts       # 智能体 CRUD、发布、雇佣、收藏
│   │   │   │   ├── reviews.ts      # 评价列表 / 提交 / 标记有用
│   │   │   │   ├── users.ts        # 个人资料 / 我的智能体 / 积分 / 收藏
│   │   │   │   ├── export.ts       # 多种格式导出
│   │   │   │   └── admin.ts        # 管理员接口
│   │   │   ├── services/
│   │   │   │   └── rankingService.ts   # 排名分计算 + 定时 cron
│   │   │   ├── utils/
│   │   │   │   ├── pointsEngine.ts     # 积分发放、质量分计算
│   │   │   │   └── slugify.ts
│   │   │   └── db/migrations/          # SQL 迁移文件（Docker 自动执行）
│   │   ├── .env                        # 本地环境变量（已存在）
│   │   └── package.json
│   └── web/                 # React 前端
│       ├── index.html
│       ├── src/
│       │   ├── App.tsx              # 路由表
│       │   ├── main.tsx             # ReactDOM 挂载
│       │   ├── pages/               # 页面级组件
│       │   │   ├── Home/
│       │   │   ├── Marketplace/
│       │   │   ├── AgentDetail/
│       │   │   ├── AgentUpload/
│       │   │   ├── UserProfile/
│       │   │   ├── Login/
│       │   │   ├── Register/
│       │   │   ├── TryAgent/
│       │   │   └── NotFound/
│       │   ├── components/          # 可复用组件
│       │   │   ├── agent/AgentCard.tsx
│       │   │   ├── layout/Navbar.tsx / Footer.tsx
│       │   │   └── export/ExportModal.tsx
│       │   ├── store/
│       │   │   ├── authStore.ts     # 用户认证状态（持久化 localStorage）
│       │   │   └── uiStore.ts       # UI 状态（视图模式、语言、导出弹窗）
│       │   ├── api/
│       │   │   ├── client.ts        # axios 实例
│       │   │   └── index.ts         # 按模块封装的 API 方法
│       │   ├── i18n/                # 国际化
│       │   │   ├── index.ts
│       │   │   └── locales/zh-CN.json / en.json
│       │   ├── styles/globals.css   # Tailwind 入口 + 自定义组件类
│       │   └── utils/cn.ts          # clsx + twMerge 工具函数
│       ├── vite.config.ts           # 开发代理 /api -> localhost:3001
│       ├── tailwind.config.js
│       └── package.json
├── packages/
│   └── shared/              # 共享类型与常量
│       └── src/index.ts     # Agent/User/Review 类型、积分规则、徽章阈值、分类/能力标签等
├── docker-compose.yml       # PostgreSQL 16 本地容器
├── pnpm-workspace.yaml
├── package.json
└── AGENTS.md                # 本文件
```

---

## 环境要求

- **Node.js** 20+
- **pnpm**
- **Docker & Docker Compose**（用于本地 PostgreSQL）

---

## 快速开始

### 1. 启动数据库

```bash
docker compose up -d
```

容器会自动挂载 `apps/api/src/db/migrations/` 下的 SQL 文件执行初始化。

默认连接信息：
- 端口：`5432`
- 数据库：`hireagent`
- 用户/密码：`hireagent` / `hireagent_dev`

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

确保 `apps/api/.env` 已存在并包含以下变量（示例）：

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://hireagent:hireagent_dev@localhost:5432/hireagent
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

> 注意：`.env` 文件包含敏感信息，不要提交到版本控制。

### 4. 启动开发服务器

```bash
# 同时启动 API + Web（根目录）
pnpm dev
```

- 前端：`http://localhost:5173`
- 后端：`http://localhost:3001`
- API 健康检查：`GET http://localhost:3001/api/v1/health`

---

## 构建与部署

### 构建全部

```bash
pnpm build
```

构建顺序：
1. `packages/shared`
2. `apps/api`（`tsc` 编译到 `dist/`）
3. `apps/web`（`tsc && vite build`）

### 生产运行 API

```bash
cd apps/api
pnpm start   # node dist/index.js
```

### 部署前端到 GitHub Pages

项目已配置 `.github/workflows/deploy-web.yml`，推送至 `main` 分支后自动构建并部署到 GitHub Pages。详见 `docs/DEPLOYMENT.md`。

### Lint

```bash
pnpm lint    # 目前仅 web 项目配置了 eslint
```

---

## 代码规范与约定

### 语言与注释
- 项目主要面向中文用户，**代码注释、错误提示、路由返回消息多为中文**；共享包中的标签常量同时提供 `zh` / `en`。
- 变量/函数命名使用 **camelCase**；React 组件使用 **PascalCase**。

### 导入风格
- 前端使用相对路径导入项目内部模块（如 `../../store/authStore`）。
- 共享包通过 workspace 别名 `@hireagent/shared` 引用，已在 `vite.config.ts` 和 `tsconfig.json` 中配置。

### 后端路由组织
- 每个路由文件导出一个 `async function xxxRoutes(app: FastifyInstance)`。
- 认证通过 `app.decorate('authenticate', ...)` 注册为自定义装饰器，在路由 `preHandler` 中调用。
- 管理员权限校验使用局部中间件 `requireAdmin`。

### 数据库访问
- 直接使用 `pg` 的 `Pool` 执行原生 SQL，没有使用 ORM。
- SQL 参数化查询使用 `$1, $2...` 占位符。

### 样式约定
- 使用 Tailwind 原子类；复杂/重复样式抽取到 `globals.css` 的 `@layer components`：
  - `.card`
  - `.btn-primary` / `.btn-secondary`
  - `.badge`
  - `.input`
- 动态类名合并使用 `cn(...)` 工具函数。

---

## 测试

> **当前项目尚未配置测试框架**。没有 Jest、Vitest、Playwright 等测试文件或配置。

如需补充测试，建议：
- 前端：Vitest + React Testing Library
- 后端：Vitest / Node Tap + 使用 `pg` 的测试数据库
- E2E：Playwright

---

## 安全与敏感信息

- **JWT**：Access Token 与 Refresh Token 使用不同 Secret，通过环境变量注入。
- **密码**：使用 `bcryptjs` 以 salt rounds `12` 哈希存储。
- **速率限制**：Fastify 注册了 `@fastify/rate-limit`，默认 `100 req / 1 minute`。
- **CORS**：由 `env.CORS_ORIGIN` 控制，开发环境默认为 `http://localhost:5173`。
- **文件上传**：后端注册了 `@fastify/multipart`（当前代码中主要使用 URL 形式存储媒体资源）。

---

## 关键业务逻辑说明

### 排名分计算（Ranking Score）
- 定时任务每 6 小时执行一次（`startRankingCron`）。
- 公式：`0.4 * 评分归一化 + 0.3 * 使用度 + 0.2 * 质量分 + 0.1 * 新鲜度`
- 管理员也可通过接口手动触发重新计算。

### 质量分（Quality Score）
- 根据系统提示词长度、MCP 配置、能力数量、描述长度、头像/演示视频、标签数量等维度自动计算，范围 `[0, 1]`。

### OpenClaw 导出
- 针对 OpenClaw 多 Agent 框架提供专属导出格式。
- 下载内容包含 `agent.md`（系统提示词）和 `openclaw.json` 合并指南，方便用户快速将 Agent 接入自己的多 Agent 工作流。

### TryAgent 页面
- 提供不调用真实 LLM 的"模拟对话"沙盒。
- 用户可输入问题，页面根据 Agent 的系统提示词和能力标签生成风格预览模板，帮助用户在导出前快速了解该 Agent 的回复风格。

### 积分与徽章
- 积分规则（`POINT_RULES`）定义在 `packages/shared`：
  - 智能体被使用：`+10`
  - 获得五星好评：`+50`
  - 被推荐到首页：`+100`
  - 首次发布：`+25`
  - 评价被标记有用：`+5`
- 徽章等级：`新星 -> 成长者 -> 精英 -> 大师`（按积分阈值自动升级）。

---

## 常用脚本速查

| 命令 | 说明 |
|------|------|
| `docker compose up -d` | 启动本地 PostgreSQL |
| `pnpm install` | 安装依赖 |
| `pnpm dev` | 同时启动 API + Web 开发服务 |
| `pnpm --filter api dev` | 单独启动 API（带热重载） |
| `pnpm --filter web dev` | 单独启动 Web（Vite） |
| `pnpm build` | 构建 shared + api + web |
| `pnpm lint` | 运行 eslint（目前仅 web） |
| `cd apps/api && pnpm start` | 生产模式运行 API |

---

## 变更本文件时的注意事项

如果你修改了以下内容，请同步更新本 `AGENTS.md`：
- 新增/移除 workspace 包
- 更改构建命令或启动端口
- 引入新的测试框架或 CI/CD 流程
- 修改环境变量要求
- 变更数据库迁移策略
