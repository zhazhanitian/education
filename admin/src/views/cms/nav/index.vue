<script setup lang="tsx">
import { ref, reactive, onMounted } from 'vue';
import { NButton, NSpace, NPopconfirm, NTag, NSwitch, NInput } from 'naive-ui';
import { fetchNavList, fetchCreateNav, fetchUpdateNav, fetchDeleteNav } from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { useBoolean } from '@sa/hooks';

const appStore = useAppStore();
const { bool: showModal, setTrue: openModal, setFalse: closeModal } = useBoolean();

const editTarget = reactive<{ id: number | null; data: Api.Cms.NavMenuForm }>({
  id: null,
  data: { name: '', type: 'PAGE', sortOrder: 0, isVisible: true, parentId: null }
});

const loading = reactive({ table: false, save: false });
const tableData = ref<Api.Cms.NavMenu[]>([]);

async function loadList() {
  loading.table = true;
  const { data } = await fetchNavList();
  tableData.value = data || [];
  loading.table = false;
}

onMounted(loadList);

function openCreate(parentId?: number) {
  editTarget.id = null;
  Object.assign(editTarget.data, {
    name: '', type: parentId ? 'PAGE' : 'DIRECTORY',
    sortOrder: 0, isVisible: true, parentId: parentId ?? null
  });
  openModal();
}

function openEdit(row: Api.Cms.NavMenu) {
  editTarget.id = row.id;
  Object.assign(editTarget.data, {
    name: row.name, type: row.type,
    sortOrder: row.sortOrder, isVisible: row.isVisible, parentId: row.parentId
  });
  openModal();
}

async function handleSave() {
  if (!editTarget.data.name) {
    window.$message?.warning('请填写菜单名称');
    return;
  }
  loading.save = true;
  if (editTarget.id) {
    await fetchUpdateNav(editTarget.id, editTarget.data);
  } else {
    await fetchCreateNav(editTarget.data);
  }
  loading.save = false;
  window.$message?.success(editTarget.id ? '更新成功' : '创建成功');
  closeModal();
  loadList();
}

async function handleDelete(id: number) {
  await fetchDeleteNav(id);
  window.$message?.success('删除成功');
  loadList();
}

async function toggleVisible(row: Api.Cms.NavMenu, v: boolean) {
  await fetchUpdateNav(row.id, { name: row.name, type: row.type, sortOrder: row.sortOrder, isVisible: v, parentId: row.parentId });
  loadList();
}

const TYPE_LABEL: Record<Api.Cms.MenuType, string> = {
  DIRECTORY: '目录',
  PAGE: '页面',
};

const columns: NaiveUI.TableColumn<Api.Cms.NavMenu>[] = [
  { title: '菜单名称', key: 'name', minWidth: 180 },
  {
    title: '类型', key: 'type', minWidth: 100, align: 'center',
    render: row => (
      <NTag type={row.type === 'DIRECTORY' ? 'info' : 'success'} size="small">
        {TYPE_LABEL[row.type]}
      </NTag>
    )
  },
  { title: '排序', key: 'sortOrder', minWidth: 80, align: 'center' },
  {
    title: '层级', key: 'parentId', minWidth: 100, align: 'center',
    render: row => <NTag type={row.parentId ? 'warning' : 'default'} size="small">{row.parentId ? '二级菜单' : '一级菜单'}</NTag>
  },
  {
    title: '显示', key: 'isVisible', minWidth: 90, align: 'center',
    render: row => <NSwitch value={row.isVisible} onUpdateValue={(v: boolean) => toggleVisible(row, v)} size="small" />
  },
  {
    title: '操作', key: 'actions', width: 240, align: 'center',
    render: row => (
      <NSpace>
        <NButton size="small" type="primary" onClick={() => openEdit(row)}>编辑</NButton>
        <NPopconfirm onPositiveClick={() => handleDelete(row.id)}>
          {{ default: () => '确认删除？同时删除关联内容', trigger: () => <NButton size="small" type="error">删除</NButton> }}
        </NPopconfirm>
        {!row.parentId
          ? <NButton size="small" onClick={() => openCreate(row.id)}>+ 子菜单</NButton>
          : <div style="width: 74px" />
        }
      </NSpace>
    )
  }
];
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <!-- 表格 -->
    <NCard title="导航菜单" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <NButton type="primary" size="small" @click="openCreate()">新建一级菜单</NButton>
      </template>
      <NDataTable :columns="columns" :data="tableData" :loading="loading.table"
        :row-key="(row: Api.Cms.NavMenu) => row.id"
        :expanded-row-keys="tableData.filter(m => m.children?.length).map(m => m.id)" :child-column-key="'children'"
        :flex-height="!appStore.isMobile" :scroll-x="800" class="sm:h-full" size="small" />
    </NCard>

    <!-- 编辑/创建 Modal -->
    <NModal v-model:show="showModal" preset="card" :title="editTarget.id ? '编辑菜单' : '新建菜单'" class="w-460px">
      <div class="space-y-5 py-1">
        <!-- 菜单名称 -->
        <div>
          <div class="text-sm font-medium text-gray-700 mb-1.5">菜单名称</div>
          <NInput v-model:value="editTarget.data.name" placeholder="例：成果申报" size="medium" />
        </div>

        <!-- 菜单类型 -->
        <div>
          <div class="text-sm font-medium text-gray-700 mb-2">菜单类型</div>
          <div class="grid grid-cols-2 gap-3">
            <div class="type-card cursor-pointer rounded-lg border-2 p-3 transition-all" :class="editTarget.data.type === 'DIRECTORY'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'" @click="editTarget.data.type = 'DIRECTORY'">
              <div class="flex items-center gap-2 mb-1.5">
                <div class="w-7 h-7 rounded-md flex items-center justify-center"
                  :class="editTarget.data.type === 'DIRECTORY' ? 'bg-blue-500' : 'bg-gray-100'">
                  <icon-ic-round-folder class="text-base"
                    :class="editTarget.data.type === 'DIRECTORY' ? 'text-white' : 'text-gray-400'" />
                </div>
                <span class="text-sm font-semibold"
                  :class="editTarget.data.type === 'DIRECTORY' ? 'text-blue-600' : 'text-gray-600'">目录</span>
              </div>
              <p class="text-xs text-gray-400 leading-relaxed">点击时自动跳转至第一个子菜单</p>
            </div>

            <div class="type-card cursor-pointer rounded-lg border-2 p-3 transition-all" :class="editTarget.data.type === 'PAGE'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'" @click="editTarget.data.type = 'PAGE'">
              <div class="flex items-center gap-2 mb-1.5">
                <div class="w-7 h-7 rounded-md flex items-center justify-center"
                  :class="editTarget.data.type === 'PAGE' ? 'bg-green-500' : 'bg-gray-100'">
                  <icon-ic-round-article class="text-base"
                    :class="editTarget.data.type === 'PAGE' ? 'text-white' : 'text-gray-400'" />
                </div>
                <span class="text-sm font-semibold"
                  :class="editTarget.data.type === 'PAGE' ? 'text-green-600' : 'text-gray-600'">页面</span>
              </div>
              <p class="text-xs text-gray-400 leading-relaxed">点击时直接展示对应内容页</p>
            </div>
          </div>
        </div>

        <!-- 排序 + 显示 -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-sm font-medium text-gray-700 mb-1.5">排序权重</div>
            <NInputNumber v-model:value="editTarget.data.sortOrder" :min="0" class="w-full" placeholder="0" />
          </div>
          <div>
            <div class="text-sm font-medium text-gray-700 mb-1.5">是否显示</div>
            <div class="flex items-center h-34px">
              <NSwitch v-model:value="editTarget.data.isVisible" />
              <span class="ml-2 text-sm text-gray-500">{{ editTarget.data.isVisible ? '显示' : '隐藏' }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="closeModal">取消</NButton>
          <NButton type="primary" :loading="loading.save" @click="handleSave">保存</NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>
