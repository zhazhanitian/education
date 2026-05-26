// GET  /api/admin/nav        - 获取所有菜单（树形）
// POST /api/admin/nav        - 创建菜单

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const prisma = usePrisma()

  if (event.method === 'GET') {
    const menus = await prisma.navMenu.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: {
          orderBy: { sortOrder: 'asc' },
          include: {
            pages: { select: { id: true } },
          },
        },
        pages: { select: { id: true } },
      },
    })
    return { code: 0, data: menus }
  }

  if (event.method === 'POST') {
    const body = await readBody(event)
    const { name, type, sortOrder, isVisible, parentId } = body
    const menu = await prisma.navMenu.create({
      data: { name, type: type || 'PAGE', sortOrder: sortOrder || 0, isVisible: isVisible !== false, parentId: parentId || null },
    })
    return { code: 0, data: menu }
  }
})
