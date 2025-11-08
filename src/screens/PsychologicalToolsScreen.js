import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import MaterialButton from '../components/MaterialButton';
import MaterialTheme from '../theme/MaterialTheme';
import StorageService from '../services/StorageService';
import AuthService from '../services/AuthService';

// 心理调适工具定义
const PSYCHOLOGICAL_TOOLS = [
  {
    id: 'breathing',
    name: '深呼吸练习',
    description: '通过规律的深呼吸来放松身心，缓解焦虑',
    emoji: '🌬️',
    color: MaterialTheme.colors.primary.default,
    duration: 5, // 分钟
    difficulty: '简单',
    category: '放松技巧',
  },
  {
    id: 'mindfulness',
    name: '正念冥想',
    description: '关注当下，培养觉知，减少杂念',
    emoji: '🧘',
    color: MaterialTheme.colors.secondary.default,
    duration: 10,
    difficulty: '中等',
    category: '冥想练习',
  },
  {
    id: 'progressive_relaxation',
    name: '渐进式放松',
    description: '逐步放松身体各部位，释放紧张',
    emoji: '💆',
    color: MaterialTheme.colors.tertiary.default,
    duration: 8,
    difficulty: '简单',
    category: '放松技巧',
  },
  {
    id: 'positive_thinking',
    name: '积极思考',
    description: '转变消极思维，培养积极心态',
    emoji: '🌈',
    color: MaterialTheme.colors.success.default,
    duration: 7,
    difficulty: '中等',
    category: '认知调整',
  },
  {
    id: 'gratitude_journal',
    name: '感恩日记',
    description: '记录生活中的美好，培养感恩心态',
    emoji: '📝',
    color: MaterialTheme.colors.info.default,
    duration: 5,
    difficulty: '简单',
    category: '情绪管理',
  },
  {
    id: 'visualization',
    name: '积极想象',
    description: '想象美好场景，提升积极情绪',
    emoji: '🌅',
    color: MaterialTheme.colors.warning.default,
    duration: 6,
    difficulty: '中等',
    category: '情绪管理',
  },
];

// 工具使用记录
const PsychologicalToolsScreen = () => {
  const [selectedTool, setSelectedTool] = useState(null);
  const [showToolModal, setShowToolModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [toolUsage, setToolUsage] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [breathingProgress, setBreathingProgress] = useState(0);
  const [breathingPhase, setBreathingPhase] = useState('inhale'); // inhale, hold, exhale
  const [breathingTimer, setBreathingTimer] = useState(null);
  const [exerciseTime, setExerciseTime] = useState(0);
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  const [breathAnimation] = useState(new Animated.Value(1));

  useEffect(() => {
    loadData();
    return () => {
      if (breathingTimer) {
        clearInterval(breathingTimer);
      }
    };
  }, []);

  const loadData = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
      
      const usage = await StorageService.getPsychologicalSessions();
      setToolUsage(usage);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToolSelect = (tool) => {
    setSelectedTool(tool);
    setShowToolModal(true);
  };

  const startBreathingExercise = () => {
    setShowToolModal(false);
    setShowExerciseModal(true);
    setIsExerciseActive(true);
    setExerciseTime(0);
    setBreathingPhase('inhale');
    setBreathingProgress(0);
    
    startBreathingAnimation();
    
    // 计时器
    const timer = setInterval(() => {
      setExerciseTime(prev => prev + 1);
    }, 1000);
    
    setBreathingTimer(timer);
  };

  const startBreathingAnimation = () => {
    const breathingCycle = () => {
      // 吸气阶段 (4秒)
      Animated.timing(breathAnimation, {
        toValue: 1.5,
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start(() => {
        setBreathingPhase('hold');
        // 屏息阶段 (2秒)
        setTimeout(() => {
          setBreathingPhase('exhale');
          // 呼气阶段 (6秒)
          Animated.timing(breathAnimation, {
            toValue: 1,
            duration: 6000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }).start(() => {
            setBreathingPhase('rest');
            // 休息阶段 (2秒)
            setTimeout(() => {
              setBreathingPhase('inhale');
              if (isExerciseActive) {
                breathingCycle();
              }
            }, 2000);
          });
        }, 2000);
      });
    };
    
    breathingCycle();
  };

  const stopExercise = async () => {
    setIsExerciseActive(false);
    if (breathingTimer) {
      clearInterval(breathingTimer);
      setBreathingTimer(null);
    }
    breathAnimation.stopAnimation();
    
    // 保存使用记录
    if (selectedTool && exerciseTime > 0) {
      try {
        const session = {
          toolId: selectedTool.id,
          toolName: selectedTool.name,
          duration: exerciseTime,
          timestamp: new Date().toISOString(),
          userId: currentUser?.id,
        };
        
        const savedSession = await StorageService.savePsychologicalSession(session);
        if (savedSession) {
          setToolUsage(prev => [savedSession, ...prev]);
        }
      } catch (error) {
        console.error('保存使用记录失败:', error);
      }
    }
    
    setShowExerciseModal(false);
  };

  const getToolUsageStats = () => {
    const toolStats = {};
    
    toolUsage.forEach(session => {
      if (!toolStats[session.toolId]) {
        toolStats[session.toolId] = {
          count: 0,
          totalDuration: 0,
          lastUsed: session.timestamp,
        };
      }
      toolStats[session.toolId].count += 1;
      toolStats[session.toolId].totalDuration += session.duration;
      if (new Date(session.timestamp) > new Date(toolStats[session.toolId].lastUsed)) {
        toolStats[session.toolId].lastUsed = session.timestamp;
      }
    });
    
    return toolStats;
  };

  const getBreathingInstructions = () => {
    switch (breathingPhase) {
      case 'inhale':
        return {
          text: '缓慢吸气...',
          subtext: '用鼻子深吸气，感受腹部鼓起',
          color: MaterialTheme.colors.success.default,
        };
      case 'hold':
        return {
          text: '屏住呼吸...',
          subtext: '保持呼吸，感受身体的平静',
          color: MaterialTheme.colors.info.default,
        };
      case 'exhale':
        return {
          text: '缓慢呼气...',
          subtext: '用嘴巴慢慢呼气，释放紧张',
          color: MaterialTheme.colors.primary.default,
        };
      case 'rest':
        return {
          text: '自然呼吸...',
          subtext: '放松身体，准备下一次呼吸',
          color: MaterialTheme.colors.secondary.default,
        };
      default:
        return {
          text: '开始深呼吸...',
          subtext: '按照提示进行呼吸练习',
          color: MaterialTheme.colors.primary.default,
        };
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  const toolStats = getToolUsageStats();
  const breathingInstructions = getBreathingInstructions();

  return (
    <View style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>心理调适工具</Text>
        <Text style={styles.headerSubtitle}>
          选择适合的工具来缓解压力，调节情绪
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* 工具统计概览 */}
        {toolUsage.length > 0 && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>使用统计</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{toolUsage.length}</Text>
                <Text style={styles.statLabel}>总使用次数</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {Math.round(toolUsage.reduce((sum, session) => sum + session.duration, 0) / 60)}
                </Text>
                <Text style={styles.statLabel}>总时长(分钟)</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {Object.keys(toolStats).length}
                </Text>
                <Text style={styles.statLabel}>使用工具数</Text>
              </View>
            </View>
          </View>
        )}

        {/* 工具网格 */}
        <View style={styles.toolsSection}>
          <Text style={styles.sectionTitle}>调适工具</Text>
          <View style={styles.toolsGrid}>
            {PSYCHOLOGICAL_TOOLS.map(tool => (
              <TouchableOpacity
                key={tool.id}
                style={[styles.toolCard, {borderLeftColor: tool.color}]}
                onPress={() => handleToolSelect(tool)}>
                <View style={styles.toolHeader}>
                  <Text style={styles.toolEmoji}>{tool.emoji}</Text>
                  <View style={styles.toolBadges}>
                    <View style={styles.difficultyBadge}>
                      <Text style={styles.difficultyText}>{tool.difficulty}</Text>
                    </View>
                    <View style={styles.durationBadge}>
                      <Text style={styles.durationText}>{tool.duration}分钟</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.toolName}>{tool.name}</Text>
                <Text style={styles.toolDescription}>{tool.description}</Text>
                <Text style={styles.toolCategory}>{tool.category}</Text>
                
                {/* 使用统计 */}
                {toolStats[tool.id] && (
                  <View style={styles.usageInfo}>
                    <Text style={styles.usageText}>
                      使用 {toolStats[tool.id].count} 次
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 使用记录 */}
        {toolUsage.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>最近使用</Text>
            {toolUsage.slice(0, 5).map((session, index) => (
              <View key={session.id || index} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionTool}>{session.toolName}</Text>
                  <Text style={styles.sessionDuration}>
                    {formatDuration(session.duration)}
                  </Text>
                </View>
                <Text style={styles.sessionTime}>
                  {formatDate(session.timestamp)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 工具详情模态框 */}
      <Modal
        visible={showToolModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedTool?.name}</Text>
            <TouchableOpacity onPress={() => setShowToolModal(false)}>
              <Text style={styles.modalClose}>关闭</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedTool && (
              <>
                <View style={styles.toolDetailHeader}>
                  <Text style={styles.toolDetailEmoji}>{selectedTool.emoji}</Text>
                  <View style={styles.toolDetailInfo}>
                    <Text style={styles.toolDetailName}>{selectedTool.name}</Text>
                    <Text style={styles.toolDetailCategory}>
                      {selectedTool.category}
                    </Text>
                  </View>
                </View>

                <View style={styles.toolDetailSection}>
                  <Text style={styles.toolDetailDescription}>
                    {selectedTool.description}
                  </Text>
                </View>

                <View style={styles.toolDetailSection}>
                  <Text style={styles.sectionTitle}>工具信息</Text>
                  <View style={styles.toolMetaGrid}>
                    <View style={styles.toolMetaItem}>
                      <Text style={styles.toolMetaLabel}>难度</Text>
                      <Text style={styles.toolMetaValue}>{selectedTool.difficulty}</Text>
                    </View>
                    <View style={styles.toolMetaItem}>
                      <Text style={styles.toolMetaLabel}>时长</Text>
                      <Text style={styles.toolMetaValue}>{selectedTool.duration}分钟</Text>
                    </View>
                    <View style={styles.toolMetaItem}>
                      <Text style={styles.toolMetaLabel}>使用次数</Text>
                      <Text style={styles.toolMetaValue}>
                        {toolStats[selectedTool.id]?.count || 0}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 工具特定说明 */}
                {selectedTool.id === 'breathing' && (
                  <View style={styles.toolDetailSection}>
                    <Text style={styles.sectionTitle}>练习说明</Text>
                    <View style={styles.instructionsList}>
                      <Text style={styles.instructionItem}>• 找一个安静舒适的地方</Text>
                      <Text style={styles.instructionItem}>• 坐直或躺下，放松身体</Text>
                      <Text style={styles.instructionItem}>• 按照提示进行深呼吸</Text>
                      <Text style={styles.instructionItem}>• 吸气4秒，屏息2秒，呼气6秒</Text>
                      <Text style={styles.instructionItem}>• 重复练习5-10分钟</Text>
                    </View>
                  </View>
                )}

                {selectedTool.id === 'mindfulness' && (
                  <View style={styles.toolDetailSection}>
                    <Text style={styles.sectionTitle}>练习说明</Text>
                    <View style={styles.instructionsList}>
                      <Text style={styles.instructionItem}>• 关闭干扰，专注当下</Text>
                      <Text style={styles.instructionItem}>• 观察呼吸，不加评判</Text>
                      <Text style={styles.instructionItem}>• 当思绪飘走，温柔带回</Text>
                      <Text style={styles.instructionItem}>• 感受身体感觉和情绪</Text>
                      <Text style={styles.instructionItem}>• 每天练习10-20分钟</Text>
                    </View>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <MaterialButton
              title="开始练习"
              onPress={selectedTool?.id === 'breathing' ? startBreathingExercise : () => {
                Alert.alert('提示', '该功能正在开发中');
              }}
              variant="contained"
              style={styles.startButton}
            />
          </View>
        </View>
      </Modal>

      {/* 深呼吸练习模态框 */}
      <Modal
        visible={showExerciseModal}
        animationType="fade"
        presentationStyle="fullScreen"
        statusBarTranslucent>
        <View style={[styles.exerciseContainer, {backgroundColor: breathingInstructions.color}]}>
          {/* 呼吸动画 */}
          <View style={styles.breathingAnimation}>
            <Animated.View
              style={[
                styles.breathingCircle,
                {
                  transform: [{scale: breathAnimation}],
                  backgroundColor: MaterialTheme.colors.surface.container,
                },
              ]}>
              <Text style={styles.breathingText}>{breathingInstructions.text}</Text>
              <Text style={styles.breathingSubtext}>{breathingInstructions.subtext}</Text>
            </Animated.View>
          </View>

          {/* 练习信息 */}
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseTime}>{formatDuration(exerciseTime)}</Text>
            <Text style={styles.exerciseTool}>{selectedTool?.name}</Text>
          </View>

          {/* 控制按钮 */}
          <View style={styles.exerciseControls}>
            <MaterialButton
              title="结束练习"
              onPress={stopExercise}
              variant="outlined"
              textStyle={{color: MaterialTheme.colors.onPrimary.default}}
              style={[styles.stopButton, {borderColor: MaterialTheme.colors.onPrimary.default}]}
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
  statsSection: {
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: MaterialTheme.typography.headline2.fontSize,
    fontWeight: 'bold',
    color: MaterialTheme.colors.primary.default,
    marginBottom: MaterialTheme.spacing.xs,
  },
  statLabel: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
    textAlign: 'center',
  },
  toolsSection: {
    marginBottom: MaterialTheme.spacing.xl,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  toolCard: {
    width: '48%',
    backgroundColor: MaterialTheme.colors.surface.container,
    borderRadius: MaterialTheme.borderRadius.lg,
    padding: MaterialTheme.spacing.md,
    marginBottom: MaterialTheme.spacing.md,
    ...MaterialTheme.elevation.small,
    borderLeftWidth: 4,
  },
  toolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: MaterialTheme.spacing.sm,
  },
  toolEmoji: {
    fontSize: 24,
  },
  toolBadges: {
    alignItems: 'flex-end',
  },
  difficultyBadge: {
    backgroundColor: MaterialTheme.colors.surface.variant,
    paddingHorizontal: MaterialTheme.spacing.xs,
    paddingVertical: 2,
    borderRadius: MaterialTheme.borderRadius.xs,
    marginBottom: MaterialTheme.spacing.xs,
  },
  difficultyText: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
  },
  durationBadge: {
    backgroundColor: MaterialTheme.colors.primary.container,
    paddingHorizontal: MaterialTheme.spacing.xs,
    paddingVertical: 2,
    borderRadius: MaterialTheme.borderRadius.xs,
  },
  durationText: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.primary.default,
    fontWeight: '500',
  },
  toolName: {
    fontSize: MaterialTheme.typography.body1.fontSize,
    fontWeight: '500',
    color: MaterialTheme.colors.onSurface.high,
    marginBottom: MaterialTheme.spacing.xs,
  },
  toolDescription: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
    marginBottom: MaterialTheme.spacing.xs,
    lineHeight: 14,
  },
  toolCategory: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.onSurface.low,
    marginBottom: MaterialTheme.spacing.xs,
  },
  usageInfo: {
    marginTop: MaterialTheme.spacing.xs,
  },
  usageText: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.primary.default,
    fontWeight: '500',
  },
  historySection: {
    marginBottom: MaterialTheme.spacing.xl,
  },
  sessionCard: {
    backgroundColor: MaterialTheme.colors.surface.container,
    borderRadius: MaterialTheme.borderRadius.lg,
    padding: MaterialTheme.spacing.md,
    marginBottom: MaterialTheme.spacing.md,
    ...MaterialTheme.elevation.small,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: MaterialTheme.spacing.xs,
  },
  sessionTool: {
    fontSize: MaterialTheme.typography.body1.fontSize,
    fontWeight: '500',
    color: MaterialTheme.colors.onSurface.high,
  },
  sessionDuration: {
    fontSize: MaterialTheme.typography.body2.fontSize,
    color: MaterialTheme.colors.primary.default,
    fontWeight: '500',
  },
  sessionTime: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
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
  toolDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: MaterialTheme.spacing.xl,
  },
  toolDetailEmoji: {
    fontSize: 48,
    marginRight: MaterialTheme.spacing.lg,
  },
  toolDetailInfo: {
    flex: 1,
  },
  toolDetailName: {
    fontSize: MaterialTheme.typography.headline2.fontSize,
    fontWeight: MaterialTheme.typography.headline2.fontWeight,
    color: MaterialTheme.colors.onSurface.high,
    marginBottom: MaterialTheme.spacing.xs,
  },
  toolDetailCategory: {
    fontSize: MaterialTheme.typography.body2.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
  },
  toolDetailSection: {
    marginBottom: MaterialTheme.spacing.xl,
  },
  toolDetailDescription: {
    fontSize: MaterialTheme.typography.body1.fontSize,
    color: MaterialTheme.colors.onSurface.high,
    lineHeight: 22,
  },
  toolMetaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toolMetaItem: {
    alignItems: 'center',
    flex: 1,
  },
  toolMetaLabel: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
    marginBottom: MaterialTheme.spacing.xs,
  },
  toolMetaValue: {
    fontSize: MaterialTheme.typography.body1.fontSize,
    fontWeight: '500',
    color: MaterialTheme.colors.onSurface.high,
  },
  instructionsList: {
    marginLeft: MaterialTheme.spacing.md,
  },
  instructionItem: {
    fontSize: MaterialTheme.typography.body2.fontSize,
    color: MaterialTheme.colors.onSurface.high,
    marginBottom: MaterialTheme.spacing.sm,
    lineHeight: 18,
  },
  modalFooter: {
    padding: MaterialTheme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: MaterialTheme.colors.outline.variant,
  },
  startButton: {
    borderRadius: MaterialTheme.borderRadius.lg,
  },
  // 练习界面样式
  exerciseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingAnimation: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    ...MaterialTheme.elevation.medium,
  },
  breathingText: {
    fontSize: MaterialTheme.typography.headline2.fontSize,
    fontWeight: MaterialTheme.typography.headline2.fontWeight,
    color: MaterialTheme.colors.onSurface.high,
    textAlign: 'center',
    marginBottom: MaterialTheme.spacing.sm,
  },
  breathingSubtext: {
    fontSize: MaterialTheme.typography.body2.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
    textAlign: 'center',
  },
  exerciseInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseTime: {
    fontSize: MaterialTheme.typography.headline1.fontSize,
    fontWeight: MaterialTheme.typography.headline1.fontWeight,
    color: MaterialTheme.colors.onPrimary.default,
    marginBottom: MaterialTheme.spacing.sm,
  },
  exerciseTool: {
    fontSize: MaterialTheme.typography.headline3.fontSize,
    color: MaterialTheme.colors.onPrimary.default,
  },
  exerciseControls: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButton: {
    borderRadius: MaterialTheme.borderRadius.lg,
    minWidth: 140,
  },
});

export default PsychologicalToolsScreen;