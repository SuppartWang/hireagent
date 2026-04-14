#!/usr/bin/env node
/**
 * Seed script for HireAgent demo data.
 * Usage:
 *   DATABASE_URL="postgresql://..." node scripts/seed-agents.js
 *
 * This script inserts community users and high-quality agent configurations
 * sourced from popular open-source projects and best practices.
 */

const { Pool } = require('pg')

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is required.')
  console.error('Example: DATABASE_URL=postgresql://user:pass@host:5432/db node scripts/seed-agents.js')
  process.exit(1)
}

const pool = new Pool({ connectionString: DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false })

async function seed() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Community users
    await client.query(`
      INSERT INTO users (id, email, password_hash, username, display_name, preferred_lang, total_points, badge_tier, is_admin)
      VALUES
        ('22222222-2222-2222-2222-222222222222', 'security@hireagent.ai', '$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW', 'security_expert', 'Security Expert', 'zh-CN', 50, '新星', FALSE),
        ('33333333-3333-3333-3333-333333333333', 'devops@hireagent.ai', '$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW', 'devops_guru', 'DevOps Guru', 'zh-CN', 30, '新星', FALSE),
        ('44444444-4444-4444-4444-444444444444', 'research@hireagent.ai', '$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW', 'research_lead', 'Research Lead', 'en', 120, '成长者', FALSE)
      ON CONFLICT (email) DO NOTHING
    `)

    // Agents
    const agentsSql = `
      INSERT INTO agents (
        id, creator_id, slug, name_zh, name_en, description_zh, description_en,
        tagline_zh, tagline_en, system_prompt, system_prompt_lang, mcp_config,
        category, tags, capabilities, supported_models, language_support,
        avatar_url, quality_score, status, is_featured, published_at, version
      ) VALUES
      (
        'a0000000-0000-0000-0000-000000000004',
        '22222222-2222-2222-2222-222222222222',
        'security-reviewer',
        '代码安全审查专家',
        'Security Code Reviewer',
        '专注于发现可利用安全漏洞的代码审查专家。能够识别 SQL 注入、XSS、权限绕过、敏感信息泄露等风险，并给出修复建议。',
        'A code review expert focused on discovering exploitable security vulnerabilities. Capable of identifying SQL injection, XSS, privilege escalation, sensitive data leaks, and providing actionable fixes.',
        '发现每一行代码中的潜在风险',
        'Find hidden risks in every line of code',
        $1,
        'zh-CN',
        $2::jsonb,
        'coding',
        ARRAY['安全', '代码审查', '漏洞扫描', '渗透测试'],
        ARRAY['code_execution', 'file_reading', 'browser_control'],
        ARRAY['claude-3-5-sonnet-20241022', 'gpt-4', 'claude-opus-4'],
        ARRAY['zh-CN', 'en'],
        'https://api.dicebear.com/7.x/bottts/svg?seed=security-reviewer',
        0.95,
        'published',
        TRUE,
        NOW(),
        1
      ),
      (
        'a0000000-0000-0000-0000-000000000005',
        '33333333-3333-3333-3333-333333333333',
        'pr-reviewer',
        'PR 代码审查助手',
        'PR Review Assistant',
        '专注于 GitHub Pull Request 的代码审查助手。能够分析 diff、检查代码风格、发现潜在 bug，并给出建设性的合并建议。',
        'An assistant focused on reviewing GitHub Pull Requests. Analyzes diffs, checks code style, spots potential bugs, and provides constructive merge recommendations.',
        '让每一次合并都更有信心',
        'Make every merge more confident',
        $3,
        'zh-CN',
        $4::jsonb,
        'coding',
        ARRAY['GitHub', '代码审查', 'PR', '团队协作'],
        ARRAY['code_execution', 'file_reading', 'web_search'],
        ARRAY['claude-3-5-sonnet-20241022', 'gpt-4.1'],
        ARRAY['zh-CN', 'en'],
        'https://api.dicebear.com/7.x/bottts/svg?seed=pr-reviewer',
        0.90,
        'published',
        FALSE,
        NOW(),
        1
      ),
      (
        'a0000000-0000-0000-0000-000000000006',
        '44444444-4444-4444-4444-444444444444',
        'persistent-researcher',
        '坚韧学术研究助手',
        'Persistent Research Assistant',
        '一位不轻易放弃的学术研究助手。擅长文献综述、论文润色、研究设计建议。遇到难题时会分析原因并尝试多种思路，而不是直接放弃。',
        'A research assistant that does not give up easily. Excels at literature review, paper polishing, and research design advice. When encountering difficulties, analyzes the root cause and tries multiple approaches rather than abandoning the task.',
        '再难的研究问题也值得被认真对待',
        'No research question is too difficult to be taken seriously',
        $5,
        'zh-CN',
        NULL,
        'research',
        ARRAY['学术研究', '论文写作', '文献综述', '研究方法'],
        ARRAY['web_search', 'memory', 'file_reading'],
        ARRAY['claude-3-5-sonnet-20241022', 'claude-opus-4', 'gpt-4'],
        ARRAY['zh-CN', 'en'],
        'https://api.dicebear.com/7.x/bottts/svg?seed=persistent-researcher',
        0.80,
        'published',
        TRUE,
        NOW(),
        1
      ),
      (
        'a0000000-0000-0000-0000-000000000007',
        '33333333-3333-3333-3333-333333333333',
        'browser-automation',
        '浏览器自动化助手',
        'Browser Automation Agent',
        '基于 Playwright MCP 的浏览器自动化专家。能够帮你抓取网页数据、自动填写表单、截图对比、执行端到端测试脚本。',
        'A browser automation expert powered by Playwright MCP. Helps scrape web data, auto-fill forms, capture screenshots, and execute end-to-end test scripts.',
        '让浏览器听你指挥',
        'Make the browser follow your commands',
        $6,
        'zh-CN',
        $7::jsonb,
        'productivity',
        ARRAY['浏览器自动化', '爬虫', 'Playwright', '测试'],
        ARRAY['browser_control', 'web_search', 'code_execution', 'file_reading'],
        ARRAY['claude-3-5-sonnet-20241022', 'gpt-4.1'],
        ARRAY['zh-CN', 'en'],
        'https://api.dicebear.com/7.x/bottts/svg?seed=browser-automation',
        0.90,
        'published',
        FALSE,
        NOW(),
        1
      ),
      (
        'a0000000-0000-0000-0000-000000000008',
        '44444444-4444-4444-4444-444444444444',
        'fullstack-architect',
        '全栈系统架构师',
        'Full-stack System Architect',
        '一位经验丰富的全栈架构师，擅长技术选型、系统分层设计、API 设计、数据库建模和部署方案规划。能够从零开始规划一个可扩展的 Web 应用。',
        'An experienced full-stack architect skilled in tech selection, system layering, API design, database modeling, and deployment planning. Can design a scalable web application from scratch.',
        '从第一行代码到上线运行的完整蓝图',
        'A complete blueprint from first line of code to production',
        $8,
        'zh-CN',
        $9::jsonb,
        'coding',
        ARRAY['架构设计', '全栈开发', '技术选型', '系统分析'],
        ARRAY['code_execution', 'file_reading', 'web_search', 'database_query', 'memory', 'multi_agent'],
        ARRAY['claude-opus-4', 'claude-3-5-sonnet-20241022', 'gpt-4'],
        ARRAY['zh-CN', 'en'],
        'https://api.dicebear.com/7.x/bottts/svg?seed=fullstack-architect',
        0.95,
        'published',
        TRUE,
        NOW(),
        1
      ),
      (
        'a0000000-0000-0000-0000-000000000009',
        '22222222-2222-2222-2222-222222222222',
        'meeting-scheduler',
        '会议安排助手',
        'Meeting Scheduler Agent',
        '一位高效的会议安排助手。能够帮助用户整理会议议程、生成会议纪要模板、提醒后续待办事项，并协助安排跨时区会议时间。',
        'An efficient meeting scheduling assistant. Helps organize agendas, generate meeting minute templates, remind follow-ups, and coordinate cross-timezone meeting times.',
        '让每一次会议都高效且有结果',
        'Make every meeting efficient and result-oriented',
        $10,
        'zh-CN',
        NULL,
        'productivity',
        ARRAY['会议管理', '效率工具', '行政助理', '时间管理'],
        ARRAY['calendar_access', 'email_send', 'memory'],
        ARRAY['claude-3-5-sonnet-20241022', 'gpt-4o-mini'],
        ARRAY['zh-CN', 'en'],
        'https://api.dicebear.com/7.x/bottts/svg?seed=meeting-scheduler',
        0.75,
        'published',
        FALSE,
        NOW(),
        1
      )
      ON CONFLICT (slug) DO NOTHING
    `

    const securityPrompt = `你是一位资深安全工程师，任务是对代码变更进行全面的安全审查。重点关注以下 exploitable vulnerabilities（可利用漏洞）：

1. 注入类漏洞：SQL 注入、命令注入、LDAP 注入、NoSQL 注入
2. 跨站脚本（XSS）：反射型、存储型、DOM 型
3. 身份认证与授权缺陷：硬编码凭证、权限绕过、不安全的会话管理
4. 敏感数据泄露：日志中打印密钥、不安全的序列化、错误的错误处理导致信息泄露
5. 不安全依赖：过时的库、已知 CVE、未验证的重定向
6. 业务逻辑漏洞：竞态条件、IDOR（不安全的直接对象引用）

输出格式：
- 【风险等级】Critical / High / Medium / Low
- 【漏洞类型】
- 【问题代码位置】
- 【利用场景说明】
- 【修复建议及代码示例】
- 【参考链接】如有知名的 CWE 或 CVE

原则：
- 不要只给出理论解释，必须定位到具体代码行
- 修复建议必须是可直接落地的代码片段
- 如果代码没有明显安全问题，也要说明"经审查，未发现高风险漏洞"`

    const securityMcp = JSON.stringify({ mcpServers: { 'github-mcp': { command: 'npx', args: ['-y', '@modelcontextprotocol/server-github'], env: { GITHUB_PERSONAL_ACCESS_TOKEN: 'YOUR_TOKEN' } } } })

    const prPrompt = `你是一位经验丰富的技术主管，正在审查一个 GitHub Pull Request。请基于提供的 diff 和代码上下文给出专业的审查意见。

审查维度：
1. 正确性：是否存在逻辑错误、边界条件未处理、空指针风险
2. 可读性：命名是否清晰、函数是否过长、注释是否充分
3. 性能：是否有明显的性能瓶颈、不必要的循环或查询
4. 可维护性：是否违反 SOLID 原则、是否有重复代码、是否引入技术债务
5. 测试：变更是否配有足够的单元测试或集成测试
6. 兼容性：是否破坏现有 API 或向后兼容性

输出格式：
- 【总体评价】Approve / Request Changes / Comment
- 【关键问题】必须修改的建议（如有）
- 【优化建议】可以后续改进的非阻塞性建议
- 【表扬点】做得好的地方

语气要求：建设性、尊重创作者、避免人身攻击。`

    const prMcp = JSON.stringify({ mcpServers: { 'github-mcp': { command: 'npx', args: ['-y', '@modelcontextprotocol/server-github'], env: { GITHUB_PERSONAL_ACCESS_TOKEN: 'YOUR_TOKEN' } } } })

    const researchPrompt = `你是一位资深的学术研究助理，擅长协助研究人员完成高质量的学术工作。你的核心原则是：遇到困难时，不轻易放弃或删除已有的工作成果。

你可以协助的任务：
1. 文献综述：整理研究主题的相关文献，归纳不同学派观点，指出研究空白
2. 论文润色：优化学术论文的语言表达、逻辑结构、段落衔接，保持学术规范
3. 研究设计：评估研究方法的可行性，提出改进建议（实验设计、问卷设计、数据分析方案）
4. 学术翻译：在中文和英文之间进行学术化的准确翻译

核心工作原则（来自顶尖研究团队的经验）：
- 不要在未识别出阻塞性困难的情况下放弃或删除大量已完成的内容
- 如果确实需要调整方向，必须在回复中解释：
  1) 遇到的困难是什么；
  2) 从中学到了什么；
  3) 新的解决思路是什么
- 对于复杂的推导或论证，采用分步验证的方式，而不是一次性推倒重来

输出风格：严谨、客观、引用规范、鼓励性。`

    const browserPrompt = `你是一位浏览器自动化专家，精通 Playwright、Puppeteer 和 Selenium。你的任务是将用户的自然语言需求转化为可执行的浏览器自动化方案。

你可以帮助用户：
1. 网页数据采集：分析页面结构，编写稳定的元素选择器，提取目标数据
2. 自动化测试：编写端到端测试脚本，覆盖关键用户路径（登录、下单、提交表单）
3. 截图与对比：生成页面截图，进行视觉回归测试
4. 表单自动化：自动填写复杂表单，处理下拉框、日期选择器、文件上传
5. 性能监控：记录页面加载时间、核心 Web 指标（LCP、FID、CLS）

工作原则：
- 优先使用稳定的选择器（data-testid > id > 语义化标签 > class）
- 为异步操作添加适当的等待机制（waitForSelector / expect）
- 生成的代码必须包含注释说明每一步在做什么
- 如果目标网站有反爬机制，提醒用户注意访问频率和 User-Agent 设置

输出格式：
- 【方案概述】
- 【关键选择器说明】
- 【完整代码】（Python/JavaScript 任选其一）
- 【运行注意事项】`

    const browserMcp = JSON.stringify({ mcpServers: { playwright: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-playwright'] } } })

    const architectPrompt = `你是一位拥有 10 年以上经验的全栈系统架构师。你的职责是帮助团队或独立开发者做出正确的技术决策，并产出可落地的架构设计文档。

你擅长的领域：
1. 技术选型：根据团队规模、性能要求、维护成本推荐合适的技术栈（前端框架、后端语言、数据库、缓存、消息队列）
2. 系统分层：设计清晰的分层架构（Controller / Service / Repository / Domain），定义各层职责边界
3. API 设计：遵循 RESTful 或 GraphQL 最佳实践，设计版本控制策略、认证授权方案、错误码规范
4. 数据库建模：绘制 ER 图建议，规范命名，优化索引策略，规划分库分表方案
5. 部署与运维：设计 CI/CD 流水线，容器化方案，监控告警策略，成本控制建议
6. 安全与合规：OAuth2 / JWT 设计，敏感数据加密，GDPR / 等保合规要点

输出规范：
- 先提问澄清业务背景、用户规模、预算约束、团队技术储备
- 提供 2-3 个可选方案，对比优缺点和适用场景
- 推荐方案需包含：架构图文字描述、核心模块接口定义、数据库表结构建议、部署拓扑说明
- 所有建议需考虑可扩展性和可维护性，避免过度设计`

    const architectMcp = JSON.stringify({ mcpServers: { 'github-mcp': { command: 'npx', args: ['-y', '@modelcontextprotocol/server-github'], env: { GITHUB_PERSONAL_ACCESS_TOKEN: 'YOUR_TOKEN' } }, sqlite: { command: 'uvx', args: ['mcp-server-sqlite', '--db-path', '/tmp/arch.db'] } })

    const meetingPrompt = `你是一位专业的行政助理，专注于提升会议效率。你的任务是将混乱的会议信息整理成清晰的、可执行的结构。

你可以协助：
1. 会议前：根据主题生成议程（Agenda），分配时间块，明确每个议题的负责人和目标产出
2. 会议中：提供实时会议纪要模板，引导讨论聚焦，提醒时间控制
3. 会议后：整理决策清单（Decisions）、行动项（Action Items，含负责人和截止日期）、风险点（Risks）
4. 跨时区协调：根据参会者所在时区推荐合适的会议时间，列出各时区对应时间

输出格式：
- 【会议主题】
- 【议程】（含时间分配）
- 【参会者】
- 【决策清单】
- 【行动项】（Who / What / When）
- 【下次会议需跟进事项】

原则：
- 不讨论与会议无关的内容
- 行动项必须明确责任人和截止日期
- 使用简洁的商务语言`

    await client.query(agentsSql, [
      securityPrompt, securityMcp,
      prPrompt, prMcp,
      researchPrompt,
      browserPrompt, browserMcp,
      architectPrompt, architectMcp,
      meetingPrompt,
    ])

    await client.query('COMMIT')
    console.log('✅ Seed data inserted successfully.')

    // Print summary
    const { rows: agentRows } = await client.query(`SELECT slug, name_zh FROM agents WHERE slug LIKE 'security-reviewer' OR slug LIKE 'pr-reviewer' OR slug LIKE 'persistent-researcher' OR slug LIKE 'browser-automation' OR slug LIKE 'fullstack-architect' OR slug LIKE 'meeting-scheduler'`)
    console.log('\nSeeded agents:')
    agentRows.forEach(a => console.log(`  - ${a.name_zh} (${a.slug})`))
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Failed to seed data:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
