// GET  /api/admin/content       - 内容页列表（分页）
// POST /api/admin/content       - 创建内容页（每个菜单项一个，用 menuId 关联）

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const prisma = usePrisma()

  if (event.method === 'GET') {
    const q = getQuery(event)
    const page = Number(q.page) || 1
    const limit = Number(q.limit) || 20

    const [total, items] = await Promise.all([
      prisma.contentPage.count(),
      prisma.contentPage.findMany({
        include: {
          menu: { select: { id: true, name: true } },
          files: { select: { id: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    return { code: 0, data: { items, total, page, limit } }
  }

  if (event.method === 'POST') {
    const body = await readBody(event)
    const { fileIds, ...pageData } = body
    // 检查该菜单是否已有内容页
    const existing = await prisma.contentPage.findUnique({
      where: { menuId: pageData.menuId },
    })
    if (existing) {
      throw createError({ statusCode: 400, message: '该菜单已有内容页，请直接编辑' })
    }
    const contentPage = await prisma.contentPage.create({ data: pageData })
    // 关联已上传的文件
    if (Array.isArray(fileIds) && fileIds.length > 0) {
      await prisma.pageFile.updateMany({
        where: { id: { in: fileIds } },
        data: { pageId: contentPage.id },
      })
    }
    return { code: 0, data: contentPage }
  }
})
