import AsyncStorage from '@react-native-async-storage/async-storage';

// 存储键常量
const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  EMOTION_RECORDS: 'emotion_records',
  PRESSURE_ASSESSMENTS: 'pressure_assessments',
  PSYCHOLOGICAL_SESSIONS: 'psychological_sessions',
  PARENT_REPORTS: 'parent_reports',
};

class StorageService {
  // 用户数据管理
  static async saveUserProfile(profile) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      return true;
    } catch (error) {
      console.error('保存用户资料失败:', error);
      return false;
    }
  }

  static async getUserProfile() {
    try {
      const profile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('获取用户资料失败:', error);
      return null;
    }
  }

  // 情绪记录管理
  static async saveEmotionRecord(record) {
    try {
      const records = await this.getEmotionRecords();
      const newRecord = {
        id: Date.now().toString(),
        ...record,
        createdAt: new Date().toISOString(),
      };
      
      const updatedRecords = [newRecord, ...records];
      await AsyncStorage.setItem(
        STORAGE_KEYS.EMOTION_RECORDS,
        JSON.stringify(updatedRecords),
      );
      
      return newRecord;
    } catch (error) {
      console.error('保存情绪记录失败:', error);
      return null;
    }
  }

  static async getEmotionRecords() {
    try {
      const records = await AsyncStorage.getItem(STORAGE_KEYS.EMOTION_RECORDS);
      return records ? JSON.parse(records) : [];
    } catch (error) {
      console.error('获取情绪记录失败:', error);
      return [];
    }
  }

  static async getEmotionRecordsByDateRange(startDate, endDate) {
    try {
      const records = await this.getEmotionRecords();
      return records.filter(record => {
        const recordDate = new Date(record.createdAt);
        return recordDate >= startDate && recordDate <= endDate;
      });
    } catch (error) {
      console.error('按日期范围获取情绪记录失败:', error);
      return [];
    }
  }

  // 压力评估管理
  static async savePressureAssessment(assessment) {
    try {
      const assessments = await this.getPressureAssessments();
      const newAssessment = {
        id: Date.now().toString(),
        ...assessment,
        createdAt: new Date().toISOString(),
      };
      
      const updatedAssessments = [newAssessment, ...assessments];
      await AsyncStorage.setItem(
        STORAGE_KEYS.PRESSURE_ASSESSMENTS,
        JSON.stringify(updatedAssessments),
      );
      
      return newAssessment;
    } catch (error) {
      console.error('保存压力评估失败:', error);
      return null;
    }
  }

  static async getPressureAssessments() {
    try {
      const assessments = await AsyncStorage.getItem(STORAGE_KEYS.PRESSURE_ASSESSMENTS);
      return assessments ? JSON.parse(assessments) : [];
    } catch (error) {
      console.error('获取压力评估失败:', error);
      return [];
    }
  }

  static async getLatestPressureAssessment() {
    try {
      const assessments = await this.getPressureAssessments();
      return assessments.length > 0 ? assessments[0] : null;
    } catch (error) {
      console.error('获取最新压力评估失败:', error);
      return null;
    }
  }

  // 心理调节会话管理
  static async savePsychologicalSession(session) {
    try {
      const sessions = await this.getPsychologicalSessions();
      const newSession = {
        id: Date.now().toString(),
        ...session,
        createdAt: new Date().toISOString(),
      };
      
      const updatedSessions = [newSession, ...sessions];
      await AsyncStorage.setItem(
        STORAGE_KEYS.PSYCHOLOGICAL_SESSIONS,
        JSON.stringify(updatedSessions),
      );
      
      return newSession;
    } catch (error) {
      console.error('保存心理调节会话失败:', error);
      return null;
    }
  }

  static async getPsychologicalSessions() {
    try {
      const sessions = await AsyncStorage.getItem(STORAGE_KEYS.PSYCHOLOGICAL_SESSIONS);
      return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
      console.error('获取心理调节会话失败:', error);
      return [];
    }
  }

  // 家长报告管理
  static async saveParentReport(report) {
    try {
      const reports = await this.getParentReports();
      const newReport = {
        id: Date.now().toString(),
        ...report,
        createdAt: new Date().toISOString(),
      };
      
      const updatedReports = [newReport, ...reports];
      await AsyncStorage.setItem(
        STORAGE_KEYS.PARENT_REPORTS,
        JSON.stringify(updatedReports),
      );
      
      return newReport;
    } catch (error) {
      console.error('保存家长报告失败:', error);
      return null;
    }
  }

  static async getParentReports() {
    try {
      const reports = await AsyncStorage.getItem(STORAGE_KEYS.PARENT_REPORTS);
      return reports ? JSON.parse(reports) : [];
    } catch (error) {
      console.error('获取家长报告失败:', error);
      return [];
    }
  }

  // 数据统计和分析
  static async getEmotionStatistics(days = 7) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const records = await this.getEmotionRecordsByDateRange(startDate, endDate);
      
      const stats = {
        totalRecords: records.length,
        emotionDistribution: {},
        averageIntensity: 0,
        dailyAverage: 0,
      };
      
      if (records.length === 0) {
        return stats;
      }
      
      // 计算情绪分布
      records.forEach(record => {
        const emotion = record.emotion;
        stats.emotionDistribution[emotion] = (stats.emotionDistribution[emotion] || 0) + 1;
      });
      
      // 计算平均强度
      const totalIntensity = records.reduce((sum, record) => sum + record.intensity, 0);
      stats.averageIntensity = totalIntensity / records.length;
      
      // 计算日均记录数
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      stats.dailyAverage = records.length / daysDiff;
      
      return stats;
    } catch (error) {
      console.error('获取情绪统计失败:', error);
      return null;
    }
  }

  // 清空所有数据（用于测试）
  static async clearAllData() {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
      return true;
    } catch (error) {
      console.error('清空数据失败:', error);
      return false;
    }
  }

  // 导出数据
  static async exportData() {
    try {
      const data = {
        userProfile: await this.getUserProfile(),
        emotionRecords: await this.getEmotionRecords(),
        pressureAssessments: await this.getPressureAssessments(),
        psychologicalSessions: await this.getPsychologicalSessions(),
        parentReports: await this.getParentReports(),
        exportDate: new Date().toISOString(),
      };
      
      return data;
    } catch (error) {
      console.error('导出数据失败:', error);
      return null;
    }
  }

  // 导入数据
  static async importData(data) {
    try {
      if (data.userProfile) {
        await this.saveUserProfile(data.userProfile);
      }
      if (data.emotionRecords) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.EMOTION_RECORDS,
          JSON.stringify(data.emotionRecords),
        );
      }
      if (data.pressureAssessments) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.PRESSURE_ASSESSMENTS,
          JSON.stringify(data.pressureAssessments),
        );
      }
      if (data.psychologicalSessions) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.PSYCHOLOGICAL_SESSIONS,
          JSON.stringify(data.psychologicalSessions),
        );
      }
      if (data.parentReports) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.PARENT_REPORTS,
          JSON.stringify(data.parentReports),
        );
      }
      
      return true;
    } catch (error) {
      console.error('导入数据失败:', error);
      return false;
    }
  }
}

export default StorageService;