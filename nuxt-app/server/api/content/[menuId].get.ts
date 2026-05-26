// GET /api/content/:menuId - 根据菜单ID获取内容页

export default defineEventHandler(async (event) => {
  const menuId = Number(getRouterParam(event, 'menuId'))
  const prisma = usePrisma()

  const page = await prisma.contentPage.findUnique({
    where: { menuId },
    include: {
      menu: {
        select: {
          id: true,
          name: true,
          parentId: true,
          parent: { select: { id: true, name: true } },
        },
      },
      files: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!page) {
    throw createError({ statusCode: 404, message: '该菜单暂无内容' })
  }

  return { code: 0, data: page }
})
