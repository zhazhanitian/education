<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import '@wangeditor/editor/dist/css/style.css'
import { createEditor, createToolbar } from '@wangeditor/editor'
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import { localStg } from '@/utils/storage'

interface Props {
  modelValue?: string
  placeholder?: string
  height?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '请输入内容...',
  height: 400,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const toolbarRef = ref<HTMLDivElement | null>(null)
const editorRef = ref<HTMLDivElement | null>(null)
let editor: IDomEditor | null = null

/** 获取上传接口基础地址 */
function getUploadBaseUrl() {
  const base = import.meta.env.VITE_SERVICE_BASE_URL as string || ''
  // 去掉末尾 /api/admin，拼成 /proxy-default/files/upload
  return base.replace(/\/api\/admin\/?$/, '')
}

/** 自定义图片上传 */
async function customUploadImage(
  file: File,
  insertFn: (url: string, alt: string, href: string) => void,
) {
  const token = localStg.get('token') || ''
  const fd = new FormData()
  fd.append('file', file)
  const base = getUploadBaseUrl()
  const res = await fetch(`${base}/files/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  })
  const json = await res.json()
  if (json.code === 0 && json.data?.url) {
    insertFn(json.data.url, file.name, '')
  } else {
    window.$message?.error('图片上传失败')
  }
}

/** 自定义视频上传 */
async function customUploadVideo(
  file: File,
  insertFn: (url: string, poster?: string) => void,
) {
  const token = localStg.get('token') || ''
  const fd = new FormData()
  fd.append('file', file)
  const base = getUploadBaseUrl()
  const res = await fetch(`${base}/files/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  })
  const json = await res.json()
  if (json.code === 0 && json.data?.url) {
    insertFn(json.data.url, '')
  } else {
    window.$message?.error('视频上传失败')
  }
}

function initEditor() {
  if (!toolbarRef.value || !editorRef.value) return

  const editorConfig: Partial<IEditorConfig> = {
    placeholder: props.placeholder,
    onChange(e: IDomEditor) {
      const html = e.getHtml()
      emit('update:modelValue', html === '<p><br></p>' ? '' : html)
    },
    MENU_CONF: {
      uploadImage: {
        customUpload: customUploadImage,
      },
      uploadVideo: {
        customUpload: customUploadVideo,
      },
    },
  }

  editor = createEditor({
    selector: editorRef.value,
    html: props.modelValue || '',
    config: editorConfig,
    mode: 'default',
  })

  const toolbarConfig: Partial<IToolbarConfig> = {
    excludeKeys: ['fullScreen'],
  }

  createToolbar({
    editor,
    selector: toolbarRef.value,
    config: toolbarConfig,
    mode: 'default',
  })

  if (props.disabled) editor.disable()
}

watch(
  () => props.modelValue,
  (val) => {
    if (!editor || editor.isDestroyed) return
    const current = editor.getHtml()
    if (val !== current) {
      editor.setHtml(val || '')
    }
  },
)

onMounted(() => {
  nextTick(initEditor)
})

onBeforeUnmount(() => {
  editor?.destroy()
  editor = null
})
</script>

<template>
  <div class="rich-editor-wrap w-full border border-[#e5e7eb] rounded overflow-hidden">
    <div ref="toolbarRef" class="editor-toolbar" style="border-bottom: 1px solid #e5e7eb;" />
    <div ref="editorRef" class="editor-content" :style="{ height: `${height}px`, overflowY: 'auto' }" />
  </div>
</template>

<style>
.rich-editor-wrap .w-e-toolbar { flex-wrap: wrap; }
.rich-editor-wrap .w-e-text-container [data-slate-editor] { padding: 12px 16px; }
</style>
