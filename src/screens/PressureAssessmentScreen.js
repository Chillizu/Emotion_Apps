import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import MaterialButton from '../components/MaterialButton';
import MaterialTheme from '../theme/MaterialTheme';
import StorageService from '../services/StorageService';
import AuthService from '../services/AuthService';

// 压力评估问题定义
const PRESSURE_QUESTIONS = [
  {
    id: 1,
    question: '最近我感到紧张、焦虑或担忧',
    category: '情绪状态',
  },
  {
    id: 2,
    question: '我难以入睡或睡眠质量不好',
    category: '睡眠质量',
  },
  {
    id: 3,
    question: '我对学习或作业感到压力很大',
    category: '学业压力',
  },
  {
    id: 4,
    question: '我与家人或朋友的关系让我感到困扰',
    category: '人际关系',
  },
  {
    id: 5,
    question: '我感到身体疲惫或精力不足',
    category: '身体状况',
  },
  {
    id: 6,
    question: '我容易发脾气或情绪波动',
    category: '情绪控制',
  },
  {
    id: 7,
    question: '我对未来感到担忧或迷茫',
    category: '未来规划',
  },
  {
    id: 8,
    question: '我感到孤独或不被理解',
    category: '社交状态',
  },
  {
    id: 9,
    question: '我对自己要求很高，容易自责',
    category: '自我要求',
  },
  {
    id: 10,
    question: '我感到时间不够用，总是很匆忙',
    category: '时间管理',
  },
];

// 压力等级定义
const PRESSURE_LEVELS = [
  {level: 1, label: '从不', score: 0, color: MaterialTheme.colors.success.default},
  {level: 2, label: '偶尔', score: 1, color: MaterialTheme.colors.info.default},
  {level: 3, label: '有时', score: 2, color: MaterialTheme.colors.warning.default},
  {level: 4, label: '经常', score: 3, color: MaterialTheme.colors.error.light},
  {level: 5, label: '总是', score: 4, color: MaterialTheme.colors.error.default},
];

// 压力评估结果等级
const ASSESSMENT_RESULTS = [
  {
    scoreRange: [0, 10],
    level: '低压力',
    description: '你的压力水平较低，继续保持良好的心态和生活习惯',
    color: MaterialTheme.colors.success.default,
    suggestions: [
      '继续保持规律的作息',
      '多参与户外活动',
      '与朋友家人保持良好沟通',
    ],
  },
  {
    scoreRange: [11, 20],
    level: '中等压力',
    description: '你感受到一定的压力，需要适当调整和放松',
    color: MaterialTheme.colors.warning.default,
    suggestions: [
      '尝试深呼吸放松',
      '合理安排学习时间',
      '适当运动释放压力',
      '与信任的人倾诉',
    ],
  },
  {
    scoreRange: [21, 30],
    level: '较高压力',
    description: '你的压力水平较高，需要积极应对和寻求帮助',
    color: MaterialTheme.colors.error.light,
    suggestions: [
      '寻求老师或家长帮助',
      '学习压力管理技巧',
      '保证充足睡眠',
      '适当减少额外负担',
    ],
  },
  {
    scoreRange: [31, 40],
    level: '高压力',
    description: '你的压力水平很高，建议及时寻求专业帮助',
    color: MaterialTheme.colors.error.default,
    suggestions: [
      '立即寻求心理咨询',
      '与家长老师深入沟通',
      '调整学习生活节奏',
      '必要时寻求医疗帮助',
    ],
  },
];

const PressureAssessmentScreen = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [pressureAssessments, setPressureAssessments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
      
      const assessments = await StorageService.getPressureAssessments();
      setPressureAssessments(assessments);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, level) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: level,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < PRESSURE_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      calculateResult();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateResult = () => {
    let totalScore = 0;
    let answeredCount = 0;

    // 计算总分
    Object.values(answers).forEach(answerLevel => {
      const level = PRESSURE_LEVELS.find(l => l.level === answerLevel);
      if (level) {
        totalScore += level.score;
        answeredCount++;
      }
    });

    // 如果未完成所有问题，提示用户
    if (answeredCount < PRESSURE_QUESTIONS.length) {
      Alert.alert('提示', '请完成所有问题后再查看结果');
      return;
    }

    // 查找对应的压力等级
    const result = ASSESSMENT_RESULTS.find(
      r => totalScore >= r.scoreRange[0] && totalScore <= r.scoreRange[1],
    );

    const assessmentData = {
      totalScore,
      level: result.level,
      description: result.description,
      suggestions: result.suggestions,
      answers: {...answers},
      timestamp: new Date().toISOString(),
      userId: currentUser?.id,
    };

    setAssessmentResult(assessmentData);
    setShowAssessmentModal(false);
    setShowResultModal(true);
  };

  const saveAssessmentResult = async () => {
    try {
      const savedAssessment = await StorageService.savePressureAssessment(assessmentResult);
      
      if (savedAssessment) {
        setPressureAssessments(prev => [savedAssessment, ...prev]);
        Alert.alert('成功', '压力评估结果已保存');
        setShowResultModal(false);
        resetAssessment();
      }
    } catch (error) {
      console.error('保存评估结果失败:', error);
      Alert.alert('错误', '保存失败，请重试');
    }
  };

  const resetAssessment = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setAssessmentResult(null);
  };

  const getProgressPercentage = () => {
    return ((currentQuestion + 1) / PRESSURE_QUESTIONS.length) * 100;
  };

  const getCategoryStats = () => {
    const categoryScores = {};
    
    PRESSURE_QUESTIONS.forEach(question => {
      const answerLevel = answers[question.id];
      if (answerLevel) {
        const level = PRESSURE_LEVELS.find(l => l.level === answerLevel);
        if (level) {
          categoryScores[question.category] = (categoryScores[question.category] || 0) + level.score;
        }
      }
    });

    return categoryScores;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN');
  };

  const getResultColor = (level) => {
    const result = ASSESSMENT_RESULTS.find(r => r.level === level);
    return result ? result.color : MaterialTheme.colors.onSurface.medium;
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
        <Text style={styles.headerTitle}>压力评估</Text>
        <Text style={styles.headerSubtitle}>
          了解你的压力状况，获得专业建议
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* 开始评估卡片 */}
        <View style={styles.startCard}>
          <Text style={styles.startTitle}>压力自评量表</Text>
          <Text style={styles.startDescription}>
            本评估包含10个问题，大约需要3-5分钟完成。
            通过评估可以了解你当前的压力状况，并获得个性化的建议。
          </Text>
          <MaterialButton
            title="开始评估"
            onPress={() => setShowAssessmentModal(true)}
            variant="contained"
            style={styles.startButton}
          />
        </View>

        {/* 历史记录 */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>历史评估</Text>
          {pressureAssessments.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>还没有评估记录</Text>
              <Text style={styles.emptySubtext}>
                点击上方按钮开始你的第一次压力评估
              </Text>
            </View>
          ) : (
            pressureAssessments.map((assessment, index) => (
              <View key={assessment.id || index} style={styles.assessmentCard}>
                <View style={styles.assessmentHeader}>
                  <View style={styles.assessmentInfo}>
                    <Text style={styles.assessmentDate}>
                      {formatDate(assessment.timestamp)}
                    </Text>
                    <Text style={styles.assessmentScore}>
                      总分: {assessment.totalScore}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.levelBadge,
                      {backgroundColor: getResultColor(assessment.level)},
                    ]}>
                    <Text style={styles.levelText}>{assessment.level}</Text>
                  </View>
                </View>
                <Text style={styles.assessmentDescription}>
                  {assessment.description}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* 压力管理小贴士 */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>压力管理小贴士</Text>
          <View style={styles.tipsGrid}>
            <View style={styles.tipCard}>
              <Text style={styles.tipEmoji}>💤</Text>
              <Text style={styles.tipTitle}>保证睡眠</Text>
              <Text style={styles.tipDescription}>
                每天保证7-9小时充足睡眠，有助于缓解压力
              </Text>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipEmoji}>🏃</Text>
              <Text style={styles.tipTitle}>适当运动</Text>
              <Text style={styles.tipDescription}>
                每天30分钟运动，释放压力，提升心情
              </Text>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipEmoji}>🧘</Text>
              <Text style={styles.tipTitle}>深呼吸</Text>
              <Text style={styles.tipDescription}>
                感到紧张时，尝试深呼吸放松身心
              </Text>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipEmoji}>👥</Text>
              <Text style={styles.tipTitle}>寻求支持</Text>
              <Text style={styles.tipDescription}>
                与家人朋友分享感受，不要独自承受
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 压力评估模态框 */}
      <Modal
        visible={showAssessmentModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              压力评估 ({currentQuestion + 1}/{PRESSURE_QUESTIONS.length})
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowAssessmentModal(false);
                resetAssessment();
              }}>
              <Text style={styles.modalClose}>取消</Text>
            </TouchableOpacity>
          </View>

          {/* 进度条 */}
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                {width: `${getProgressPercentage()}%`},
              ]}
            />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* 当前问题 */}
            <View style={styles.questionSection}>
              <Text style={styles.questionCategory}>
                {PRESSURE_QUESTIONS[currentQuestion].category}
              </Text>
              <Text style={styles.questionText}>
                {PRESSURE_QUESTIONS[currentQuestion].question}
              </Text>
            </View>

            {/* 答案选项 */}
            <View style={styles.answersSection}>
              {PRESSURE_LEVELS.map(level => (
                <TouchableOpacity
                  key={level.level}
                  style={[
                    styles.answerOption,
                    answers[PRESSURE_QUESTIONS[currentQuestion].id] === level.level && {
                      backgroundColor: level.color + '20',
                      borderColor: level.color,
                    },
                  ]}
                  onPress={() =>
                    handleAnswerSelect(PRESSURE_QUESTIONS[currentQuestion].id, level.level)
                  }>
                  <Text style={styles.answerLabel}>{level.label}</Text>
                  <Text style={styles.answerDescription}>
                    {level.level === 1 && '几乎没有这种感觉'}
                    {level.level === 2 && '每月几次'}
                    {level.level === 3 && '每周几次'}
                    {level.level === 4 && '几乎每天'}
                    {level.level === 5 && '每天多次'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <View style={styles.footerButtons}>
              {currentQuestion > 0 && (
                <MaterialButton
                  title="上一题"
                  onPress={handlePreviousQuestion}
                  variant="outlined"
                  style={styles.navButton}
                />
              )}
              <MaterialButton
                title={
                  currentQuestion === PRESSURE_QUESTIONS.length - 1
                    ? '查看结果'
                    : '下一题'
                }
                onPress={handleNextQuestion}
                variant="contained"
                disabled={!answers[PRESSURE_QUESTIONS[currentQuestion].id]}
                style={styles.navButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* 结果模态框 */}
      <Modal
        visible={showResultModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>评估结果</Text>
            <TouchableOpacity onPress={() => setShowResultModal(false)}>
              <Text style={styles.modalClose}>关闭</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {assessmentResult && (
              <>
                {/* 总体结果 */}
                <View style={styles.resultSection}>
                  <View
                    style={[
                      styles.resultLevel,
                      {backgroundColor: getResultColor(assessmentResult.level)},
                    ]}>
                    <Text style={styles.resultLevelText}>
                      {assessmentResult.level}
                    </Text>
                    <Text style={styles.resultScore}>
                      得分: {assessmentResult.totalScore}
                    </Text>
                  </View>
                  <Text style={styles.resultDescription}>
                    {assessmentResult.description}
                  </Text>
                </View>

                {/* 分类统计 */}
                <View style={styles.categorySection}>
                  <Text style={styles.sectionTitle}>压力来源分析</Text>
                  {Object.entries(getCategoryStats()).map(([category, score]) => (
                    <View key={category} style={styles.categoryItem}>
                      <Text style={styles.categoryName}>{category}</Text>
                      <View style={styles.categoryScoreBar}>
                        <View
                          style={[
                            styles.categoryScoreFill,
                            {
                              width: `${(score / 12) * 100}%`,
                              backgroundColor: getResultColor(assessmentResult.level),
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.categoryScore}>{score}</Text>
                    </View>
                  ))}
                </View>

                {/* 建议 */}
                <View style={styles.suggestionsSection}>
                  <Text style={styles.sectionTitle}>建议与帮助</Text>
                  {assessmentResult.suggestions.map((suggestion, index) => (
                    <View key={index} style={styles.suggestionItem}>
                      <Text style={styles.suggestionBullet}>•</Text>
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <MaterialButton
              title="保存结果"
              onPress={saveAssessmentResult}
              variant="contained"
              style={styles.saveButton}
            />
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
  startCard: {
    backgroundColor: MaterialTheme.colors.surface.container,
    borderRadius: MaterialTheme.borderRadius.lg,
    padding: MaterialTheme.spacing.lg,
    marginBottom: MaterialTheme.spacing.lg,
    ...MaterialTheme.elevation.small,
    alignItems: 'center',
  },
  startTitle: {
    fontSize: MaterialTheme.typography.headline3.fontSize,
    fontWeight: MaterialTheme.typography.headline3.fontWeight,
    color: MaterialTheme.colors.onSurface.high,
    marginBottom: MaterialTheme.spacing.md,
    textAlign: 'center',
  },
  startDescription: {
    fontSize: MaterialTheme.typography.body2.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
    textAlign: 'center',
    marginBottom: MaterialTheme.spacing.xl,
    lineHeight: 20,
  },
  startButton: {
    borderRadius: MaterialTheme.borderRadius.lg,
    minWidth: 140,
  },
  historySection: {
    marginBottom: MaterialTheme.spacing.xl,
  },
  sectionTitle: {
    fontSize: MaterialTheme.typography.headline3.fontSize,
    fontWeight: MaterialTheme.typography.headline3.fontWeight,
    color: MaterialTheme.colors.onSurface.high,
    marginBottom: MaterialTheme.spacing.md,
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
  assessmentCard: {
    backgroundColor: MaterialTheme.colors.surface.container,
    borderRadius: MaterialTheme.borderRadius.lg,
    padding: MaterialTheme.spacing.lg,
    marginBottom: MaterialTheme.spacing.md,
    ...MaterialTheme.elevation.small,
  },
  assessmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: MaterialTheme.spacing.md,
  },
  assessmentInfo: {
    flex: 1,
  },
  assessmentDate: {
    fontSize: MaterialTheme.typography.body2.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
    marginBottom: MaterialTheme.spacing.xs,
  },
  assessmentScore: {
    fontSize: MaterialTheme.typography.body1.fontSize,
    fontWeight: '500',
    color: MaterialTheme.colors.onSurface.high,
  },
  levelBadge: {
    paddingHorizontal: MaterialTheme.spacing.md,
    paddingVertical: MaterialTheme.spacing.xs,
    borderRadius: MaterialTheme.borderRadius.sm,
  },
  levelText: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.onPrimary.default,
    fontWeight: '500',
  },
  assessmentDescription: {
    fontSize: MaterialTheme.typography.body2.fontSize,
    color: MaterialTheme.colors.onSurface.high,
    lineHeight: 20,
  },
  tipsSection: {
    marginBottom: MaterialTheme.spacing.xl,
  },
  tipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tipCard: {
    width: '48%',
    backgroundColor: MaterialTheme.colors.surface.container,
    borderRadius: MaterialTheme.borderRadius.lg,
    padding: MaterialTheme.spacing.md,
    marginBottom: MaterialTheme.spacing.md,
    ...MaterialTheme.elevation.small,
    alignItems: 'center',
  },
  tipEmoji: {
    fontSize: 24,
    marginBottom: MaterialTheme.spacing.sm,
  },
  tipTitle: {
    fontSize: MaterialTheme.typography.body2.fontSize,
    fontWeight: '500',
    color: MaterialTheme.colors.onSurface.high,
    marginBottom: MaterialTheme.spacing.xs,
    textAlign: 'center',
  },
  tipDescription: {
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
  progressContainer: {
    height: 4,
    backgroundColor: MaterialTheme.colors.outline.variant,
  },
  progressBar: {
    height: '100%',
    backgroundColor: MaterialTheme.colors.primary.default,
  },
  modalContent: {
    flex: 1,
    padding: MaterialTheme.spacing.lg,
  },
  questionSection: {
    marginBottom: MaterialTheme.spacing.xl,
  },
  questionCategory: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.primary.default,
    fontWeight: '500',
    marginBottom: MaterialTheme.spacing.sm,
  },
  questionText: {
    fontSize: MaterialTheme.typography.headline3.fontSize,
    fontWeight: MaterialTheme.typography.headline3.fontWeight,
    color: MaterialTheme.colors.onSurface.high,
    lineHeight: 24,
  },
  answersSection: {
    marginBottom: MaterialTheme.spacing.xl,
  },
  answerOption: {
    borderWidth: 2,
    borderColor: MaterialTheme.colors.outline.default,
    borderRadius: MaterialTheme.borderRadius.md,
    padding: MaterialTheme.spacing.lg,
    marginBottom: MaterialTheme.spacing.md,
  },
  answerLabel: {
    fontSize: MaterialTheme.typography.body1.fontSize,
    fontWeight: '500',
    color: MaterialTheme.colors.onSurface.high,
    marginBottom: MaterialTheme.spacing.xs,
  },
  answerDescription: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
  },
  modalFooter: {
    padding: MaterialTheme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: MaterialTheme.colors.outline.variant,
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    flex: 1,
    marginHorizontal: MaterialTheme.spacing.xs,
  },
  // 结果样式
  resultSection: {
    marginBottom: MaterialTheme.spacing.xl,
  },
  resultLevel: {
    borderRadius: MaterialTheme.borderRadius.lg,
    padding: MaterialTheme.spacing.xl,
    alignItems: 'center',
    marginBottom: MaterialTheme.spacing.lg,
  },
  resultLevelText: {
    fontSize: MaterialTheme.typography.headline2.fontSize,
    fontWeight: MaterialTheme.typography.headline2.fontWeight,
    color: MaterialTheme.colors.onPrimary.default,
    marginBottom: MaterialTheme.spacing.sm,
  },
  resultScore: {
    fontSize: MaterialTheme.typography.body1.fontSize,
    color: MaterialTheme.colors.onPrimary.default,
  },
  resultDescription: {
    fontSize: MaterialTheme.typography.body1.fontSize,
    color: MaterialTheme.colors.onSurface.high,
    textAlign: 'center',
    lineHeight: 20,
  },
  categorySection: {
    marginBottom: MaterialTheme.spacing.xl,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: MaterialTheme.spacing.md,
  },
  categoryName: {
    width: 80,
    fontSize: MaterialTheme.typography.body2.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
  },
  categoryScoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: MaterialTheme.colors.outline.variant,
    borderRadius: 4,
    marginHorizontal: MaterialTheme.spacing.md,
    overflow: 'hidden',
  },
  categoryScoreFill: {
    height: '100%',
    borderRadius: 4,
  },
  categoryScore: {
    width: 20,
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
    textAlign: 'right',
  },
  suggestionsSection: {
    marginBottom: MaterialTheme.spacing.xl,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: MaterialTheme.spacing.md,
  },
  suggestionBullet: {
    fontSize: MaterialTheme.typography.body1.fontSize,
    color: MaterialTheme.colors.primary.default,
    marginRight: MaterialTheme.spacing.sm,
    marginTop: 2,
  },
  suggestionText: {
    flex: 1,
    fontSize: MaterialTheme.typography.body2.fontSize,
    color: MaterialTheme.colors.onSurface.high,
    lineHeight: 20,
  },
  saveButton: {
    borderRadius: MaterialTheme.borderRadius.lg,
  },
});

export default PressureAssessmentScreen;