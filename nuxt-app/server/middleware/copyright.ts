/**
 * 版权保护中间件
 * 对所有 /uploads/ 静态文件请求注入防下载响应头：
 *   - Content-Disposition: inline（强制浏览器内嵌预览，不触发下载）
 *   - Cache-Control: no-store（禁止客户端缓存到磁盘）
 *   - X-Content-Type-Options: nosniff
 *   - X-Robots-Tag: noindex, noarchive（防搜索引擎收录素材）
 */
export default defineEventHandler((event) => {
  const url = event.node.req.url ?? ''

  if (url.startsWith('/uploads/')) {
    setHeader(event, 'Content-Disposition', 'inline')
    setHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate')
    setHeader(event, 'X-Content-Type-Options', 'nosniff')
    setHeader(event, 'X-Robots-Tag', 'noindex, noarchive')
  }
})
