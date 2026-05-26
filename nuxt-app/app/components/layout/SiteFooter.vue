<template>
  <footer class="bg-[#8C1515] text-red-200">
    <div class="max-w-7xl mx-auto px-6 py-10">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- 品牌 -->
        <div>
          <div class="flex items-center gap-2 mb-4">
            <div class="w-7 h-7 rounded-sm bg-[#C9A84C] flex items-center justify-center flex-shrink-0">
              <UIcon name="lucide:graduation-cap" class="text-white text-sm" />
            </div>
            <span class="text-white font-bold text-sm">教学成果奖申报平台</span>
          </div>
          <p class="text-xs leading-relaxed text-red-300">
            某某高等职业技术学院 · 聚焦高职教育教学改革创新，展示国家级教学成果奖申报成果，促进区域职业教育高质量发展。
          </p>
        </div>

        <!-- 快速链接 -->
        <div>
          <h4 class="text-white text-sm font-semibold mb-3 pb-2 border-b border-white/20">平台模块</h4>
          <ul class="grid grid-cols-2 gap-1.5">
            <li v-for="item in ['成果申报', '人才培养', '学生成果', '媒体交流', '典型案例', '数字化平台']" :key="item">
              <a href="#modules" class="text-xs text-red-200 hover:text-[#C9A84C] transition-colors flex items-center gap-1">
                <span class="w-1 h-1 rounded-full bg-red-300" />
                {{ item }}
              </a>
            </li>
          </ul>
        </div>

        <!-- 联系 -->
        <div>
          <h4 class="text-white text-sm font-semibold mb-3 pb-2 border-b border-white/20">联系我们</h4>
          <ul class="space-y-2 text-xs">
            <li class="flex items-center gap-2 text-red-200">
              <UIcon name="lucide:map-pin" class="text-[#C9A84C] flex-shrink-0 text-sm" />
              某某省某某市大学路1号
            </li>
            <li class="flex items-center gap-2 text-red-200">
              <UIcon name="lucide:phone" class="text-[#C9A84C] flex-shrink-0 text-sm" />
              0000-12345678
            </li>
            <li class="flex items-center gap-2 text-red-200">
              <UIcon name="lucide:mail" class="text-[#C9A84C] flex-shrink-0 text-sm" />
              achievement@example.edu.cn
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="border-t border-white/20 py-3">
      <div class="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-red-200">
        <span>© {{ new Date().getFullYear() }} 某某高等职业技术学院 教学成果奖申报平台</span>
        <span>技术支持：教务处信息化建设团队</span>
      </div>
    </div>
  </footer>
</template>
