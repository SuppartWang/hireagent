"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = adminRoutes;
const db_1 = require("../config/db");
const pointsEngine_1 = require("../utils/pointsEngine");
const rankingService_1 = require("../services/rankingService");
const shared_1 = require("@hireagent/shared");
async function adminRoutes(app) {
    const requireAdmin = async (req, reply) => {
        await app.authenticate(req, reply);
        if (!req.user.isAdmin)
            reply.code(403).send({ error: '需要管理员权限' });
    };
    // Feature/unfeature agent
    app.post('/agents/:id/feature', { preHandler: [requireAdmin] }, async (req, reply) => {
        const { id } = req.params;
        const { featured } = req.body;
        const { rows } = await db_1.pool.query(`UPDATE agents SET is_featured=$1, featured_at=CASE WHEN $1 THEN NOW() ELSE NULL END, updated_at=NOW()
       WHERE id=$2 RETURNING creator_id, name_zh`, [featured !== false, id]);
        if (!rows[0])
            return reply.code(404).send({ error: '智能体不存在' });
        if (featured !== false && rows[0].creator_id) {
            await (0, pointsEngine_1.awardPoints)(rows[0].creator_id, id, shared_1.POINT_RULES.FEATURED, 'FEATURED', `智能体「${rows[0].name_zh}」被推荐到首页`, 'Agent featured on homepage');
        }
        return reply.send({ success: true });
    });
    // Recalculate rankings
    app.post('/rankings/recalculate', { preHandler: [requireAdmin] }, async (_req, reply) => {
        await (0, rankingService_1.recalculateAllRankings)();
        return reply.send({ success: true, message: '排名重新计算完成' });
    });
    // Platform stats
    app.get('/stats', { preHandler: [requireAdmin] }, async (_req, reply) => {
        const { rows } = await db_1.pool.query(`
      SELECT
        (SELECT COUNT(*) FROM agents WHERE status='published') as published_agents,
        (SELECT COUNT(*) FROM agents WHERE status='draft') as draft_agents,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM agent_hires) as total_hires,
        (SELECT COUNT(*) FROM agent_hires WHERE created_at > NOW() - INTERVAL '24 hours') as hires_today,
        (SELECT COUNT(*) FROM reviews) as total_reviews,
        (SELECT SUM(amount) FROM point_transactions WHERE amount > 0) as total_points_awarded
    `);
        return reply.send(rows[0]);
    });
}
