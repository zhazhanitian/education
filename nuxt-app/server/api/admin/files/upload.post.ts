// POST /api/admin/files/upload - 管理员上传文件
import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'
import { randomUUID } from 'crypto'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads'
const MAX_SIZE = 100 * 1024 * 1024 // 100MB

const EXT_TYPE_MAP: Record<string, string> = {
  '.pdf': 'PDF',
  '.doc': 'WORD',
  '.docx': 'WORD',
  '.xls': 'OTHER',
  '.xlsx': 'OTHER',
  '.ppt': 'OTHER',
  '.pptx': 'OTHER',
  '.jpg': 'IMAGE',
  '.jpeg': 'IMAGE',
  '.png': 'IMAGE',
  '.gif': 'IMAGE',
  '.webp': 'IMAGE',
  '.mp4': 'VIDEO',
  '.mov': 'VIDEO',
  '.avi': 'VIDEO',
  '.webm': 'VIDEO',
}

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const formData = await readFormData(event)
  const file = formData.get('file') as File | null
  const pageId = formData.get('pageId') ? Number(formData.get('pageId')) : undefined

  if (!file || !file.name) throw createError({ statusCode: 400, message: '未上传文件' })
  if (file.size > MAX_SIZE) throw createError({ statusCode: 413, message: '文件大小超过 100MB 限制' })

  const ext = extname(file.name).toLowerCase()
  const fileName = `${randomUUID()}${ext}`
  const subDir = new Date().toISOString().slice(0, 7) // YYYY-MM
  const dir = join(UPLOAD_DIR, subDir)

  await mkdir(dir, { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(join(dir, fileName), buffer)

  const url = `/uploads/${subDir}/${fileName}`
  const fileType = (EXT_TYPE_MAP[ext] || 'OTHER') as 'PDF' | 'WORD' | 'IMAGE' | 'VIDEO' | 'OTHER'

  const prisma = usePrisma()
  const record = await prisma.pageFile.create({
    data: {
      fileName,
      originalName: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      url,
      fileType,
      ...(pageId ? { pageId } : {}),
    },
  })

  return { code: 0, data: record }
})
