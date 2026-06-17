<script setup lang="ts">
/**
 * 版权保护 PDF 查看器
 * 使用 PDF.js 将 PDF 渲染为 canvas，完全屏蔽右键另存、拖拽下载等操作。
 */
// ?url 让 Vite 直接输出 worker 文件的真实 URL，避免 SSR 期间 import.meta.url 解析失败
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'

GlobalWorkerOptions.workerSrc = workerUrl

const props = defineProps<{ src: string }>()

const container = ref<HTMLDivElement | null>(null)
const totalPages = ref(0)
const loading = ref(true)
const hasError = ref(false)

async function renderPdf(url: string) {
  if (!container.value) return
  loading.value = true
  hasError.value = false
  totalPages.value = 0
  container.value.innerHTML = ''

  try {
    const pdf = await getDocument({ url }).promise
    totalPages.value = pdf.numPages

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale: 1.6 })

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      canvas.width = viewport.width
      canvas.height = viewport.height
      canvas.style.cssText = 'display:block;width:100%;user-select:none;'
      canvas.draggable = false
      // 屏蔽 canvas 自身的右键菜单
      canvas.addEventListener('contextmenu', e => e.preventDefault(), true)

      await page.render({ canvasContext: ctx, viewport, canvas }).promise

      const wrapper = document.createElement('div')
      wrapper.style.cssText = 'background:#fff;border-bottom:4px solid #f3f4f6;'
      wrapper.appendChild(canvas)
      container.value.appendChild(wrapper)
    }
  } catch (e) {
    console.error('[PdfViewer] 渲染失败', e)
    hasError.value = true
  } finally {
    loading.value = false
  }
}

// 挂载后再渲染（等 container ref 就绪）
onMounted(() => renderPdf(props.src))
watch(() => props.src, (newSrc) => {
  if (newSrc) renderPdf(newSrc)
})
</script>

<template>
  <div
    class="relative select-none bg-gray-100"
    @contextmenu.prevent
  >
    <!-- 加载中 -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 text-gray-400">
      <UIcon name="lucide:loader-circle" class="text-4xl text-[#B01C1C] animate-spin mb-3" />
      <p class="text-sm">正在加载文档…</p>
    </div>

    <!-- 加载失败 -->
    <div v-else-if="hasError" class="flex flex-col items-center justify-center py-24 text-gray-400">
      <UIcon name="lucide:file-x" class="text-5xl text-gray-200 mb-3" />
      <p class="text-sm">文档加载失败，请稍后重试</p>
    </div>

    <!-- canvas 由 renderPdf() 直接插入 DOM -->
    <div
      ref="container"
      class="overflow-y-auto"
      style="max-height: 80vh;"
      @contextmenu.prevent
    >
      <!-- 加载完成后右下角浮动页数提示 -->
      <div
        v-if="!loading && !hasError"
        class="sticky bottom-2 right-2 float-right mr-2 text-[11px] text-gray-400 bg-white/80 backdrop-blur-sm px-2 py-1 rounded select-none pointer-events-none"
      >
        共 {{ totalPages }} 页
      </div>
    </div>
  </div>
</template>
