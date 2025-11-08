import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import MaterialButton from '../components/MaterialButton';
import MaterialTheme from '../theme/MaterialTheme';
import AuthService, {USER_ROLES} from '../services/AuthService';
import StorageService from '../services/StorageService';

const ParentDashboardScreen = () => {
  const [linkedStudents, setLinkedStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentData, setStudentData] = useState({});
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [newStudentUsername, setNewStudentUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
      
      if (user.role === USER_ROLES.PARENT) {
        const students = await AuthService.getLinkedStudents(user.id);
        setLinkedStudents(students);
        
        // 加载每个学生的数据
        const studentDataMap = {};
        for (const student of students) {
          const data = await loadStudentData(student.id);
          studentDataMap[student.id] = data;
        }
        setStudentData(studentDataMap);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const loadStudentData = async (studentId) => {
    try {
      // 获取学生的情绪记录
      const emotionRecords = await StorageService.getEmotionRecords();
      const studentEmotions = emotionRecords.filter(record => record.userId === studentId);
      
      // 获取学生的压力评估
      const pressureAssessments = await StorageService.getPressureAssessments();
      const studentAssessments = pressureAssessments.filter(assessment => assessment.userId === studentId);
      
      // 获取学生的心理调适记录
      const psychologicalSessions = await StorageService.getPsychologicalSessions();
      const studentSessions = psychologicalSessions.filter(session => session.userId === studentId);

      return {
        emotionRecords: studentEmotions,
        pressureAssessments: studentAssessments,
        psychologicalSessions: studentSessions,
      };
    } catch (error) {
      console.error(`加载学生${studentId}数据失败:`, error);
      return {
        emotionRecords: [],
        pressureAssessments: [],
        psychologicalSessions: [],
      };
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const handleLinkStudent = async () => {
    if (!newStudentUsername.trim()) {
      Alert.alert('输入错误', '请输入学生用户名');
      return;
    }

    try {
      const result = await AuthService.linkStudent(currentUser.id, newStudentUsername);
      
      if (result.success) {
        Alert.alert('成功', result.message);
        setShowLinkModal(false);
        setNewStudentUsername('');
        loadData(); // 重新加载数据
      } else {
        Alert.alert('失败', result.error);
      }
    } catch (error) {
      console.error('关联学生失败:', error);
      Alert.alert('错误', '关联学生失败，请重试');
    }
  };

  const getEmotionStats = (studentId) => {
    const data = studentData[studentId];
    if (!data) return { total: 0, recent: 0, mostFrequent: '暂无' };

    const records = data.emotionRecords || [];
    const recentRecords = records.filter(record => {
      const recordDate = new Date(record.timestamp);
      const today = new Date();
      const diffTime = Math.abs(today - recordDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    });

    // 计算最常见的情绪
    const emotionCounts = {};
    recentRecords.forEach(record => {
      emotionCounts[record.emotionType] = (emotionCounts[record.emotionType] || 0) + 1;
    });
    
    const mostFrequent = Object.keys(emotionCounts).reduce((a, b) => 
      emotionCounts[a] > emotionCounts[b] ? a : b, '暂无');

    return {
      total: records.length,
      recent: recentRecords.length,
      mostFrequent: getEmotionDisplayName(mostFrequent),
    };
  };

  const getPressureStats = (studentId) => {
    const data = studentData[studentId];
    if (!data) return { total: 0, latest: null, trend: 'stable' };

    const assessments = data.pressureAssessments || [];
    const latestAssessment = assessments.length > 0 ? assessments[0] : null;

    return {
      total: assessments.length,
      latest: latestAssessment,
      trend: 'stable', // 简化处理，实际应该计算趋势
    };
  };

  const getToolUsageStats = (studentId) => {
    const data = studentData[studentId];
    if (!data) return { total: 0, duration: 0, favorite: '暂无' };

    const sessions = data.psychologicalSessions || [];
    const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0);
    
    // 计算最常用的工具
    const toolCounts = {};
    sessions.forEach(session => {
      toolCounts[session.toolId] = (toolCounts[session.toolId] || 0) + 1;
    });
    
    const favoriteTool = Object.keys(toolCounts).reduce((a, b) => 
      toolCounts[a] > toolCounts[b] ? a : b, '暂无');

    return {
      total: sessions.length,
      duration: Math.round(totalDuration / 60), // 转换为分钟
      favorite: getToolDisplayName(favoriteTool),
    };
  };

  const getEmotionDisplayName = (emotionType) => {
    const emotionMap = {
      'happy': '开心',
      'sad': '伤心',
      'angry': '生气',
      'anxious': '焦虑',
      'calm': '平静',
      'excited': '兴奋',
      'tired': '疲惫',
      'confused': '困惑',
    };
    return emotionMap[emotionType] || emotionType;
  };

  const getToolDisplayName = (toolId) => {
    const toolMap = {
      'breathing': '深呼吸练习',
      'mindfulness': '正念冥想',
      'progressive_relaxation': '渐进式放松',
      'positive_thinking': '积极思考',
      'gratitude_journal': '感恩日记',
      'visualization': '积极想象',
    };
    return toolMap[toolId] || toolId;
  };

  const getPressureLevelColor = (level) => {
    switch (level) {
      case '低压力': return MaterialTheme.colors.success.default;
      case '中等压力': return MaterialTheme.colors.warning.default;
      case '较高压力': return MaterialTheme.colors.error.light;
      case '高压力': return MaterialTheme.colors.error.default;
      default: return MaterialTheme.colors.onSurface.medium;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '暂无';
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN');
  };

  const getAlertLevel = (studentId) => {
    const pressureStats = getPressureStats(studentId);
    if (pressureStats.latest?.level === '高压力') {
      return 'high';
    } else if (pressureStats.latest?.level === '较高压力') {
      return 'medium';
    }
    return 'low';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>家长监控</Text>
        <Text style={styles.headerSubtitle}>
          关注孩子的情绪状态和心理健康
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        
        {/* 关联学生卡片 */}
        <View style={styles.studentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>关联学生</Text>
            <MaterialButton
              title="关联学生"
              onPress={() => setShowLinkModal(true)}
              variant="outlined"
              size="small"
            />
          </View>

          {linkedStudents.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>还没有关联的学生</Text>
              <Text style={styles.emptySubtext}>
                点击上方按钮关联孩子账户，开始监控
              </Text>
            </View>
          ) : (
            linkedStudents.map(student => {
              const alertLevel = getAlertLevel(student.id);
              const emotionStats = getEmotionStats(student.id);
              const pressureStats = getPressureStats(student.id);
              const toolStats = getToolUsageStats(student.id);

              return (
                <TouchableOpacity
                  key={student.id}
                  style={styles.studentCard}
                  onPress={() => handleStudentSelect(student)}>
                  
                  {/* 警报指示器 */}
                  {alertLevel !== 'low' && (
                    <View style={[
                      styles.alertIndicator,
                      alertLevel === 'high' ? styles.highAlert : styles.mediumAlert,
                    ]} />
                  )}

                  <View style={styles.studentHeader}>
                    <View style={styles.studentInfo}>
                      <Text style={styles.studentName}>{student.profile.name}</Text>
                      <Text style={styles.studentDetails}>
                        {student.profile.age ? `${student.profile.age}岁` : ''} 
                        {student.profile.grade ? ` • ${student.profile.grade}` : ''}
                        {student.profile.school ? ` • ${student.profile.school}` : ''}
                      </Text>
                    </View>
                    <View style={styles.studentStats}>
                      <Text style={styles.statValue}>{emotionStats.recent}</Text>
                      <Text style={styles.statLabel}>最近情绪</Text>
                    </View>
                  </View>

                  <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{emotionStats.total}</Text>
                      <Text style={styles.statLabel}>情绪记录</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{pressureStats.total}</Text>
                      <Text style={styles.statLabel}>压力评估</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{toolStats.total}</Text>
                      <Text style={styles.statLabel}>工具使用</Text>
                    </View>
                  </View>

                  {/* 最新压力评估 */}
                  {pressureStats.latest && (
                    <View style={styles.latestAssessment}>
                      <Text style={styles.assessmentLabel}>最新压力评估:</Text>
                      <View style={styles.assessmentInfo}>
                        <View
                          style={[
                            styles.pressureLevel,
                            {backgroundColor: getPressureLevelColor(pressureStats.latest.level)},
                          ]}>
                          <Text style={styles.pressureLevelText}>
                            {pressureStats.latest.level}
                          </Text>
                        </View>
                        <Text style={styles.assessmentDate}>
                          {formatDate(pressureStats.latest.timestamp)}
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* 使用指南 */}
        <View style={styles.guideSection}>
          <Text style={styles.sectionTitle}>家长指南</Text>
          <View style={styles.guideCards}>
            <View style={styles.guideCard}>
              <Text style={styles.guideEmoji}>👁️</Text>
              <Text style={styles.guideTitle}>观察情绪变化</Text>
              <Text style={styles.guideDescription}>
                关注孩子情绪记录的变化趋势，及时发现异常
              </Text>
            </View>
            <View style={styles.guideCard}>
              <Text style={styles.guideEmoji}>💬</Text>
              <Text style={styles.guideTitle}>积极沟通</Text>
              <Text style={styles.guideDescription}>
                当发现孩子压力较大时，主动沟通并提供支持
              </Text>
            </View>
            <View style={styles.guideCard}>
              <Text style={styles.guideEmoji}>🤝</Text>
              <Text style={styles.guideTitle}>寻求帮助</Text>
              <Text style={styles.guideDescription}>
                必要时联系学校心理老师或专业心理咨询师
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 学生详情模态框 */}
      <Modal
        visible={showStudentModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedStudent?.profile.name} 的详情
            </Text>
            <TouchableOpacity onPress={() => setShowStudentModal(false)}>
              <Text style={styles.modalClose}>关闭</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedStudent && (
              <>
                {/* 学生基本信息 */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>基本信息</Text>
                  <View style={styles.detailGrid}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>姓名</Text>
                      <Text style={styles.detailValue}>
                        {selectedStudent.profile.name}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>年龄</Text>
                      <Text style={styles.detailValue}>
                        {selectedStudent.profile.age || '未设置'}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>年级</Text>
                      <Text style={styles.detailValue}>
                        {selectedStudent.profile.grade || '未设置'}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>学校</Text>
                      <Text style={styles.detailValue}>
                        {selectedStudent.profile.school || '未设置'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 情绪统计 */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>情绪记录</Text>
                  {(() => {
                    const stats = getEmotionStats(selectedStudent.id);
                    return (
                      <View style={styles.statsDetail}>
                        <View style={styles.detailStat}>
                          <Text style={styles.detailStatValue}>{stats.total}</Text>
                          <Text style={styles.detailStatLabel}>总记录数</Text>
                        </View>
                        <View style={styles.detailStat}>
                          <Text style={styles.detailStatValue}>{stats.recent}</Text>
                          <Text style={styles.detailStatLabel}>最近7天</Text>
                        </View>
                        <View style={styles.detailStat}>
                          <Text style={styles.detailStatValue}>{stats.mostFrequent}</Text>
                          <Text style={styles.detailStatLabel}>常见情绪</Text>
                        </View>
                      </View>
                    );
                  })()}
                </View>

                {/* 压力评估 */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>压力评估</Text>
                  {(() => {
                    const stats = getPressureStats(selectedStudent.id);
                    return (
                      <View style={styles.statsDetail}>
                        <View style={styles.detailStat}>
                          <Text style={styles.detailStatValue}>{stats.total}</Text>
                          <Text style={styles.detailStatLabel}>评估次数</Text>
                        </View>
                        {stats.latest && (
                          <View style={styles.detailStat}>
                            <Text style={styles.detailStatValue}>{stats.latest.level}</Text>
                            <Text style={styles.detailStatLabel}>最新结果</Text>
                          </View>
                        )}
                      </View>
                    );
                  })()}
                </View>

                {/* 工具使用 */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>心理调适</Text>
                  {(() => {
                    const stats = getToolUsageStats(selectedStudent.id);
                    return (
                      <View style={styles.statsDetail}>
                        <View style={styles.detailStat}>
                          <Text style={styles.detailStatValue}>{stats.total}</Text>
                          <Text style={styles.detailStatLabel}>使用次数</Text>
                        </View>
                        <View style={styles.detailStat}>
                          <Text style={styles.detailStatValue}>{stats.duration}</Text>
                          <Text style={styles.detailStatLabel}>总时长(分)</Text>
                        </View>
                        <View style={styles.detailStat}>
                          <Text style={styles.detailStatValue}>{stats.favorite}</Text>
                          <Text style={styles.detailStatLabel}>常用工具</Text>
                        </View>
                      </View>
                    );
                  })()}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* 关联学生模态框 */}
      <Modal
        visible={showLinkModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>关联学生账户</Text>
            <TouchableOpacity
              onPress={() => {
                setShowLinkModal(false);
                setNewStudentUsername('');
              }}>
              <Text style={styles.modalClose}>取消</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.linkSection}>
              <Text style={styles.linkDescription}>
                请输入您孩子的用户名来关联账户。关联后，您可以查看孩子的情绪状态和使用情况。
              </Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>学生用户名</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="请输入学生的用户名"
                  value={newStudentUsername}
                  onChangeText={setNewStudentUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <Text style={styles.demoHint}>
                演示提示：可尝试输入 "student1"
              </Text>
            </View>
          </View>

          <View style={styles.modalFooter}>
            <MaterialButton
              title="关联学生"
              onPress={handleLinkStudent}
              variant="contained"
              disabled={!newStudentUsername.trim()}
              style={styles.linkButton}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// 添加 TextInput 导入和样式
import { TextInput } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MaterialTheme.colors.surface.default,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: MaterialTheme.typography.body1.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
  },
  header: {
    backgroundColor: MaterialTheme.colors.surface.container,
    padding: MaterialTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: MaterialTheme.colors.outline.variant,
  },
  headerTitle: {
    fontSize: MaterialTheme.typography.headline2.fontSize,
    fontWeight: MaterialTheme.typography.headline2.fontWeight,
    color: MaterialTheme.colors.onSurface.high,
    marginBottom: MaterialTheme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: MaterialTheme.typography.body2.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: MaterialTheme.spacing.lg,
  },
  studentsSection: {
    marginBottom: MaterialTheme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: MaterialTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: MaterialTheme.typography.headline3.fontSize,
    fontWeight: MaterialTheme.typography.headline3.fontWeight,
    color: MaterialTheme.colors.onSurface.high,
  },
  emptyState: {
    alignItems: 'center',
    padding: MaterialTheme.spacing.xl,
    backgroundColor: MaterialTheme.colors.surface.container,
    borderRadius: MaterialTheme.borderRadius.lg,
    ...MaterialTheme.elevation.small,
  },
  emptyText: {
    fontSize: MaterialTheme.typography.body1.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
    marginBottom: MaterialTheme.spacing.xs,
  },
  emptySubtext: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.onSurface.low,
    textAlign: 'center',
  },
  studentCard: {
    backgroundColor: MaterialTheme.colors.surface.container,
    borderRadius: MaterialTheme.borderRadius.lg,
    padding: MaterialTheme.spacing.lg,
    marginBottom: MaterialTheme.spacing.md,
    ...MaterialTheme.elevation.small,
    position: 'relative',
  },
  alertIndicator: {
    position: 'absolute',
    top: MaterialTheme.spacing.lg,
    right: MaterialTheme.spacing.lg,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  highAlert: {
    backgroundColor: MaterialTheme.colors.error.default,
  },
  mediumAlert: {
    backgroundColor: MaterialTheme.colors.warning.default,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: MaterialTheme.spacing.md,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: MaterialTheme.typography.headline3.fontSize,
    fontWeight: MaterialTheme.typography.headline3.fontWeight,
    color: MaterialTheme.colors.onSurface.high,
    marginBottom: MaterialTheme.spacing.xs,
  },
  studentDetails: {
    fontSize: MaterialTheme.typography.body2.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
  },
  studentStats: {
    alignItems: 'flex-end',
  },
  statValue: {
    fontSize: MaterialTheme.typography.headline4.fontSize,
    fontWeight: 'bold',
    color: MaterialTheme.colors.primary.default,
    marginBottom: MaterialTheme.spacing.xs,
  },
  statLabel: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: MaterialTheme.spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  latestAssessment: {
    paddingTop: MaterialTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: MaterialTheme.colors.outline.variant,
  },
  assessmentLabel: {
    fontSize: MaterialTheme.typography.body2.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
    marginBottom: MaterialTheme.spacing.xs,
  },
  assessmentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pressureLevel: {
    paddingHorizontal: MaterialTheme.spacing.md,
    paddingVertical: MaterialTheme.spacing.xs,
    borderRadius: MaterialTheme.borderRadius.sm,
  },
  pressureLevelText: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.onPrimary.default,
    fontWeight: '500',
  },
  assessmentDate: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
  },
  guideSection: {
    marginBottom: MaterialTheme.spacing.xl,
  },
  guideCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  guideCard: {
    width: '48%',
    backgroundColor: MaterialTheme.colors.surface.container,
    borderRadius: MaterialTheme.borderRadius.lg,
    padding: MaterialTheme.spacing.md,
    marginBottom: MaterialTheme.spacing.md,
    ...MaterialTheme.elevation.small,
    alignItems: 'center',
  },
  guideEmoji: {
    fontSize: 24,
    marginBottom: MaterialTheme.spacing.sm,
  },
  guideTitle: {
    fontSize: MaterialTheme.typography.body2.fontSize,
    fontWeight: '500',
    color: MaterialTheme.colors.onSurface.high,
    marginBottom: MaterialTheme.spacing.xs,
    textAlign: 'center',
  },
  guideDescription: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
    textAlign: 'center',
    lineHeight: 14,
  },
  // 模态框样式
  modalContainer: {
    flex: 1,
    backgroundColor: MaterialTheme.colors.surface.default,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: MaterialTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: MaterialTheme.colors.outline.variant,
  },
  modalTitle: {
    fontSize: MaterialTheme.typography.headline2.fontSize,
    fontWeight: MaterialTheme.typography.headline2.fontWeight,
    color: MaterialTheme.colors.onSurface.high,
  },
  modalClose: {
    fontSize: MaterialTheme.typography.body1.fontSize,
    color: MaterialTheme.colors.primary.default,
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    padding: MaterialTheme.spacing.lg,
  },
  detailSection: {
    marginBottom: MaterialTheme.spacing.xl,
  },
  detailSectionTitle: {
    fontSize: MaterialTheme.typography.headline3.fontSize,
    fontWeight: MaterialTheme.typography.headline3.fontWeight,
    color: MaterialTheme.colors.onSurface.high,
    marginBottom: MaterialTheme.spacing.md,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    marginBottom: MaterialTheme.spacing.md,
  },
  detailLabel: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
    marginBottom: MaterialTheme.spacing.xs,
  },
  detailValue: {
    fontSize: MaterialTheme.typography.body2.fontSize,
    color: MaterialTheme.colors.onSurface.high,
    fontWeight: '500',
  },
  statsDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailStat: {
    alignItems: 'center',
    flex: 1,
  },
  detailStatValue: {
    fontSize: MaterialTheme.typography.headline4.fontSize,
    fontWeight: 'bold',
    color: MaterialTheme.colors.primary.default,
    marginBottom: MaterialTheme.spacing.xs,
  },
  detailStatLabel: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
    textAlign: 'center',
  },
  linkSection: {
    marginBottom: MaterialTheme.spacing.xl,
  },
  linkDescription: {
    fontSize: MaterialTheme.typography.body1.fontSize,
    color: MaterialTheme.colors.onSurface.high,
    lineHeight: 20,
    marginBottom: MaterialTheme.spacing.xl,
  },
  inputContainer: {
    marginBottom: MaterialTheme.spacing.lg,
  },
  inputLabel: {
    fontSize: MaterialTheme.typography.body2.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
    marginBottom: MaterialTheme.spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: MaterialTheme.colors.outline.default,
    borderRadius: MaterialTheme.borderRadius.md,
    paddingHorizontal: MaterialTheme.spacing.md,
    paddingVertical: MaterialTheme.spacing.sm,
    fontSize: MaterialTheme.typography.body1.fontSize,
    color: MaterialTheme.colors.onSurface.high,
    backgroundColor: MaterialTheme.colors.surface.default,
  },
  demoHint: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.onSurface.low,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  modalFooter: {
    padding: MaterialTheme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: MaterialTheme.colors.outline.variant,
  },
  linkButton: {
    borderRadius: MaterialTheme.borderRadius.lg,
  },
});

export default ParentDashboardScreen;