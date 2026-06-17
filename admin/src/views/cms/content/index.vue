<script setup lang="tsx">
import { ref, reactive, computed } from 'vue';
import {
  NButton, NSpace, NPopconfirm, NTag, NSwitch, NInput, NSelect,
  NRadioGroup, NRadioButton, NAlert, NUpload, NUploadDragger,
  NIcon, NProgress, NText,
} from 'naive-ui';
import type { UploadCustomRequestOptions } from 'naive-ui';
import { fetchNavList, fetchContentList, fetchContentDetail, fetchCreateContent, fetchUpdateContent, fetchDeleteContent, fetchUploadFile, fetchDeleteFile } from '@/service/api';
import { useNaivePaginatedTable } from '@/hooks/common/table';
import { useAppStore } from '@/store/modules/app';
import { useBoolean } from '@sa/hooks';
import RichEditor from '@/components/custom/RichEditor.vue';

const appStore = useAppStore();
const { bool: showModal, setTrue: openModal, setFalse: closeModal } = useBoolean();

const searchParams = reactive({ title: '', menuId: undefined as number | undefined });
const menus = ref<Api.Cms.NavMenu[]>([]);
const editTarget = ref<Api.Cms.ContentPage | null>(null);
const form = reactive<Api.Cms.ContentPageForm>({
  title: '', contentType: 'RICHTEXT', richText: '', isPublished: true, menuId: null, fileIds: [],
});
const saving = ref(false);

// 已上传文件列表（弹窗内临时存储）
const uploadedFiles = ref<Api.Cms.PageFile[]>([]);
const uploading = ref(false);

const paginationReactive = reactive({ page: 1, pageSize: 20 });

// 文件类型图标
function fileTypeIcon(fileType: string) {
  const map: Record<string, string> = {
    PDF: '📄', WORD: '📝', IMAGE: '🖼️', VIDEO: '🎬', OTHER: '📎',
  };
  return map[fileType] || '📎';
}

// 文件大小格式化
function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// 只显示 PAGE 类型菜单
const flatMenuOptions = computed(() => {
  const opts: { label: string; value: number }[] = [];
  menus.value.forEach(m => {
    if (m.type === 'PAGE') opts.push({ label: `【一级】${m.name}`, value: m.id });
    m.children?.forEach(c => {
      if (c.type === 'PAGE') opts.push({ label: `　└ ${c.name}`, value: c.id });
    });
  });
  return opts;
});

const { columns, data, loading, pagination, getData } = useNaivePaginatedTable({
  api: async () => {
    const [contentRes, menuRes] = await Promise.all([
      fetchContentList(paginationReactive.page, paginationReactive.pageSize),
      fetchNavList(),
    ]);
    menus.value = menuRes.data || [];
    return contentRes;
  },
  transform: response => {
    const res = (response as any)?.data;
    return { data: res?.items || [], pageNum: paginationReactive.page, pageSize: paginationReactive.pageSize, total: res?.total || 0 };
  },
  onPaginationParamsChange: params => {
    paginationReactive.page = params.page || 1;
    paginationReactive.pageSize = params.pageSize || 20;
  },
  columns: () => [
    { title: '标题', key: 'title', minWidth: 200, ellipsis: { tooltip: true } },
    {
      title: '内容类型', key: 'contentType', minWidth: 100, align: 'center',
      render: (row: Api.Cms.ContentPage) => {
        const map: Record<string, { label: string; type: 'info' | 'warning' }> = {
          RICHTEXT: { label: '富文本', type: 'info' },
          FILE: { label: '文件预览', type: 'warning' },
        };
        const c = map[row.contentType] || { label: row.contentType, type: 'info' as const };
        return <NTag type={c.type} size="small">{c.label}</NTag>;
      }
    },
    { title: '所属菜单', key: 'menu', minWidth: 140, render: (row: Api.Cms.ContentPage) => row.menu?.name || '-' },
    {
      title: '附件数', key: 'files', minWidth: 80, align: 'center',
      render: (row: Api.Cms.ContentPage) => {
        const count = row.files?.length || 0;
        return count > 0 ? <NTag type="success" size="small">{count} 个文件</NTag> : <span class="text-gray-400">-</span>;
      }
    },
    {
      title: '状态', key: 'isPublished', minWidth: 90, align: 'center',
      render: (row: Api.Cms.ContentPage) => <NTag type={row.isPublished ? 'success' : 'default'} size="small">{row.isPublished ? '已发布' : '草稿'}</NTag>
    },
    {
      title: '操作', key: 'actions', minWidth: 160, align: 'center',
      render: (row: Api.Cms.ContentPage) => (
        <NSpace justify="center">
          <NButton size="small" type="primary" onClick={() => openEdit(row)}>编辑</NButton>
          <NPopconfirm onPositiveClick={() => handleDelete(row.id)}>
            {{ default: () => '确认删除？', trigger: () => <NButton size="small" type="error">删除</NButton> }}
          </NPopconfirm>
        </NSpace>
      )
    }
  ]
});

async function openEdit(row: Api.Cms.ContentPage) {
  const { data: detail } = await fetchContentDetail(row.id);
  editTarget.value = row;
  uploadedFiles.value = detail?.files || [];
  Object.assign(form, {
    title: row.title,
    contentType: row.contentType,
    richText: detail?.richText || '',
    isPublished: row.isPublished,
    menuId: row.menuId,
    fileIds: [],
  });
  openModal();
}

function openCreate() {
  editTarget.value = null;
  uploadedFiles.value = [];
  Object.assign(form, { title: '', contentType: 'RICHTEXT', richText: '', isPublished: true, menuId: null, fileIds: [] });
  openModal();
}

// 自定义上传逻辑
async function handleCustomUpload({ file, onProgress, onFinish, onError }: UploadCustomRequestOptions) {
  uploading.value = true;
  try {
    const fd = new FormData();
    fd.append('file', file.file as File);
    onProgress({ percent: 50 });
    const res = await fetchUploadFile(fd);
    if (res.data) {
      uploadedFiles.value.push(res.data);
      form.fileIds = [...(form.fileIds || []), res.data.id];
    }
    onProgress({ percent: 100 });
    onFinish();
    window.$message?.success(`${file.name} 上传成功`);
  } catch (e) {
    onError();
    window.$message?.error(`${file.name} 上传失败`);
  } finally {
    uploading.value = false;
  }
}

// 删除已上传文件
async function handleRemoveFile(fileId: number) {
  try {
    await fetchDeleteFile(fileId);
    uploadedFiles.value = uploadedFiles.value.filter(f => f.id !== fileId);
    form.fileIds = (form.fileIds || []).filter(id => id !== fileId);
    window.$message?.success('文件已删除');
  } catch {
    window.$message?.error('删除失败');
  }
}

async function handleSave() {
  if (!form.title || !form.menuId) {
    window.$message?.warning('请填写标题并选择所属菜单');
    return;
  }
  saving.value = true;
  try {
    if (editTarget.value) {
      await fetchUpdateContent(editTarget.value.id, form);
    } else {
      await fetchCreateContent(form);
    }
    window.$message?.success(editTarget.value ? '更新成功' : '创建成功');
    closeModal();
    getData();
  } finally {
    saving.value = false;
  }
}

async function handleDelete(id: number) {
  await fetchDeleteContent(id);
  window.$message?.success('删除成功');
  getData();
}

function handleSearch() { paginationReactive.page = 1; getData(); }
function handleReset() { Object.assign(searchParams, { title: '', menuId: undefined }); paginationReactive.page = 1; getData(); }
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <!-- 搜索栏 -->
    <NCard :bordered="false" size="small" class="card-wrapper">
      <NSpace>
        <NInput v-model:value="searchParams.title" placeholder="页面标题" clearable class="w-200px" />
        <NSelect v-model:value="searchParams.menuId" :options="flatMenuOptions" placeholder="所属菜单" clearable class="w-180px" />
        <NButton type="primary" @click="handleSearch">
          <template #icon><icon-ic-round-search class="text-icon" /></template>
          搜索
        </NButton>
        <NButton @click="handleReset">
          <template #icon><icon-ic-round-refresh class="text-icon" /></template>
          重置
        </NButton>
      </NSpace>
    </NCard>

    <!-- 表格 -->
    <NCard title="页面内容" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <NButton type="primary" size="small" @click="openCreate">新建内容页</NButton>
      </template>
      <NDataTable
        :columns="columns"
        :data="data"
        :loading="loading"
        :pagination="pagination"
        :flex-height="!appStore.isMobile"
        :scroll-x="900"
        remote
        class="sm:h-full"
        size="small"
      />
    </NCard>

    <!-- 编辑/创建 Modal -->
    <NModal v-model:show="showModal" preset="card" :title="editTarget ? '编辑内容' : '新建内容'" class="w-900px">
      <NForm label-placement="left" label-width="90">
        <NFormItem label="所属菜单" :feedback="'仅页面类型菜单可配置内容'" feedback-status="info">
          <NSelect v-model:value="form.menuId" :options="flatMenuOptions" placeholder="选择菜单" :disabled="!!editTarget" />
        </NFormItem>
        <NFormItem label="页面标题">
          <NInput v-model:value="form.title" placeholder="页面标题" />
        </NFormItem>
        <NFormItem label="内容类型">
          <NRadioGroup v-model:value="form.contentType">
            <NRadioButton value="RICHTEXT">富文本编辑</NRadioButton>
            <NRadioButton value="FILE">文件预览</NRadioButton>
          </NRadioGroup>
        </NFormItem>

        <!-- 富文本编辑器 -->
        <NFormItem v-if="form.contentType === 'RICHTEXT'" label="正文内容">
          <div class="w-full">
            <RichEditor v-model="form.richText" placeholder="请输入正文内容..." :height="420" />
          </div>
        </NFormItem>

        <!-- 文件上传区域 -->
        <template v-else>
          <NFormItem label="上传文件">
            <div class="w-full">
              <NUpload
                multiple
                :custom-request="handleCustomUpload"
                :show-file-list="false"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.webm"
              >
                <NUploadDragger>
                  <div class="py-6 text-center">
                    <NIcon size="36" class="text-gray-400 mb-2">
                      <icon-ic-round-cloud-upload />
                    </NIcon>
                    <p class="text-sm text-gray-500 mb-1">点击或拖拽文件到此处上传</p>
                    <p class="text-xs text-gray-400">支持 PDF、图片、视频，单文件最大 100MB</p>
                  </div>
                </NUploadDragger>
              </NUpload>

              <!-- 已上传文件列表 -->
              <div v-if="uploadedFiles.length > 0" class="mt-3 border border-gray-200 rounded overflow-hidden">
                <div class="bg-gray-50 px-3 py-2 text-xs text-gray-500 border-b border-gray-200">
                  已上传文件（{{ uploadedFiles.length }} 个）
                </div>
                <div
                  v-for="file in uploadedFiles"
                  :key="file.id"
                  class="flex items-center justify-between px-3 py-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="text-base flex-shrink-0">{{ fileTypeIcon(file.fileType) }}</span>
                    <div class="min-w-0">
                      <div class="text-sm text-gray-800 truncate">{{ file.originalName }}</div>
                      <div class="text-xs text-gray-400">{{ formatSize(file.size) }}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <a :href="file.url" target="_blank" class="text-xs text-blue-500 hover:underline">预览</a>
                    <NPopconfirm @positive-click="handleRemoveFile(file.id)">
                      <template #trigger>
                        <NButton size="tiny" type="error" ghost>删除</NButton>
                      </template>
                      确认删除该文件？
                    </NPopconfirm>
                  </div>
                </div>
              </div>

              <NAlert v-else type="info" :show-icon="false" class="mt-2">
                上传后文件将在前端页面内嵌预览（PDF 使用在线查看器，视频直接播放）
              </NAlert>
            </div>
          </NFormItem>
        </template>

        <NFormItem label="立即发布">
          <NSwitch v-model:value="form.isPublished" />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="closeModal">取消</NButton>
          <NButton type="primary" :loading="saving" @click="handleSave">保存</NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>
