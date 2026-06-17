import { request } from '../request';

/** 获取用户列表 */
export function fetchUserList() {
  return request<Api.Manage.AdminUser[]>({ url: '/users' });
}

/** 创建用户 */
export function fetchCreateUser(data: Api.Manage.UserForm) {
  return request<Api.Manage.AdminUser>({ url: '/users', method: 'post', data });
}

/** 更新用户 */
export function fetchUpdateUser(id: number, data: Api.Manage.UserUpdateForm) {
  return request<Api.Manage.AdminUser>({ url: `/users/${id}`, method: 'put', data });
}

/** 删除用户 */
export function fetchDeleteUser(id: number) {
  return request({ url: `/users/${id}`, method: 'delete' });
}
