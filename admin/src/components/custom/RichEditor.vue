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

/** 后端静态资源根地址：http://host/api/admin → http://host */
function getStaticBase() {
  const base = import.meta.env.VITE_SERVICE_BASE_URL as string || ''
  return base.replace(/\/api\/admin\/?$/, '')
}

/**
 * 编辑器展示用：把 HTML 里的相对 /uploads/ 路径替换为绝对 URL
 * 数据库仍存相对路径，只在渲染时转换，换服务器地址不影响存储数据
 */
function injectStaticBase(html: string) {
  if (!html) return html
  const base = getStaticBase()
  return html.replace(/(src|href)="(\/uploads\/)/g, `$1="${base}$2`)
}

/**
 * 保存用：把编辑器 HTML 里的绝对 URL 还原为相对路径
 * 确保数据库里始终存的是 /uploads/... 相对路径
 */
function stripStaticBase(html: string) {
  if (!html) return html
  const base = getStaticBase()
  if (!base) return html
  return html.replaceAll(`src="${base}/uploads/`, 'src="/uploads/')
    .replaceAll(`href="${base}/uploads/`, 'href="/uploads/')
}

/** 获取上传接口地址
 *  - 开启代理（VITE_HTTP_PROXY=Y）：走 /proxy-default，Vite 转发到 localhost:3000/api/admin，无跨域
 *  - 关闭代理（生产/远程）：直接用 VITE_SERVICE_BASE_URL（已含 /api/admin）
 */
function getUploadUrl() {
  const isProxy = import.meta.env.VITE_HTTP_PROXY === 'Y'
  if (isProxy) {
    return '/proxy-default/files/upload'
  }
  const base = import.meta.env.VITE_SERVICE_BASE_URL as string || ''
  return `${base}/files/upload`
}

/** 自定义图片上传 */
async function customUploadImage(
  file: File,
  insertFn: (url: string, alt: string, href: string) => void,
) {
  const token = localStg.get('token') || ''
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch(getUploadUrl(), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  })
  const json = await res.json()
  if (json.code === 0 && json.data?.url) {
    // 插入时用绝对 URL 供编辑器展示，保存时会自动 stripStaticBase 还原为相对路径
    insertFn(`${getStaticBase()}${json.data.url}`, file.name, '')
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
  const res = await fetch(getUploadUrl(), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  })
  const json = await res.json()
  if (json.code === 0 && json.data?.url) {
    insertFn(`${getStaticBase()}${json.data.url}`, '')
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
      // 保存前把绝对 URL 还原为相对路径，数据库始终存 /uploads/...
      const clean = html === '<p><br></p>' ? '' : stripStaticBase(html)
      emit('update:modelValue', clean)
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
    // 加载时把相对路径替换为绝对 URL，历史数据和新数据都能正常回显
    html: injectStaticBase(props.modelValue || ''),
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
    // 比较时用还原后的值，避免因 base 注入导致死循环更新
    const current = stripStaticBase(editor.getHtml())
    if (val !== current) {
      editor.setHtml(injectStaticBase(val || ''))
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
