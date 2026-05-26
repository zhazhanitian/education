<script setup lang="ts">
const { data } = await useFetch('/api/news', { query: { page: 1, pageSize: 6 } })
const newsList = computed(() => data.value?.data?.items ?? [])
const topNews = computed(() => newsList.value[0] ?? null)
const restNews = computed(() => newsList.value.slice(1, 6))

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return {
    month: String(d.getMonth() + 1).padStart(2, '0'),
    day: String(d.getDate()).padStart(2, '0'),
    year: d.getFullYear(),
  }
}
</script>

<template>
  <section class="py-14 bg-gray-50 border-t border-gray-200">
    <div class="max-w-7xl mx-auto px-6">
      <div class="flex items-center justify-between mb-8" data-sr="left">
        <div class="flex items-center gap-3">
          <div class="w-1 h-8 bg-[#B01C1C] rounded-sm" />
          <h2 class="text-xl md:text-2xl font-bold text-gray-800">新闻动态</h2>
          <span class="text-xs text-gray-400 ml-1 hidden md:block">News & Updates</span>
        </div>
        <NuxtLink to="/news" class="text-sm text-[#8C1515] hover:underline flex items-center gap-1">
          更多 <UIcon name="lucide:chevron-right" class="text-xs" />
        </NuxtLink>
      </div>

      <div v-if="newsList.length === 0" class="text-center py-16 text-gray-400 text-sm bg-white border border-gray-200" data-sr="fade">
        暂无新闻动态
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <!-- 左：头条 -->
        <NuxtLink
          v-if="topNews"
          :to="`/news/${topNews.id}`"
          data-sr="left"
          data-delay="100"
          class="lg:col-span-2 block group relative overflow-hidden"
        >
          <div class="relative bg-[#8C1515] h-full" style="min-height: 280px;">
            <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=60')] bg-cover bg-center opacity-20" />
            <div class="relative z-10 p-6 flex flex-col justify-end h-full" style="min-height: 280px;">
              <div v-if="topNews.category" class="inline-flex items-center gap-1 bg-[#C9A84C] text-white text-xs px-2 py-0.5 mb-3 w-fit font-medium">
                {{ topNews.category }}
              </div>
              <h3 class="text-base font-bold text-white group-hover:text-[#C9A84C] transition-colors leading-snug mb-2">
                {{ topNews.title }}
              </h3>
              <p v-if="topNews.summary" class="text-sm text-red-200 line-clamp-2 mb-3">{{ topNews.summary }}</p>
              <span class="text-xs text-red-300">
                {{ topNews.publishedAt ? new Date(topNews.publishedAt).toLocaleDateString('zh-CN') : '' }}
              </span>
            </div>
          </div>
        </NuxtLink>

        <!-- 右：新闻列表 -->
        <div class="lg:col-span-3 bg-white border border-gray-200" data-sr="right" data-delay="150">
          <NuxtLink
            v-for="(item, i) in restNews"
            :key="item.id"
            :to="`/news/${item.id}`"
            class="group flex items-start gap-4 px-5 py-4 hover:bg-red-50 transition-colors"
            :class="i > 0 ? 'border-t border-gray-100' : ''"
          >
            <div v-if="item.publishedAt" class="flex-shrink-0 text-center w-10">
              <div class="text-xl font-bold text-[#B01C1C] leading-none">{{ formatDate(item.publishedAt).day }}</div>
              <div class="text-xs text-gray-400">{{ formatDate(item.publishedAt).month }}/{{ formatDate(item.publishedAt).year }}</div>
            </div>
            <div class="w-px self-stretch bg-gray-100 flex-shrink-0" />
            <div class="flex-1 min-w-0">
              <div v-if="item.category" class="text-xs text-[#B01C1C] mb-0.5">{{ item.category }}</div>
              <h4 class="text-sm text-gray-700 group-hover:text-[#B01C1C] transition-colors line-clamp-1 leading-relaxed">
                {{ item.title }}
              </h4>
            </div>
            <UIcon name="lucide:chevron-right" class="text-gray-300 group-hover:text-[#B01C1C] text-sm flex-shrink-0 mt-0.5 transition-colors" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
