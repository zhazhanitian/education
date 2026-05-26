import jwt from 'jsonwebtoken'
import { H3Event, getCookie, createError } from 'h3'

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production'

export function signToken(payload: object, expiresIn = '8h'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions)
}

export function verifyToken(token: string): Record<string, unknown> | null {
  try {
    return jwt.verify(token, JWT_SECRET) as Record<string, unknown>
  } catch {
    return null
  }
}

export function requireAuth(event: H3Event) {
  const authHeader = getHeader(event, 'authorization')
  const token = authHeader?.replace('Bearer ', '') || getCookie(event, 'admin_token')

  if (!token) throw createError({ statusCode: 401, message: '未授权，请先登录' })

  const payload = verifyToken(token)
  if (!payload) throw createError({ statusCode: 401, message: 'Token 已过期或无效' })

  return payload
}
