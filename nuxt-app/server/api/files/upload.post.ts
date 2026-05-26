// POST /api/files/upload - 文件上传
import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'
import { randomUUID } from 'crypto'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads'
const MAX_SIZE = 50 * 1024 * 1024 // 50MB

const MIME_MAP: Record<string, string> = {
  '.pdf': 'PDF',
  '.doc': 'WORD',
  '.docx': 'WORD',
  '.jpg': 'IMAGE',
  '.jpeg': 'IMAGE',
  '.png': 'IMAGE',
  '.gif': 'IMAGE',
  '.mp4': 'VIDEO',
  '.mov': 'VIDEO',
}

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const formData = await readFormData(event)
  const file = formData.get('file') as File | null

  if (!file) throw createError({ statusCode: 400, message: '未上传文件' })
  if (file.size > MAX_SIZE) throw createError({ statusCode: 413, message: '文件大小超过 50MB 限制' })

  const ext = extname(file.name).toLowerCase()
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
