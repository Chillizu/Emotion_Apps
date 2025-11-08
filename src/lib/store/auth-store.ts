'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, UserRole, LoginCredentials, RegisterData } from '@/types';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

// 模拟用户数据（在实际应用中应该从API获取）
const mockUsers = [
  {
    id: '1',
    username: 'student1',
    password: 'password123',
    role: UserRole.STUDENT,
    profile: {
      name: '小明',
      age: 12,
      grade: '六年级',
      school: '阳光小学',
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    username: 'parent1',
    password: 'password123',
    role: UserRole.PARENT,
    profile: {
      name: '张爸爸',
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true });
        
        try {
          // 模拟API调用延迟
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const user = mockUsers.find(
            u => u.username === credentials.username && u.password === credentials.password
          );
          
          if (user) {
            // 移除密码后存储用户信息
            const { password, ...userWithoutPassword } = user;
            set({
              user: userWithoutPassword,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          } else {
            set({ isLoading: false });
            throw new Error('用户名或密码错误');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });
        
        try {
          // 模拟API调用延迟
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // 检查用户名是否已存在
          const existingUser = mockUsers.find(u => u.username === data.username);
          if (existingUser) {
            throw new Error('用户名已存在');
          }
          
          // 检查密码确认
          if (data.password !== data.confirmPassword) {
            throw new Error('密码确认不匹配');
          }
          
          // 创建新用户
          const newUser: User = {
            id: Date.now().toString(),
            username: data.username,
            role: data.role,
            profile: {
              name: data.profile.name || data.username,
              age: data.profile.age,
              grade: data.profile.grade,
              school: data.profile.school,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          // 在实际应用中，这里应该调用API注册用户
          // mockUsers.push({ ...newUser, password: data.password });
          
          set({
            user: newUser,
            isAuthenticated: true,
            isLoading: false,
          });
          
          return true;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      checkAuth: () => {
        const { user } = get();
        // 这里可以添加token验证逻辑
        if (user) {
          set({ isAuthenticated: true });
        }
      },

      updateUser: (updatedUser: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({
            user: {
              ...user,
              ...updatedUser,
              updatedAt: new Date().toISOString(),
            },
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// 认证相关的工具函数
export const authUtils = {
  // 检查用户是否有特定角色
  hasRole: (user: User | null, roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    return requiredRoles.includes(user.role);
  },

  // 获取用户显示名称
  getDisplayName: (user: User | null): string => {
    if (!user) return '游客';
    return user.profile.name || user.username;
  },

  // 检查是否是学生
  isStudent: (user: User | null): boolean => {
    return user?.role === UserRole.STUDENT;
  },

  // 检查是否是家长
  isParent: (user: User | null): boolean => {
    return user?.role === UserRole.PARENT;
  },

  // 检查是否是教师
  isTeacher: (user: User | null): boolean => {
    return user?.role === UserRole.TEACHER;
  },
};