# HireAgent Crawler

自动化全网检索高质量 AI Agent / MCP Server，并通过 LLM 数据清洗后批量上传到 HireAgent 市场的工具。

## 核心改进（v2）

- **Awesome List 解析**：直接抓取 `awesome-mcp-servers`、`modelcontextprotocol/servers`、`awesome-ai-agents` 等 curated 列表，解析其中的真实工具条目
- **GitHub 精准搜索**：通过 `in:name,description` 精准匹配，并自动过滤掉 awesome-list 本身等非工具仓库
- **多重去重 + 垃圾过滤**：基于关键词的垃圾过滤 + 相关性评分排序，只把最优质的候选传给 LLM
- **多 LLM Provider**：支持 OpenAI 兼容 API（默认 fucheers）、Kimi、Ollama 本地模型

## 快速开始

```bash
cd tools/agent-crawler
pnpm install
```

### 配置环境变量

已预配置 `fucheers` OpenAI 兼容 API：
```bash
cp .env.example .env   # 可选，.env 已包含默认配置
```

如需切换 Provider，编辑 `.env`：
- **OpenAI 兼容**（默认，最快）：`LLM_PROVIDER=openai`
- **Kimi**：需要标准 Moonshot API key（Kimi Code key 不可用）
- **Ollama 本地**：`LLM_PROVIDER=ollama`（慢但免费）

### 试运行

```bash
pnpm crawl --dry-run --sources=awesome,github
```

### 正式上传

```bash
pnpm crawl --sources=awesome,github
```

## 数据源

| Source | 说明 | 典型产出 |
|--------|------|----------|
| `awesome` | 解析 awesome-mcp-servers / awesome-ai-agents 等列表 | ~150 条高质量条目 |
| `github` | GitHub API 精准搜索 mcp-server / ai-agent | ~10-20 条高星仓库 |
| `producthunt` | Product Hunt AI 产品 | ~10 条 |
| `aggregators` | AI 工具聚合站点 | 视站点而定 |
| `web` | DuckDuckGo 精准搜索 | ~5-10 条 |

## 工作流

```
Awesome Lists → 解析工具条目 → 去重过滤 → 相关性评分 → Top 12 → LLM清洗 → 上传
GitHub Search → 精准_repo搜索 → 过滤非工具 → 相关性评分 → Top 12 → LLM清洗 → 上传
```

## 常见问题

**Q: GitHub API 返回 Bad credentials？**  
A: 环境变量 `GITHUB_TOKEN` 中有一个无效的 token。工具会自动检测并回退到无认证模式（每小时 60 次请求）。

**Q: LLM 处理太慢？**  
A: 默认使用 `fucheers` OpenAI 兼容 API。如需更快，可换用标准 OpenAI key；如需免费，可换 Ollama（但处理 12 个条目约需 5-10 分钟）。

**Q: 上传失败 401？**  
A: 确保 `HIREAGENT_ADMIN_EMAIL` 和 `HIREAGENT_ADMIN_PASSWORD` 正确，且 Render 后端已部署最新的 `/admin/import-agents` 接口。
