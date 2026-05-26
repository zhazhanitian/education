// GET /api/news/:id - 新闻详情

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const prisma = usePrisma()

  const news = await prisma.news.findUnique({
    where: { id, isPublished: true },
  })

  if (!news) throw createError({ statusCode: 404, message: '新闻不存在' })

  // 增加浏览量
  await prisma.news.update({ where: { id }, data: { viewCount: { increment: 1 } } })

  return { code: 0, data: news }
})
