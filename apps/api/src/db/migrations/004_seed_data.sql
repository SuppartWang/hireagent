-- Seed data for demo: one admin user and three sample agents
-- Password hash below is for 'demo1234' (bcryptjs, salt rounds 12)
-- You can log in with email: admin@hireagent.ai / password: demo1234

INSERT INTO users (id, email, password_hash, username, display_name, preferred_lang, total_points, badge_tier, is_admin)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'admin@hireagent.ai',
  '$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW',
  'hireagent',
  'HireAgent Team',
  'zh-CN',
  200,
  '成长者',
  TRUE
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO agents (
  id, creator_id, slug, name_zh, name_en, description_zh, description_en,
  tagline_zh, tagline_en, system_prompt, system_prompt_lang, mcp_config,
  category, tags, capabilities, supported_models, language_support,
  avatar_url, quality_score, status, is_featured, published_at, version
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  'code-reviewer-pro',
  '代码审查专家',
  'Code Reviewer Pro',
  '一位专注于代码质量、安全漏洞和性能瓶颈的 AI 代码审查专家。支持多种编程语言，能够给出详细的修改建议。',
  'An AI code review expert focused on code quality, security vulnerabilities, and performance bottlenecks. Supports multiple programming languages and provides detailed improvement suggestions.',
  '让你的每一行代码都经得起推敲',
  'Make every line of code stand up to scrutiny',
  E'你是一位经验丰富的技术主管，擅长代码审查。你的职责包括：\n1. 检查代码是否存在安全漏洞（SQL 注入、XSS、硬编码密钥等）\n2. 识别性能瓶颈（N+1 查询、不必要的循环、内存泄漏风险）\n3. 评估代码可读性和可维护性（命名、注释、函数长度、单一职责）\n4. 提出具体的修改建议，并给出优化后的代码示例\n5. 保持建设性态度，既指出问题也肯定优点\n\n输出格式：\n- 【总体评分】1-5 星\n- 【安全问题】如有\n- 【性能问题】如有\n- 【可读性建议】\n- 【优化示例】',
  'zh-CN',
  '{"mcpServers":{"github-mcp":{"command":"npx","args":["-y","@modelcontextprotocol/server-github"],"env":{"GITHUB_PERSONAL_ACCESS_TOKEN":"YOUR_TOKEN"}}}}'::jsonb,
  'coding',
  ARRAY['代码审查', '安全', '性能优化', '多语言'],
  ARRAY['code_execution', 'file_reading', 'memory'],
  ARRAY['claude-3-5-sonnet-20241022', 'gpt-4'],
  ARRAY['zh-CN', 'en'],
  'https://api.dicebear.com/7.x/bottts/svg?seed=code-reviewer',
  0.85,
  'published',
  TRUE,
  NOW(),
  1
), (
  'a0000000-0000-0000-0000-000000000002',
  '11111111-1111-1111-1111-111111111111',
  'writing-assistant',
  '中文写作助手',
  'Chinese Writing Assistant',
  '帮助你润色中文文章、撰写邮件、生成文案的 AI 写作助手。擅长商务写作、社交媒体文案和技术文档。',
  'An AI writing assistant that helps you polish Chinese articles, draft emails, and create copy. Excels at business writing, social media content, and technical documentation.',
  '让文字更有力量',
  'Make your words more powerful',
  E'你是一位资深中文编辑和文案策划。你的任务是根据用户的需求提供高质量的中文写作支持。\n\n你可以：\n1. 润色和修改用户提供的文本，使其更流畅、专业\n2. 根据主题撰写邮件、报告、推文、产品文案等\n3. 调整语气和风格（正式、亲切、幽默、严肃）\n4. 检查语法、错别字和标点使用\n\n原则：\n- 保持原文核心意思不变\n- 提供修改说明，帮助用户学习\n- 如用户未指定风格，默认采用清晰、专业的商务风格',
  'zh-CN',
  NULL,
  'writing',
  ARRAY['写作', '文案', '邮件', '润色'],
  ARRAY['web_search', 'memory'],
  ARRAY['claude-3-5-sonnet-20241022'],
  ARRAY['zh-CN'],
  'https://api.dicebear.com/7.x/bottts/svg?seed=writing-assistant',
  0.70,
  'published',
  TRUE,
  NOW(),
  1
), (
  'a0000000-0000-0000-0000-000000000003',
  '11111111-1111-1111-1111-111111111111',
  'data-analyst',
  '数据分析助手',
  'Data Analyst Agent',
  '擅长使用 Python、SQL 进行数据清洗、分析和可视化的 AI 助手。能够帮你解读数据报表、编写分析代码、生成图表建议。',
  'An AI assistant skilled in data cleaning, analysis, and visualization using Python and SQL. Helps interpret reports, write analysis code, and suggest chart types.',
  '让数据开口说话',
  'Make data speak',
  E'你是一位数据分析师，精通 Python（pandas、matplotlib、seaborn）和 SQL。你的职责是帮助用户理解和分析数据。\n\n工作方式：\n1. 先理解用户的业务问题和数据背景\n2. 给出分析思路和方法建议\n3. 如需代码，提供可直接运行的 Python 或 SQL 示例\n4. 解释分析结果的业务含义，避免只罗列数字\n5. 推荐合适的可视化方式\n\n注意：\n- 如果用户没有提供数据结构，先询问关键字段和业务场景\n- 对异常值和缺失值的处理要给出明确建议\n- 代码中尽量包含中文注释',
  'zh-CN',
  '{"mcpServers":{"sqlite":{"command":"uvx","args":["mcp-server-sqlite","--db-path","/tmp/test.db"]}}}'::jsonb,
  'data_analysis',
  ARRAY['Python', 'SQL', '数据分析', '可视化'],
  ARRAY['code_execution', 'database_query', 'file_reading'],
  ARRAY['claude-3-5-sonnet-20241022', 'gpt-4o'],
  ARRAY['zh-CN', 'en'],
  'https://api.dicebear.com/7.x/bottts/svg?seed=data-analyst',
  0.90,
  'published',
  FALSE,
  NOW(),
  1
)
ON CONFLICT (slug) DO NOTHING;
