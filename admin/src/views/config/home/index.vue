<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { fetchHomeConfig, fetchSaveHomeConfig } from '@/service/api'

const message = useMessage()

const configs = ref<Record<string, string>>({})
const stats = ref<Api.Config.HomeStat[]>([])
const saving = ref(false)

async function loadConfig() {
  const { data } = await fetchHomeConfig()
  const configArr = data?.configs || []
  configs.value = configArr.reduce((acc, c) => ({ ...acc, [c.configKey]: c.configValue }), {} as Record<string, string>)
  stats.value = data?.stats || []
}

onMounted(loadConfig)

async function save() {
  saving.value = true
  await fetchSaveHomeConfig({ configs: configs.value, stats: stats.value })
  saving.value = false
  message.success('保存成功')
}

function addStat() {
  stats.value.push({ id: Date.now(), label: '新指标', value: '0', icon: 'lucide:star', sortOrder: stats.value.length, isVisible: true })
}

function removeStat(i: number) {
  stats.value.splice(i, 1)
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard title="首页基本配置" :bordered="false" class="card-wrapper">
      <NForm label-placement="left" label-width="120">
        <NFormItem label="Hero 主标题">
          <NInput v-model:value="configs['hero_title']" placeholder="首页大标题" />
        </NFormItem>
        <NFormItem label="Hero 副标题">
          <NInput v-model:value="configs['hero_subtitle']" type="textarea" :rows="2" placeholder="首页副标题/简介" />
        </NFormItem>
        <NFormItem label="宣传视频 URL">
          <NInput v-model:value="configs['hero_video']" placeholder="视频文件链接（mp4）" />
        </NFormItem>
        <NFormItem label="封面图 URL">
          <NInput v-model:value="configs['hero_cover']" placeholder="视频封面图链接（jpg/png）" />
        </NFormItem>
      </NForm>
    </NCard>

    <NCard title="核心数据统计" :bordered="false" class="card-wrapper">
      <template #header-extra>
        <NButton type="primary" size="small" @click="addStat">+ 添加指标</NButton>
      </template>
      <div class="space-y-3">
        <div
          v-for="(stat, i) in stats"
          :key="stat.id"
          class="flex items-center gap-3 p-3 border border-gray-100 rounded-lg bg-gray-50"
        >
          <NInput v-model:value="stat.label" placeholder="指标名称" style="width: 160px" />
          <NInput v-model:value="stat.value" placeholder="数值，如：32项" style="width: 120px" />
          <NInput v-model:value="stat.icon" placeholder="图标（lucide:xxx）" style="width: 180px" />
          <NInputNumber v-model:value="stat.sortOrder" :min="0" placeholder="排序" style="width: 80px" />
          <NSwitch v-model:value="stat.isVisible" />
          <NButton type="error" size="small" @click="removeStat(i)">删除</NButton>
        </div>
        <NEmpty v-if="!stats.length" description="暂无统计数据，点击右上角添加" />
      </div>
    </NCard>

    <div class="flex justify-end">
      <NButton type="primary" :loading="saving" @click="save">保存所有配置</NButton>
    </div>
  </div>
</template>
