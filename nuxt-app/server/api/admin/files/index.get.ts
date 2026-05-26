// GET /api/admin/files — 已上传文件列表

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const q = getQuery(event)
  const page = Number(q.page) || 1
  const limit = Number(q.limit) || 30

  const prisma = usePrisma()
  const [total, items] = await Promise.all([
    prisma.pageFile.count(),
    prisma.pageFile.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return { code: 0, data: { items, total } }
})
