// GET /api/home - 首页所有配置（统计数据 + 配置项）

export default defineEventHandler(async () => {
  const prisma = usePrisma()

  const [configs, stats] = await Promise.all([
    prisma.homeConfig.findMany(),
    prisma.homeStat.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  // 将配置转为 key-value 对象
  const configMap = configs.reduce(
    (acc, c) => ({ ...acc, [c.configKey]: c.configValue }),
    {} as Record<string, string>,
  )

  return { code: 0, data: { config: configMap, stats } }
})
