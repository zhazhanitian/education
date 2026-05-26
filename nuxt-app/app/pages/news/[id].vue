<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const id = Number(route.params.id)

const { data, error } = await useFetch(`/api/news/${id}`)
const news = computed(() => data.value?.data)

useSeoMeta({
  title: computed(() => `${news.value?.title || '新闻详情'} - 教学成果奖申报平台`)
})

const CATEGORY_COLOR: Record<string, string> = {
  获奖公告: '#c0392b',
  媒体报道: '#9B1B1B',
  高校交流: '#0891b2',
  学生成果: '#15803d',
  校园动态: '#7c3aed',
}

function formatDate(d?: string | null) {
  if (!d) return ''
  const date = new Date(d)
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`
}

// 获取最新新闻列表用于右侧推荐
const { data: latestData } = await useFetch('/api/news', { query: { limit: 6 } })
const latestList = computed(() => latestData.value?.data?.items?.filter((n: { id: number }) => n.id !== id) ?? [])
</script>

<template>
  <div>
    <!-- 页面顶部 -->
    <div class="bg-gray-50 border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-6 py-3">
        <nav class="flex items-center gap-1.5 text-xs text-gray-500">
          <NuxtLink to="/" class="hover:text-[#B01C1C] transition-colors">首页</NuxtLink>
          <UIcon name="lucide:chevron-right" class="text-xs opacity-40" />
          <NuxtLink to="/news" class="hover:text-[#B01C1C] transition-colors">新闻动态</NuxtLink>
          <UIcon name="lucide:chevron-right" class="text-xs opacity-40" />
          <span class="text-gray-800 font-medium line-clamp-1 max-w-[300px]">{{ news?.title }}</span>
        </nav>
      </div>
    </div>
    <div class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-6 py-6">
        <div class="flex items-start gap-3">
          <div class="w-1 h-7 bg-[#B01C1C] rounded-sm flex-shrink-0 mt-0.5" />
          <div>
            <div v-if="news?.category" class="inline-flex items-center text-xs font-medium text-[#B01C1C] bg-red-50 border border-red-100 px-2 py-0.5 mb-2">
              {{ news.category }}
            </div>
            <h1 class="text-xl md:text-2xl font-bold text-gray-800 leading-snug">{{ news?.title }}</h1>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-6 py-10">

      <!-- 404 -->
      <div v-if="error || !news" class="flex flex-col items-center justify-center py-24 text-gray-400">
        <UIcon name="lucide:file-x" class="text-6xl text-gray-200 mb-4" />
        <p class="text-base font-medium text-gray-500 mb-2">新闻不存在或已下线</p>
        <NuxtLink to="/news" class="mt-4 text-sm text-[#1B2B4B] border border-[#1B2B4B] px-5 py-2 rounded-full hover:bg-[#1B2B4B] hover:text-white transition-colors">
          返回新闻列表
        </NuxtLink>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-4 gap-8">

        <!-- 主内容 -->
        <article class="lg:col-span-3">
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <!-- 文章头部信息 -->
            <div class="px-8 pt-8 pb-5 border-b border-gray-100">
              <div class="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <span class="flex items-center gap-1.5">
                  <UIcon name="lucide:calendar" class="text-xs" />
                  {{ formatDate(news?.publishedAt) }}
                </span>
                <span v-if="news.viewCount" class="flex items-center gap-1.5">
                  <UIcon name="lucide:eye" class="text-xs" />
                  {{ news.viewCount }} 次浏览
                </span>
              </div>
            </div>

            <!-- 摘要 -->
            <div v-if="news.summary" class="mx-8 mt-6 px-5 py-4 bg-[#EFF3FB] border-l-4 border-[#1B2B4B] rounded-r-lg">
              <p class="text-sm text-[#1B2B4B] leading-relaxed">{{ news.summary }}</p>
            </div>

            <!-- 正文 -->
            <div class="px-8 py-6">
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div
                v-if="news.content"
                class="rich-content"
                v-html="news.content"
              />
              <div v-else class="text-center py-12 text-gray-400">
                <UIcon name="lucide:file-text" class="text-5xl text-gray-200 mb-3" />
                <p class="text-sm">暂无正文内容</p>
              </div>
            </div>

            <!-- 底部操作栏 -->
            <div class="px-8 py-5 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
              <NuxtLink
                to="/news"
                class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1B2B4B] transition-colors"
              >
                <UIcon name="lucide:arrow-left" class="text-xs" /> 返回列表
              </NuxtLink>
              <NuxtLink
                to="/"
                class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1B2B4B] transition-colors"
              >
                <UIcon name="lucide:home" class="text-xs" /> 网站首页
              </NuxtLink>
            </div>
          </div>
        </article>

        <!-- 右侧边栏 -->
        <aside class="lg:col-span-1 space-y-5">
          <!-- 最新动态 -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 class="text-sm font-bold text-[#1B2B4B] mb-4 flex items-center gap-2 pb-3 border-b border-gray-100">
              <UIcon name="lucide:rss" /> 最新动态
            </h3>
            <div v-if="latestList.length" class="space-y-4">
              <NuxtLink
                v-for="item in latestList.slice(0, 5)"
                :key="item.id"
                :to="`/news/${item.id}`"
                class="group block"
              >
                <p class="text-xs font-medium text-gray-700 group-hover:text-[#1B2B4B] transition-colors line-clamp-2 leading-relaxed mb-1">
                  {{ item.title }}
                </p>
                <div class="flex items-center gap-2">
                  <span
                    v-if="item.category"
                    class="text-[10px] px-1.5 py-0.5 rounded"
                    :style="{ backgroundColor: (CATEGORY_COLOR[item.category] || '#999') + '15', color: CATEGORY_COLOR[item.category] || '#999' }"
                  >
                    {{ item.category }}
                  </span>
                  <span class="text-[11px] text-gray-400">
                    {{ item.publishedAt ? item.publishedAt.slice(0, 10) : '' }}
                  </span>
                </div>
              </NuxtLink>
            </div>
            <div v-else class="text-xs text-gray-400 py-4 text-center">暂无更多动态</div>
            <NuxtLink
              to="/news"
              class="mt-4 flex items-center justify-center gap-1 text-xs text-[#1B2B4B] hover:underline pt-3 border-t border-gray-100"
            >
              查看全部 <UIcon name="lucide:arrow-right" class="text-xs" />
            </NuxtLink>
          </div>
        </aside>

      </div>
    </div>
  </div>
</template>

<style scoped>
.prose :deep(h2) {
  border-left: 4px solid #1B2B4B;
  padding-left: 12px;
  margin-top: 2em;
}
.prose :deep(img) {
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}
.prose :deep(blockquote) {
  border-left-color: #c9a84c;
  background: #fffbf0;
  padding: 12px 16px;
  border-radius: 0 8px 8px 0;
}
.prose :deep(table th) {
  background: #EFF3FB;
  color: #1B2B4B;
}
</style>
