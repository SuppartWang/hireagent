import { BadgeTier, computeBadgeTier, POINT_RULES } from '@hireagent/shared'
import { pool } from '../config/db'

export async function awardPoints(
  userId: string,
  agentId: string | null,
  amount: number,
  reason: keyof typeof POINT_RULES | string,
  descriptionZh: string,
  descriptionEn: string
): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(
      `INSERT INTO point_transactions (user_id, agent_id, amount, reason, description_zh, description_en)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, agentId, amount, reason, descriptionZh, descriptionEn]
    )
    const { rows } = await client.query(
      `UPDATE users SET total_points = total_points + $1, updated_at = NOW()
       WHERE id = $2 RETURNING total_points`,
      [amount, userId]
    )
    const newTotal = rows[0].total_points
    const newTier = computeBadgeTier(newTotal)
    await client.query(
      `UPDATE users SET badge_tier = $1 WHERE id = $2`,
      [newTier, userId]
    )
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export function computeQualityScore(agent: {
  system_prompt?: string
  mcp_config?: any
  capabilities?: string[]
  description_zh?: string
  avatar_url?: string
  demo_video_url?: string
  tags?: string[]
}): number {
  let score = 0
  if ((agent.system_prompt?.length ?? 0) > 200) score += 0.3
  if (agent.mcp_config && Object.keys(agent.mcp_config?.mcpServers ?? {}).length > 0) score += 0.25
  if ((agent.capabilities?.length ?? 0) >= 2) score += 0.15
  if ((agent.description_zh?.length ?? 0) > 100) score += 0.1
  if (agent.avatar_url) score += 0.05
  if (agent.demo_video_url) score += 0.1
  if ((agent.tags?.length ?? 0) >= 3) score += 0.05
  return Math.min(1, score)
}
