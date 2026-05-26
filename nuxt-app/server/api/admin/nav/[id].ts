// PUT /api/admin/nav/:id   - 更新菜单
// DELETE /api/admin/nav/:id - 删除菜单

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const id = Number(getRouterParam(event, 'id'))
  const prisma = usePrisma()

  if (event.method === 'PUT') {
    const body = await readBody(event)
    const { name, type, sortOrder, isVisible, parentId } = body
    const menu = await prisma.navMenu.update({
      where: { id },
      data: { name, type, sortOrder, isVisible, parentId },
    })
    return { code: 0, data: menu }
  }

  if (event.method === 'DELETE') {
    // 先删除关联的内容页
    await prisma.contentPage.deleteMany({ where: { menuId: id } })
    await prisma.navMenu.delete({ where: { id } })
    return { code: 0, message: '删除成功' }
  }
})
