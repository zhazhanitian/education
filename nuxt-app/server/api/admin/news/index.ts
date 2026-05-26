// GET /api/admin/news       - 新闻列表
// POST /api/admin/news      - 创建新闻

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const prisma = usePrisma()

  if (event.method === 'GET') {
    const q = getQuery(event)
    const page = Number(q.page) || 1
    const limit = Number(q.limit) || 20

    const [total, items] = await Promise.all([
      prisma.news.count(),
      prisma.news.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])
    return { code: 0, data: { items, total, page, limit } }
  }

  if (event.method === 'POST') {
    const body = await readBody(event)
    const news = await prisma.news.create({ data: body })
    return { code: 0, data: news }
  }
})
