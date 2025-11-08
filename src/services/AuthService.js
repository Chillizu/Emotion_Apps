import AsyncStorage from '@react-native-async-storage/async-storage';
import StorageService from './StorageService';

// 用户角色定义
export const USER_ROLES = {
  STUDENT: 'student',
  PARENT: 'parent',
  TEACHER: 'teacher',
  ADMIN: 'admin',
};

// 用户数据模型
const DEFAULT_USER_PROFILE = {
  id: '',
  username: '',
  email: '',
  role: USER_ROLES.STUDENT,
  profile: {
    name: '',
    age: 0,
    grade: '',
    school: '',
    avatar: '',
  },
  settings: {
    notifications: true,
    reminderTime: '20:00',
    language: 'zh-CN',
    theme: 'light',
  },
  createdAt: '',
  lastLogin: '',
};

class AuthService {
  // 用户注册
  static async register(userData) {
    try {
      const {username, email, password, role, profile} = userData;
      
      // 检查用户是否已存在
      const existingUsers = await this.getAllUsers();
      const userExists = existingUsers.some(
        user => user.username === username || user.email === email,
      );
      
      if (userExists) {
        throw new Error('用户名或邮箱已存在');
      }
      
      // 创建新用户
      const newUser = {
        ...DEFAULT_USER_PROFILE,
        id: this.generateUserId(),
        username,
        email,
        role: role || USER_ROLES.STUDENT,
        profile: {...DEFAULT_USER_PROFILE.profile, ...profile},
        password: this.hashPassword(password),
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      
      // 保存用户
      existingUsers.push(newUser);
      await AsyncStorage.setItem('users', JSON.stringify(existingUsers));
      
      // 保存当前用户会话
      await this.setCurrentUser(newUser);
      
      return {
        success: true,
        user: this.sanitizeUser(newUser),
        message: '注册成功',
      };
    } catch (error) {
      console.error('用户注册失败:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 用户登录
  static async login(credentials) {
    try {
      const {username, password} = credentials;
      const users = await this.getAllUsers();
      
      const user = users.find(
        u => (u.username === username || u.email === username) && 
             u.password === this.hashPassword(password),
      );
      
      if (!user) {
        throw new Error('用户名或密码错误');
      }
      
      // 更新最后登录时间
      user.lastLogin = new Date().toISOString();
      await this.updateUser(user);
      
      // 保存当前用户会话
      await this.setCurrentUser(user);
      
      return {
        success: true,
        user: this.sanitizeUser(user),
        message: '登录成功',
      };
    } catch (error) {
      console.error('用户登录失败:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 用户登出
  static async logout() {
    try {
      await AsyncStorage.removeItem('currentUser');
      return {success: true, message: '登出成功'};
    } catch (error) {
      console.error('用户登出失败:', error);
      return {success: false, error: error.message};
    }
  }

  // 获取当前用户
  static async getCurrentUser() {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (!userData) return null;
      
      const user = JSON.parse(userData);
      return this.sanitizeUser(user);
    } catch (error) {
      console.error('获取当前用户失败:', error);
      return null;
    }
  }

  // 更新用户资料
  static async updateUserProfile(updates) {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('用户未登录');
      }
      
      const users = await this.getAllUsers();
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      
      if (userIndex === -1) {
        throw new Error('用户不存在');
      }
      
      // 更新用户资料
      users[userIndex] = {
        ...users[userIndex],
        profile: {...users[userIndex].profile, ...updates},
      };
      
      await AsyncStorage.setItem('users', JSON.stringify(users));
      await this.setCurrentUser(users[userIndex]);
      
      return {
        success: true,
        user: this.sanitizeUser(users[userIndex]),
        message: '资料更新成功',
      };
    } catch (error) {
      console.error('更新用户资料失败:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 家长关联学生
  static async linkStudent(parentId, studentUsername) {
    try {
      const users = await this.getAllUsers();
      const parent = users.find(u => u.id === parentId);
      const student = users.find(u => u.username === studentUsername);
      
      if (!parent || parent.role !== USER_ROLES.PARENT) {
        throw new Error('家长用户不存在');
      }
      
      if (!student || student.role !== USER_ROLES.STUDENT) {
        throw new Error('学生用户不存在');
      }
      
      // 初始化家长关联列表
      if (!parent.linkedStudents) {
        parent.linkedStudents = [];
      }
      
      // 检查是否已关联
      if (parent.linkedStudents.includes(student.id)) {
        throw new Error('该学生已关联');
      }
      
      // 添加关联
      parent.linkedStudents.push(student.id);
      await AsyncStorage.setItem('users', JSON.stringify(users));
      
      return {
        success: true,
        message: '学生关联成功',
      };
    } catch (error) {
      console.error('关联学生失败:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 获取家长关联的学生
  static async getLinkedStudents(parentId) {
    try {
      const users = await this.getAllUsers();
      const parent = users.find(u => u.id === parentId);
      
      if (!parent || !parent.linkedStudents) {
        return [];
      }
      
      const linkedStudents = users.filter(u => 
        parent.linkedStudents.includes(u.id)
      );
      
      return linkedStudents.map(this.sanitizeUser);
    } catch (error) {
      console.error('获取关联学生失败:', error);
      return [];
    }
  }

  // 教师关联班级
  static async linkClass(teacherId, classInfo) {
    try {
      const users = await this.getAllUsers();
      const teacher = users.find(u => u.id === teacherId);
      
      if (!teacher || teacher.role !== USER_ROLES.TEACHER) {
        throw new Error('教师用户不存在');
      }
      
      // 初始化班级列表
      if (!teacher.linkedClasses) {
        teacher.linkedClasses = [];
      }
      
      teacher.linkedClasses.push(classInfo);
      await AsyncStorage.setItem('users', JSON.stringify(users));
      
      return {
        success: true,
        message: '班级关联成功',
      };
    } catch (error) {
      console.error('关联班级失败:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 辅助方法
  static async getAllUsers() {
    try {
      const usersData = await AsyncStorage.getItem('users');
      return usersData ? JSON.parse(usersData) : [];
    } catch (error) {
      console.error('获取用户列表失败:', error);
      return [];
    }
  }

  static async setCurrentUser(user) {
    try {
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
    } catch (error) {
      console.error('设置当前用户失败:', error);
    }
  }

  static async updateUser(updatedUser) {
    try {
      const users = await this.getAllUsers();
      const userIndex = users.findIndex(u => u.id === updatedUser.id);
      
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        await AsyncStorage.setItem('users', JSON.stringify(users));
      }
    } catch (error) {
      console.error('更新用户失败:', error);
    }
  }

  static generateUserId() {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static hashPassword(password) {
    // 简单的哈希函数，实际项目中应该使用更安全的哈希算法
    return btoa(password); // 注意：这只是一个演示，不适用于生产环境
  }

  static sanitizeUser(user) {
    const sanitized = {...user};
    delete sanitized.password;
    return sanitized;
  }

  // 检查用户权限
  static hasPermission(user, permission) {
    const permissions = {
      [USER_ROLES.STUDENT]: ['view_own_data', 'record_emotion', 'use_tools'],
      [USER_ROLES.PARENT]: ['view_own_data', 'view_linked_students', 'receive_alerts'],
      [USER_ROLES.TEACHER]: ['view_own_data', 'view_class_data', 'manage_students'],
      [USER_ROLES.ADMIN]: ['all'],
    };
    
    const userPermissions = permissions[user.role] || [];
    return userPermissions.includes('all') || userPermissions.includes(permission);
  }

  // 初始化演示数据
  static async initializeDemoData() {
    try {
      const users = await this.getAllUsers();
      
      // 如果还没有用户，创建演示用户
      if (users.length === 0) {
        const demoUsers = [
          {
            ...DEFAULT_USER_PROFILE,
            id: this.generateUserId(),
            username: 'student1',
            email: 'student1@example.com',
            role: USER_ROLES.STUDENT,
            profile: {
              name: '小明',
              age: 12,
              grade: '六年级',
              school: '阳光小学',
              avatar: '',
            },
            password: this.hashPassword('123456'),
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          },
          {
            ...DEFAULT_USER_PROFILE,
            id: this.generateUserId(),
            username: 'parent1',
            email: 'parent1@example.com',
            role: USER_ROLES.PARENT,
            profile: {
              name: '张爸爸',
              age: 40,
              grade: '',
              school: '',
              avatar: '',
            },
            password: this.hashPassword('123456'),
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          },
          {
            ...DEFAULT_USER_PROFILE,
            id: this.generateUserId(),
            username: 'teacher1',
            email: 'teacher1@example.com',
            role: USER_ROLES.TEACHER,
            profile: {
              name: '李老师',
              age: 35,
              grade: '',
              school: '阳光小学',
              avatar: '',
            },
            password: this.hashPassword('123456'),
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          },
        ];
        
        await AsyncStorage.setItem('users', JSON.stringify(demoUsers));
        console.log('演示数据初始化完成');
      }
    } catch (error) {
      console.error('初始化演示数据失败:', error);
    }
  }
}

export default AuthService;