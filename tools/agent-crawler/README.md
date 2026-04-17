# HireAgent Crawler

自动化全网检索 AI Agent / MCP Server，并通过 LLM 数据清洗后批量上传到 HireAgent 市场的工具。

## 功能

- **GitHub 检索**：通过 GitHub API 搜索高星 AI agent / MCP server 仓库，解析 README 获取详细信息
- **Web 检索**：通过 Playwright 爬取搜索引擎结果，发现最新 Agent 产品
- **LLM 清洗**：调用 OpenAI GPT 将原始非结构化数据转换为标准的 HireAgent 数据格式（名称、描述、系统提示词、分类、标签等）
- **自动上传**：调用 HireAgent Admin API 批量导入并自动发布

## 快速开始

### 1. 安装依赖

```bash
cd tools/agent-crawler
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 填入你的 API key 和账号
```

必填项：
- `HIREAGENT_API_BASE_URL` — HireAgent API 地址
- `HIREAGENT_ADMIN_EMAIL` / `HIREAGENT_ADMIN_PASSWORD` — 管理员账号（用于登录和导入）
- `OPENAI_API_KEY` — OpenAI API key（用于数据清洗）

### 3. 试运行（不实际上传）

```bash
pnpm crawl --dry-run
```

### 4. 正式运行

```bash
pnpm crawl
```

## 自定义搜索

```bash
# 只搜索 GitHub
pnpm crawl --sources=github --github-query="MCP server typescript"

# 只搜索 Web
pnpm crawl --sources=web --web-query="best coding AI agents 2025"

# 自定义两者
pnpm crawl --github-query="autonomous agent framework" --web-query="AI customer service agents"
```

## 架构

```
src/
├── api.ts           # HireAgent API 客户端（登录 + bulk import）
├── config.ts        # 环境变量和常量校验
├── llm.ts           # OpenAI 数据清洗模块
├── pipeline.ts      # 主流程：搜索 -> 清洗 -> 上传
├── searchers/
│   ├── github.ts    # GitHub API 搜索器
│   ├── web.ts       # Playwright 网页爬虫
│   └── index.ts     # 聚合导出
└── index.ts         # CLI 入口
```

## 注意事项

- GitHub API 有速率限制（未认证每小时 60 次）。如果经常超限，可在环境变量中添加 `GITHUB_TOKEN`。
- Web 搜索使用 Playwright + Bing，首次运行会自动下载 Chromium。
- 默认每次运行最多导入 `MAX_AGENTS_PER_RUN`（默认 20）个智能体，避免 API 和 LLM 用量过大。
