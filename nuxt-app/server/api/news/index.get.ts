// GET /api/news - 新闻列表（支持分页和分类筛选）

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 10
  const category = query.category as string | undefined

  const prisma = usePrisma()

  const where = {
    isPublished: true,
    ...(category ? { category } : {}),
  }

  const [total, items] = await Promise.all([
    prisma.news.count({ where }),
    prisma.news.findMany({
      where,
      select: {
        id: true,
        title: true,
        summary: true,
        coverImage: true,
        category: true,
        publishedAt: true,
        viewCount: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return {
    code: 0,
    data: { items, total, page, limit, totalPages: Math.ceil(total / limit) },
  }
})
