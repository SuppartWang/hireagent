import { FastifyInstance } from 'fastify'
import { pool } from '../config/db'
import { awardPoints } from '../utils/pointsEngine'
import { recalculateAllRankings } from '../services/rankingService'
import { POINT_RULES } from '@hireagent/shared'
import { computeQualityScore } from '../utils/pointsEngine'
import slugify from '../utils/slugify'

export async function adminRoutes(app: FastifyInstance) {
  const requireAdmin = async (req: any, reply: any) => {
    await (app as any).authenticate(req, reply)
    if (!(req.user as any).isAdmin) reply.code(403).send({ error: '需要管理员权限' })
  }

  // Bulk import agents (admin only)
  app.post('/import-agents', { preHandler: [requireAdmin] }, async (req, reply) => {
    const user = req.user as any
    const { agents = [], publish = true } = req.body as any

    if (!Array.isArray(agents) || agents.length === 0) {
      return reply.code(400).send({ error: 'agents 必须是且至少包含一个元素的数组' })
    }
    if (agents.length > 50) {
      return reply.code(400).send({ error: '单次最多导入 50 个智能体' })
    }

    const results = { success: 0, failed: 0, errors: [] as string[], importedIds: [] as string[] }

    for (const agent of agents) {
      const {
        nameZh, nameEn, descriptionZh, descriptionEn, taglineZh, taglineEn,
        systemPrompt, systemPromptLang, mcpConfig,
        category, tags, capabilities, supportedModels, languageSupport,
        avatarUrl, coverUrl, demoVideoUrl,
      } = agent

      if (!nameZh || !descriptionZh || !systemPrompt) {
        results.failed++
        results.errors.push(`缺少必填字段: ${nameZh || '[未命名]'}`)
        continue
      }

      const uniqueSlug = slugify(nameZh) + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6)
      const qualityScore = computeQualityScore({
        system_prompt: systemPrompt, mcp_config: mcpConfig,
        capabilities, description_zh: descriptionZh,
        avatar_url: avatarUrl, demo_video_url: demoVideoUrl, tags,
      })

      try {
        const { rows } = await pool.query(`
          INSERT INTO agents (
            creator_id, slug, name_zh, name_en, description_zh, description_en,
            tagline_zh, tagline_en, system_prompt, system_prompt_lang, mcp_config,
            category, tags, capabilities, supported_models, language_support,
            avatar_url, cover_url, demo_video_url, quality_score,
            status, published_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
          RETURNING id
        `, [
          user.id, uniqueSlug, nameZh, nameEn || null, descriptionZh, descriptionEn || null,
          taglineZh || null, taglineEn || null, systemPrompt, systemPromptLang || 'zh-CN',
          mcpConfig ? JSON.stringify(mcpConfig) : null,
          category || 'other',
          tags || [], capabilities || [], supportedModels || [], languageSupport || ['zh-CN'],
          avatarUrl || null, coverUrl || null, demoVideoUrl || null, qualityScore,
          publish ? 'published' : 'draft',
          publish ? new Date().toISOString() : null,
        ])
        results.success++
        results.importedIds.push(rows[0].id)
      } catch (err: any) {
        results.failed++
        results.errors.push(`${nameZh}: ${err.message}`)
      }
    }

    if (results.success > 0 && publish) {
      await recalculateAllRankings()
    }

    return reply.send(results)
  })

  // Feature/unfeature agent
  app.post('/agents/:id/feature', { preHandler: [requireAdmin] }, async (req, reply) => {
    const { id } = req.params as any
    const { featured } = req.body as any
    const { rows } = await pool.query(
      `UPDATE agents SET is_featured=$1, featured_at=CASE WHEN $1 THEN NOW() ELSE NULL END, updated_at=NOW()
       WHERE id=$2 RETURNING creator_id, name_zh`,
      [featured !== false, id]
    )
    if (!rows[0]) return reply.code(404).send({ error: '智能体不存在' })
    if (featured !== false && rows[0].creator_id) {
      await awardPoints(rows[0].creator_id, id, POINT_RULES.FEATURED, 'FEATURED',
        `智能体「${rows[0].name_zh}」被推荐到首页`, 'Agent featured on homepage')
    }
    return reply.send({ success: true })
  })

  // Recalculate rankings
  app.post('/rankings/recalculate', { preHandler: [requireAdmin] }, async (_req, reply) => {
    await recalculateAllRankings()
    return reply.send({ success: true, message: '排名重新计算完成' })
  })

  // Platform stats
  app.get('/stats', { preHandler: [requireAdmin] }, async (_req, reply) => {
    const { rows } = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM agents WHERE status='published') as published_agents,
        (SELECT COUNT(*) FROM agents WHERE status='draft') as draft_agents,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM agent_hires) as total_hires,
        (SELECT COUNT(*) FROM agent_hires WHERE created_at > NOW() - INTERVAL '24 hours') as hires_today,
        (SELECT COUNT(*) FROM reviews) as total_reviews,
        (SELECT SUM(amount) FROM point_transactions WHERE amount > 0) as total_points_awarded
    `)
    return reply.send(rows[0])
  })
}
