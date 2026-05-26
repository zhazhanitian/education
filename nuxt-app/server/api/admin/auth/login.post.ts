// POST /api/admin/auth/login  — SoybeanAdmin 兼容接口
// SoybeanAdmin 传 { userName, password }，我们的表里存 username
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ userName: string; password: string }>(event)

  if (!body.userName || !body.password) {
    throw createError({ statusCode: 400, message: '请输入用户名和密码' })
  }

  const prisma = usePrisma()
  const user = await prisma.adminUser.findUnique({
    where: { username: body.userName },
  })

  if (!user || !user.isActive) {
    throw createError({ statusCode: 401, message: '用户名或密码错误' })
  }

  const valid = await bcrypt.compare(body.password, user.passwordHash)
  if (!valid) {
    throw createError({ statusCode: 401, message: '用户名或密码错误' })
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

  const token = signToken({ id: user.id, username: user.username, role: user.role })

  return {
    code: 0,
    data: {
      token,
      refreshToken: token, // 简化实现，使用同一 token
    },
  }
})
