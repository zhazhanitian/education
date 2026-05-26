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
  <header class="sticky top-0 z-50 shadow-md">
    <!-- 单条一体化：品牌标识 + 导航 -->
    <div class="bg-[#B01C1C]">
      <div class="max-w-7xl mx-auto px-6 flex items-center h-[60px]">

        <!-- Logo + 平台名 -->
        <NuxtLink to="/" class="flex items-center gap-3 flex-shrink-0 mr-8 group">
          <div class="w-9 h-9 rounded-sm bg-white/20 border border-white/30 flex items-center justify-center group-hover:bg-white/25 transition-colors">
            <UIcon name="lucide:graduation-cap" class="text-white text-lg" />
          </div>
          <div class="leading-tight hidden sm:block">
            <div class="text-white/60 text-[10px] tracking-widest uppercase">Teaching Achievement Award</div>
            <div class="text-white font-bold text-sm tracking-wide leading-none mt-0.5">教学成果奖申报平台</div>
          </div>
        </NuxtLink>

        <!-- 桌面导航：居中/左对齐 -->
        <nav class="hidden lg:flex items-center flex-1">
          <NuxtLink
            to="/"
            class="h-[60px] flex items-center px-4 text-sm font-medium transition-colors relative whitespace-nowrap"
            :class="$route.path === '/' ? 'text-[#C9A84C]' : 'text-white/85 hover:text-white'"
          >
            首页
            <span
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C9A84C] transition-all"
              :class="$route.path === '/' ? 'opacity-100' : 'opacity-0'"
            />
          </NuxtLink>

          <div
            v-for="menu in menus"
            :key="menu.id"
            class="relative h-[60px] flex items-center"
            @mouseenter="onMenuEnter(menu.id)"
            @mouseleave="onMenuLeave"
          >
            <NuxtLink
              :to="menuLink(menu)"
              class="h-[60px] flex items-center gap-1 px-4 text-sm font-medium transition-colors whitespace-nowrap relative"
              :class="activeMenu === menu.id ? 'text-[#C9A84C]' : 'text-white/85 hover:text-white'"
            >
              {{ menu.name }}
              <UIcon
                v-if="menu.children?.length"
                name="lucide:chevron-down"
                class="text-xs transition-transform duration-200"
                :class="activeMenu === menu.id ? 'rotate-180' : 'opacity-50'"
              />
              <span
                class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C9A84C] transition-all"
                :class="activeMenu === menu.id ? 'opacity-100' : 'opacity-0'"
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
        </nav>

        <!-- 右侧：院校名 + 最新动态 -->
        <div class="hidden lg:flex items-center gap-4 ml-auto flex-shrink-0">
          <span class="text-white/50 text-xs border-r border-white/20 pr-4">某某高等职业技术学院</span>
          <NuxtLink to="/news" class="flex items-center gap-1.5 text-xs text-white/75 hover:text-[#C9A84C] transition-colors">
            <span class="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
            最新动态
          </NuxtLink>
        </div>

        <!-- 移动端按钮 -->
        <button class="lg:hidden ml-auto text-white/85 hover:text-white p-1 transition-colors" @click="mobileOpen = !mobileOpen">
          <UIcon :name="mobileOpen ? 'lucide:x' : 'lucide:menu'" class="text-xl" />
        </button>
      </div>
    </div>

    <!-- 移动端菜单 -->
    <Transition name="slide-down">
      <div v-if="mobileOpen" class="lg:hidden bg-white border-t-2 border-[#C9A84C] shadow-xl">
        <NuxtLink to="/" class="flex items-center gap-2 px-6 py-3.5 text-sm font-medium text-[#B01C1C] border-b border-gray-100" @click="mobileOpen = false">
          <span class="w-1 h-1 rounded-full bg-[#C9A84C]" /> 首页
        </NuxtLink>
        <template v-for="menu in menus" :key="menu.id">
          <NuxtLink
            :to="menuLink(menu)"
            class="flex items-center gap-2 px-6 py-3.5 text-sm text-gray-700 hover:text-[#B01C1C] hover:bg-red-50 border-b border-gray-100"
            @click="mobileOpen = false"
          >
            <span class="w-1 h-1 rounded-full bg-gray-300" /> {{ menu.name }}
          </NuxtLink>
          <template v-if="menu.children?.length">
            <NuxtLink
              v-for="child in menu.children"
              :key="child.id"
              :to="menuLink(child)"
              class="flex items-center gap-2 pl-10 pr-6 py-3 text-xs text-gray-500 hover:text-[#B01C1C] hover:bg-red-50 border-b border-gray-50"
              @click="mobileOpen = false"
            >
              <span class="w-1 h-1 rounded-full bg-[#C9A84C]" /> {{ child.name }}
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
