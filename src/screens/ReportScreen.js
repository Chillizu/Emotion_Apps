import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import MaterialButton from '../components/MaterialButton';
import MaterialTheme from '../theme/MaterialTheme';
import StorageService from '../services/StorageService';
import AuthService, {USER_ROLES} from '../services/AuthService';

const {width: screenWidth} = Dimensions.get('window');

const ReportScreen = () => {
  const [reportData, setReportData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month, all
  const [showExportModal, setShowExportModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
      
      const data = await generateReportData(selectedPeriod);
      setReportData(data);
    } catch (error) {
      console.error('加载报告数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReportData = async (period) => {
    // 获取所有数据
    const emotionRecords = await StorageService.getEmotionRecords();
    const pressureAssessments = await StorageService.getPressureAssessments();
    const psychologicalSessions = await StorageService.getPsychologicalSessions();

    // 根据时间段过滤数据
    const filterByPeriod = (records) => {
      const now = new Date();
      const periodStart = new Date();
      
      switch (period) {
        case 'week':
          periodStart.setDate(now.getDate() - 7);
          break;
        case 'month':
          periodStart.setMonth(now.getMonth() - 1);
          break;
        case 'all':
        default:
          return records;
      }
      
      return records.filter(record => 
        new Date(record.timestamp) >= periodStart
      );
    };

    const filteredEmotions = filterByPeriod(emotionRecords);
    const filteredAssessments = filterByPeriod(pressureAssessments);
    const filteredSessions = filterByPeriod(psychologicalSessions);

    // 情绪分析
    const emotionAnalysis = analyzeEmotions(filteredEmotions);
    
    // 压力趋势
    const pressureTrend = analyzePressureTrend(filteredAssessments);
    
    // 工具使用分析
    const toolAnalysis = analyzeToolUsage(filteredSessions);
    
    // 总体统计
    const overallStats = {
      totalEmotionRecords: filteredEmotions.length,
      totalAssessments: filteredAssessments.length,
      totalSessions: filteredSessions.length,
      sessionDuration: filteredSessions.reduce((sum, session) => sum + session.duration, 0),
    };

    return {
      period,
      emotionAnalysis,
      pressureTrend,
      toolAnalysis,
      overallStats,
      generatedAt: new Date().toISOString(),
    };
  };

  const analyzeEmotions = (emotionRecords) => {
    if (emotionRecords.length === 0) {
      return {
        total: 0,
        positiveCount: 0,
        negativeCount: 0,
        neutralCount: 0,
        mostFrequent: null,
        dailyAverage: 0,
        emotionDistribution: {},
      };
    }

    // 情绪分类
    const positiveEmotions = ['happy', 'calm', 'excited'];
    const negativeEmotions = ['sad', 'angry', 'anxious', 'tired', 'confused'];
    const neutralEmotions = [];

    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;
    const emotionDistribution = {};

    emotionRecords.forEach(record => {
      // 统计情绪分布
      emotionDistribution[record.emotionType] = (emotionDistribution[record.emotionType] || 0) + 1;
      
      // 分类统计
      if (positiveEmotions.includes(record.emotionType)) {
        positiveCount++;
      } else if (negativeEmotions.includes(record.emotionType)) {
        negativeCount++;
      } else {
        neutralCount++;
      }
    });

    // 找出最常见的情绪
    const mostFrequent = Object.keys(emotionDistribution).reduce((a, b) => 
      emotionDistribution[a] > emotionDistribution[b] ? a : b
    );

    // 计算每日平均记录数
    const days = getPeriodDays(selectedPeriod);
    const dailyAverage = emotionRecords.length / days;

    return {
      total: emotionRecords.length,
      positiveCount,
      negativeCount,
      neutralCount,
      mostFrequent,
      dailyAverage: Math.round(dailyAverage * 10) / 10,
      emotionDistribution,
    };
  };

  const analyzePressureTrend = (assessments) => {
    if (assessments.length === 0) {
      return {
        total: 0,
        averageScore: 0,
        latestLevel: null,
        trend: 'stable',
        levelDistribution: {},
      };
    }

    // 压力等级分数映射
    const levelScores = {
      '低压力': 0,
      '中等压力': 1,
      '较高压力': 2,
      '高压力': 3,
    };

    // 计算平均分数
    const totalScore = assessments.reduce((sum, assessment) => {
      return sum + (levelScores[assessment.level] || 0);
    }, 0);
    const averageScore = totalScore / assessments.length;

    // 压力等级分布
    const levelDistribution = {};
    assessments.forEach(assessment => {
      levelDistribution[assessment.level] = (levelDistribution[assessment.level] || 0) + 1;
    });

    // 趋势分析（简化版）
    let trend = 'stable';
    if (assessments.length >= 2) {
      const recentScore = levelScores[assessments[0].level] || 0;
      const previousScore = levelScores[assessments[1].level] || 0;
      if (recentScore > previousScore) {
        trend = 'increasing';
      } else if (recentScore < previousScore) {
        trend = 'decreasing';
      }
    }

    return {
      total: assessments.length,
      averageScore: Math.round(averageScore * 10) / 10,
      latestLevel: assessments[0]?.level,
      trend,
      levelDistribution,
    };
  };

  const analyzeToolUsage = (sessions) => {
    if (sessions.length === 0) {
      return {
        total: 0,
        totalDuration: 0,
        averageDuration: 0,
        mostUsed: null,
        toolDistribution: {},
      };
    }

    // 工具使用分布
    const toolDistribution = {};
    let totalDuration = 0;

    sessions.forEach(session => {
      toolDistribution[session.toolId] = (toolDistribution[session.toolId] || 0) + 1;
      totalDuration += session.duration;
    });

    // 找出最常用的工具
    const mostUsed = Object.keys(toolDistribution).reduce((a, b) => 
      toolDistribution[a] > toolDistribution[b] ? a : b
    );

    const averageDuration = totalDuration / sessions.length;

    return {
      total: sessions.length,
      totalDuration: Math.round(totalDuration / 60), // 转换为分钟
      averageDuration: Math.round(averageDuration),
      mostUsed,
      toolDistribution,
    };
  };

  const getPeriodDays = (period) => {
    switch (period) {
      case 'week': return 7;
      case 'month': return 30;
      case 'all': return 365; // 近似值
      default: return 7;
    }
  };

  const getPeriodDisplayName = (period) => {
    switch (period) {
      case 'week': return '最近一周';
      case 'month': return '最近一月';
      case 'all': return '全部时间';
      default: return period;
    }
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

  const getTrendDisplay = (trend) => {
    switch (trend) {
      case 'increasing': return {text: '上升', color: MaterialTheme.colors.error.default};
      case 'decreasing': return {text: '下降', color: MaterialTheme.colors.success.default};
      default: return {text: '稳定', color: MaterialTheme.colors.info.default};
    }
  };

  const generateExportText = () => {
    if (!reportData) return '';
    
    const {emotionAnalysis, pressureTrend, toolAnalysis, overallStats} = reportData;
    
    let text = `心情守护 - 心理健康报告\n`;
    text += `生成时间: ${new Date().toLocaleDateString('zh-CN')}\n`;
    text += `统计周期: ${getPeriodDisplayName(selectedPeriod)}\n\n`;
    
    text += `=== 情绪记录分析 ===\n`;
    text += `总记录数: ${emotionAnalysis.total}\n`;
    text += `积极情绪: ${emotionAnalysis.positiveCount}次\n`;
    text += `消极情绪: ${emotionAnalysis.negativeCount}次\n`;
    text += `最常见情绪: ${getEmotionDisplayName(emotionAnalysis.mostFrequent)}\n`;
    text += `日均记录: ${emotionAnalysis.dailyAverage}次\n\n`;
    
    text += `=== 压力评估分析 ===\n`;
    text += `评估次数: ${pressureTrend.total}\n`;
    text += `平均压力水平: ${pressureTrend.averageScore}\n`;
    text += `最新压力等级: ${pressureTrend.latestLevel}\n`;
    text += `趋势: ${getTrendDisplay(pressureTrend.trend).text}\n\n`;
    
    text += `=== 工具使用分析 ===\n`;
    text += `使用次数: ${toolAnalysis.total}\n`;
    text += `总时长: ${toolAnalysis.totalDuration}分钟\n`;
    text += `平均时长: ${toolAnalysis.averageDuration}秒\n`;
    text += `最常用工具: ${getToolDisplayName(toolAnalysis.mostUsed)}\n\n`;
    
    text += `=== 总体统计 ===\n`;
    text += `情绪日记: ${overallStats.totalEmotionRecords}次\n`;
    text += `压力评估: ${overallStats.totalAssessments}次\n`;
    text += `心理调适: ${overallStats.totalSessions}次\n`;
    
    return text;
  };

  const handleExport = () => {
    const exportText = generateExportText();
    // 在实际应用中，这里可以调用分享功能或保存到文件
    setShowExportModal(true);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>生成报告中...</Text>
      </View>
    );
  }

  if (!reportData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>无法生成报告数据</Text>
        <MaterialButton
          title="重新加载"
          onPress={loadData}
          variant="contained"
          style={styles.retryButton}
        />
      </View>
    );
  }

  const {emotionAnalysis, pressureTrend, toolAnalysis, overallStats} = reportData;
  const trendInfo = getTrendDisplay(pressureTrend.trend);

  return (
    <View style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>数据分析报告</Text>
        <Text style={styles.headerSubtitle}>
          了解你的心理健康状况和变化趋势
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* 时间段选择 */}
        <View style={styles.periodSelector}>
          <Text style={styles.selectorLabel}>统计周期:</Text>
          <View style={styles.periodButtons}>
            {['week', 'month', 'all'].map(period => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonSelected,
                ]}
                onPress={() => setSelectedPeriod(period)}>
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === period && styles.periodButtonTextSelected,
                  ]}>
                  {getPeriodDisplayName(period)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 总体概览 */}
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>总体概览</Text>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewNumber}>{overallStats.totalEmotionRecords}</Text>
              <Text style={styles.overviewLabel}>情绪记录</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewNumber}>{overallStats.totalAssessments}</Text>
              <Text style={styles.overviewLabel}>压力评估</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewNumber}>{overallStats.totalSessions}</Text>
              <Text style={styles.overviewLabel}>调适练习</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewNumber}>{Math.round(overallStats.sessionDuration / 60)}</Text>
              <Text style={styles.overviewLabel}>练习时长(分)</Text>
            </View>
          </View>
        </View>

        {/* 情绪分析 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>情绪记录分析</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{emotionAnalysis.total}</Text>
              <Text style={styles.statLabel}>总记录数</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{emotionAnalysis.dailyAverage}</Text>
              <Text style={styles.statLabel}>日均记录</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{emotionAnalysis.positiveCount}</Text>
              <Text style={styles.statLabel}>积极情绪</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{emotionAnalysis.negativeCount}</Text>
              <Text style={styles.statLabel}>消极情绪</Text>
            </View>
          </View>
          
          {emotionAnalysis.mostFrequent && (
            <View style={styles.detailCard}>
              <Text style={styles.detailTitle}>最常见情绪</Text>
              <Text style={styles.detailValue}>
                {getEmotionDisplayName(emotionAnalysis.mostFrequent)}
              </Text>
            </View>
          )}
        </View>

        {/* 压力分析 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>压力评估分析</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{pressureTrend.total}</Text>
              <Text style={styles.statLabel}>评估次数</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{pressureTrend.averageScore}</Text>
              <Text style={styles.statLabel}>平均压力</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{pressureTrend.latestLevel}</Text>
              <Text style={styles.statLabel}>最新等级</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, {color: trendInfo.color}]}>
                {trendInfo.text}
              </Text>
              <Text style={styles.statLabel}>趋势</Text>
            </View>
          </View>
        </View>

        {/* 工具使用分析 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>心理调适分析</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{toolAnalysis.total}</Text>
              <Text style={styles.statLabel}>使用次数</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{toolAnalysis.totalDuration}</Text>
              <Text style={styles.statLabel}>总时长(分)</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{toolAnalysis.averageDuration}</Text>
              <Text style={styles.statLabel}>平均时长</Text>
            </View>
          </View>
          
          {toolAnalysis.mostUsed && (
            <View style={styles.detailCard}>
              <Text style={styles.detailTitle}>最常用工具</Text>
              <Text style={styles.detailValue}>
                {getToolDisplayName(toolAnalysis.mostUsed)}
              </Text>
            </View>
          )}
        </View>

        {/* 导出按钮 */}
        <MaterialButton
          title="导出报告"
          onPress={handleExport}
          variant="contained"
          style={styles.exportButton}
        />
      </ScrollView>

      {/* 导出预览模态框 */}
      <Modal
        visible={showExportModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>报告预览</Text>
            <TouchableOpacity onPress={() => setShowExportModal(false)}>
              <Text style={styles.modalClose}>关闭</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.exportText}>{generateExportText()}</Text>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Text style={styles.exportHint}>
              提示：在实际应用中，这里可以调用系统分享功能或保存到文件
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: MaterialTheme.spacing.xl,
  },
  errorText: {
    fontSize: MaterialTheme.typography.body1.fontSize,
    color: MaterialTheme.colors.error.default,
    marginBottom: MaterialTheme.spacing.lg,
    textAlign: 'center',
  },
  retryButton: {
    minWidth: 120,
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
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: MaterialTheme.spacing.xl,
    backgroundColor: MaterialTheme.colors.surface.container,
    borderRadius: MaterialTheme.borderRadius.lg,
    padding: MaterialTheme.spacing.md,
    ...MaterialTheme.elevation.small,
  },
  selectorLabel: {
    fontSize: MaterialTheme.typography.body2.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
    fontWeight: '500',
  },
  periodButtons: {
    flexDirection: 'row',
  },
  periodButton: {
    paddingHorizontal: MaterialTheme.spacing.md,
    paddingVertical: MaterialTheme.spacing.sm,
    borderRadius: MaterialTheme.borderRadius.md,
    marginLeft: MaterialTheme.spacing.sm,
    backgroundColor: MaterialTheme.colors.surface.variant,
  },
  periodButtonSelected: {
    backgroundColor: MaterialTheme.colors.primary.default,
  },
  periodButtonText: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
    fontWeight: '500',
  },
  periodButtonTextSelected: {
    color: MaterialTheme.colors.onPrimary.default,
  },
  overviewSection: {
    backgroundColor: MaterialTheme.colors.surface.container,
    borderRadius: MaterialTheme.borderRadius.lg,
    padding: MaterialTheme.spacing.lg,
    marginBottom: MaterialTheme.spacing.lg,
    ...MaterialTheme.elevation.small,
  },
  sectionTitle: {
    fontSize: MaterialTheme.typography.headline3.fontSize,
    fontWeight: MaterialTheme.typography.headline3.fontWeight,
    color: MaterialTheme.colors.onSurface.high,
    marginBottom: MaterialTheme.spacing.md,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  overviewItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: MaterialTheme.spacing.md,
  },
  overviewNumber: {
    fontSize: MaterialTheme.typography.headline2.fontSize,
    fontWeight: 'bold',
    color: MaterialTheme.colors.primary.default,
    marginBottom: MaterialTheme.spacing.xs,
  },
  overviewLabel: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
    textAlign: 'center',
  },
  section: {
    backgroundColor: MaterialTheme.colors.surface.container,
    borderRadius: MaterialTheme.borderRadius.lg,
    padding: MaterialTheme.spacing.lg,
    marginBottom: MaterialTheme.spacing.lg,
    ...MaterialTheme.elevation.small,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: MaterialTheme.spacing.md,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    marginBottom: MaterialTheme.spacing.md,
  },
  statNumber: {
    fontSize: MaterialTheme.typography.headline4.fontSize,
    fontWeight: 'bold',
    color: MaterialTheme.colors.primary.default,
    marginBottom: MaterialTheme.spacing.xs,
  },
  statLabel: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
    textAlign: 'center',
  },
  detailCard: {
    backgroundColor: MaterialTheme.colors.surface.variant,
    borderRadius: MaterialTheme.borderRadius.md,
    padding: MaterialTheme.spacing.md,
    marginTop: MaterialTheme.spacing.sm,
  },
  detailTitle: {
    fontSize: MaterialTheme.typography.body2.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
    marginBottom: MaterialTheme.spacing.xs,
  },
  detailValue: {
    fontSize: MaterialTheme.typography.body1.fontSize,
    fontWeight: '500',
    color: MaterialTheme.colors.onSurface.high,
  },
  exportButton: {
    marginTop: MaterialTheme.spacing.md,
    borderRadius: MaterialTheme.borderRadius.lg,
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
  exportText: {
    fontSize: MaterialTheme.typography.body2.fontSize,
    color: MaterialTheme.colors.onSurface.high,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  modalFooter: {
    padding: MaterialTheme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: MaterialTheme.colors.outline.variant,
  },
  exportHint: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ReportScreen;