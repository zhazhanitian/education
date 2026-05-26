// GET /api/nav - 获取完整导航树

export default defineEventHandler(async () => {
  const prisma = usePrisma()

  const menus = await prisma.navMenu.findMany({
    where: { isVisible: true, parentId: null },
    orderBy: { sortOrder: 'asc' },
    include: {
      children: {
        where: { isVisible: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  return { code: 0, data: menus }
})
