<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const menuId = computed(() => Number(route.params.id))

const { data, error } = await useFetch(() => `/api/content/${menuId.value}`)
const page = computed(() => data.value?.data)
const isEmpty = computed(() => !page.value && error.value?.statusCode === 404)

useSeoMeta({
  title: computed(() => `${page.value?.title || '内容页'} - 教学成果奖申报平台`)
})

const breadcrumbs = computed(() => {
  const items: Array<{ label: string; to?: string }> = [{ label: '首页', to: '/' }]
  const menu = page.value?.menu
  if (menu?.parent) items.push({ label: menu.parent.name })
  if (menu) items.push({ label: menu.name })
  return items
})

const videoFiles = computed(() => page.value?.files?.filter((f: { fileType: string }) => f.fileType === 'VIDEO') ?? [])
const previewFile = computed(() => page.value?.files?.find((f: { fileType: string }) => f.fileType === 'PDF' || f.fileType === 'WORD'))
const images = computed(() => page.value?.files?.filter((f: { fileType: string }) => f.fileType === 'IMAGE') ?? [])
const otherFiles = computed(() => page.value?.files?.filter((f: { fileType: string }) => !['IMAGE', 'VIDEO'].includes(f.fileType)) ?? [])

function fileIcon(type: string) {
  const map: Record<string, string> = {
    PDF: 'lucide:file-text',
    WORD: 'lucide:file-type',
    VIDEO: 'lucide:video',
    IMAGE: 'lucide:image',
    OTHER: 'lucide:paperclip',
  }
  return map[type] || 'lucide:paperclip'
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
</script>

<template>
  <div>
    <!-- 顶部横幅 -->
    <div class="bg-[#B01C1C] py-10">
      <div class="max-w-7xl mx-auto px-6">
        <nav class="flex items-center gap-1.5 text-xs text-red-300 mb-3">
          <template v-for="(crumb, i) in breadcrumbs" :key="i">
            <NuxtLink v-if="crumb.to" :to="crumb.to" class="hover:text-white transition-colors">{{ crumb.label }}</NuxtLink>
            <span v-else class="text-white/60">{{ crumb.label }}</span>
            <UIcon v-if="i < breadcrumbs.length - 1" name="lucide:chevron-right" class="text-xs opacity-50" />
          </template>
        </nav>
        <h1 class="text-xl md:text-2xl font-bold text-white">
          {{ page?.menu?.name || page?.title || '页面内容' }}
        </h1>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-6 py-10">
      <!-- 加载中 -->
      <div v-if="!page && !isEmpty && !error" class="flex items-center justify-center py-24">
        <UIcon name="lucide:loader-circle" class="text-[#1B2B4B] text-4xl animate-spin" />
      </div>

      <!-- 暂无内容 -->
      <div v-else-if="isEmpty || (!page && error)" class="flex items-center justify-center py-24">
        <div class="text-center">
          <UIcon name="lucide:file-clock" class="text-gray-300 text-6xl mb-4" />
          <h2 class="text-lg font-bold text-[#1B2B4B] mb-2">内容正在建设中</h2>
          <p class="text-gray-400 text-sm mb-6">该页面内容尚未发布，请稍后再来</p>
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-2 text-sm text-[#1B2B4B] border border-[#1B2B4B] px-5 py-2 rounded-full hover:bg-[#1B2B4B] hover:text-white transition-colors"
          >
            <UIcon name="lucide:home" class="text-xs" /> 返回首页
          </NuxtLink>
        </div>
      </div>

      <template v-else-if="page">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <!-- 主内容区 -->
          <div class="lg:col-span-3 space-y-6">
            <!-- 富文本 -->
            <div v-if="page.contentType === 'RICHTEXT'" class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:p-8">
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div
                class="prose prose-lg max-w-none prose-headings:text-[#1B2B4B] prose-a:text-[#C0392B]"
                v-html="page.richText || '<p class=&quot;text-gray-400&quot;>暂无内容</p>'"
              />
            </div>

            <!-- PDF 内嵌 -->
            <div v-if="page.contentType === 'FILE' && previewFile?.fileType === 'PDF'" class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div class="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
                <UIcon name="lucide:file-text" class="text-[#C0392B]" />
                <span class="text-sm text-gray-700 font-medium">{{ previewFile.originalName }}</span>
                <a :href="previewFile.url" download class="ml-auto text-xs text-[#1B2B4B] hover:underline flex items-center gap-1">
                  <UIcon name="lucide:download" class="text-xs" /> 下载
                </a>
              </div>
              <iframe :src="`/api/files/preview?url=${encodeURIComponent(previewFile.url)}`" class="w-full border-0" style="min-height: 75vh;" title="PDF 在线预览" />
            </div>

            <!-- Word 下载 -->
            <div v-if="page.contentType === 'FILE' && previewFile?.fileType === 'WORD'" class="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
              <UIcon name="lucide:file-type" class="text-5xl text-blue-300 mb-4" />
              <p class="text-gray-700 font-medium mb-2">{{ previewFile.originalName }}</p>
              <p class="text-sm text-gray-400 mb-5">Word 文档需下载后查看</p>
              <a :href="previewFile.url" download class="inline-flex items-center gap-2 bg-[#1B2B4B] text-white px-6 py-2 rounded-lg text-sm hover:bg-[#1B2B4B]/80 transition-colors">
                <UIcon name="lucide:download" /> 下载文件
              </a>
            </div>

            <!-- 视频 -->
            <div v-if="videoFiles.length" class="space-y-4">
              <div v-for="video in videoFiles" :key="video.id" class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div class="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <UIcon name="lucide:video" class="text-[#1B2B4B]" />
                  <span class="text-sm text-gray-700 font-medium">{{ video.originalName }}</span>
                </div>
                <video :src="video.url" controls preload="metadata" class="w-full max-h-[500px] bg-black">您的浏览器不支持视频播放</video>
              </div>
            </div>

            <!-- 图片 -->
            <div v-if="images.length" class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 class="text-base font-bold text-[#1B2B4B] mb-4 flex items-center gap-2">
                <UIcon name="lucide:image" /> 相关图片
              </h3>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <a v-for="img in images" :key="img.id" :href="img.url" target="_blank" class="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity">
                  <img :src="img.url" :alt="img.originalName" class="w-full h-full object-cover" />
                </a>
              </div>
            </div>
          </div>

          <!-- 侧边栏 -->
          <div class="lg:col-span-1 space-y-4">
            <!-- 附件 -->
            <div v-if="otherFiles.length" class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 class="text-sm font-bold text-[#1B2B4B] mb-3 flex items-center gap-2">
                <UIcon name="lucide:paperclip" /> 附件下载
              </h3>
              <div class="space-y-2">
                <a
                  v-for="file in otherFiles" :key="file.id" :href="file.url" download
                  class="flex items-center gap-2 p-2.5 rounded-lg border border-gray-100 hover:border-[#1B2B4B]/30 hover:bg-[#EFF3FB] transition-all group"
                >
                  <UIcon :name="fileIcon(file.fileType)" class="text-[#C0392B] flex-shrink-0 text-base" />
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-gray-700 truncate group-hover:text-[#1B2B4B]">{{ file.originalName }}</p>
                    <p class="text-xs text-gray-400">{{ formatSize(file.size) }}</p>
                  </div>
                  <UIcon name="lucide:download" class="text-gray-300 group-hover:text-[#1B2B4B] text-xs flex-shrink-0" />
                </a>
              </div>
            </div>

            <!-- 快速导航 -->
            <div class="bg-[#EFF3FB] rounded-xl p-5">
              <h3 class="text-sm font-bold text-[#1B2B4B] mb-3 flex items-center gap-2">
                <UIcon name="lucide:layout-list" /> 快速导航
              </h3>
              <NuxtLink to="/" class="flex items-center gap-2 py-1.5 text-xs text-gray-600 hover:text-[#1B2B4B] transition-colors">
                <UIcon name="lucide:home" /> 网站首页
              </NuxtLink>
              <NuxtLink to="/news" class="flex items-center gap-2 py-1.5 text-xs text-gray-600 hover:text-[#1B2B4B] transition-colors">
                <UIcon name="lucide:newspaper" /> 新闻动态
              </NuxtLink>
            </div>
          </div>
        </div>
      </template>
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
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}
.prose :deep(table th) {
  background: #EFF3FB;
  color: #1B2B4B;
}
</style>
