import { FastifyInstance } from 'fastify'
import { pool } from '../config/db'

export async function userRoutes(app: FastifyInstance) {
  // Get own profile
  app.get('/me', { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const { id } = req.user as any
    const { rows } = await pool.query(
      `SELECT id, email, username, display_name, avatar_url, bio, preferred_lang,
              total_points, badge_tier, is_admin, created_at
       FROM users WHERE id = $1`,
      [id]
    )
    return reply.send(rows[0])
  })

  // Update profile
  app.put('/me', { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const { id } = req.user as any
    const { displayName, bio, avatarUrl, preferredLang } = req.body as any
    const { rows } = await pool.query(
      `UPDATE users SET display_name=COALESCE($1,display_name), bio=COALESCE($2,bio),
       avatar_url=COALESCE($3,avatar_url), preferred_lang=COALESCE($4,preferred_lang), updated_at=NOW()
       WHERE id=$5 RETURNING id, username, display_name, bio, avatar_url, preferred_lang, total_points, badge_tier`,
      [displayName, bio, avatarUrl, preferredLang, id]
    )
    return reply.send(rows[0])
  })

  // My agents
  app.get('/me/agents', { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const { id } = req.user as any
    const { rows } = await pool.query(
      `SELECT id, slug, name_zh, name_en, category, status, is_featured,
              hire_count, rating_avg, rating_count, ranking_score, created_at, published_at
       FROM agents WHERE creator_id = $1 ORDER BY created_at DESC`,
      [id]
    )
    return reply.send(rows)
  })

  // Points history
  app.get('/me/points', { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const { id } = req.user as any
    const { page = 1, limit = 30 } = req.query as any
    const offset = (Number(page) - 1) * Number(limit)
    const { rows } = await pool.query(
      `SELECT pt.*, a.name_zh as agent_name, a.slug as agent_slug
       FROM point_transactions pt
       LEFT JOIN agents a ON pt.agent_id = a.id
       WHERE pt.user_id = $1 ORDER BY pt.created_at DESC LIMIT $2 OFFSET $3`,
      [id, Number(limit), offset]
    )
    return reply.send(rows)
  })

  // Bookmarks
  app.get('/me/bookmarks', { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const { id } = req.user as any
    const { rows } = await pool.query(
      `SELECT a.id, a.slug, a.name_zh, a.name_en, a.tagline_zh, a.category,
              a.avatar_url, a.hire_count, a.rating_avg, ab.created_at as bookmarked_at
       FROM agent_bookmarks ab
       JOIN agents a ON ab.agent_id = a.id
       WHERE ab.user_id = $1 ORDER BY ab.created_at DESC`,
      [id]
    )
    return reply.send(rows)
  })

  // Public profile
  app.get('/:username', async (req, reply) => {
    const { username } = req.params as any
    const { rows } = await pool.query(
      `SELECT id, username, display_name, avatar_url, bio, badge_tier, total_points, created_at
       FROM users WHERE username = $1`,
      [username]
    )
    if (!rows[0]) return reply.code(404).send({ error: '用户不存在' })
    const { rows: agents } = await pool.query(
      `SELECT id, slug, name_zh, category, status, hire_count, rating_avg, published_at
       FROM agents WHERE creator_id = $1 AND status = 'published' ORDER BY ranking_score DESC LIMIT 10`,
      [rows[0].id]
    )
    return reply.send({ ...rows[0], agents })
  })
}
