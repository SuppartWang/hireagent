import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import { authRoutes } from './routes/auth'
import { agentRoutes } from './routes/agents'
import { reviewRoutes } from './routes/reviews'
import { exportRoutes } from './routes/export'
import { userRoutes } from './routes/users'
import { adminRoutes } from './routes/admin'
import { env } from './config/env'
import { startRankingCron } from './services/rankingService'

const app = Fastify({ logger: true })

async function start() {
  await app.register(cors, { origin: env.CORS_ORIGIN, credentials: true })
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' })
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: env.JWT_EXPIRES_IN },
  })

  app.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify()
    } catch {
      reply.code(401).send({ error: '未授权' })
    }
  })

  await app.register(authRoutes, { prefix: '/api/v1/auth' })
  await app.register(agentRoutes, { prefix: '/api/v1/agents' })
  await app.register(reviewRoutes, { prefix: '/api/v1/reviews' })
  await app.register(exportRoutes, { prefix: '/api/v1/export' })
  await app.register(userRoutes, { prefix: '/api/v1/users' })
  await app.register(adminRoutes, { prefix: '/api/v1/admin' })

  app.get('/api/v1/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  await app.listen({ port: env.PORT, host: '0.0.0.0' })
  console.log(`API running on http://localhost:${env.PORT}`)

  startRankingCron()
}

start().catch(err => { console.error(err); process.exit(1) })
