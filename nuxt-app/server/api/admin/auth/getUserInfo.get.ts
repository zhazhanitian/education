// GET /api/admin/auth/getUserInfo  — SoybeanAdmin 兼容接口

export default defineEventHandler(async (event) => {
  const payload = requireAuth(event) as { id: number; username: string; role: string }
  const prisma = usePrisma()

  const user = await prisma.adminUser.findUnique({
    where: { id: payload.id },
    select: { id: true, username: true, realName: true, role: true },
  })

  if (!user) throw createError({ statusCode: 401, message: '用户不存在' })

  return {
    code: 0,
    data: {
      userId: String(user.id),
      userName: user.username,
      roles: [user.role === 'SUPER_ADMIN' ? 'R_SUPER' : user.role === 'ADMIN' ? 'R_ADMIN' : 'R_EDITOR'],
      buttons: ['B_CODE1', 'B_CODE2'],
    },
  }
})
