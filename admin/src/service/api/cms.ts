import { request } from '../request';

/** 获取导航菜单列表（树形） */
export function fetchNavList() {
  return request<Api.Cms.NavMenu[]>({ url: '/nav' });
}

/** 创建导航菜单 */
export function fetchCreateNav(data: Api.Cms.NavMenuForm) {
  return request<Api.Cms.NavMenu>({ url: '/nav', method: 'post', data });
}

/** 更新导航菜单 */
export function fetchUpdateNav(id: number, data: Api.Cms.NavMenuForm) {
  return request<Api.Cms.NavMenu>({ url: `/nav/${id}`, method: 'put', data });
}

/** 删除导航菜单 */
export function fetchDeleteNav(id: number) {
  return request({ url: `/nav/${id}`, method: 'delete' });
}

/** 获取内容页列表 */
export function fetchContentList(page: number, limit = 20) {
  return request<Api.Cms.PageResult<Api.Cms.ContentPage>>({ url: '/content', params: { page, limit } });
}

/** 获取内容页详情 */
export function fetchContentDetail(id: number) {
  return request<Api.Cms.ContentPage>({ url: `/content/${id}` });
}

/** 创建内容页 */
export function fetchCreateContent(data: Api.Cms.ContentPageForm) {
  return request<Api.Cms.ContentPage>({ url: '/content', method: 'post', data });
}

/** 更新内容页 */
export function fetchUpdateContent(id: number, data: Api.Cms.ContentPageForm) {
  return request<Api.Cms.ContentPage>({ url: `/content/${id}`, method: 'put', data });
}

/** 删除内容页 */
export function fetchDeleteContent(id: number) {
  return request({ url: `/content/${id}`, method: 'delete' });
}

/** 获取新闻列表 */
export function fetchNewsList(page: number, limit = 20) {
  return request<Api.Cms.PageResult<Api.Cms.NewsItem>>({ url: '/news', params: { page, limit } });
}

/** 获取新闻详情 */
export function fetchNewsDetail(id: number) {
  return request<Api.Cms.NewsItem>({ url: `/news/${id}` });
}

/** 创建新闻 */
export function fetchCreateNews(data: Api.Cms.NewsForm) {
  return request<Api.Cms.NewsItem>({ url: '/news', method: 'post', data });
}

/** 更新新闻 */
export function fetchUpdateNews(id: number, data: Api.Cms.NewsForm) {
  return request<Api.Cms.NewsItem>({ url: `/news/${id}`, method: 'put', data });
}

/** 删除新闻 */
export function fetchDeleteNews(id: number) {
  return request({ url: `/news/${id}`, method: 'delete' });
}
