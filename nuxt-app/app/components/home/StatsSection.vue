<script setup lang="ts">
const stats = [
  { icon: 'lucide:award', value: '2项', label: '国家级教学成果奖' },
  { icon: 'lucide:trophy', value: '3项', label: '省级一等奖' },
  { icon: 'lucide:users', value: '3000+', label: '年度在校生' },
  { icon: 'lucide:graduation-cap', value: '98%', label: '毕业生就业率' },
  { icon: 'lucide:book-open', value: '48门', label: '精品课程' },
  { icon: 'lucide:building-2', value: '120家', label: '校企合作单位' },
  { icon: 'lucide:medal', value: '500+', label: '学生竞赛获奖' },
  { icon: 'lucide:flask-conical', value: '12项', label: '大创立项' },
]
</script>

<template>
  <section class="bg-gray-50 border-t border-gray-200 py-12">
    <div class="max-w-7xl mx-auto px-6">
      <div class="flex items-center gap-3 mb-8" data-sr="left">
        <div class="w-1 h-8 bg-[#B01C1C] rounded-sm" />
        <h2 class="text-xl md:text-2xl font-bold text-gray-800">核心成果数据</h2>
        <span class="text-xs text-gray-400 ml-1 hidden md:block">Core Data</span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-px bg-gray-200 border border-gray-200">
        <div v-for="(stat, i) in stats" :key="stat.label" data-sr="up" :data-delay="String(i * 60)"
          class="flex flex-col items-center justify-center py-6 px-3 text-center bg-white hover:bg-red-50 transition-colors cursor-default group">
          <UIcon :name="stat.icon"
            class="text-xl text-[#B01C1C]/40 group-hover:text-[#B01C1C] transition-colors mb-2.5" />
          <div class="text-xl md:text-2xl font-bold text-[#B01C1C] leading-none mb-1">{{ stat.value }}</div>
          <div class="text-xs text-gray-500 leading-tight">{{ stat.label }}</div>
        </div>
      </div>

      <p class="text-right text-xs text-gray-400 mt-3">数据来源：教务处统计报告（2024年度）</p>
    </div>
  </section>
</template>
