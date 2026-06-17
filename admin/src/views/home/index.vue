<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import { request } from '@/service/request'

const router = useRouter()
const authStore = useAuthStore()

const userName = computed(() => authStore.userInfo.userName || '管理员')

// 统计数据
const stats = ref({ news: 0, content: 0, files: 0 })
const loadingStats = ref(true)

// 最近新闻
interface NewsItem { id: number; title: string; category: string; publishedAt: string; isPublished: boolean }
const recentNews = ref<NewsItem[]>([])
const loadingNews = ref(true)

// 快捷入口
const allQuickLinks = [
  { label: '导航菜单', icon: 'ic:round-menu', color: '#1B2B4B', route: '/cms/nav', roles: ['R_SUPER', 'R_ADMIN'] },
  { label: '页面内容', icon: 'ic:round-article', color: '#B01C1C', route: '/cms/content', roles: [] },
  { label: '新闻动态', icon: 'ic:round-newspaper', color: '#0891b2', route: '/cms/news', roles: [] },
  { label: '文件管理', icon: 'ic:round-folder', color: '#7c3aed', route: '/config/files', roles: ['R_SUPER', 'R_ADMIN'] },
  { label: '首页配置', icon: 'ic:round-settings', color: '#15803d', route: '/config/home', roles: ['R_SUPER', 'R_ADMIN'] },
  { label: '用户管理', icon: 'ic:round-manage-accounts', color: '#b45309', route: '/manage/users', roles: ['R_SUPER', 'R_ADMIN'] },
]

// roles 为空数组表示所有人可见，否则取交集
const quickLinks = computed(() =>
  allQuickLinks.filter(link =>
    link.roles.length === 0 || link.roles.some(r => authStore.userInfo.roles.includes(r))
  )
)

function getHour() {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 12) return '上午好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
}

const today = computed(() => {
  const d = new Date()
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`
})

async function loadData() {
  // 并行请求统计和新闻
  const [newsRes, contentRes, filesRes, recentRes] = await Promise.allSettled([
    request<{ total: number }>({ url: '/news', params: { page: 1, limit: 1 } }),
    request<{ total: number }>({ url: '/content', params: { page: 1, limit: 1 } }),
    request<{ total: number }>({ url: '/files', params: { page: 1, limit: 1 } }),
    request<{ items: NewsItem[] }>({ url: '/news', params: { page: 1, limit: 6 } }),
  ])

  if (newsRes.status === 'fulfilled' && newsRes.value.data) {
    stats.value.news = (newsRes.value.data as any).total ?? 0
  }
  if (contentRes.status === 'fulfilled' && contentRes.value.data) {
    stats.value.content = (contentRes.value.data as any).total ?? 0
  }
  if (filesRes.status === 'fulfilled' && filesRes.value.data) {
    stats.value.files = (filesRes.value.data as any).total ?? 0
  }
  loadingStats.value = false

  if (recentRes.status === 'fulfilled' && recentRes.value.data) {
    recentNews.value = (recentRes.value.data as any).items ?? []
  }
  loadingNews.value = false
}

const CATEGORY_COLOR: Record<string, string> = {
  获奖公告: '#c0392b',
  媒体报道: '#9B1B1B',
  高校交流: '#0891b2',
  学生成果: '#15803d',
  校园动态: '#7c3aed',
}

function formatDate(d?: string | null) {
  if (!d) return ''
  return d.slice(0, 10)
}

onMounted(loadData)
</script>

<template>
  <div class="space-y-5">

    <!-- 欢迎横幅 -->
    <NCard :bordered="false" class="card-wrapper overflow-hidden" content-style="padding:0">
      <div class="relative flex items-center justify-between px-8 py-6"
        style="background: linear-gradient(135deg, #1B2B4B 0%, #2d4a7a 60%, #B01C1C 100%);">
        <!-- 装饰圆 -->
        <div class="absolute right-32 top-0 size-40 rounded-full opacity-10"
          style="background:white;transform:translateY(-40%)" />
        <div class="absolute right-12 bottom-0 size-24 rounded-full opacity-10"
          style="background:white;transform:translateY(40%)" />

        <div class="relative z-10">
          <p class="text-white/70 text-sm mb-1">{{ today }}</p>
          <h2 class="text-white text-2xl font-bold mb-1">{{ getHour() }}，{{ userName }}</h2>
          <p class="text-white/60 text-sm">欢迎使用 教学成果奖申报平台 管理后台</p>
        </div>
        <div class="relative z-10 hidden md:flex items-center gap-3">
          <div class="text-right text-white/80 text-sm">
            <p class="text-lg font-semibold text-white">教学成果奖</p>
            <p class="text-xs text-white/50">申报展示平台 · 内容管理系统</p>
          </div>
          <div class="size-14 rounded-full bg-white/20 flex items-center justify-center">
            <SvgIcon icon="ic:round-school" class="text-white text-3xl" />
          </div>
        </div>
      </div>
    </NCard>

    <!-- 统计卡片 -->
    <NGrid :x-gap="16" :y-gap="16" responsive="screen" cols="2 m:3 l:3">
      <NGi>
        <NCard :bordered="false" class="card-wrapper" content-style="padding:20px">
          <NSkeleton v-if="loadingStats" text :repeat="2" />
          <div v-else class="flex items-center gap-4">
            <div class="size-12 rounded-xl flex items-center justify-center shrink-0"
              style="background:#FEF2F2">
              <SvgIcon icon="ic:round-newspaper" class="text-2xl" style="color:#B01C1C" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-800">{{ stats.news }}</p>
              <p class="text-sm text-gray-500 mt-0.5">新闻动态</p>
            </div>
          </div>
        </NCard>
      </NGi>
      <NGi>
        <NCard :bordered="false" class="card-wrapper" content-style="padding:20px">
          <NSkeleton v-if="loadingStats" text :repeat="2" />
          <div v-else class="flex items-center gap-4">
            <div class="size-12 rounded-xl flex items-center justify-center shrink-0"
              style="background:#EFF3FB">
              <SvgIcon icon="ic:round-article" class="text-2xl" style="color:#1B2B4B" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-800">{{ stats.content }}</p>
              <p class="text-sm text-gray-500 mt-0.5">内容页面</p>
            </div>
          </div>
        </NCard>
      </NGi>
      <NGi>
        <NCard :bordered="false" class="card-wrapper" content-style="padding:20px">
          <NSkeleton v-if="loadingStats" text :repeat="2" />
          <div v-else class="flex items-center gap-4">
            <div class="size-12 rounded-xl flex items-center justify-center shrink-0"
              style="background:#F5F3FF">
              <SvgIcon icon="ic:round-folder" class="text-2xl" style="color:#7c3aed" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-800">{{ stats.files }}</p>
              <p class="text-sm text-gray-500 mt-0.5">上传文件</p>
            </div>
          </div>
        </NCard>
      </NGi>
    </NGrid>

    <NGrid :x-gap="16" :y-gap="16" responsive="screen" cols="1 m:3 l:3">

      <!-- 最近新闻 -->
      <NGi span="1 m:2 l:2">
        <NCard title="最近新闻" :bordered="false" class="card-wrapper h-full" size="small">
          <template #header-extra>
            <NButton text type="primary" size="small" @click="router.push('/cms/news')">
              查看全部
            </NButton>
          </template>
          <NSkeleton v-if="loadingNews" text :repeat="5" />
          <div v-else-if="recentNews.length === 0" class="py-8 text-center text-gray-400 text-sm">
            暂无新闻
          </div>
          <div v-else class="divide-y divide-gray-100">
            <div
              v-for="item in recentNews"
              :key="item.id"
              class="flex items-center gap-3 py-3 cursor-pointer hover:bg-gray-50 -mx-4 px-4 transition-colors"
              @click="router.push(`/cms/news`)"
            >
              <span
                v-if="item.category"
                class="shrink-0 text-[11px] font-medium px-1.5 py-0.5 rounded"
                :style="{
                  backgroundColor: (CATEGORY_COLOR[item.category] || '#999') + '18',
                  color: CATEGORY_COLOR[item.category] || '#999'
                }"
              >{{ item.category }}</span>
              <span class="flex-1 text-sm text-gray-700 truncate">{{ item.title }}</span>
              <span class="shrink-0 text-xs text-gray-400">{{ formatDate(item.publishedAt) }}</span>
              <span
                class="shrink-0 text-[10px] px-1.5 py-0.5 rounded"
                :class="item.isPublished ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'"
              >{{ item.isPublished ? '已发布' : '草稿' }}</span>
            </div>
          </div>
        </NCard>
      </NGi>

      <!-- 快捷入口 -->
      <NGi span="1 m:1 l:1">
        <NCard title="快捷入口" :bordered="false" class="card-wrapper h-full" size="small">
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="link in quickLinks"
              :key="link.route"
              class="flex flex-col items-center justify-center gap-2 py-4 rounded-xl cursor-pointer border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
              @click="router.push(link.route)"
            >
              <div class="size-10 rounded-lg flex items-center justify-center"
                :style="{ backgroundColor: link.color + '15' }">
                <SvgIcon :icon="link.icon" class="text-xl" :style="{ color: link.color }" />
              </div>
              <span class="text-xs text-gray-600 font-medium">{{ link.label }}</span>
            </div>
          </div>
        </NCard>
      </NGi>
    </NGrid>

  </div>
</template>

<style scoped></style>
