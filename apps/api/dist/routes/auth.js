"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../config/db");
async function authRoutes(app) {
    // Register
    app.post('/register', async (req, reply) => {
        const { email, password, username, displayName, preferredLang } = req.body;
        if (!email || !password || !username) {
            return reply.code(400).send({ error: '缺少必填字段' });
        }
        const hash = await bcryptjs_1.default.hash(password, 12);
        try {
            const { rows } = await db_1.pool.query(`INSERT INTO users (email, password_hash, username, display_name, preferred_lang)
         VALUES ($1, $2, $3, $4, $5) RETURNING id, email, username, display_name, preferred_lang, total_points, badge_tier`, [email.toLowerCase(), hash, username.toLowerCase(), displayName || username, preferredLang || 'zh-CN']);
            const user = rows[0];
            // Award first-join badge
            await db_1.pool.query(`INSERT INTO badges (user_id, badge_type) VALUES ($1, $2)`, [user.id, '新星']);
            const token = app.jwt.sign({ id: user.id, username: user.username, isAdmin: false });
            return reply.code(201).send({ user, token });
        }
        catch (err) {
            if (err.code === '23505')
                return reply.code(409).send({ error: '邮箱或用户名已被占用' });
            throw err;
        }
    });
    // Login
    app.post('/login', async (req, reply) => {
        const { email, password } = req.body;
        if (!email || !password)
            return reply.code(400).send({ error: '缺少邮箱或密码' });
        const { rows } = await db_1.pool.query(`SELECT id, email, username, display_name, avatar_url, preferred_lang, total_points, badge_tier, is_admin, password_hash
       FROM users WHERE email = $1`, [email.toLowerCase()]);
        if (!rows[0])
            return reply.code(401).send({ error: '邮箱或密码错误' });
        const valid = await bcryptjs_1.default.compare(password, rows[0].password_hash);
        if (!valid)
            return reply.code(401).send({ error: '邮箱或密码错误' });
        const { password_hash: _, ...user } = rows[0];
        const token = app.jwt.sign({ id: user.id, username: user.username, isAdmin: user.is_admin });
        return reply.send({ user, token });
    });
    // Get current user
    app.get('/me', { preHandler: [app.authenticate] }, async (req, reply) => {
        const { id } = req.user;
        const { rows } = await db_1.pool.query(`SELECT id, email, username, display_name, avatar_url, bio, preferred_lang, total_points, badge_tier, is_admin, created_at
       FROM users WHERE id = $1`, [id]);
        if (!rows[0])
            return reply.code(404).send({ error: '用户不存在' });
        return reply.send(rows[0]);
    });
}
