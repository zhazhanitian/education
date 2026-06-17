// PUT    /api/admin/users/:id  — 更新用户（角色/状态/密码/姓名）
// DELETE /api/admin/users/:id  — 删除用户
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const payload = requireAuth(event) as { id: number; role: string }
  const prisma = usePrisma()

  if (!['ADMIN', 'SUPER_ADMIN'].includes(payload.role)) {
    throw createError({ statusCode: 403, message: '无权限访问用户管理' })
  }

  const targetId = Number(getRouterParam(event, 'id'))
  if (!targetId) throw createError({ statusCode: 400, message: '无效的用户 ID' })

  // 查询目标用户
  const target = await prisma.adminUser.findUnique({ where: { id: targetId } })
  if (!target) throw createError({ statusCode: 404, message: '用户不存在' })

  // ── PUT 更新用户 ───────────────────────────────────────────────
  if (event.method === 'PUT') {
    const body = await readBody<{
      realName?: string
      role?: string
      isActive?: boolean
      password?: string
    }>(event)

    // 不允许修改超级管理员的角色/状态
    if (target.role === 'SUPER_ADMIN' && (body.role !== undefined || body.isActive !== undefined)) {
      throw createError({ statusCode: 403, message: '不允许修改超级管理员的角色或状态' })
    }

    // 不允许将用户升级为超级管理员
    if (body.role === 'SUPER_ADMIN') {
      throw createError({ statusCode: 403, message: '不允许设置超级管理员角色' })
    }

    // 不允许禁用自己
    if (body.isActive === false && targetId === payload.id) {
      throw createError({ statusCode: 400, message: '不能禁用自己的账号' })
    }

    const updateData: Record<string, unknown> = {}
    if (body.realName !== undefined) updateData.realName = body.realName
    if (body.role && ['ADMIN', 'EDITOR'].includes(body.role)) updateData.role = body.role
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.password) {
      updateData.passwordHash = await bcrypt.hash(body.password, 10)
    }

    const updated = await prisma.adminUser.update({
      where: { id: targetId },
      data: updateData,
      select: { id: true, username: true, realName: true, role: true, isActive: true, createdAt: true },
    })

    return { code: 0, data: updated }
  }

  // ── DELETE 删除用户 ────────────────────────────────────────────
  if (event.method === 'DELETE') {
    // 不允许删除超级管理员
    if (target.role === 'SUPER_ADMIN') {
      throw createError({ statusCode: 403, message: '不允许删除超级管理员账号' })
    }

    // 不允许删除自己
    if (targetId === payload.id) {
      throw createError({ statusCode: 400, message: '不能删除自己的账号' })
    }

    await prisma.adminUser.delete({ where: { id: targetId } })
    return { code: 0, message: '删除成功' }
  }
})
