import { defineConfig } from 'prisma/config'
import { config } from 'dotenv'

// Prisma 7 CLI 不自动加载 .env，需要手动加载
config()

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL
  }
})
