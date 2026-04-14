"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewRoutes = reviewRoutes;
const db_1 = require("../config/db");
const pointsEngine_1 = require("../utils/pointsEngine");
const shared_1 = require("@hireagent/shared");
async function reviewRoutes(app) {
    // List reviews for agent
    app.get('/agent/:agentId', async (req, reply) => {
        const { agentId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const { rows } = await db_1.pool.query(`
      SELECT r.*, u.username, u.display_name, u.avatar_url
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.agent_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `, [agentId, Number(limit), offset]);
        return reply.send(rows);
    });
    // Submit review
    app.post('/agent/:agentId', { preHandler: [app.authenticate] }, async (req, reply) => {
        const { agentId } = req.params;
        const user = req.user;
        const { rating, commentZh, commentEn } = req.body;
        if (!rating || rating < 1 || rating > 5) {
            return reply.code(400).send({ error: '评分必须在1到5之间' });
        }
        const { rows: agentRows } = await db_1.pool.query(`SELECT creator_id FROM agents WHERE id = $1 AND status = 'published'`, [agentId]);
        if (!agentRows[0])
            return reply.code(404).send({ error: '智能体不存在' });
        try {
            const { rows } = await db_1.pool.query(`
        INSERT INTO reviews (agent_id, user_id, rating, comment_zh, comment_en)
        VALUES ($1, $2, $3, $4, $5) RETURNING *
      `, [agentId, user.id, rating, commentZh, commentEn]);
            // Update agent rating average
            await db_1.pool.query(`
        UPDATE agents SET
          rating_avg = (SELECT AVG(rating) FROM reviews WHERE agent_id = $1),
          rating_count = (SELECT COUNT(*) FROM reviews WHERE agent_id = $1),
          updated_at = NOW()
        WHERE id = $1
      `, [agentId]);
            // Award points to creator for 5-star review
            if (rating === 5 && agentRows[0].creator_id && agentRows[0].creator_id !== user.id) {
                await (0, pointsEngine_1.awardPoints)(agentRows[0].creator_id, agentId, shared_1.POINT_RULES.FIVE_STAR_REVIEW, 'FIVE_STAR_REVIEW', '获得五星好评', 'Received a 5-star review');
            }
            return reply.code(201).send(rows[0]);
        }
        catch (err) {
            if (err.code === '23505')
                return reply.code(409).send({ error: '您已评价过此智能体' });
            throw err;
        }
    });
    // Mark review helpful
    app.post('/:id/helpful', { preHandler: [app.authenticate] }, async (req, reply) => {
        const { id } = req.params;
        const { rows } = await db_1.pool.query(`UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = $1 RETURNING user_id`, [id]);
        if (!rows[0])
            return reply.code(404).send({ error: '评价不存在' });
        const user = req.user;
        if (rows[0].user_id && rows[0].user_id !== user.id) {
            await (0, pointsEngine_1.awardPoints)(rows[0].user_id, null, shared_1.POINT_RULES.REVIEW_HELPFUL, 'REVIEW_HELPFUL', '评价被标记为有用', 'Review marked as helpful');
        }
        return reply.send({ success: true });
    });
}
