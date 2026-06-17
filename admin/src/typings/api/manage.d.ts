declare namespace Api {
  namespace Manage {
    type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR';

    interface AdminUser {
      id: number;
      username: string;
      realName: string | null;
      role: AdminRole;
      isActive: boolean;
      lastLoginAt: string | null;
      createdAt: string;
    }

    interface UserForm {
      username: string;
      password: string;
      realName?: string;
      role: 'ADMIN' | 'EDITOR';
    }

    interface UserUpdateForm {
      realName?: string;
      role?: 'ADMIN' | 'EDITOR';
      isActive?: boolean;
      password?: string;
    }
  }
}
