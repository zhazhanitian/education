// GET /api/admin/content/:id    - 内容页详情
// PUT /api/admin/content/:id    - 更新内容页
// DELETE /api/admin/content/:id - 删除内容页

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const id = Number(getRouterParam(event, 'id'))
  const prisma = usePrisma()

  if (event.method === 'GET') {
    const page = await prisma.contentPage.findUnique({
      where: { id },
      include: { files: true, menu: true },
    })
    if (!page) throw createError({ statusCode: 404, message: '不存在' })
    return { code: 0, data: page }
  }

  if (event.method === 'PUT') {
    const body = await readBody(event)
    const { fileIds, ...pageData } = body
    const page = await prisma.contentPage.update({ where: { id }, data: pageData })
    // 关联新上传的文件（fileIds 中未关联的）
    if (Array.isArray(fileIds) && fileIds.length > 0) {
      await prisma.pageFile.updateMany({
        where: { id: { in: fileIds } },
        data: { pageId: id },
      })
    }
    return { code: 0, data: page }
  }

  if (event.method === 'DELETE') {
    await prisma.contentPage.delete({ where: { id } })
    return { code: 0, message: '删除成功' }
  }
})
