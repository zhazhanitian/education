<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import '@wangeditor/editor/dist/css/style.css'
import { createEditor, createToolbar } from '@wangeditor/editor'
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'

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

function initEditor() {
  if (!toolbarRef.value || !editorRef.value) return

  const editorConfig: Partial<IEditorConfig> = {
    placeholder: props.placeholder,
    onChange(e: IDomEditor) {
      const html = e.getHtml()
      emit('update:modelValue', html === '<p><br></p>' ? '' : html)
    },
  }

  editor = createEditor({
    selector: editorRef.value,
    html: props.modelValue || '',
    config: editorConfig,
    mode: 'default',
  })

  const toolbarConfig: Partial<IToolbarConfig> = {
    excludeKeys: ['fullScreen', 'group-video'],
  }

  createToolbar({
    editor,
    selector: toolbarRef.value,
    config: toolbarConfig,
    mode: 'default',
  })

  if (props.disabled) editor.disable()
}

// 外部 value 更新时同步内容
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
