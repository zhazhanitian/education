import { request } from '../request';

/** 获取首页配置 */
export function fetchHomeConfig() {
  return request<Api.Config.HomeConfig>({ url: '/home' });
}

/** 保存首页配置 */
export function fetchSaveHomeConfig(data: { configs: Record<string, string>; stats: Api.Config.HomeStat[] }) {
  return request({ url: '/home', method: 'put', data });
}

/** 获取文件列表 */
export function fetchFileList(page = 1, limit = 20) {
  return request<Api.Config.FilePageResult>({ url: '/files', params: { page, limit } });
}

/** 删除文件 */
export function fetchDeleteFile(id: number) {
  return request({ url: `/files/${id}`, method: 'delete' });
}
