import { FastifyInstance } from 'fastify'
import { pool } from '../config/db'
import { awardPoints, computeQualityScore } from '../utils/pointsEngine'
import { recalculateAllRankings } from '../services/rankingService'
import { POINT_RULES } from '@hireagent/shared'
import slugify from '../utils/slugify'

export async function agentRoutes(app: FastifyInstance) {
  // List agents with filters and sorting
  app.get('/', async (req, reply) => {
    const {
      page = 1, limit = 20, sort = 'ranking',
      category, capabilities, language, model, q,
    } = req.query as any

    const offset = (Number(page) - 1) * Number(limit)
    const conditions: string[] = [`a.status = 'published'`]
    const params: any[] = []
    let p = 1

    if (q) {
      conditions.push(`a.search_vector @@ plainto_tsquery('simple', $${p++})`)
      params.push(q)
    }
    if (category && category !== 'all') {
      conditions.push(`a.category = $${p++}`)
      params.push(category)
    }
    if (capabilities) {
      const caps = Array.isArray(capabilities) ? capabilities : [capabilities]
      conditions.push(`a.capabilities @> $${p++}`)
      params.push(caps)
    }
    if (language) {
      conditions.push(`$${p++} = ANY(a.language_support)`)
      params.push(language)
    }
    if (model) {
      conditions.push(`$${p++} = ANY(a.supported_models)`)
      params.push(model)
    }

    const sortMap: Record<string, string> = {
      ranking: 'a.ranking_score DESC',
      newest: 'a.published_at DESC',
      rating: 'a.rating_avg DESC, a.rating_count DESC',
      usage: 'a.hire_count DESC',
      trending: `(
        SELECT COALESCE(SUM(1), 0) FROM agent_hires h
        WHERE h.agent_id = a.id AND h.created_at > NOW() - INTERVAL '7 days'
      ) DESC`,
    }
    const orderBy = sortMap[sort] || sortMap.ranking

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const countQuery = `SELECT COUNT(*) FROM agents a ${whereClause}`
    const dataQuery = `
      SELECT a.id, a.slug, a.name_zh, a.name_en, a.tagline_zh, a.tagline_en,
             a.category, a.tags, a.capabilities, a.avatar_url,
             a.hire_count, a.rating_avg, a.rating_count, a.ranking_score,
             a.status, a.is_featured, a.published_at, a.created_at,
             u.username as creator_username, u.display_name as creator_display_name
      FROM agents a
      LEFT JOIN users u ON a.creator_id = u.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${p++} OFFSET $${p++}
    `
    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, params),
      pool.query(dataQuery, [...params, Number(limit), offset]),
    ])

    return reply.send({
      data: dataResult.rows,
      total: Number(countResult.rows[0].count),
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(Number(countResult.rows[0].count) / Number(limit)),
    })
  })

  // Featured agents
  app.get('/featured', async (_req, reply) => {
    const { rows } = await pool.query(`
      SELECT a.id, a.slug, a.name_zh, a.name_en, a.tagline_zh, a.tagline_en,
             a.category, a.tags, a.capabilities, a.avatar_url, a.cover_url,
             a.hire_count, a.rating_avg, a.rating_count, a.ranking_score,
             u.username as creator_username
      FROM agents a
      LEFT JOIN users u ON a.creator_id = u.id
      WHERE a.status = 'published' AND a.is_featured = TRUE
      ORDER BY a.featured_at DESC LIMIT 6
    `)
    return reply.send(rows)
  })

  // Trending agents (top hires this week)
  app.get('/trending', async (_req, reply) => {
    const { rows } = await pool.query(`
      SELECT a.id, a.slug, a.name_zh, a.name_en, a.tagline_zh, a.tagline_en,
             a.category, a.tags, a.avatar_url, a.hire_count, a.rating_avg,
             COUNT(h.id) as week_hires,
             u.username as creator_username
      FROM agents a
      LEFT JOIN agent_hires h ON h.agent_id = a.id AND h.created_at > NOW() - INTERVAL '7 days'
      LEFT JOIN users u ON a.creator_id = u.id
      WHERE a.status = 'published'
      GROUP BY a.id, u.username
      ORDER BY week_hires DESC, a.ranking_score DESC
      LIMIT 10
    `)
    return reply.send(rows)
  })

  // Get agent by slug
  app.get('/:slug', async (req, reply) => {
    const { slug } = req.params as any
    const { rows } = await pool.query(`
      SELECT a.*,
             u.username as creator_username, u.display_name as creator_display_name, u.avatar_url as creator_avatar
      FROM agents a
      LEFT JOIN users u ON a.creator_id = u.id
      WHERE a.slug = $1 AND (a.status != 'archived' OR a.creator_id = $2)
    `, [slug, (req.user as any)?.id || null])

    if (!rows[0]) return reply.code(404).send({ error: '智能体不存在' })
    return reply.send(rows[0])
  })

  // Create agent
  app.post('/', { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const user = req.user as any
    const body = req.body as any
    const {
      nameZh, nameEn, descriptionZh, descriptionEn, taglineZh, taglineEn,
      systemPrompt, systemPromptLang, mcpConfig,
      category, tags, capabilities, supportedModels, languageSupport,
      avatarUrl, coverUrl, demoVideoUrl,
    } = body

    if (!nameZh || !descriptionZh || !systemPrompt) {
      return reply.code(400).send({ error: '缺少必填字段：名称、描述、系统提示词' })
    }

    const slug = slugify(nameZh) + '-' + Date.now().toString(36)
    const qualityScore = computeQualityScore({
      system_prompt: systemPrompt, mcp_config: mcpConfig,
      capabilities, description_zh: descriptionZh,
      avatar_url: avatarUrl, demo_video_url: demoVideoUrl, tags,
    })

    const { rows } = await pool.query(`
      INSERT INTO agents (
        creator_id, slug, name_zh, name_en, description_zh, description_en,
        tagline_zh, tagline_en, system_prompt, system_prompt_lang, mcp_config,
        category, tags, capabilities, supported_models, language_support,
        avatar_url, cover_url, demo_video_url, quality_score
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
      RETURNING *
    `, [
      user.id, slug, nameZh, nameEn, descriptionZh, descriptionEn,
      taglineZh, taglineEn, systemPrompt, systemPromptLang || 'zh-CN',
      mcpConfig ? JSON.stringify(mcpConfig) : null,
      category || 'other',
      tags || [], capabilities || [], supportedModels || [], languageSupport || ['zh-CN'],
      avatarUrl, coverUrl, demoVideoUrl, qualityScore,
    ])

    return reply.code(201).send(rows[0])
  })

  // Update agent
  app.put('/:id', { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const { id } = req.params as any
    const user = req.user as any
    const body = req.body as any

    const { rows: existing } = await pool.query(
      `SELECT creator_id, version FROM agents WHERE id = $1`, [id]
    )
    if (!existing[0]) return reply.code(404).send({ error: '智能体不存在' })
    if (existing[0].creator_id !== user.id && !user.isAdmin)
      return reply.code(403).send({ error: '无权限修改此智能体' })

    // Save version history
    const { rows: current } = await pool.query(
      `SELECT system_prompt, mcp_config, version FROM agents WHERE id = $1`, [id]
    )
    await pool.query(
      `INSERT INTO agent_versions (agent_id, version, system_prompt, mcp_config) VALUES ($1,$2,$3,$4)`,
      [id, current[0].version, current[0].system_prompt, current[0].mcp_config]
    )

    const qualityScore = computeQualityScore({
      system_prompt: body.systemPrompt,
      mcp_config: body.mcpConfig,
      capabilities: body.capabilities,
      description_zh: body.descriptionZh,
      avatar_url: body.avatarUrl,
      demo_video_url: body.demoVideoUrl,
      tags: body.tags,
    })

    const { rows } = await pool.query(`
      UPDATE agents SET
        name_zh=$1, name_en=$2, description_zh=$3, description_en=$4,
        tagline_zh=$5, tagline_en=$6, system_prompt=$7, system_prompt_lang=$8,
        mcp_config=$9, category=$10, tags=$11, capabilities=$12,
        supported_models=$13, language_support=$14, avatar_url=$15,
        cover_url=$16, demo_video_url=$17, quality_score=$18,
        version=version+1, updated_at=NOW()
      WHERE id=$19 RETURNING *
    `, [
      body.nameZh, body.nameEn, body.descriptionZh, body.descriptionEn,
      body.taglineZh, body.taglineEn, body.systemPrompt, body.systemPromptLang || 'zh-CN',
      body.mcpConfig ? JSON.stringify(body.mcpConfig) : null,
      body.category || 'other', body.tags || [], body.capabilities || [],
      body.supportedModels || [], body.languageSupport || ['zh-CN'],
      body.avatarUrl, body.coverUrl, body.demoVideoUrl, qualityScore, id,
    ])
    return reply.send(rows[0])
  })

  // Publish agent
  app.post('/:id/publish', { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const { id } = req.params as any
    const user = req.user as any
    const { rows: existing } = await pool.query(
      `SELECT creator_id, status FROM agents WHERE id = $1`, [id]
    )
    if (!existing[0]) return reply.code(404).send({ error: '智能体不存在' })
    if (existing[0].creator_id !== user.id) return reply.code(403).send({ error: '无权限' })

    const isFirst = existing[0].status === 'draft'
    const { rows } = await pool.query(
      `UPDATE agents SET status='published', published_at=COALESCE(published_at, NOW()), updated_at=NOW()
       WHERE id=$1 RETURNING *`,
      [id]
    )

    if (isFirst) {
      // Check if user's first agent publish for bonus points
      const { rows: prevAgents } = await pool.query(
        `SELECT COUNT(*) FROM agents WHERE creator_id=$1 AND status='published' AND id != $2`,
        [user.id, id]
      )
      if (Number(prevAgents[0].count) === 0) {
        await awardPoints(user.id, id, POINT_RULES.FIRST_PUBLISH, 'FIRST_PUBLISH',
          '首次发布智能体奖励', 'First agent published bonus')
      }
    }

    await recalculateAllRankings()
    return reply.send(rows[0])
  })

  // Record hire event
  app.post('/:id/hire', async (req, reply) => {
    const { id } = req.params as any
    const { hireType } = req.body as any
    const user = req.user as any

    const { rows } = await pool.query(
      `UPDATE agents SET hire_count = hire_count + 1, updated_at = NOW()
       WHERE id = $1 AND status = 'published' RETURNING creator_id`,
      [id]
    )
    if (!rows[0]) return reply.code(404).send({ error: '智能体不存在' })

    await pool.query(
      `INSERT INTO agent_hires (agent_id, user_id, hire_type) VALUES ($1, $2, $3)`,
      [id, user?.id || null, hireType || 'unknown']
    )

    // Award points to creator
    if (rows[0].creator_id && rows[0].creator_id !== user?.id) {
      await awardPoints(rows[0].creator_id, id, POINT_RULES.AGENT_HIRED, 'AGENT_HIRED',
        '智能体被使用', 'Agent was hired/exported')
    }

    return reply.send({ success: true })
  })

  // Toggle bookmark
  app.post('/:id/bookmark', { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const { id } = req.params as any
    const user = req.user as any
    const { rows: existing } = await pool.query(
      `SELECT 1 FROM agent_bookmarks WHERE user_id=$1 AND agent_id=$2`, [user.id, id]
    )
    if (existing.length > 0) {
      await pool.query(`DELETE FROM agent_bookmarks WHERE user_id=$1 AND agent_id=$2`, [user.id, id])
      return reply.send({ bookmarked: false })
    } else {
      await pool.query(`INSERT INTO agent_bookmarks (user_id, agent_id) VALUES ($1, $2)`, [user.id, id])
      return reply.send({ bookmarked: true })
    }
  })

  // Platform stats
  app.get('/stats/platform', async (_req, reply) => {
    const { rows } = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM agents WHERE status='published') as total_agents,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM agent_hires) as total_hires,
        (SELECT COUNT(*) FROM reviews) as total_reviews
    `)
    return reply.send(rows[0])
  })
}
