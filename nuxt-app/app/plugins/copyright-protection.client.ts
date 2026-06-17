/**
 * 网站版权保护插件（仅客户端）
 * 根据校方要求，禁止所有素材下载及内容复制：
 *   - 屏蔽右键菜单
 *   - 屏蔽拖拽（防止拖拽图片/视频保存）
 *   - 屏蔽 Ctrl+S / Ctrl+P / Ctrl+U / F12
 *   - 屏蔽富文本区域的复制（Ctrl+C / Cmd+C 及 copy 事件）
 */

/** 判断事件目标是否在富文本内容区域内 */
function isInRichContent(el: EventTarget | null): boolean {
  if (!(el instanceof Element)) return false
  return el.closest('.rich-content') !== null
}

export default defineNuxtPlugin(() => {
  if (import.meta.server) return

  // 禁用右键菜单
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    return false
  }, true)

  // 禁用拖拽（防止拖图片/视频到桌面保存）
  document.addEventListener('dragstart', (e) => {
    const target = e.target as HTMLElement
    if (
      target instanceof HTMLImageElement
      || target instanceof HTMLVideoElement
      || target instanceof HTMLAnchorElement
    ) {
      e.preventDefault()
      return false
    }
  }, true)

  // 屏蔽键盘快捷键
  document.addEventListener('keydown', (e) => {
    const key = e.key?.toLowerCase()
    // Ctrl/Cmd + S（另存为）、P（打印）、U（查看源码）
    if ((e.ctrlKey || e.metaKey) && ['s', 'p', 'u'].includes(key)) {
      e.preventDefault()
      return false
    }
    // F12（开发者工具）
    if (key === 'f12') {
      e.preventDefault()
      return false
    }
    // 富文本区域内禁止 Ctrl/Cmd+C（复制）、Ctrl/Cmd+A（全选）
    if ((e.ctrlKey || e.metaKey) && ['c', 'a'].includes(key) && isInRichContent(e.target)) {
      e.preventDefault()
      return false
    }
  }, true)

  // 富文本区域禁止 copy 事件（覆盖浏览器默认复制行为）
  document.addEventListener('copy', (e) => {
    if (isInRichContent(e.target)) {
      e.preventDefault()
      e.clipboardData?.clearData()
      return false
    }
  }, true)

  // 富文本区域禁止 selectstart（彻底阻止文本被框选）
  document.addEventListener('selectstart', (e) => {
    if (isInRichContent(e.target)) {
      e.preventDefault()
      return false
    }
  }, true)
})
