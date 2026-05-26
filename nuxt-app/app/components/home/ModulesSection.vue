<script setup lang="ts">
const modules = [
  { icon: 'lucide:file-text', label: '成果申报', desc: '申报书、总结报告、附件材料' },
  { icon: 'lucide:video', label: '图片视频', desc: '宣传视频、教学视频、活动记录' },
  { icon: 'lucide:users', label: '人才培养', desc: '培养方案、学生画像、智慧课程' },
  { icon: 'lucide:trophy', label: '学生成果', desc: '学科竞赛、大创项目、创新成果' },
  { icon: 'lucide:newspaper', label: '媒体交流', desc: '媒体报道、高校交流、新闻稿' },
  { icon: 'lucide:bookmark', label: '典型案例', desc: '杰出毕业生、企业导师风采' },
  { icon: 'lucide:building-2', label: '产业合作', desc: '政校企合作资源、合作案例' },
  { icon: 'lucide:monitor-dot', label: '数字化平台', desc: '数字孪生仿真、智慧课程平台' },
]
</script>

<template>
  <section id="modules" class="py-14 bg-white border-t border-gray-200">
    <div class="max-w-7xl mx-auto px-6">
      <div class="flex items-center gap-3 mb-8" data-sr="left">
        <div class="w-1 h-8 bg-[#B01C1C] rounded-sm" />
        <h2 class="text-xl md:text-2xl font-bold text-gray-800">平台内容模块</h2>
        <span class="text-xs text-gray-400 ml-1 hidden md:block">Platform Modules</span>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200 border border-gray-200">
        <div v-for="(mod, i) in modules" :key="mod.label" data-sr="scale" :data-delay="String(i * 60)"
          class="group flex flex-col items-center justify-center py-8 px-5 text-center bg-white hover:bg-[#8C1515] transition-colors cursor-pointer">
          <div
            class="w-12 h-12 rounded-full bg-red-50 group-hover:bg-white/15 flex items-center justify-center mb-3 transition-colors">
            <UIcon :name="mod.icon" class="text-2xl text-[#B01C1C] group-hover:text-white transition-colors" />
          </div>
          <h3 class="font-bold text-sm text-gray-800 group-hover:text-white transition-colors mb-1.5">{{ mod.label }}
          </h3>
          <p class="text-xs text-gray-400 group-hover:text-red-200 transition-colors leading-relaxed">{{ mod.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
