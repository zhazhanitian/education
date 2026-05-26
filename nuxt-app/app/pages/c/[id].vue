<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const menuId = computed(() => Number(route.params.id))

const { data, error } = await useFetch(() => `/api/content/${menuId.value}`)
const page = computed(() => data.value?.data)
const isEmpty = computed(() => !page.value && error.value?.statusCode === 404)

useSeoMeta({
  title: computed(() => `${page.value?.menu?.name || page.value?.title || '内容页'} - 教学成果奖申报平台`)
})

// 面包屑
const breadcrumbs = computed(() => {
  const items: Array<{ label: string; to?: string }> = [{ label: '首页', to: '/' }]
  const menu = page.value?.menu
  if (menu?.parent) items.push({ label: menu.parent.name })
  if (menu) items.push({ label: menu.name })
  return items
})

// 获取同级菜单（左侧子导航）
const { data: navData } = await useFetch('/api/nav')
const allMenus = computed(() => navData.value?.data ?? [])

const sidebarMenus = computed(() => {
  const menu = page.value?.menu
  if (!menu) return []
  if (menu.parentId) {
    // 有父级：找到父级下的兄弟菜单
    const parent = allMenus.value.find((m: { id: number }) => m.id === menu.parentId)
    return parent?.children ?? []
  }
  // 顶级菜单：找其子菜单
  const self = allMenus.value.find((m: { id: number }) => m.id === menu.id)
  return self?.children ?? []
})

const parentMenu = computed(() => {
  const menu = page.value?.menu
  if (!menu?.parentId) return null
  return allMenus.value.find((m: { id: number }) => m.id === menu.parentId) ?? null
})

// 文件分类
const videoFiles = computed(() => page.value?.files?.filter((f: { fileType: string }) => f.fileType === 'VIDEO') ?? [])
const previewFile = computed(() => page.value?.files?.find((f: { fileType: string }) => f.fileType === 'PDF' || f.fileType === 'WORD'))
const images = computed(() => page.value?.files?.filter((f: { fileType: string }) => f.fileType === 'IMAGE') ?? [])
const otherFiles = computed(() => page.value?.files?.filter((f: { fileType: string }) => !['IMAGE', 'VIDEO'].includes(f.fileType)) ?? [])

function fileIcon(type: string) {
  const map: Record<string, string> = { PDF: 'lucide:file-text', WORD: 'lucide:file-type', VIDEO: 'lucide:video', IMAGE: 'lucide:image', OTHER: 'lucide:paperclip' }
  return map[type] || 'lucide:paperclip'
}
function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 面包屑 -->
    <div class="bg-gray-100 border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-6 py-2.5">
        <nav class="flex items-center gap-1.5 text-xs text-gray-500">
          <template v-for="(crumb, i) in breadcrumbs" :key="i">
            <NuxtLink v-if="crumb.to" :to="crumb.to" class="hover:text-[#B01C1C] transition-colors">{{ crumb.label }}</NuxtLink>
            <span v-else class="text-gray-700">{{ crumb.label }}</span>
            <UIcon v-if="i < breadcrumbs.length - 1" name="lucide:chevron-right" class="text-xs opacity-40" />
          </template>
        </nav>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-6 py-8">
      <div class="flex gap-6 items-start">

        <!-- 左侧：子导航 -->
        <aside v-if="sidebarMenus.length > 0" class="w-48 flex-shrink-0 hidden lg:block">
          <!-- 父级标题 -->
          <div class="bg-[#B01C1C] text-white text-sm font-bold px-4 py-3 text-center">
            {{ parentMenu?.name || page?.menu?.name || '导航' }}
          </div>
          <!-- 子菜单列表 -->
          <div class="bg-white border border-gray-200 border-t-0">
            <NuxtLink
              v-for="(item, i) in sidebarMenus"
              :key="item.id"
              :to="`/c/${item.id}`"
              class="flex items-center gap-2 px-4 py-3 text-sm transition-colors border-b border-gray-100 last:border-b-0"
              :class="item.id === menuId
                ? 'bg-red-50 text-[#B01C1C] font-medium border-l-2 border-l-[#B01C1C]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-[#B01C1C]'"
            >
              <UIcon
                name="lucide:chevron-right"
                class="text-xs flex-shrink-0"
                :class="item.id === menuId ? 'text-[#B01C1C]' : 'text-gray-300'"
              />
              {{ item.name }}
            </NuxtLink>
          </div>
        </aside>

        <!-- 右侧：主内容 -->
        <main class="flex-1 min-w-0">
          <!-- 加载中 -->
          <div v-if="!page && !isEmpty && !error" class="flex items-center justify-center py-32 bg-white rounded border border-gray-200">
            <UIcon name="lucide:loader-circle" class="text-[#B01C1C] text-3xl animate-spin" />
          </div>

          <!-- 暂无内容 -->
          <div v-else-if="isEmpty || (!page && error)" class="flex flex-col items-center justify-center py-32 bg-white rounded border border-gray-200">
            <UIcon name="lucide:file-clock" class="text-gray-200 text-6xl mb-4" />
            <h2 class="text-base font-bold text-gray-600 mb-2">内容正在建设中</h2>
            <p class="text-gray-400 text-sm mb-5">该页面内容尚未发布，请稍后再来</p>
            <NuxtLink to="/" class="inline-flex items-center gap-2 text-sm text-[#B01C1C] border border-[#B01C1C] px-5 py-2 hover:bg-[#B01C1C] hover:text-white transition-colors">
              <UIcon name="lucide:home" class="text-xs" /> 返回首页
            </NuxtLink>
          </div>

          <template v-else-if="page">
            <!-- 页面标题 -->
            <div class="bg-white border border-gray-200 border-b-0 px-6 py-4 flex items-center gap-3">
              <div class="w-0.5 h-5 bg-[#B01C1C] flex-shrink-0" />
              <h1 class="text-lg font-bold text-gray-800">{{ page.menu?.name || page.title }}</h1>
            </div>

            <!-- 富文本 -->
            <div v-if="page.contentType === 'RICHTEXT'" class="bg-white border border-gray-200 p-6 md:p-8">
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div
                class="rich-content"
                v-html="page.richText || '<p style=&quot;color:#9ca3af&quot;>暂无内容</p>'"
              />
            </div>

            <!-- PDF 内嵌 -->
            <div v-if="page.contentType === 'FILE' && previewFile?.fileType === 'PDF'" class="bg-white border border-gray-200 overflow-hidden">
              <div class="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
                <UIcon name="lucide:file-text" class="text-[#B01C1C]" />
                <span class="text-sm text-gray-700 font-medium">{{ previewFile.originalName }}</span>
                <a :href="previewFile.url" download class="ml-auto text-xs text-[#B01C1C] hover:underline flex items-center gap-1">
                  <UIcon name="lucide:download" class="text-xs" /> 下载
                </a>
              </div>
              <iframe :src="`/api/files/preview?url=${encodeURIComponent(previewFile.url)}`" class="w-full border-0" style="min-height: 75vh;" title="PDF 在线预览" />
            </div>

            <!-- Word 下载 -->
            <div v-if="page.contentType === 'FILE' && previewFile?.fileType === 'WORD'" class="bg-white border border-gray-200 p-8 text-center">
              <UIcon name="lucide:file-type" class="text-5xl text-blue-300 mb-4" />
              <p class="text-gray-700 font-medium mb-2">{{ previewFile.originalName }}</p>
              <p class="text-sm text-gray-400 mb-5">Word 文档需下载后查看</p>
              <a :href="previewFile.url" download class="inline-flex items-center gap-2 bg-[#B01C1C] text-white px-6 py-2 text-sm hover:bg-[#8C1515] transition-colors">
                <UIcon name="lucide:download" /> 下载文件
              </a>
            </div>

            <!-- 视频 -->
            <div v-if="videoFiles.length" class="space-y-4 mt-0">
              <div v-for="video in videoFiles" :key="video.id" class="bg-white border border-gray-200 overflow-hidden">
                <div class="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <UIcon name="lucide:video" class="text-[#B01C1C]" />
                  <span class="text-sm text-gray-700 font-medium">{{ video.originalName }}</span>
                </div>
                <video :src="video.url" controls preload="metadata" class="w-full max-h-[500px] bg-black">您的浏览器不支持视频播放</video>
              </div>
            </div>

            <!-- 图片 -->
            <div v-if="images.length" class="bg-white border border-gray-200 border-t-0 p-6">
              <h3 class="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <UIcon name="lucide:image" class="text-[#B01C1C]" /> 相关图片
              </h3>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <a v-for="img in images" :key="img.id" :href="img.url" target="_blank" class="aspect-[4/3] rounded overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity">
                  <img :src="img.url" :alt="img.originalName" class="w-full h-full object-cover" />
                </a>
              </div>
            </div>

            <!-- 附件下载 -->
            <div v-if="otherFiles.length" class="bg-white border border-gray-200 border-t-0 p-6">
              <h3 class="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <UIcon name="lucide:paperclip" class="text-[#B01C1C]" /> 附件下载
              </h3>
              <div class="space-y-2">
                <a
                  v-for="file in otherFiles" :key="file.id" :href="file.url" download
                  class="flex items-center gap-3 p-3 border border-gray-100 hover:border-[#B01C1C]/30 hover:bg-red-50 transition-all group"
                >
                  <UIcon :name="fileIcon(file.fileType)" class="text-[#B01C1C] flex-shrink-0" />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-700 truncate group-hover:text-[#B01C1C]">{{ file.originalName }}</p>
                    <p class="text-xs text-gray-400">{{ formatSize(file.size) }}</p>
                  </div>
                  <UIcon name="lucide:download" class="text-gray-300 group-hover:text-[#B01C1C] flex-shrink-0" />
                </a>
              </div>
            </div>
          </template>
        </main>

      </div>
    </div>
  </div>
</template>
