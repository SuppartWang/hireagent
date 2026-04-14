import { Pool } from 'pg'
import { env } from './env'

export const pool = new Pool({ connectionString: env.DATABASE_URL })

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err)
})
