<script setup lang="tsx">
import { ref, reactive, computed } from 'vue';
import { NButton, NSpace, NPopconfirm, NTag, NSwitch, NInput, NSelect, NRadioGroup, NRadioButton } from 'naive-ui';
import { fetchNavList, fetchContentList, fetchContentDetail, fetchCreateContent, fetchUpdateContent, fetchDeleteContent } from '@/service/api';
import { useNaivePaginatedTable } from '@/hooks/common/table';
import { useAppStore } from '@/store/modules/app';
import { useBoolean } from '@sa/hooks';

const appStore = useAppStore();
const { bool: showModal, setTrue: openModal, setFalse: closeModal } = useBoolean();

const searchParams = reactive({ title: '', menuId: undefined as number | undefined });
const menus = ref<Api.Cms.NavMenu[]>([]);
const editTarget = ref<Api.Cms.ContentPage | null>(null);
const form = reactive<Api.Cms.ContentPageForm>({
  title: '', contentType: 'RICHTEXT', richText: '', isPublished: true, menuId: null
});
const saving = ref(false);

const paginationReactive = reactive({ page: 1, pageSize: 20 });

// 只显示 PAGE 类型菜单（目录类型不需要内容页）
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
  Object.assign(form, {
    title: row.title,
    contentType: row.contentType,
    richText: detail?.richText || '',
    isPublished: row.isPublished,
    menuId: row.menuId,
  });
  openModal();
}

function openCreate() {
  editTarget.value = null;
  Object.assign(form, { title: '', contentType: 'RICHTEXT', richText: '', isPublished: true, menuId: null });
  openModal();
}

async function handleSave() {
  if (!form.title || !form.menuId) {
    window.$message?.warning('请填写标题并选择所属菜单');
    return;
  }
  saving.value = true;
  if (editTarget.value) {
    await fetchUpdateContent(editTarget.value.id, form);
  } else {
    await fetchCreateContent(form);
  }
  saving.value = false;
  window.$message?.success(editTarget.value ? '更新成功' : '创建成功');
  closeModal();
  getData();
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
        :scroll-x="800"
        remote
        class="sm:h-full"
        size="small"
      />
    </NCard>

    <!-- 编辑/创建 Modal -->
    <NModal v-model:show="showModal" preset="card" :title="editTarget ? '编辑内容' : '新建内容'" class="w-600px">
      <NForm label-placement="left" label-width="90">
        <NFormItem label="所属菜单" :feedback="'选择该内容对应的菜单项（仅页面类型菜单可配置内容）'" feedback-status="info">
          <NSelect v-model:value="form.menuId" :options="flatMenuOptions" placeholder="选择菜单" :disabled="!!editTarget" />
        </NFormItem>
        <NFormItem label="页面标题">
          <NInput v-model:value="form.title" placeholder="页面标题" />
        </NFormItem>
        <NFormItem label="内容类型" :feedback="form.contentType === 'RICHTEXT' ? '直接编写或粘贴富文本 HTML 内容' : '上传文件后在页面内嵌预览（PDF/Word/视频）'" :feedback-status="form.contentType === 'RICHTEXT' ? 'info' : 'warning'">
          <NRadioGroup v-model:value="form.contentType">
            <NRadioButton value="RICHTEXT">富文本</NRadioButton>
            <NRadioButton value="FILE">文件预览</NRadioButton>
          </NRadioGroup>
        </NFormItem>
        <NFormItem v-if="form.contentType === 'RICHTEXT'" label="正文内容">
          <NInput v-model:value="form.richText" type="textarea" :rows="10" placeholder="支持 HTML 内容，粘贴富文本编辑器的输出" />
        </NFormItem>
        <NFormItem v-else label="说明">
          <NAlert type="info" :show-icon="false">
            保存后在详情页上传文件，支持 PDF、Word、视频等格式，前端页面内嵌在线预览
          </NAlert>
        </NFormItem>
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
