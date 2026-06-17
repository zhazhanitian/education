// GET  /api/admin/users  — 用户列表
// POST /api/admin/users  — 创建用户
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const payload = requireAuth(event) as { id: number; role: string }
  const prisma = usePrisma()

  // 只有 ADMIN 和 SUPER_ADMIN 可以管理用户
  if (!['ADMIN', 'SUPER_ADMIN'].includes(payload.role)) {
    throw createError({ statusCode: 403, message: '无权限访问用户管理' })
  }

  // ── GET 用户列表 ──────────────────────────────────────────────
  if (event.method === 'GET') {
    const users = await prisma.adminUser.findMany({
      select: {
        id: true,
        username: true,
        realName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    })
    return { code: 0, data: users }
  }

  // ── POST 创建用户 ──────────────────────────────────────────────
  if (event.method === 'POST') {
    const body = await readBody<{
      username: string
      password: string
      realName?: string
      role: string
    }>(event)

    if (!body.username || !body.password) {
      throw createError({ statusCode: 400, message: '用户名和密码不能为空' })
    }

    // 禁止通过 UI 创建超级管理员
    if (body.role === 'SUPER_ADMIN') {
      throw createError({ statusCode: 403, message: '不允许创建超级管理员账号' })
    }

    // 只允许合法角色
    if (!['ADMIN', 'EDITOR'].includes(body.role)) {
      throw createError({ statusCode: 400, message: '无效的角色类型' })
    }

    const exists = await prisma.adminUser.findUnique({ where: { username: body.username } })
    if (exists) {
      throw createError({ statusCode: 409, message: '用户名已存在' })
    }

    const passwordHash = await bcrypt.hash(body.password, 10)
    const user = await prisma.adminUser.create({
      data: {
        username: body.username,
        passwordHash,
        realName: body.realName || null,
        role: body.role as 'ADMIN' | 'EDITOR',
      },
      select: { id: true, username: true, realName: true, role: true, isActive: true, createdAt: true },
    })

    return { code: 0, data: user }
  }
})
