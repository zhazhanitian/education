<script setup lang="ts">
const { data: navData } = await useFetch('/api/nav')
const menus = computed(() => navData.value?.data ?? [])

const activeMenu = ref<number | null>(null)
const mobileOpen = ref(false)

function onMenuEnter(id: number) { activeMenu.value = id }
function onMenuLeave() { activeMenu.value = null }

function menuLink(menu: { id: number; type: string; children?: Array<{ id: number; type: string }> }): string {
  if (menu.type === 'DIRECTORY') {
    const firstChild = menu.children?.[0]
    if (firstChild) return `/c/${firstChild.id}`
    return '/'
  }
  return `/c/${menu.id}`
}
</script>

<template>
  <header class="sticky top-0 z-50">

    <!-- 品牌栏：白底，校名 + 平台名 -->
    <div class="bg-white border-b border-gray-100 shadow-sm">
      <div class="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
        <!-- 左：Logo + 标题 -->
        <NuxtLink to="/" class="flex items-center gap-4 group">
          <div class="w-12 h-12 rounded-sm bg-[#B01C1C] flex items-center justify-center flex-shrink-0">
            <UIcon name="lucide:graduation-cap" class="text-white text-2xl" />
          </div>
          <div class="leading-tight">
            <div class="text-gray-400 text-xs tracking-widest mb-0.5 uppercase">Teaching Achievement Award</div>
            <div class="text-[#B01C1C] font-bold text-lg tracking-wide leading-none">教学成果奖申报平台</div>
          </div>
        </NuxtLink>

        <!-- 右：院校名 + 最新动态 -->
        <div class="hidden md:flex items-center gap-5">
          <span class="text-gray-400 text-sm border-r border-gray-200 pr-5">某某高等职业技术学院</span>
          <NuxtLink
            to="/news"
            class="flex items-center gap-1.5 text-sm text-[#B01C1C] hover:text-[#8C1515] transition-colors font-medium"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
            最新动态
          </NuxtLink>
        </div>

        <!-- 移动端 -->
        <button class="md:hidden text-gray-600 hover:text-[#B01C1C] p-1 transition-colors" @click="mobileOpen = !mobileOpen">
          <UIcon :name="mobileOpen ? 'lucide:x' : 'lucide:menu'" class="text-2xl" />
        </button>
      </div>
    </div>

    <!-- 导航栏：红底 -->
    <div class="bg-[#B01C1C] hidden md:block">
      <div class="max-w-7xl mx-auto px-6 flex items-center h-11">
        <NuxtLink
          to="/"
          class="h-11 flex items-center px-5 text-sm font-medium transition-colors whitespace-nowrap relative"
          :class="$route.path === '/' ? 'bg-[#C9A84C] text-white' : 'text-white/90 hover:bg-white/10 hover:text-white'"
        >
          首页
        </NuxtLink>

        <div
          v-for="menu in menus"
          :key="menu.id"
          class="relative h-11 flex items-center"
          @mouseenter="onMenuEnter(menu.id)"
          @mouseleave="onMenuLeave"
        >
          <NuxtLink
            :to="menuLink(menu)"
            class="h-11 flex items-center gap-1.5 px-5 text-sm font-medium transition-colors whitespace-nowrap"
            :class="activeMenu === menu.id
              ? 'bg-white/15 text-white'
              : 'text-white/90 hover:bg-white/10 hover:text-white'"
          >
            {{ menu.name }}
            <UIcon
              v-if="menu.children?.length"
              name="lucide:chevron-down"
              class="text-xs transition-transform duration-200"
              :class="activeMenu === menu.id ? 'rotate-180' : 'opacity-60'"
            />
          </NuxtLink>

          <!-- 下拉菜单 -->
          <Transition name="dropdown">
            <div
              v-if="menu.children?.length && activeMenu === menu.id"
              class="absolute top-full left-0 z-50"
              style="min-width: 160px;"
            >
              <div class="bg-white shadow-xl border-t-2 border-[#C9A84C]">
                <NuxtLink
                  v-for="(child, i) in menu.children"
                  :key="child.id"
                  :to="menuLink(child)"
                  class="group flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-[#B01C1C] hover:text-white transition-colors"
                  :class="i > 0 ? 'border-t border-gray-50' : ''"
                >
                  <span class="w-1 h-1 rounded-full bg-[#C9A84C] flex-shrink-0" />
                  {{ child.name }}
                </NuxtLink>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- 移动端展开 -->
    <Transition name="slide-down">
      <div v-if="mobileOpen" class="md:hidden bg-white border-t border-gray-100 shadow-lg">
        <NuxtLink to="/" class="block px-6 py-3 text-sm font-medium text-[#B01C1C] border-b border-gray-100" @click="mobileOpen = false">首页</NuxtLink>
        <template v-for="menu in menus" :key="menu.id">
          <NuxtLink
            :to="menuLink(menu)"
            class="block px-6 py-3 text-sm text-gray-700 hover:text-[#B01C1C] hover:bg-red-50 border-b border-gray-100"
            @click="mobileOpen = false"
          >
            {{ menu.name }}
          </NuxtLink>
          <template v-if="menu.children?.length">
            <NuxtLink
              v-for="child in menu.children"
              :key="child.id"
              :to="menuLink(child)"
              class="flex items-center gap-2 pl-10 pr-6 py-2.5 text-xs text-gray-500 hover:text-[#B01C1C] hover:bg-red-50 border-b border-gray-50"
              @click="mobileOpen = false"
            >
              <span class="w-1 h-1 rounded-full bg-[#C9A84C]" />
              {{ child.name }}
            </NuxtLink>
          </template>
        </template>
      </div>
    </Transition>

  </header>
</template>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-6px); }
.slide-down-enter-active, .slide-down-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
