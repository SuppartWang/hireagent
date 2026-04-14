import { FastifyInstance } from 'fastify'
import { pool } from '../config/db'
import { awardPoints } from '../utils/pointsEngine'
import { POINT_RULES } from '@hireagent/shared'

export async function reviewRoutes(app: FastifyInstance) {
  // List reviews for agent
  app.get('/agent/:agentId', async (req, reply) => {
    const { agentId } = req.params as any
    const { page = 1, limit = 20 } = req.query as any
    const offset = (Number(page) - 1) * Number(limit)
    const { rows } = await pool.query(`
      SELECT r.*, u.username, u.display_name, u.avatar_url
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.agent_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `, [agentId, Number(limit), offset])
    return reply.send(rows)
  })

  // Submit review
  app.post('/agent/:agentId', { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const { agentId } = req.params as any
    const user = req.user as any
    const { rating, commentZh, commentEn } = req.body as any

    if (!rating || rating < 1 || rating > 5) {
      return reply.code(400).send({ error: '评分必须在1到5之间' })
    }

    const { rows: agentRows } = await pool.query(
      `SELECT creator_id FROM agents WHERE id = $1 AND status = 'published'`, [agentId]
    )
    if (!agentRows[0]) return reply.code(404).send({ error: '智能体不存在' })

    try {
      const { rows } = await pool.query(`
        INSERT INTO reviews (agent_id, user_id, rating, comment_zh, comment_en)
        VALUES ($1, $2, $3, $4, $5) RETURNING *
      `, [agentId, user.id, rating, commentZh, commentEn])

      // Update agent rating average
      await pool.query(`
        UPDATE agents SET
          rating_avg = (SELECT AVG(rating) FROM reviews WHERE agent_id = $1),
          rating_count = (SELECT COUNT(*) FROM reviews WHERE agent_id = $1),
          updated_at = NOW()
        WHERE id = $1
      `, [agentId])

      // Award points to creator for 5-star review
      if (rating === 5 && agentRows[0].creator_id && agentRows[0].creator_id !== user.id) {
        await awardPoints(
          agentRows[0].creator_id, agentId, POINT_RULES.FIVE_STAR_REVIEW, 'FIVE_STAR_REVIEW',
          '获得五星好评', 'Received a 5-star review'
        )
      }
      return reply.code(201).send(rows[0])
    } catch (err: any) {
      if (err.code === '23505') return reply.code(409).send({ error: '您已评价过此智能体' })
      throw err
    }
  })

  // Mark review helpful
  app.post('/:id/helpful', { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const { id } = req.params as any
    const { rows } = await pool.query(
      `UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = $1 RETURNING user_id`,
      [id]
    )
    if (!rows[0]) return reply.code(404).send({ error: '评价不存在' })
    const user = req.user as any
    if (rows[0].user_id && rows[0].user_id !== user.id) {
      await awardPoints(rows[0].user_id, null, POINT_RULES.REVIEW_HELPFUL, 'REVIEW_HELPFUL',
        '评价被标记为有用', 'Review marked as helpful')
    }
    return reply.send({ success: true })
  })
}
