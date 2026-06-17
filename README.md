# 教学成果奖申报平台

高校教学成果奖申报展示平台，政务高校风格，支持导航菜单动态配置、富文本内容、PDF/Word 文件预览。

## 技术栈

| 模块 | 技术 |
|------|------|
| 用户端 + API | Nuxt 3 + NuxtUI v4 + Tailwind CSS v4 |
| 管理后台 | SoybeanAdmin v2 + Naive UI |
| 数据库 | PostgreSQL 16 + Prisma ORM |
| 部署 | Docker Compose + Nginx |

## 目录结构

```
.
├── nuxt-app/          # Nuxt 3 用户端 + 后端 API
├── admin/             # SoybeanAdmin 管理后台
├── nginx/             # Nginx 反向代理配置
├── postgres/init/     # 数据库初始化脚本
├── docker-compose.yml # 一键部署
└── .env.example       # 环境变量模板
```

## 数据库初始化说明

`postgres/init/` 目录下的 SQL 脚本会被 PostgreSQL 官方镜像在**数据卷首次创建时**自动执行（通过 Docker 的 `/docker-entrypoint-initdb.d` 机制），**无需手动运行**。

| 文件 | 作用 |
|------|------|
| `01_seed.sql` | 写入初始导航菜单、首页配置、核心统计数据、超管账号占位符 |

> **注意事项**
> - 脚本仅在数据卷**第一次初始化**时执行。如果 `postgres_data` 卷已存在，重启容器不会重复执行。
> - 表结构（DDL）由 Prisma 在应用启动时通过 `pnpm db:push` / `prisma migrate` 管理，`init/` 目录只负责种子数据（DML）。
> - 换服务器部署时，若需要重新初始化，删除旧数据卷即可：
>   ```bash
>   docker compose down -v   # -v 同时删除数据卷，触发下次启动重新初始化
>   docker compose up -d --build
>   ```
> - 超管账号 `admin` 的密码占位符 `$2b$10$placeholder_replace_on_first_login` 需要应用层在首次登录时完成 bcrypt 替换，**切勿直接用于生产**，首次部署后请立即通过管理后台修改密码。

## 快速部署（生产）

```bash
# 1. 复制环境变量文件并修改密码
cp .env.example .env
# 编辑 .env，修改 POSTGRES_PASSWORD 和 JWT_SECRET

# 2. 一键启动
docker compose up -d --build

# 访问地址：
# 用户端：http://your-server-ip/
# 管理后台：http://your-server-ip/admin/
# 管理员账号：admin / Admin@2024（首次部署后请立即修改密码）
```

## 本地开发

```bash
# 启动数据库
docker compose up postgres -d

# Nuxt 用户端
cd nuxt-app
pnpm install
cp .env.example .env          # 填入数据库密码和初始管理员密码
pnpm db:push                   # 同步数据库表结构
pnpm db:seed                   # 写入初始数据（含初始管理员账号）
pnpm dev                       # http://localhost:3000

# SoybeanAdmin 管理后台
cd ../admin
pnpm install
pnpm dev                        # http://localhost:9527
```

## 管理后台功能

- **导航菜单管理**：增删改查一/二级菜单，拖拽排序，显示/隐藏控制
- **内容页管理**：支持富文本、文件预览（PDF/Word）、混合三种类型
- **新闻管理**：发布/草稿，分类，封面图，富文本正文
- **首页配置**：Hero 标题/副标题/视频、核心统计数据可视化配置
- **文件管理**：上传 PDF/Word/图片/视频，复制链接供内容页使用

## 页面路由

| 路径 | 说明 |
|------|------|
| `/` | 首页 |
| `/c/:slug` | 内容页（二级菜单页面） |
| `/news` | 新闻动态列表 |
| `/news/:id` | 新闻详情 |
| `/admin/` | 管理后台（SoybeanAdmin） |
