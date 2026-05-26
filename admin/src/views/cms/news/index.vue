<script setup lang="tsx">
import { ref, reactive, computed } from 'vue';
import { NButton, NSpace, NPopconfirm, NTag, NInput, NSelect, NSwitch } from 'naive-ui';
import { fetchNewsList, fetchNewsDetail, fetchCreateNews, fetchUpdateNews, fetchDeleteNews } from '@/service/api';
import { useNaivePaginatedTable } from '@/hooks/common/table';
import { useAppStore } from '@/store/modules/app';
import { useBoolean } from '@sa/hooks';

const appStore = useAppStore();
const { bool: showModal, setTrue: openModal, setFalse: closeModal } = useBoolean();

const paginationReactive = reactive({ page: 1, pageSize: 20 });
const editTarget = ref<Api.Cms.NewsItem | null>(null);
const saving = ref(false);

const CATEGORIES = ['媒体报道', '获奖公告', '高校交流', '学生成果', '校园动态'];
const CATEGORY_OPTIONS = CATEGORIES.map(c => ({ label: c, value: c }));

const form = reactive<Api.Cms.NewsForm>({
  title: '',
  summary: '',
  content: '',
  category: '校园动态',
  isPublished: true,
  publishedAt: '',
});

const CATEGORY_TYPE: Record<string, 'error' | 'warning' | 'info' | 'success' | 'default'> = {
  获奖公告: 'error',
  媒体报道: 'info',
  高校交流: 'default',
  学生成果: 'success',
  校园动态: 'warning',
};

const { columns, data, loading, pagination, getData } = useNaivePaginatedTable({
  api: async () => fetchNewsList(paginationReactive.page, paginationReactive.pageSize),
  transform: response => {
    const res = (response as any)?.data;
    return { data: res?.items || [], pageNum: paginationReactive.page, pageSize: paginationReactive.pageSize, total: res?.total || 0 };
  },
  onPaginationParamsChange: params => {
    paginationReactive.page = params.page || 1;
    paginationReactive.pageSize = params.pageSize || 20;
  },
  columns: () => [
    { title: '标题', key: 'title', minWidth: 260, ellipsis: { tooltip: true } },
    {
      title: '分类', key: 'category', minWidth: 100, align: 'center',
      render: (row: Api.Cms.NewsItem) => (
        <NTag type={CATEGORY_TYPE[row.category || ''] || 'default'} size="small" round>
          {row.category || '-'}
        </NTag>
      )
    },
    {
      title: '状态', key: 'isPublished', minWidth: 90, align: 'center',
      render: (row: Api.Cms.NewsItem) => (
        <NTag type={row.isPublished ? 'success' : 'default'} size="small">
          {row.isPublished ? '已发布' : '草稿'}
        </NTag>
      )
    },
    {
      title: '发布时间', key: 'publishedAt', minWidth: 130, align: 'center',
      render: (row: Api.Cms.NewsItem) => row.publishedAt ? row.publishedAt.slice(0, 10) : '-'
    },
    { title: '浏览量', key: 'viewCount', minWidth: 80, align: 'center' },
    {
      title: '操作', key: 'actions', minWidth: 160, align: 'center',
      render: (row: Api.Cms.NewsItem) => (
        <NSpace justify="center">
          <NButton size="small" type="primary" onClick={() => openEdit(row)}>编辑</NButton>
          <NPopconfirm onPositiveClick={() => handleDelete(row.id)}>
            {{ default: () => '确认删除该新闻？', trigger: () => <NButton size="small" type="error">删除</NButton> }}
          </NPopconfirm>
        </NSpace>
      )
    }
  ]
});

async function openEdit(row: Api.Cms.NewsItem) {
  const { data: detail } = await fetchNewsDetail(row.id);
  editTarget.value = row;
  Object.assign(form, {
    title: row.title,
    summary: row.summary || '',
    content: detail?.content || '',
    category: row.category || '校园动态',
    isPublished: row.isPublished,
    publishedAt: row.publishedAt || '',
  });
  openModal();
}

function openCreate() {
  editTarget.value = null;
  Object.assign(form, { title: '', summary: '', content: '', category: '校园动态', isPublished: true, publishedAt: '' });
  openModal();
}

async function handleSave() {
  if (!form.title) {
    window.$message?.warning('请填写新闻标题');
    return;
  }
  saving.value = true;
  const payload = {
    ...form,
    publishedAt: form.isPublished && !form.publishedAt ? new Date().toISOString() : (form.publishedAt || undefined),
  };
  if (editTarget.value) {
    await fetchUpdateNews(editTarget.value.id, payload);
  } else {
    await fetchCreateNews(payload);
  }
  saving.value = false;
  window.$message?.success(editTarget.value ? '更新成功' : '发布成功');
  closeModal();
  getData();
}

async function handleDelete(id: number) {
  await fetchDeleteNews(id);
  window.$message?.success('删除成功');
  getData();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard title="新闻动态管理" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <NButton type="primary" size="small" @click="openCreate">
          <template #icon><icon-ic-round-add class="text-icon" /></template>
          发布新闻
        </NButton>
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
    <NModal v-model:show="showModal" preset="card" :title="editTarget ? '编辑新闻' : '发布新闻'" class="w-640px">
      <div class="space-y-4 py-1">
        <div>
          <div class="text-sm font-medium text-gray-700 mb-1.5">新闻标题 <span class="text-red-500">*</span></div>
          <NInput v-model:value="form.title" placeholder="请输入新闻标题" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-sm font-medium text-gray-700 mb-1.5">分类</div>
            <NSelect v-model:value="form.category" :options="CATEGORY_OPTIONS" />
          </div>
          <div>
            <div class="text-sm font-medium text-gray-700 mb-1.5">发布状态</div>
            <div class="flex items-center h-34px gap-2">
              <NSwitch v-model:value="form.isPublished" />
              <span class="text-sm text-gray-500">{{ form.isPublished ? '立即发布' : '存为草稿' }}</span>
            </div>
          </div>
        </div>
        <div>
          <div class="text-sm font-medium text-gray-700 mb-1.5">摘要</div>
          <NInput v-model:value="form.summary" type="textarea" :rows="2" placeholder="简短描述，显示在新闻列表和首页预览（不填则截取正文）" />
        </div>
        <div>
          <div class="text-sm font-medium text-gray-700 mb-1.5">正文内容</div>
          <NInput v-model:value="form.content" type="textarea" :rows="10" placeholder="支持 HTML 内容" />
        </div>
      </div>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="closeModal">取消</NButton>
          <NButton type="primary" :loading="saving" @click="handleSave">
            {{ form.isPublished ? '发布' : '保存草稿' }}
          </NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>
