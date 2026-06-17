// POST /api/files/upload - 文件上传
import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'
import { randomUUID } from 'crypto'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads'
const MAX_SIZE = 100 * 1024 * 1024 // 100MB

// 根据校方版权保护要求，仅允许上传 PDF、图片、视频三类文件
const MIME_MAP: Record<string, string> = {
  '.pdf': 'PDF',
  '.jpg': 'IMAGE',
  '.jpeg': 'IMAGE',
  '.png': 'IMAGE',
  '.gif': 'IMAGE',
  '.webp': 'IMAGE',
  '.mp4': 'VIDEO',
  '.mov': 'VIDEO',
  '.webm': 'VIDEO',
}

const ALLOWED_EXTS = new Set(Object.keys(MIME_MAP))

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const formData = await readFormData(event)
  const file = formData.get('file') as File | null

  if (!file) throw createError({ statusCode: 400, message: '未上传文件' })

  const ext = extname(file.name).toLowerCase()
  if (!ALLOWED_EXTS.has(ext)) {
    throw createError({ statusCode: 415, message: '不支持的文件类型，仅允许 PDF、图片（jpg/png/gif/webp）、视频（mp4/mov/webm）' })
  }
  if (file.size > MAX_SIZE) throw createError({ statusCode: 413, message: '文件大小超过 100MB 限制' })

  const fileName = `${randomUUID()}${ext}`
  const subDir = new Date().toISOString().slice(0, 7) // YYYY-MM
  const dir = join(UPLOAD_DIR, subDir)

  await mkdir(dir, { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(join(dir, fileName), buffer)

  const url = `/uploads/${subDir}/${fileName}`
  const fileType = (MIME_MAP[ext] || 'OTHER') as 'PDF' | 'WORD' | 'IMAGE' | 'VIDEO' | 'OTHER'

  const prisma = usePrisma()
  const record = await prisma.pageFile.create({
    data: {
      fileName,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      url,
      fileType,
    },
  })

  return { code: 0, data: record }
})
