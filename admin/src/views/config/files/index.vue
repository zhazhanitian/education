<script setup lang="tsx">
import { ref, reactive, computed, onMounted, h } from 'vue'
import { NButton, NSpace, NPopconfirm, NTag, NInput } from 'naive-ui'
import { fetchFileList, fetchDeleteFile } from '@/service/api'
import { request } from '@/service/request'
import { useAppStore } from '@/store/modules/app'

const appStore = useAppStore()

const loading = ref(false)
const uploading = ref(false)
const files = ref<Api.Config.FileRecord[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const searchParams = reactive({ name: '' })

async function loadList() {
  loading.value = true
  const { data } = await fetchFileList()
  files.value = (data as any)?.items || []
  loading.value = false
}

onMounted(loadList)

async function uploadFile(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return
  uploading.value = true
  const fd = new FormData()
  fd.append('file', input.files[0])
  const { error } = await request<Api.Config.FileRecord>({
    url: '/files/upload',
    method: 'post',
    data: fd,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  uploading.value = false
  input.value = ''
  if (!error) {
    window.$message?.success('上传成功')
    loadList()
  } else {
    window.$message?.error('上传失败')
  }
}

async function remove(id: number) {
  await fetchDeleteFile(id)
  window.$message?.success('删除成功')
  loadList()
}

function copyUrl(url: string) {
  navigator.clipboard.writeText(url)
  window.$message?.success('链接已复制')
}

function formatSize(b: number) {
  if (b < 1024) return `${b}B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)}KB`
  return `${(b / 1024 / 1024).toFixed(1)}MB`
}

const typeColors = { PDF: 'error', WORD: 'info', IMAGE: 'success', VIDEO: 'warning', OTHER: 'default' } as const

const filteredFiles = computed(() =>
  searchParams.name
    ? files.value.filter(f => f.originalName.toLowerCase().includes(searchParams.name.toLowerCase()))
    : files.value
)

const columns = [
  { title: '文件名', key: 'originalName', minWidth: 200, ellipsis: { tooltip: true } },
  {
    title: '类型', key: 'fileType', minWidth: 90, align: 'center' as const,
    render: (row: Api.Config.FileRecord) => h(NTag, { type: typeColors[row.fileType as keyof typeof typeColors] || 'default', size: 'small' }, { default: () => row.fileType })
  },
  { title: '大小', key: 'size', minWidth: 90, align: 'center' as const, render: (row: Api.Config.FileRecord) => formatSize(row.size) },
  { title: '上传时间', key: 'createdAt', minWidth: 120, align: 'center' as const, render: (row: Api.Config.FileRecord) => new Date(row.createdAt).toLocaleDateString('zh-CN') },
  {
    title: '操作', key: 'actions', minWidth: 200, align: 'center' as const,
    render: (row: Api.Config.FileRecord) => (
      <NSpace justify="center">
        <NButton size="small" onClick={() => copyUrl(row.url)}>复制链接</NButton>
        <a href={row.url} target="_blank" rel="noopener noreferrer">
          <NButton size="small" type="primary">预览</NButton>
        </a>
        <NPopconfirm onPositiveClick={() => remove(row.id)}>
          {{ default: () => '确认删除？', trigger: () => <NButton size="small" type="error">删除</NButton> }}
        </NPopconfirm>
      </NSpace>
    )
  }
]
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <!-- 搜索栏 -->
    <NCard :bordered="false" size="small" class="card-wrapper">
      <NSpace>
        <NInput v-model:value="searchParams.name" placeholder="文件名" clearable class="w-200px" />
        <NButton type="primary" @click="loadList">
          <template #icon><icon-ic-round-search class="text-icon" /></template>
          搜索
        </NButton>
        <NButton @click="() => { searchParams.name = ''; loadList(); }">
          <template #icon><icon-ic-round-refresh class="text-icon" /></template>
          重置
        </NButton>
      </NSpace>
    </NCard>

    <!-- 表格 -->
    <NCard title="文件管理" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <NSpace>
          <NAlert type="info" style="padding: 4px 10px; font-size: 12px;">
            支持 PDF、Word、图片、视频（≤50MB）
          </NAlert>
          <input ref="fileInput" type="file" class="hidden" @change="uploadFile" />
          <NButton type="primary" size="small" :loading="uploading" @click="fileInput?.click()">上传文件</NButton>
        </NSpace>
      </template>
      <NDataTable
        :loading="loading"
        :columns="columns"
        :data="filteredFiles"
        :row-key="(row: Api.Config.FileRecord) => row.id"
        :flex-height="!appStore.isMobile"
        :scroll-x="800"
        class="sm:h-full"
        size="small"
      />
    </NCard>
  </div>
</template>
