<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({ title: '新闻动态 - 教学成果奖申报平台' })

interface NewsItem {
  id: number
  title: string
  summary?: string
  category?: string
  publishedAt?: string
  viewCount?: number
}

const CATEGORIES = ['全部', '媒体报道', '获奖公告', '高校交流', '学生成果', '校园动态']
const CATEGORY_COLOR: Record<string, string> = {
  获奖公告: '#c0392b',
  媒体报道: '#9B1B1B',
  高校交流: '#0891b2',
  学生成果: '#15803d',
  校园动态: '#7c3aed',
}

const activeCategory = ref('全部')
const page = ref(1)
const pageSize = 12

const { data, pending, refresh } = await useFetch('/api/news', {
  query: computed(() => ({
    page: page.value,
    limit: pageSize,
    category: activeCategory.value === '全部' ? undefined : activeCategory.value,
  })),
})

const newsList = computed<NewsItem[]>(() => data.value?.data?.items ?? [])
const total = computed(() => data.value?.data?.total ?? 0)
const totalPages = computed(() => Math.ceil(total.value / pageSize))

function switchCategory(cat: string) {
  activeCategory.value = cat
  page.value = 1
}

function formatDate(d?: string) {
  if (!d) return ''
  const date = new Date(d)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}
</script>

<template>
  <div>
    <!-- 页面顶部横幅 -->
    <div class="bg-[#B01C1C] py-10">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex items-center gap-2 text-red-300 text-xs mb-3">
          <NuxtLink to="/" class="hover:text-white transition-colors">首页</NuxtLink>
          <UIcon name="lucide:chevron-right" class="text-xs opacity-60" />
          <span class="text-white/60">新闻动态</span>
        </div>
        <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">新闻动态</h1>
        <p class="text-red-300 text-sm">聚焦媒体报道、获奖公告、校园动态等最新资讯</p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-6 py-10">
      <div class="flex flex-col lg:flex-row gap-8">

        <!-- 左侧主内容 -->
        <div class="flex-1 min-w-0">

          <!-- 分类筛选 -->
          <div class="flex flex-wrap gap-2 mb-8">
            <button
              v-for="cat in CATEGORIES"
              :key="cat"
              class="px-4 py-2 text-sm rounded-lg border transition-all font-medium"
              :class="activeCategory === cat
                ? 'bg-[#B01C1C] text-white border-[#B01C1C] shadow-sm'
                : 'text-gray-600 border-gray-200 hover:border-[#B01C1C]/50 hover:text-[#B01C1C] bg-white'"
              @click="switchCategory(cat)"
            >
              {{ cat }}
            </button>
          </div>

          <!-- 加载中 -->
          <div v-if="pending" class="flex items-center justify-center py-24">
            <UIcon name="lucide:loader-circle" class="text-[#1B2B4B] text-3xl animate-spin" />
          </div>

          <!-- 无数据 -->
          <div v-else-if="!newsList.length" class="flex flex-col items-center justify-center py-24 text-gray-400">
            <UIcon name="lucide:newspaper" class="text-6xl text-gray-200 mb-4" />
            <p class="text-sm">暂无相关动态，请通过管理后台发布新闻</p>
          </div>

          <!-- 新闻卡片列表 -->
          <div v-else class="space-y-4">
            <NuxtLink
              v-for="item in newsList"
              :key="item.id"
              :to="`/news/${item.id}`"
              class="group flex gap-5 p-5 bg-white rounded-xl border border-gray-100 hover:shadow-lg hover:border-[#1B2B4B]/20 hover:-translate-y-0.5 transition-all duration-300"
            >
              <!-- 日期块 -->
              <div class="flex-shrink-0 w-14 text-center pt-0.5">
                <div class="text-2xl font-bold text-[#1B2B4B] leading-none">
                  {{ item.publishedAt ? new Date(item.publishedAt).getDate() : '--' }}
                </div>
                <div class="text-xs text-gray-400 mt-1">
                  {{ item.publishedAt ? `${new Date(item.publishedAt).getFullYear()}/${String(new Date(item.publishedAt).getMonth() + 1).padStart(2, '0')}` : '' }}
                </div>
              </div>

              <!-- 竖分隔线 -->
              <div class="flex-shrink-0 w-px bg-gray-100 self-stretch" />

              <!-- 内容 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-3 mb-2">
                  <h3 class="text-base font-semibold text-gray-800 group-hover:text-[#1B2B4B] transition-colors line-clamp-1">
                    {{ item.title }}
                  </h3>
                  <span
                    v-if="item.category"
                    class="flex-shrink-0 text-xs px-2 py-0.5 rounded font-medium"
                    :style="{ backgroundColor: (CATEGORY_COLOR[item.category] || '#999') + '15', color: CATEGORY_COLOR[item.category] || '#999' }"
                  >
                    {{ item.category }}
                  </span>
                </div>
                <p v-if="item.summary" class="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-2">
                  {{ item.summary }}
                </p>
                <div class="flex items-center gap-4 text-xs text-gray-400">
                  <span v-if="item.viewCount" class="flex items-center gap-1">
                    <UIcon name="lucide:eye" class="text-xs" /> {{ item.viewCount }} 次浏览
                  </span>
                  <span class="flex items-center gap-1 ml-auto text-[#1B2B4B] opacity-0 group-hover:opacity-100 transition-opacity">
                    阅读全文 <UIcon name="lucide:arrow-right" class="text-xs" />
                  </span>
                </div>
              </div>
            </NuxtLink>
          </div>

          <!-- 分页 -->
          <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-2">
            <button
              :disabled="page <= 1"
              class="w-9 h-9 rounded-lg border flex items-center justify-center text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#1B2B4B] hover:text-[#1B2B4B]"
              @click="page--"
            >
              <UIcon name="lucide:chevron-left" />
            </button>
            <button
              v-for="p in totalPages"
              :key="p"
              class="w-9 h-9 rounded-lg border text-sm transition-all"
              :class="p === page
                ? 'bg-[#1B2B4B] text-white border-[#1B2B4B]'
                : 'hover:border-[#1B2B4B] hover:text-[#1B2B4B]'"
              @click="page = p"
            >
              {{ p }}
            </button>
            <button
              :disabled="page >= totalPages"
              class="w-9 h-9 rounded-lg border flex items-center justify-center text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#1B2B4B] hover:text-[#1B2B4B]"
              @click="page++"
            >
              <UIcon name="lucide:chevron-right" />
            </button>
          </div>
        </div>

        <!-- 右侧边栏 -->
        <div class="lg:w-64 space-y-5">
          <!-- 分类统计 -->
          <div class="bg-white rounded-xl border border-gray-100 p-5">
            <h3 class="text-sm font-bold text-[#1B2B4B] mb-4 flex items-center gap-2">
              <UIcon name="lucide:layout-list" /> 新闻分类
            </h3>
            <div class="space-y-2">
              <button
                v-for="cat in CATEGORIES.slice(1)"
                :key="cat"
                class="w-full flex items-center justify-between text-sm py-2 px-3 rounded-lg transition-colors"
                :class="activeCategory === cat
                  ? 'text-white font-medium'
                  : 'text-gray-600 hover:bg-gray-50'"
                :style="activeCategory === cat ? { backgroundColor: CATEGORY_COLOR[cat] || '#B01C1C' } : {}"
                @click="switchCategory(cat)"
              >
                <span class="flex items-center gap-2">
                  <span
                    class="w-2 h-2 rounded-full"
                    :style="{ backgroundColor: CATEGORY_COLOR[cat] || '#999' }"
                  />
                  {{ cat }}
                </span>
              </button>
            </div>
          </div>

          <!-- 返回首页 -->
          <div class="bg-[#EFF3FB] rounded-xl p-5">
            <NuxtLink to="/" class="flex items-center gap-2 text-sm text-[#1B2B4B] hover:underline">
              <UIcon name="lucide:home" /> 返回网站首页
            </NuxtLink>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
