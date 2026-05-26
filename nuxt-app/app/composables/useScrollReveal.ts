export function useScrollReveal() {
  const observer = ref<IntersectionObserver | null>(null)

  function init() {
    if (typeof window === 'undefined') return
    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('sr-visible')
            observer.value?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )

    document.querySelectorAll('[data-sr]').forEach((el) => {
      // Hero 区域内的元素（在视口内）立即触发
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight) {
        // 短暂延迟后添加 visible，让进场动画执行
        const delay = Number((el as HTMLElement).dataset.delay ?? 0)
        setTimeout(() => el.classList.add('sr-visible'), delay)
      }
      else {
        observer.value?.observe(el)
      }
    })
  }

  onMounted(() => nextTick(() => init()))
  onUnmounted(() => observer.value?.disconnect())
}
