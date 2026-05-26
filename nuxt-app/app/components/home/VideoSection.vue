<script setup lang="ts">
const showVideo = ref(false)
</script>

<template>
  <section id="video-section" class="py-14 bg-white border-t border-gray-200">
    <div class="max-w-7xl mx-auto px-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

        <!-- 左：视频播放区 -->
        <div data-sr="left" data-delay="100">
          <!-- 标题 -->
          <div class="flex items-center gap-3 mb-5">
            <div class="w-1 h-8 bg-[#B01C1C] rounded-sm" />
            <h2 class="text-xl font-bold text-gray-800">成果视频</h2>
          </div>

          <!-- 视频封面 -->
          <div
            class="relative bg-gray-900 rounded-sm overflow-hidden cursor-pointer group"
            style="aspect-ratio: 16/9;"
            @click="showVideo = true"
          >
            <!-- 封面图 -->
            <img
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=70"
              alt="成果视频封面"
              class="w-full h-full object-cover opacity-70 group-hover:opacity-80 transition-opacity"
            />
            <!-- 播放按钮 -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-16 h-16 rounded-full bg-[#8C1515] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <UIcon name="lucide:play" class="text-white text-2xl ml-1" />
              </div>
            </div>
            <!-- 底部标签 -->
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-5 py-4">
              <p class="text-white text-sm font-medium">"产教融合、知行合一"高职人才培养模式创新与实践</p>
              <p class="text-gray-300 text-xs mt-1">某某高等职业技术学院 · 国家级教学成果奖宣传片</p>
            </div>
          </div>

          <p class="text-xs text-gray-400 mt-2 text-center">点击播放宣传视频</p>
        </div>

        <!-- 右：成果简介 -->
        <div data-sr="right" data-delay="150">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-1 h-8 bg-[#B01C1C] rounded-sm" />
            <h2 class="text-xl font-bold text-gray-800">成果简介</h2>
          </div>

          <div class="space-y-4 text-sm text-gray-600 leading-[1.9]">
            <p>
              本成果围绕高职院校人才培养质量提升核心命题，历经十余年探索实践，系统构建了"产教融合、知行合一"的高职人才培养新模式，形成了具有推广价值的典型经验。
            </p>
            <p>
              项目坚持以习近平新时代中国特色社会主义思想为引领，遵循职业教育规律，深入推进产教融合、校企合作，通过"课岗证赛创"五维一体课程体系建设，着力培养适应新时代产业发展需求的高技能人才。
            </p>
            <p>
              成果先后荣获<strong class="text-[#B01C1C]">国家级教学成果奖2项</strong>、省级教学成果奖一等奖3项，在全国多所高职院校推广应用，社会反响良好。
            </p>
          </div>

          <!-- 荣誉标签 -->
          <div class="mt-6 space-y-2.5">
            <div
              v-for="item in [
                { year: '2023', label: '国家级教学成果奖二等奖', level: '国家级' },
                { year: '2022', label: '省级教学成果奖一等奖', level: '省级' },
                { year: '2021', label: '省级教学成果奖一等奖', level: '省级' },
              ]"
              :key="item.label"
              class="flex items-center gap-3 p-3 border border-gray-100 bg-gray-50 hover:border-[#B01C1C]/20 hover:bg-red-50/30 transition-colors"
            >
              <span
                class="flex-shrink-0 text-xs font-bold px-2 py-0.5"
                :class="item.level === '国家级' ? 'bg-[#8C1515] text-white' : 'bg-gray-200 text-gray-600'"
              >
                {{ item.level }}
              </span>
              <span class="text-sm text-gray-700 flex-1">{{ item.label }}</span>
              <span class="text-xs text-gray-400">{{ item.year }}</span>
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
