// 用户相关类型
export interface User {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
  profile: UserProfile;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  name: string;
  age?: number;
  grade?: string;
  school?: string;
  avatar?: string;
}

export enum UserRole {
  STUDENT = 'student',
  PARENT = 'parent',
  TEACHER = 'teacher'
}

// 情绪记录相关类型
export interface EmotionRecord {
  id: string;
  emotionType: string;
  emotionName: string;
  intensity: number;
  description: string;
  timestamp: string;
  userId: string;
}

export interface EmotionType {
  id: string;
  name: string;
  color: string;
  emoji: string;
}

// 压力评估相关类型
export interface PressureAssessment {
  id: string;
  totalScore: number;
  level: string;
  description: string;
  suggestions: string[];
  answers: Record<number, number>;
  timestamp: string;
  userId: string;
}

export interface PressureQuestion {
  id: number;
  question: string;
  category: string;
}

export interface PressureLevel {
  level: number;
  label: string;
  score: number;
  color: string;
}

// 心理调适工具相关类型
export interface PsychologicalTool {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  duration: number;
  difficulty: string;
  category: string;
}

export interface PsychologicalSession {
  id: string;
  toolId: string;
  toolName: string;
  duration: number;
  timestamp: string;
  userId: string;
}

// 数据分析相关类型
export interface ReportData {
  period: string;
  emotionAnalysis: EmotionAnalysis;
  pressureTrend: PressureTrend;
  toolAnalysis: ToolAnalysis;
  overallStats: OverallStats;
  generatedAt: string;
}

export interface EmotionAnalysis {
  total: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  mostFrequent: string | null;
  dailyAverage: number;
  emotionDistribution: Record<string, number>;
}

export interface PressureTrend {
  total: number;
  averageScore: number;
  latestLevel: string | null;
  trend: 'increasing' | 'decreasing' | 'stable';
  levelDistribution: Record<string, number>;
}

export interface ToolAnalysis {
  total: number;
  totalDuration: number;
  averageDuration: number;
  mostUsed: string | null;
  toolDistribution: Record<string, number>;
}

export interface OverallStats {
  totalEmotionRecords: number;
  totalAssessments: number;
  totalSessions: number;
  sessionDuration: number;
}

// 认证相关类型
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  profile: Partial<UserProfile>;
}

// 响应式布局类型
export interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 导航相关类型
export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  role: UserRole[];
}

// 主题相关类型
export interface ThemeColors {
  primary: {
    default: string;
    light: string;
    dark: string;
    container: string;
  };
  secondary: {
    default: string;
    light: string;
    dark: string;
    container: string;
  };
  tertiary: {
    default: string;
    light: string;
    dark: string;
    container: string;
  };
  error: {
    default: string;
    light: string;
    dark: string;
    container: string;
  };
  warning: {
    default: string;
    light: string;
    dark: string;
    container: string;
  };
  info: {
    default: string;
    light: string;
    dark: string;
    container: string;
  };
  success: {
    default: string;
    light: string;
    dark: string;
    container: string;
  };
  neutral: {
    default: string;
    light: string;
    dark: string;
    container: string;
  };
  surface: {
    default: string;
    container: string;
    variant: string;
  };
  outline: {
    default: string;
    variant: string;
  };
  onSurface: {
    high: string;
    medium: string;
    low: string;
  };
  onPrimary: {
    default: string;
  };
}

export interface ThemeConfig {
  colors: ThemeColors;
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  elevation: {
    small: string;
    medium: string;
    large: string;
  };
  breakpoints: BreakpointConfig;
}