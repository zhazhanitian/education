# ── 构建阶段 ──────────────────────────────────────
FROM node:22-alpine AS builder

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@11.1.3 --activate

WORKDIR /app

# 先复制依赖文件利用缓存
COPY .npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# 复制源码
COPY . .

# 生成 Prisma Client
RUN pnpm exec prisma generate

# 构建 Nuxt
RUN pnpm run build

# ── 运行阶段 ──────────────────────────────────────
FROM node:22-alpine AS runner

RUN corepack enable && corepack prepare pnpm@11.1.3 --activate

WORKDIR /app

# 只复制运行时必需文件
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules/.pnpm ./node_modules/.pnpm
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# 创建上传目录
RUN mkdir -p /app/public/uploads

EXPOSE 3000

# 启动：先执行数据库 push + seed，然后启动服务
CMD sh -c "node_modules/.bin/prisma db push --skip-generate && node_modules/.bin/prisma db seed 2>/dev/null || true && node .output/server/index.mjs"
