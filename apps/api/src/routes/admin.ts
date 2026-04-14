import { FastifyInstance } from 'fastify'
import { pool } from '../config/db'
import { awardPoints } from '../utils/pointsEngine'
import { recalculateAllRankings } from '../services/rankingService'
import { POINT_RULES } from '@hireagent/shared'

export async function adminRoutes(app: FastifyInstance) {
  const requireAdmin = async (req: any, reply: any) => {
    await (app as any).authenticate(req, reply)
    if (!(req.user as any).isAdmin) reply.code(403).send({ error: '需要管理员权限' })
  }

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
