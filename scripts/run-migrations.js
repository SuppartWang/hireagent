#!/usr/bin/env node
/**
 * Run SQL migrations against a PostgreSQL database.
 * Usage:
 *   DATABASE_URL="postgresql://..." node scripts/run-migrations.js
 */

const fs = require('fs')
const path = require('path')
const { Pool } = require('../apps/api/node_modules/pg')

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is required.')
  process.exit(1)
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' || process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false,
})

async function run() {
  const migrationsDir = path.join(__dirname, '../apps/api/src/db/migrations')
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()

  const client = await pool.connect()
  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8')
      console.log(`Running ${file}...`)
      await client.query(sql)
      console.log(`  ✅ ${file} completed`)
    }
    console.log('\n🎉 All migrations applied successfully.')
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

run()
