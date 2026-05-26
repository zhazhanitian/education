// GET  /api/admin/home - 获取首页配置（含统计）
// PUT  /api/admin/home - 批量更新首页配置

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const prisma = usePrisma()

  if (event.method === 'GET') {
    const [configs, stats] = await Promise.all([
      prisma.homeConfig.findMany(),
      prisma.homeStat.findMany({ orderBy: { sortOrder: 'asc' } }),
    ])
    return { code: 0, data: { configs, stats } }
  }

  if (event.method === 'PUT') {
    const body = await readBody<{ configs?: Record<string, string>; stats?: Array<{id: number; label: string; value: string; icon: string; sortOrder: number; isVisible: boolean}> }>(event)

    if (body.configs) {
      await Promise.all(
        Object.entries(body.configs).map(([key, value]) =>
          prisma.homeConfig.updateMany({ where: { configKey: key }, data: { configValue: value } }),
        ),
      )
    }

    if (body.stats) {
      await Promise.all(
        body.stats.map((s) =>
          prisma.homeStat.update({
            where: { id: s.id },
            data: { label: s.label, value: s.value, icon: s.icon, sortOrder: s.sortOrder, isVisible: s.isVisible },
          }),
        ),
      )
    }

    return { code: 0, message: '更新成功' }
  }
})
