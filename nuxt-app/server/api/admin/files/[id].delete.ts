// DELETE /api/admin/files/:id - 删除文件记录
import { unlink } from 'fs/promises'
import { join } from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads'

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, message: '缺少文件 ID' })

  const prisma = usePrisma()
  const file = await prisma.pageFile.findUnique({ where: { id } })
  if (!file) throw createError({ statusCode: 404, message: '文件不存在' })

  // 删除磁盘文件（忽略不存在的错误）
  try {
    const relativePath = file.url.replace('/uploads/', '')
    await unlink(join(UPLOAD_DIR, relativePath))
  } catch {
    // 文件可能已不存在，忽略
  }

  await prisma.pageFile.delete({ where: { id } })
  return { code: 0, message: '删除成功' }
})
