import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

declare global {
  // eslint-disable-next-line no-var
  var __prismaPool: pg.Pool | undefined
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

function createPrisma(): PrismaClient {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('环境变量 DATABASE_URL 未配置，请检查 .env 文件')
  }

  // 复用连接池，避免每次重建
  if (!globalThis.__prismaPool) {
    globalThis.__prismaPool = new pg.Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })

    // 连接池出错时清空单例，下次请求时重新创建
    globalThis.__prismaPool.on('error', () => {
      globalThis.__prisma = undefined
      globalThis.__prismaPool = undefined
    })
  }

  const adapter = new PrismaPg(globalThis.__prismaPool)
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])
}

export function usePrisma(): PrismaClient {
  if (!globalThis.__prisma) {
    globalThis.__prisma = createPrisma()
  }
  return globalThis.__prisma
}
