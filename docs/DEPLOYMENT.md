# HireAgent 部署指南

本文档介绍 HireAgent 的各种部署方式。

---

## 方案一：GitHub Pages + 自托管后端（推荐开源展示）

### 前端（GitHub Pages）

项目已配置 `.github/workflows/deploy-web.yml`，每次推送到 `main` 分支时会自动构建前端并部署到 GitHub Pages。

**启用步骤：**

1. 在 GitHub 仓库页面，进入 **Settings → Pages**。
2. 在 "Build and deployment" 中，Source 选择 **GitHub Actions**。
3. 推送代码到 `main` 分支，等待 Actions 运行完成。
4. 访问 `https://<username>.github.io/hireagent/`。

> 注意：GitHub Pages 仅支持静态内容，因此 API 后端需要单独部署。

### 后端（自托管）

在你的服务器上运行：

```bash
git clone https://github.com/yourusername/hireagent.git
cd hireagent

# 1. 启动 PostgreSQL
docker compose up -d

# 2. 配置环境变量
cp apps/api/.env.example apps/api/.env
# 编辑 .env，设置生产级 JWT_SECRET、DATABASE_URL 和 CORS_ORIGIN

# 3. 安装依赖并构建
pnpm install
pnpm build

# 4. 启动生产服务
cd apps/api && pnpm start
```

---

## 方案二：Render 托管（推荐免费 Demo）

### 后端 + 数据库

1. 在 [Render](https://render.com) 注册账号。
2. 创建一个新的 **PostgreSQL** 实例，复制其 Internal Database URL。
3. 创建一个新的 **Web Service**，连接你的 GitHub 仓库：
   - **Build Command**：`pnpm install && pnpm build`
   - **Start Command**：`cd apps/api && pnpm start`
   - **Environment**：添加 `DATABASE_URL`、`JWT_SECRET`、`JWT_REFRESH_SECRET`、`CORS_ORIGIN` 等变量。

### 前端

继续使用 GitHub Pages（零成本），只需将 `apps/web/.env.production`（如有）中的 API 地址指向 Render 的后端域名，并在 `apps/api/.env` 中配置对应的 `CORS_ORIGIN`。

---

## 方案三：Railway / Fly.io

部署思路与 Render 类似：

- **Railway**：支持一键从 GitHub 部署，自带 PostgreSQL 插件。
- **Fly.io**：通过 `fly launch` 和 `fly deploy` 部署，支持自定义 `fly.toml` 配置。

由于 HireAgent 使用标准 Node.js + PostgreSQL 技术栈，以上平台均可直接运行。

---

## 环境变量清单

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `NODE_ENV` | 运行环境 | `production` |
| `PORT` | API 服务端口 | `3001` |
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | JWT 签名密钥（至少 32 位） | `your-random-secret` |
| `JWT_REFRESH_SECRET` | Refresh Token 签名密钥 | `your-refresh-secret` |
| `JWT_EXPIRES_IN` | Access Token 有效期 | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh Token 有效期 | `7d` |
| `CORS_ORIGIN` | 前端域名，允许跨域 | `https://username.github.io` |

---

## 故障排查

**前端访问后端出现 CORS 错误**
- 检查 `CORS_ORIGIN` 是否完全匹配前端域名（包括 `https://` 和路径末尾无斜杠）。

**GitHub Pages 部署后空白页**
- 检查 `vite.config.ts` 中的 `base` 是否设置为 `/hireagent/`（与仓库名一致）。

**数据库迁移未执行**
- 确保 PostgreSQL 容器已启动，且 `apps/api/src/db/migrations/` 目录已被正确挂载到 `/docker-entrypoint-initdb.d/`。
