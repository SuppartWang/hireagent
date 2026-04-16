import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '密码不能为空'),
})

export const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  username: z.string().min(2, '用户名至少需要 2 个字符').max(20, '用户名最多 20 个字符'),
  displayName: z.string().max(20, '显示名称最多 20 个字符').optional(),
  password: z.string().min(8, '密码至少需要 8 个字符'),
})

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(500, '评论最多 500 个字符').optional(),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
export type ReviewFormValues = z.infer<typeof reviewSchema>
