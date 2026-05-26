// GET/PUT/DELETE /api/admin/news/:id

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const id = Number(getRouterParam(event, 'id'))
  const prisma = usePrisma()

  if (event.method === 'GET') {
    const news = await prisma.news.findUnique({ where: { id } })
    if (!news) throw createError({ statusCode: 404, message: '不存在' })
    return { code: 0, data: news }
  }
  if (event.method === 'PUT') {
    const body = await readBody(event)
    const news = await prisma.news.update({ where: { id }, data: body })
    return { code: 0, data: news }
  }
  if (event.method === 'DELETE') {
    await prisma.news.delete({ where: { id } })
    return { code: 0, message: '删除成功' }
  }
})
