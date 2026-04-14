"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportRoutes = exportRoutes;
const db_1 = require("../config/db");
const js_yaml_1 = __importDefault(require("js-yaml"));
async function exportRoutes(app) {
    async function getAgent(id) {
        const { rows } = await db_1.pool.query(`SELECT * FROM agents WHERE id = $1 AND status = 'published'`, [id]);
        return rows[0];
    }
    async function recordHire(agentId, userId, hireType) {
        await db_1.pool.query(`UPDATE agents SET hire_count = hire_count + 1, updated_at = NOW() WHERE id = $1`, [agentId]);
        await db_1.pool.query(`INSERT INTO agent_hires (agent_id, user_id, hire_type) VALUES ($1, $2, $3)`, [agentId, userId, hireType]);
    }
    // Export for Claude Desktop
    app.get('/:agentId/claude', async (req, reply) => {
        const { agentId } = req.params;
        const agent = await getAgent(agentId);
        if (!agent)
            return reply.code(404).send({ error: '智能体不存在' });
        const userId = req.user?.id || null;
        await recordHire(agentId, userId, 'export_claude');
        const config = agent.mcp_config
            ? { mcpServers: agent.mcp_config.mcpServers || {} }
            : { mcpServers: {} };
        reply.header('Content-Disposition', `attachment; filename="claude_desktop_config.json"`);
        reply.header('Content-Type', 'application/json');
        return reply.send(JSON.stringify(config, null, 2));
    });
    // Generic JSON export
    app.get('/:agentId/generic', async (req, reply) => {
        const { agentId } = req.params;
        const agent = await getAgent(agentId);
        if (!agent)
            return reply.code(404).send({ error: '智能体不存在' });
        const userId = req.user?.id || null;
        await recordHire(agentId, userId, 'export_generic');
        const exportData = {
            hireagent_export_version: '1.0',
            agent: {
                id: agent.id,
                slug: agent.slug,
                name: agent.name_zh,
                name_en: agent.name_en,
                description: agent.description_zh,
                system_prompt: agent.system_prompt,
                system_prompt_lang: agent.system_prompt_lang,
                mcp_config: agent.mcp_config,
                capabilities: agent.capabilities,
                category: agent.category,
                tags: agent.tags,
                supported_models: agent.supported_models,
                language_support: agent.language_support,
                exported_at: new Date().toISOString(),
                source: `https://hireagent.ai/agents/${agent.slug}`,
            },
        };
        reply.header('Content-Disposition', `attachment; filename="${agent.slug}_export.json"`);
        reply.header('Content-Type', 'application/json');
        return reply.send(JSON.stringify(exportData, null, 2));
    });
    // YAML export
    app.get('/:agentId/yaml', async (req, reply) => {
        const { agentId } = req.params;
        const agent = await getAgent(agentId);
        if (!agent)
            return reply.code(404).send({ error: '智能体不存在' });
        const userId = req.user?.id || null;
        await recordHire(agentId, userId, 'export_yaml');
        const exportData = {
            hireagent_export_version: '1.0',
            agent: {
                slug: agent.slug,
                name: agent.name_zh,
                system_prompt: agent.system_prompt,
                mcp_config: agent.mcp_config,
                capabilities: agent.capabilities,
                category: agent.category,
                tags: agent.tags,
            },
        };
        reply.header('Content-Disposition', `attachment; filename="${agent.slug}_export.yaml"`);
        reply.header('Content-Type', 'text/yaml');
        return reply.send(js_yaml_1.default.dump(exportData));
    });
    // System prompt text export
    app.get('/:agentId/prompt', async (req, reply) => {
        const { agentId } = req.params;
        const agent = await getAgent(agentId);
        if (!agent)
            return reply.code(404).send({ error: '智能体不存在' });
        const userId = req.user?.id || null;
        await recordHire(agentId, userId, 'copy_prompt');
        reply.header('Content-Disposition', `attachment; filename="${agent.slug}_system_prompt.txt"`);
        reply.header('Content-Type', 'text/plain; charset=utf-8');
        return reply.send(agent.system_prompt);
    });
    // OpenClaw export
    app.get('/:agentId/openclaw', async (req, reply) => {
        const { agentId } = req.params;
        const agent = await getAgent(agentId);
        if (!agent)
            return reply.code(404).send({ error: '智能体不存在' });
        const userId = req.user?.id || null;
        await recordHire(agentId, userId, 'export_openclaw');
        const safeSlug = agent.slug.replace(/[^a-zA-Z0-9_-]/g, '-');
        const tools = ['mcp'];
        if (agent.capabilities?.includes('file_reading'))
            tools.push('file');
        if (agent.capabilities?.includes('browser_control'))
            tools.push('browser');
        if (agent.capabilities?.includes('code_execution'))
            tools.push('shell');
        if (agent.capabilities?.includes('web_search'))
            tools.push('browser');
        const exportData = {
            hireagent_export_version: '1.0',
            openclaw_merge_guide: {
                step1: `mkdir -p ~/.openclaw/agents/${safeSlug}`,
                step2: `将下方的 agent_md 内容写入 ~/.openclaw/agents/${safeSlug}/agent.md`,
                step3: '将下方的 openclaw_json 合并到 ~/.openclaw/openclaw.json 的对应位置',
            },
            agent_md: agent.system_prompt,
            openclaw_json: {
                agents: {
                    registered: {
                        [safeSlug]: {
                            identity: `.openclaw/agents/${safeSlug}/agent.md`,
                            description: agent.description_zh || agent.name_zh,
                            tools: Array.from(new Set(tools)),
                            model: {
                                primary: agent.supported_models?.[0] || 'anthropic:claude-sonnet-4',
                                temperature: 0.5,
                                maxTokens: 64000,
                            },
                            ...(agent.mcp_config?.mcpServers ? {
                                mcp: { servers: agent.mcp_config.mcpServers },
                            } : {}),
                        },
                    },
                },
            },
        };
        reply.header('Content-Disposition', `attachment; filename="${safeSlug}_openclaw.json"`);
        reply.header('Content-Type', 'application/json');
        return reply.send(JSON.stringify(exportData, null, 2));
    });
}
