<script setup lang="ts">
const tags = ['产教融合', '知行合一', '校企协同', '1+X证书', '双高计划', '课程思政']

const highlights = [
  {
    icon: 'lucide:lightbulb',
    title: '创新点一：构建五维一体培养体系',
    desc: '以"课岗证赛创"为主线，打通课程学习—岗位实践—证书认证—竞赛拓展—创新孵化的完整育人链条，实现知识、技能、素养协同提升。',
  },
  {
    icon: 'lucide:handshake',
    title: '创新点二：双向协同育人平台',
    desc: '创设"厂中校"与"校中厂"互嵌式实践基地，企业技术骨干与学校专任教师双向流动，打破校企育人壁垒，构建沉浸式产教融合生态。',
  },
  {
    icon: 'lucide:monitor-dot',
    title: '创新点三：数字化智慧教学赋能',
    desc: '自主研发数字孪生虚拟仿真平台，建设48门线上精品课程，依托未来学习中心实现"一云三阶、四维联动"的智慧教学新形态。',
  },
]
</script>

<template>
  <section class="py-14 bg-white">
    <div class="max-w-7xl mx-auto px-6">
      <div class="flex items-center gap-3 mb-10" data-sr="left">
        <div class="w-1 h-8 bg-[#B01C1C] rounded-sm" />
        <h2 class="text-xl md:text-2xl font-bold text-gray-800">成果简介</h2>
        <span class="text-xs text-gray-400 ml-1 hidden md:block">Achievement Introduction</span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
        <div class="lg:col-span-3" data-sr="up" data-delay="100">
          <h3 class="text-base font-bold text-[#B01C1C] mb-4 leading-relaxed">
            "产教融合、知行合一"的高职人才培养模式创新与实践
          </h3>
          <div class="space-y-3.5 text-gray-600 text-sm leading-[1.9]">
            <p>
              本成果历经十余年探索与实践，围绕高职院校人才培养质量提升这一核心命题，系统构建了"产教融合、知行合一"的人才培养新模式。成果以区域产业需求为导向，深化校企协同育人机制，形成了"课岗证赛创"五维一体人才培养体系。
            </p>
            <p>
              通过创设"厂中校"与"校中厂"双向协同育人平台，引入120余家优质企业参与人才共育，建立产业教授进课堂、骨干教师入企业的双向流动机制，实现教育链、人才链与产业链、创新链的有机衔接。
            </p>
            <p>
              成果先后荣获国家级教学成果奖2项、省级教学成果奖一等奖3项，学生竞赛获奖率连续五年位居全省前三，毕业生就业率保持在98%以上，社会影响力持续提升。
            </p>
          </div>
          <div class="mt-5 flex flex-wrap gap-2">
            <span
              v-for="tag in tags"
              :key="tag"
              class="px-3 py-1 text-xs border border-[#B01C1C]/20 text-[#B01C1C] bg-red-50 rounded-sm"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <div class="lg:col-span-2 space-y-3">
          <div
            v-for="(item, i) in highlights"
            :key="item.title"
            data-sr="up"
            :data-delay="String(200 + i * 100)"
            class="flex gap-3 p-4 border border-gray-100 hover:border-[#B01C1C]/30 hover:bg-red-50/30 transition-all rounded-sm"
          >
            <div class="w-8 h-8 rounded-sm bg-[#B01C1C]/8 flex items-center justify-center flex-shrink-0 mt-0.5">
              <UIcon :name="item.icon" class="text-[#B01C1C] text-base" />
            </div>
            <div>
              <h4 class="font-semibold text-gray-800 text-sm mb-1.5">{{ item.title }}</h4>
              <p class="text-xs text-gray-500 leading-relaxed">{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
