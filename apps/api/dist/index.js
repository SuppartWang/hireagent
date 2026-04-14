"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const auth_1 = require("./routes/auth");
const agents_1 = require("./routes/agents");
const reviews_1 = require("./routes/reviews");
const export_1 = require("./routes/export");
const users_1 = require("./routes/users");
const admin_1 = require("./routes/admin");
const env_1 = require("./config/env");
const rankingService_1 = require("./services/rankingService");
const app = (0, fastify_1.default)({ logger: true });
async function start() {
    await app.register(cors_1.default, { origin: env_1.env.CORS_ORIGIN, credentials: true });
    await app.register(rate_limit_1.default, { max: 100, timeWindow: '1 minute' });
    await app.register(jwt_1.default, {
        secret: env_1.env.JWT_SECRET,
        sign: { expiresIn: env_1.env.JWT_EXPIRES_IN },
    });
    app.decorate('authenticate', async (request, reply) => {
        try {
            await request.jwtVerify();
        }
        catch {
            reply.code(401).send({ error: '未授权' });
        }
    });
    await app.register(auth_1.authRoutes, { prefix: '/api/v1/auth' });
    await app.register(agents_1.agentRoutes, { prefix: '/api/v1/agents' });
    await app.register(reviews_1.reviewRoutes, { prefix: '/api/v1/reviews' });
    await app.register(export_1.exportRoutes, { prefix: '/api/v1/export' });
    await app.register(users_1.userRoutes, { prefix: '/api/v1/users' });
    await app.register(admin_1.adminRoutes, { prefix: '/api/v1/admin' });
    app.get('/api/v1/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));
    await app.listen({ port: env_1.env.PORT, host: '0.0.0.0' });
    console.log(`API running on http://localhost:${env_1.env.PORT}`);
    (0, rankingService_1.startRankingCron)();
}
start().catch(err => { console.error(err); process.exit(1); });
