// GET /api/files/preview?url=/uploads/... - 代理返回 PDF 文件用于 iframe 预览
import { readFile } from 'fs/promises'
import { join } from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const fileUrl = query.url as string

  if (!fileUrl || !fileUrl.startsWith('/uploads/')) {
    throw createError({ statusCode: 400, message: '非法文件路径' })
  }

  // 防路径穿越
  const relativePath = fileUrl.replace('/uploads/', '')
  if (relativePath.includes('..')) {
    throw createError({ statusCode: 400, message: '非法路径' })
  }

  const filePath = join(UPLOAD_DIR, relativePath)

  try {
    const buffer = await readFile(filePath)
    setHeader(event, 'Content-Type', 'application/pdf')
    setHeader(event, 'Content-Disposition', 'inline')
    return buffer
  } catch {
    throw createError({ statusCode: 404, message: '文件不存在' })
  }
})
