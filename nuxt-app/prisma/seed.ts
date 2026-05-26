// prisma/seed.ts — 初始化数据库基础数据
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import pg from 'pg'
import { config } from 'dotenv'

config()

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])

async function main() {
  console.log('🌱 开始初始化种子数据...')

  // ── 管理员账号 ──────────────────────────────────────
  // 只在环境变量已配置且账号不存在时才创建，避免重复执行覆盖已修改的密码
  const adminUsername = process.env.INIT_ADMIN_USERNAME
  const adminPassword = process.env.INIT_ADMIN_PASSWORD

  if (adminUsername && adminPassword) {
    const exists = await prisma.adminUser.findUnique({ where: { username: adminUsername } })
    if (!exists) {
      const hash = await bcrypt.hash(adminPassword, 10)
      await prisma.adminUser.create({
        data: {
          username: adminUsername,
          passwordHash: hash,
          realName: '超级管理员',
          role: 'SUPER_ADMIN',
        },
      })
      console.log(`✅ 超级管理员账号已创建 (用户名: ${adminUsername})`)
    } else {
      console.log(`ℹ️  管理员账号 "${adminUsername}" 已存在，跳过创建`)
    }
  } else {
    console.log('⚠️  未检测到 INIT_ADMIN_USERNAME / INIT_ADMIN_PASSWORD 环境变量，跳过管理员账号初始化')
    console.log('   如需创建初始管理员，请在 .env 中配置这两个变量后重新执行 pnpm db:seed')
  }

  // ── 导航菜单 ──────────────────────────────────────
  const navData = [
    {
      name: '首页',
      slug: 'home',
      sortOrder: 0,
      children: [],
    },
    {
      name: '成果申报',
      slug: 'achievement',
      sortOrder: 1,
      children: [
        { name: '成果申报书', slug: 'achievement-application', sortOrder: 0 },
        { name: '成果总结报告', slug: 'achievement-report', sortOrder: 1 },
        { name: '成果附件材料', slug: 'achievement-attachments', sortOrder: 2 },
        { name: '应用证明', slug: 'achievement-proof', sortOrder: 3 },
      ],
    },
    {
      name: '图片视频',
      slug: 'media',
      sortOrder: 2,
      children: [
        { name: '宣传视频', slug: 'media-promo', sortOrder: 0 },
        { name: '教学视频', slug: 'media-teaching', sortOrder: 1 },
        { name: '活动视频', slug: 'media-activity', sortOrder: 2 },
        { name: '课堂实录', slug: 'media-classroom', sortOrder: 3 },
        { name: '相关图片', slug: 'media-images', sortOrder: 4 },
      ],
    },
    {
      name: '人才培养',
      slug: 'talent',
      sortOrder: 3,
      children: [
        { name: '人才培养方案', slug: 'talent-plan', sortOrder: 0 },
        { name: '学生成长全过程画像', slug: 'talent-portrait', sortOrder: 1 },
        { name: '评价标准', slug: 'talent-evaluation', sortOrder: 2 },
        { name: '智慧课程', slug: 'talent-smart-course', sortOrder: 3 },
        { name: '微专业', slug: 'talent-micro-major', sortOrder: 4 },
      ],
    },
    {
      name: '学生成果',
      slug: 'student',
      sortOrder: 4,
      children: [
        { name: '学科竞赛获奖', slug: 'student-competition', sortOrder: 0 },
        { name: '大创项目展示', slug: 'student-innovation', sortOrder: 1 },
        { name: '学生创新成果', slug: 'student-achievements', sortOrder: 2 },
      ],
    },
    {
      name: '媒体交流',
      slug: 'media-news',
      sortOrder: 5,
      children: [
        { name: '媒体报道', slug: 'media-coverage', sortOrder: 0 },
        { name: '高校交流访谈', slug: 'media-exchange', sortOrder: 1 },
        { name: '新闻稿', slug: 'media-press', sortOrder: 2 },
        { name: '杰出校友访谈', slug: 'media-alumni', sortOrder: 3 },
      ],
    },
    {
      name: '典型案例',
      slug: 'cases',
      sortOrder: 6,
      children: [
        { name: '杰出毕业生典型案例', slug: 'cases-graduate', sortOrder: 0 },
        { name: '企业导师风采', slug: 'cases-mentor', sortOrder: 1 },
        { name: '产业教授进课堂', slug: 'cases-professor', sortOrder: 2 },
      ],
    },
    {
      name: '产业合作',
      slug: 'industry',
      sortOrder: 7,
      children: [
        { name: '区域产业发展数据', slug: 'industry-data', sortOrder: 0 },
        { name: '产业-专业-课程映射图谱', slug: 'industry-mapping', sortOrder: 1 },
        { name: '厂中校/校中厂', slug: 'industry-factory-school', sortOrder: 2 },
        { name: '政校企深度合作', slug: 'industry-cooperation', sortOrder: 3 },
        { name: '合作案例展示', slug: 'industry-cases', sortOrder: 4 },
      ],
    },
    {
      name: '数字化平台',
      slug: 'digital',
      sortOrder: 8,
      children: [
        { name: '数字孪生虚拟仿真', slug: 'digital-simulation', sortOrder: 0 },
        { name: '智慧课程平台', slug: 'digital-smart-platform', sortOrder: 1 },
        { name: '未来学习中心', slug: 'digital-future-center', sortOrder: 2 },
      ],
    },
  ]

  for (const menu of navData) {
    const parent = await prisma.navMenu.upsert({
      where: { slug: menu.slug },
      update: { name: menu.name, sortOrder: menu.sortOrder },
      create: { name: menu.name, slug: menu.slug, sortOrder: menu.sortOrder },
    })

    for (const child of menu.children) {
      await prisma.navMenu.upsert({
        where: { slug: child.slug },
        update: { name: child.name, sortOrder: child.sortOrder, parentId: parent.id },
        create: { name: child.name, slug: child.slug, sortOrder: child.sortOrder, parentId: parent.id },
      })
    }
  }
  console.log('✅ 导航菜单初始化完成')

  // ── 首页配置 ──────────────────────────────────────
  const homeConfigs = [
    { configKey: 'hero_title', configValue: '某某高等职业技术学院\n教学成果奖申报平台', configType: 'text', label: '首页大标题' },
    { configKey: 'hero_subtitle', configValue: '聚焦教育教学改革创新，展示人才培养成效，打造产教融合示范高地，助力高水平职业技术大学建设', configType: 'text', label: '首页副标题' },
    { configKey: 'hero_video', configValue: '', configType: 'video', label: '宣传视频URL' },
    { configKey: 'hero_cover', configValue: '', configType: 'image', label: '视频封面图URL' },
  ]

  for (const cfg of homeConfigs) {
    await prisma.homeConfig.upsert({
      where: { configKey: cfg.configKey },
      update: {},
      create: cfg,
    })
  }
  console.log('✅ 首页配置初始化完成')

  // ── 核心统计数据 ──────────────────────────────────
  const stats = [
    { label: '省级教学成果奖', value: '12项', icon: 'lucide:trophy', sortOrder: 0 },
    { label: '国家级项目立项', value: '8项', icon: 'lucide:star', sortOrder: 1 },
    { label: '受益学生人数', value: '12,000+', icon: 'lucide:users', sortOrder: 2 },
    { label: '合作企业数量', value: '60+', icon: 'lucide:building-2', sortOrder: 3 },
    { label: '校企合作课程', value: '48门', icon: 'lucide:book-open', sortOrder: 4 },
    { label: '毕业生就业率', value: '98.2%', icon: 'lucide:bar-chart-2', sortOrder: 5 },
  ]

  // 清空旧数据再插入，避免重复
  await prisma.homeStat.deleteMany()
  await prisma.homeStat.createMany({ data: stats })
  console.log('✅ 首页统计数据初始化完成')

  // ── 示例新闻 ──────────────────────────────────────
  const newsList = [
    {
      title: '我校荣获四川省高等职业教育教学成果奖一等奖',
      summary: '近日，四川省教育厅公布2024年省级高等职业教育教学成果奖评选结果，我校"产教深度融合、数字赋能育人"成果荣获一等奖。',
      content: '<p>近日，四川省教育厅公布2024年省级高等职业教育教学成果奖评选结果，我校"产教深度融合、数字赋能育人"成果荣获一等奖。</p><p>该成果由教务处联合二级学院历时三年研究实践，聚焦区域产业链发展需求，构建了"课证赛融通"人才培养新模式，在全省职业教育领域具有重要示范意义。</p>',
      category: '获奖公告',
      isPublished: true,
      publishedAt: new Date('2024-12-15'),
      sortOrder: 0,
    },
    {
      title: '兄弟院校来访交流，共探产教融合新路径',
      summary: '本周，来自全国5所兄弟院校的教学团队莅临我校参观交流，重点考察了"校中厂"实训基地建设成效。',
      content: '<p>本周，来自全国5所兄弟院校的教学团队莅临我校参观交流，重点考察了"校中厂"实训基地建设成效和智慧课程平台应用情况。</p><p>交流团队对我校产教融合模式给予高度评价，认为该模式为高职院校人才培养改革提供了宝贵经验。</p>',
      category: '合作交流',
      isPublished: true,
      publishedAt: new Date('2024-12-10'),
      sortOrder: 1,
    },
    {
      title: '2024年学科竞赛颁奖典礼圆满举行',
      summary: '我校2024年度学科竞赛颁奖典礼在大礼堂隆重举行，全年累计获得省级以上奖项86项。',
      content: '<p>我校2024年度学科竞赛颁奖典礼在大礼堂隆重举行，全年累计获得省级以上奖项86项，其中国家级奖项12项。</p>',
      category: '校园动态',
      isPublished: true,
      publishedAt: new Date('2024-12-05'),
      sortOrder: 2,
    },
    {
      title: '《四川日报》专题报道我校产教融合育人成效',
      summary: '近日，《四川日报》以"数字赋能，产教融合育新才"为题，对我校教学改革成果进行了深度报道。',
      content: '<p>近日，《四川日报》以"数字赋能，产教融合育新才"为题，对我校教学改革成果进行了深度报道，详细介绍了学校在专业建设、课程改革、实训条件建设等方面取得的突出成就。</p>',
      category: '媒体报道',
      isPublished: true,
      publishedAt: new Date('2024-11-28'),
      sortOrder: 3,
    },
  ]

  for (const news of newsList) {
    await prisma.news.create({ data: news }).catch(() => {})
  }
  console.log('✅ 示例新闻数据创建完成')

  console.log('\n🎉 种子数据初始化完成！')
  console.log('   如需登录管理后台，请使用初始化时配置的 INIT_ADMIN_USERNAME / INIT_ADMIN_PASSWORD')
}

main()
  .catch(e => { console.error('❌ 种子数据错误:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
