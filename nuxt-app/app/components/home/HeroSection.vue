<script setup lang="ts">
const showVideo = ref(false)
</script>

<template>
  <section class="relative overflow-hidden bg-[#9B1515]">
    <!-- 右侧光晕 -->
    <div class="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />

    <!-- 底部波浪过渡到白色 -->
    <div class="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
      <svg viewBox="0 0 1440 50" preserveAspectRatio="none" class="w-full block" style="height:36px;" fill="white">
        <path d="M0,50 L0,25 Q360,0 720,20 Q1080,40 1440,8 L1440,50 Z" />
      </svg>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto px-6 py-14 md:py-20">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

        <!-- 左侧文案 -->
        <div class="lg:col-span-7">
          <div
            class="inline-flex items-center gap-2 border border-[#C9A84C]/50 text-[#C9A84C] text-xs px-3 py-1.5 mb-5 tracking-wide"
            data-sr="up" data-delay="100"
          >
            <UIcon name="lucide:award" class="text-sm" />
            国家级教学成果奖 · 二等奖
          </div>

          <h1 class="text-white font-bold leading-tight mb-4" data-sr="up" data-delay="200">
            <span class="block text-sm md:text-base text-red-300 font-normal mb-2 tracking-widest">"产教融合、知行合一"</span>
            <span class="block text-3xl md:text-4xl lg:text-5xl leading-tight">
              高职人才培养模式<br>
              <span class="text-[#C9A84C]">创新与实践</span>
            </span>
          </h1>

          <p class="text-red-200 text-sm leading-relaxed mb-7 max-w-lg" data-sr="up" data-delay="300">
            聚焦高职教育教学改革创新，打造产教融合示范高地，助力高水平职业技术大学建设，全面展示优质人才培养成效。
          </p>

          <div class="flex flex-wrap gap-3" data-sr="up" data-delay="400">
            <button
              class="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#B8963E] text-white px-5 py-2.5 text-sm font-medium transition-colors"
              @click="showVideo = true"
            >
              <UIcon name="lucide:play-circle" class="text-base" />
              观看宣传视频
            </button>
            <NuxtLink
              to="#modules"
              class="inline-flex items-center gap-2 border border-white/30 hover:border-white/60 text-white/85 hover:text-white px-5 py-2.5 text-sm transition-colors"
            >
              浏览内容模块
              <UIcon name="lucide:chevron-right" class="text-xs" />
            </NuxtLink>
          </div>
        </div>

        <!-- 右侧数据卡片 -->
        <div class="lg:col-span-5" data-sr="right" data-delay="200">
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="item in [
                { icon: 'lucide:award',         value: '2项',   label: '国家级教学成果奖', gold: true },
                { icon: 'lucide:users',          value: '3000+', label: '年度在校生规模',   gold: false },
                { icon: 'lucide:graduation-cap', value: '98%',   label: '毕业生就业率',     gold: false },
                { icon: 'lucide:building-2',     value: '120家', label: '校企合作单位',     gold: false },
              ]"
              :key="item.label"
              class="flex flex-col items-center justify-center py-6 px-4 text-center"
              :class="item.gold ? 'bg-[#C9A84C]' : 'bg-white/10 border border-white/10 hover:bg-white/15 transition-colors'"
            >
              <UIcon :name="item.icon" class="text-xl mb-2" :class="item.gold ? 'text-white' : 'text-red-200'" />
              <div class="text-2xl md:text-3xl font-bold text-white leading-none mb-1">{{ item.value }}</div>
              <div class="text-xs" :class="item.gold ? 'text-yellow-100' : 'text-red-300'">{{ item.label }}</div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- 视频弹窗 -->
    <Transition name="fade">
      <div v-if="showVideo" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90" @click.self="showVideo = false">
        <div class="relative w-full max-w-4xl mx-4">
          <button class="absolute -top-10 right-0 text-gray-400 hover:text-white text-sm flex items-center gap-1.5" @click="showVideo = false">
            <UIcon name="lucide:x" class="text-xs" /> 关闭
          </button>
          <video controls autoplay class="w-full shadow-2xl" style="max-height: 70vh;">
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
