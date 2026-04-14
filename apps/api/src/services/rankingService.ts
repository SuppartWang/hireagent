import { pool } from '../config/db'

export function normalizeRating(avg: number): number {
  return Math.max(0, (avg - 1) / 4)
}

export function usageScore(hireCount: number, globalMax: number): number {
  return Math.log(hireCount + 1) / Math.log(Math.max(globalMax + 1, 2))
}

export function freshnessScore(publishedAt: Date): number {
  const daysSince = (Date.now() - publishedAt.getTime()) / (1000 * 86400)
  return Math.exp(-0.023 * daysSince)
}

export function computeRankingScore(agent: {
  rating_avg: number
  hire_count: number
  quality_score: number
  published_at: string | null
}, globalMaxHires: number): number {
  const R = normalizeRating(agent.rating_avg)
  const U = usageScore(agent.hire_count, globalMaxHires)
  const Q = agent.quality_score
  const F = agent.published_at ? freshnessScore(new Date(agent.published_at)) : 0
  return 0.4 * R + 0.3 * U + 0.2 * Q + 0.1 * F
}

export async function recalculateAllRankings(): Promise<void> {
  const { rows: [maxRow] } = await pool.query(
    `SELECT MAX(hire_count) as max_hires FROM agents WHERE status = 'published'`
  )
  const globalMax = maxRow?.max_hires || 1

  const { rows: agents } = await pool.query(
    `SELECT id, rating_avg, hire_count, quality_score, published_at FROM agents WHERE status = 'published'`
  )

  for (const agent of agents) {
    const score = computeRankingScore(agent, globalMax)
    await pool.query(
      `UPDATE agents SET ranking_score = $1, updated_at = NOW() WHERE id = $2`,
      [score, agent.id]
    )
  }

  // Save daily snapshot
  await pool.query(`
    INSERT INTO ranking_snapshots (agent_id, snapshot_date, hire_count, rating_avg, ranking_score)
    SELECT id, CURRENT_DATE, hire_count, rating_avg, ranking_score
    FROM agents WHERE status = 'published'
    ON CONFLICT (agent_id, snapshot_date) DO UPDATE
    SET hire_count = EXCLUDED.hire_count,
        rating_avg = EXCLUDED.rating_avg,
        ranking_score = EXCLUDED.ranking_score
  `)

  console.log(`Ranking recalculated for ${agents.length} agents`)
}

export function startRankingCron(): void {
  // Run every 6 hours
  const SIX_HOURS = 6 * 60 * 60 * 1000
  recalculateAllRankings().catch(console.error)
  setInterval(() => recalculateAllRankings().catch(console.error), SIX_HOURS)
}
