<script setup lang="tsx">
import { ref, reactive, computed, onMounted, h } from 'vue'
import {
  NButton, NSpace, NTag, NInput, NPopconfirm, NSwitch,
  NModal, NForm, NFormItem, NSelect, NInputGroup, NIcon,
  type FormInst, type FormRules
} from 'naive-ui'
import { fetchUserList, fetchCreateUser, fetchUpdateUser, fetchDeleteUser } from '@/service/api'
import { useAuthStore } from '@/store/modules/auth'
import { useAppStore } from '@/store/modules/app'

const appStore = useAppStore()
const authStore = useAuthStore()

// 当前登录者是否为超级管理员
const isSuperAdmin = computed(() => authStore.userInfo.roles.includes('R_SUPER'))

const loading = ref(false)
const users = ref<Api.Manage.AdminUser[]>([])

async function loadList() {
  loading.value = true
  const { data } = await fetchUserList()
  users.value = (data as any) || []
  loading.value = false
}

onMounted(loadList)

// ── 角色标签 ────────────────────────────────────────────────────
const roleLabels: Record<string, string> = {
  SUPER_ADMIN: '超级管理员',
  ADMIN: '管理员',
  EDITOR: '运营人员',
}
const roleColors: Record<string, 'error' | 'warning' | 'info'> = {
  SUPER_ADMIN: 'error',
  ADMIN: 'warning',
  EDITOR: 'info',
}

// 创建/编辑时可选的角色（不允许设置超级管理员）
const roleOptions = [
  { label: '管理员', value: 'ADMIN' },
  { label: '运营人员', value: 'EDITOR' },
]

// ── 新增/编辑弹窗 ───────────────────────────────────────────────
const showModal = ref(false)
const isEdit = ref(false)
const editId = ref<number | null>(null)
const formRef = ref<FormInst | null>(null)

const formModel = reactive({
  username: '',
  password: '',
  realName: '',
  role: 'EDITOR' as 'ADMIN' | 'EDITOR',
})

const formRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    {
      required: true,
      message: '请输入密码（至少6位）',
      trigger: 'blur',
      validator: (_rule, value) => {
        if (isEdit.value && !value) return true // 编辑时密码可选
        if (!value || value.length < 6) return new Error('密码至少6位')
        return true
      },
    },
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

function openCreate() {
  isEdit.value = false
  editId.value = null
  Object.assign(formModel, { username: '', password: '', realName: '', role: 'EDITOR' })
  showModal.value = true
}

function openEdit(row: Api.Manage.AdminUser) {
  isEdit.value = true
  editId.value = row.id
  Object.assign(formModel, {
    username: row.username,
    password: '',
    realName: row.realName || '',
    role: row.role === 'SUPER_ADMIN' ? 'ADMIN' : row.role,
  })
  showModal.value = true
}

const saving = ref(false)
async function handleSave() {
  await formRef.value?.validate()
  saving.value = true
  try {
    if (isEdit.value && editId.value) {
      const payload: Api.Manage.UserUpdateForm = { realName: formModel.realName, role: formModel.role }
      if (formModel.password) payload.password = formModel.password
      const { error } = await fetchUpdateUser(editId.value, payload)
      if (!error) {
        window.$message?.success('更新成功')
        showModal.value = false
        loadList()
      }
    } else {
      const { error } = await fetchCreateUser({
        username: formModel.username,
        password: formModel.password,
        realName: formModel.realName || undefined,
        role: formModel.role,
      })
      if (!error) {
        window.$message?.success('创建成功')
        showModal.value = false
        loadList()
      }
    }
  } finally {
    saving.value = false
  }
}

// ── 启用/禁用 ────────────────────────────────────────────────────
async function toggleActive(row: Api.Manage.AdminUser) {
  const { error } = await fetchUpdateUser(row.id, { isActive: !row.isActive })
  if (!error) {
    row.isActive = !row.isActive
    window.$message?.success(row.isActive ? '已启用' : '已禁用')
  }
}

// ── 删除 ─────────────────────────────────────────────────────────
async function remove(id: number) {
  const { error } = await fetchDeleteUser(id)
  if (!error) {
    window.$message?.success('删除成功')
    loadList()
  }
}

// ── 格式化时间 ───────────────────────────────────────────────────
function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

// ── 当前登录用户 ID ───────────────────────────────────────────────
const currentUserId = computed(() => Number(authStore.userInfo.userId))

// ── 搜索过滤 ─────────────────────────────────────────────────────
const searchName = ref('')
const filteredUsers = computed(() =>
  searchName.value
    ? users.value.filter(u => u.username.includes(searchName.value) || (u.realName || '').includes(searchName.value))
    : users.value
)

// ── 表格列 ───────────────────────────────────────────────────────
const columns = [
  { title: '用户名', key: 'username', minWidth: 120 },
  { title: '姓名', key: 'realName', minWidth: 100, render: (row: Api.Manage.AdminUser) => row.realName || '—' },
  {
    title: '角色', key: 'role', minWidth: 120, align: 'center' as const,
    render: (row: Api.Manage.AdminUser) =>
      h(NTag, { type: roleColors[row.role] || 'default', size: 'small' }, { default: () => roleLabels[row.role] || row.role }),
  },
  {
    title: '状态', key: 'isActive', minWidth: 100, align: 'center' as const,
    render: (row: Api.Manage.AdminUser) => {
      if (row.role === 'SUPER_ADMIN') return h(NTag, { type: 'success', size: 'small' }, { default: () => '正常' })
      return h(NSwitch, {
        value: row.isActive,
        size: 'small',
        disabled: row.id === currentUserId.value,
        onUpdateValue: () => toggleActive(row),
      })
    },
  },
  { title: '最后登录', key: 'lastLoginAt', minWidth: 160, align: 'center' as const, render: (row: Api.Manage.AdminUser) => fmtDate(row.lastLoginAt) },
  { title: '创建时间', key: 'createdAt', minWidth: 120, align: 'center' as const, render: (row: Api.Manage.AdminUser) => new Date(row.createdAt).toLocaleDateString('zh-CN') },
  {
    title: '操作', key: 'actions', minWidth: 160, align: 'center' as const,
    render: (row: Api.Manage.AdminUser) => {
      if (row.role === 'SUPER_ADMIN') {
        return h(NTag, { size: 'small', type: 'error' }, { default: () => '系统账号' })
      }
      return (
        <NSpace justify="center">
          <NButton size="small" type="primary" onClick={() => openEdit(row)}>编辑</NButton>
          <NPopconfirm onPositiveClick={() => remove(row.id)}>
            {{
              default: () => `确认删除用户「${row.username}」？`,
              trigger: () => (
                <NButton
                  size="small"
                  type="error"
                  disabled={row.id === currentUserId.value}
                >
                  删除
                </NButton>
              ),
            }}
          </NPopconfirm>
        </NSpace>
      )
    },
  },
]
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <!-- 搜索栏 -->
    <NCard :bordered="false" size="small" class="card-wrapper">
      <NSpace>
        <NInput v-model:value="searchName" placeholder="用户名 / 姓名" clearable class="w-200px" />
        <NButton type="primary" @click="loadList">
          <template #icon><icon-ic-round-search class="text-icon" /></template>
          搜索
        </NButton>
        <NButton @click="() => { searchName = ''; loadList(); }">
          <template #icon><icon-ic-round-refresh class="text-icon" /></template>
          重置
        </NButton>
      </NSpace>
    </NCard>

    <!-- 表格 -->
    <NCard title="用户管理" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <NButton type="primary" size="small" @click="openCreate">
          <template #icon><icon-ic-round-add class="text-icon" /></template>
          新增用户
        </NButton>
      </template>

      <!-- 角色说明 -->
      <NAlert type="info" class="mb-12px" style="font-size:12px;">
        <b>超级管理员</b>：系统初始化账号，不可通过界面创建或修改；
        <b>管理员</b>：可访问后台全部功能；
        <b>运营人员</b>：仅可访问"首页、页面内容、新闻动态"三个模块。
      </NAlert>

      <NDataTable
        :loading="loading"
        :columns="columns"
        :data="filteredUsers"
        :row-key="(row: Api.Manage.AdminUser) => row.id"
        :flex-height="!appStore.isMobile"
        :scroll-x="900"
        class="sm:h-full"
        size="small"
      />
    </NCard>

    <!-- 新增 / 编辑弹窗 -->
    <NModal
      v-model:show="showModal"
      :title="isEdit ? '编辑用户' : '新增用户'"
      preset="card"
      class="w-440px"
      :mask-closable="false"
    >
      <NForm ref="formRef" :model="formModel" :rules="formRules" label-placement="left" label-width="80px">
        <NFormItem label="用户名" path="username">
          <NInput
            v-model:value="formModel.username"
            placeholder="登录用户名"
            :disabled="isEdit"
            :input-props="{ autocomplete: 'off' }"
          />
        </NFormItem>
        <NFormItem label="姓名" path="realName">
          <NInput
            v-model:value="formModel.realName"
            placeholder="真实姓名（选填）"
            :input-props="{ autocomplete: 'off' }"
          />
        </NFormItem>
        <NFormItem label="角色" path="role">
          <NSelect v-model:value="formModel.role" :options="roleOptions" />
        </NFormItem>
        <NFormItem :label="isEdit ? '新密码' : '密码'" path="password">
          <NInput
            v-model:value="formModel.password"
            type="password"
            show-password-on="click"
            :placeholder="isEdit ? '留空则不修改密码' : '请输入密码（至少6位）'"
            :input-props="{ autocomplete: 'new-password' }"
          />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="showModal = false">取消</NButton>
          <NButton type="primary" :loading="saving" @click="handleSave">保存</NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>
