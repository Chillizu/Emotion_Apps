/**
 * 情绪疏导方法优先级管理
 */

import { UserSettings } from '@/types';

// 情绪疏导方法配置
export const emotionGuidanceMethods = [
  { id: 'music', name: '听音乐', description: '通过音乐放松心情' },
  { id: 'breathing', name: '呼吸练习', description: '深呼吸缓解紧张' },
  { id: 'meditation', name: '正念冥想', description: '专注当下，平静心灵' },
  { id: 'gratitude', name: '感恩练习', description: '记录感恩事项培养积极心态' },
  { id: 'visualization', name: '积极想象', description: '想象美好场景提升情绪' },
  { id: 'movie', name: '看电影', description: '通过影片转移注意力' },
  { id: 'exercise', name: '轻度运动', description: '活动身体释放压力' },
  { id: 'writing', name: '情绪写作', description: '通过书写表达情感' },
];

/**
 * 获取当前推荐的情绪疏导方法
 */
export function getCurrentRecommendation(settings: UserSettings) {
  const { priorityOrder, currentMethodIndex } = settings.emotionGuidance;
  const currentMethodId = priorityOrder[currentMethodIndex];
  return emotionGuidanceMethods.find(method => method.id === currentMethodId);
}

/**
 * 处理用户否定当前推荐方法
 */
export function handleRejection(settings: UserSettings): UserSettings {
  const { denyCounts, priorityOrder, currentMethodIndex, denyThreshold } = settings.emotionGuidance;
  const currentMethodId = priorityOrder[currentMethodIndex];
  const newDenyCount = (denyCounts[currentMethodId] || 0) + 1;
  
  // 如果达到否定次数阈值，切换到下一个优先级
  if (newDenyCount >= denyThreshold) {
    const nextMethodIndex = (currentMethodIndex + 1) % priorityOrder.length;
    const newDenyCounts = { ...denyCounts };
    newDenyCounts[currentMethodId] = 0; // 重置当前方法的否定计数
    
    return {
      ...settings,
      emotionGuidance: {
        ...settings.emotionGuidance,
        currentMethodIndex: nextMethodIndex,
        denyCounts: newDenyCounts
      }
    };
  }
  
  // 否则增加否定计数
  return {
    ...settings,
    emotionGuidance: {
      ...settings.emotionGuidance,
      denyCounts: {
        ...denyCounts,
        [currentMethodId]: newDenyCount
      }
    }
  };
}

/**
 * 处理用户接受当前推荐方法
 */
export function handleAcceptance(settings: UserSettings): UserSettings {
  const { denyCounts, priorityOrder, currentMethodIndex } = settings.emotionGuidance;
  const currentMethodId = priorityOrder[currentMethodIndex];
  
  // 用户接受后重置当前方法的否定计数
  return {
    ...settings,
    emotionGuidance: {
      ...settings.emotionGuidance,
      denyCounts: {
        ...denyCounts,
        [currentMethodId]: 0
      }
    }
  };
}

/**
 * 重置优先级状态
 */
export function resetPriorityState(settings: UserSettings): UserSettings {
  return {
    ...settings,
    emotionGuidance: {
      ...settings.emotionGuidance,
      currentMethodIndex: 0,
      denyCounts: {}
    }
  };
}

/**
 * 获取推荐状态信息
 */
export function getRecommendationStatus(settings: UserSettings) {
  const currentMethod = getCurrentRecommendation(settings);
  const { denyCounts, priorityOrder, currentMethodIndex, denyThreshold } = settings.emotionGuidance;
  const currentMethodId = priorityOrder[currentMethodIndex];
  const rejectionCount = denyCounts[currentMethodId] || 0;
  
  return {
    currentMethod,
    rejectionCount,
    rejectionLimit: denyThreshold,
    remainingAttempts: denyThreshold - rejectionCount,
    isLastMethod: currentMethodIndex === priorityOrder.length - 1
  };
}

/**
 * 验证优先级设置是否有效
 */
export function validatePrioritySettings(priority: string[]): boolean {
  if (!Array.isArray(priority) || priority.length === 0) {
    return false;
  }
  
  // 检查所有方法ID是否有效
  const validMethodIds = emotionGuidanceMethods.map(method => method.id);
  return priority.every(methodId => validMethodIds.includes(methodId));
}