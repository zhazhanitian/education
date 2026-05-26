<script setup lang="ts">
// Hero 不再有视频弹窗，移至 VideoSection
</script>

<template>
  <section class="relative overflow-hidden">
    <!-- 多层背景 -->
    <div class="absolute inset-0 bg-[#9B1515]" />
    <!-- 右上角光晕 -->
    <div class="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#D42B2B]/30 blur-3xl" />
    <!-- 左下角光晕 -->
    <div class="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-[#7A0E0E]/40 blur-2xl" />
    <!-- 右侧斜切装饰块 -->
    <div class="absolute top-0 right-0 h-full w-2/5 bg-[#B01C1C]/50" style="clip-path: polygon(15% 0, 100% 0, 100% 100%, 0% 100%);" />
    <div class="absolute top-0 right-0 h-full w-1/4 bg-[#8C1515]/40" style="clip-path: polygon(20% 0, 100% 0, 100% 100%, 5% 100%);" />

    <!-- 底部波浪 -->
    <div class="absolute bottom-0 left-0 right-0 z-10">
      <svg viewBox="0 0 1440 50" preserveAspectRatio="none" class="w-full block" style="height:40px;" fill="white">
        <path d="M0,50 L0,20 Q360,0 720,20 Q1080,40 1440,10 L1440,50 Z" />
      </svg>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-24">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

        <!-- 左侧文案 -->
        <div class="lg:col-span-7">
          <div
            class="inline-flex items-center gap-2 border border-[#C9A84C]/60 bg-[#C9A84C]/15 text-[#C9A84C] text-xs px-3 py-1.5 mb-6 font-medium tracking-wide"
            data-sr="up" data-delay="100"
          >
            <UIcon name="lucide:award" class="text-sm" />
            国家级教学成果奖 · 二等奖
          </div>

          <h1 class="text-white font-bold leading-tight mb-5" data-sr="up" data-delay="200">
            <span class="block text-base md:text-lg text-red-300 font-normal mb-2 tracking-wide">"产教融合、知行合一"</span>
            <span class="block text-3xl md:text-4xl lg:text-[2.8rem] leading-tight">
              高职人才培养模式<br>
              <span class="text-[#C9A84C]">创新与实践</span>
            </span>
          </h1>

          <p class="text-red-200 text-sm md:text-base leading-relaxed mb-8 max-w-lg" data-sr="up" data-delay="300">
            聚焦高职教育教学改革创新，打造产教融合示范高地，助力高水平职业技术大学建设，向社会全面展示优质人才培养成效。
          </p>

          <div class="flex flex-wrap gap-3" data-sr="up" data-delay="400">
            <NuxtLink
              to="#video-section"
              class="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#B8963E] text-white px-6 py-2.5 text-sm font-medium transition-colors"
            >
              <UIcon name="lucide:play-circle" class="text-base" />
              观看宣传视频
            </NuxtLink>
            <NuxtLink
              to="#modules"
              class="inline-flex items-center gap-2 border border-white/30 hover:border-white/60 hover:bg-white/10 text-white px-6 py-2.5 text-sm font-medium transition-colors"
            >
              浏览内容模块
              <UIcon name="lucide:chevron-right" class="text-xs" />
            </NuxtLink>
          </div>
        </div>

        <!-- 右侧：数据卡片 -->
        <div class="lg:col-span-5" data-sr="right" data-delay="200">
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="(item, i) in [
                { icon: 'lucide:award',          value: '2项',   label: '国家级教学成果奖', gold: true },
                { icon: 'lucide:users',           value: '3000+', label: '年度在校生规模',   gold: false },
                { icon: 'lucide:graduation-cap',  value: '98%',   label: '毕业生就业率',     gold: false },
                { icon: 'lucide:building-2',      value: '120家', label: '校企合作单位',     gold: false },
              ]"
              :key="item.label"
              class="flex flex-col items-center justify-center py-6 px-4 text-center transition-colors"
              :class="item.gold
                ? 'bg-[#C9A84C]'
                : 'bg-white/10 hover:bg-white/15 border border-white/10'"
            >
              <UIcon
                :name="item.icon"
                class="text-2xl mb-2"
                :class="item.gold ? 'text-white' : 'text-red-200'"
              />
              <div class="text-2xl md:text-3xl font-bold text-white leading-none mb-1">{{ item.value }}</div>
              <div class="text-xs leading-tight" :class="item.gold ? 'text-yellow-100' : 'text-red-300'">{{ item.label }}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>
