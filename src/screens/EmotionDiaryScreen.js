import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import MaterialButton from '../components/MaterialButton';
import MaterialTheme from '../theme/MaterialTheme';
import StorageService from '../services/StorageService';
import AuthService from '../services/AuthService';

// 情绪类型定义
const EMOTION_TYPES = [
  {id: 'happy', name: '开心', color: MaterialTheme.colors.success.default, emoji: '😊'},
  {id: 'sad', name: '伤心', color: MaterialTheme.colors.tertiary.default, emoji: '😢'},
  {id: 'angry', name: '生气', color: MaterialTheme.colors.error.default, emoji: '😠'},
  {id: 'anxious', name: '焦虑', color: MaterialTheme.colors.warning.default, emoji: '😰'},
  {id: 'calm', name: '平静', color: MaterialTheme.colors.info.default, emoji: '😌'},
  {id: 'excited', name: '兴奋', color: MaterialTheme.colors.secondary.default, emoji: '🎉'},
  {id: 'tired', name: '疲惫', color: MaterialTheme.colors.neutral.default, emoji: '😴'},
  {id: 'confused', name: '困惑', color: MaterialTheme.colors.primary.default, emoji: '😕'},
];

// 情绪强度等级
const INTENSITY_LEVELS = [
  {level: 1, label: '轻微', color: MaterialTheme.colors.success.light},
  {level: 2, label: '中等', color: MaterialTheme.colors.warning.light},
  {level: 3, label: '强烈', color: MaterialTheme.colors.error.light},
  {level: 4, label: '非常强烈', color: MaterialTheme.colors.error.default},
];

const EmotionDiaryScreen = () => {
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [selectedIntensity, setSelectedIntensity] = useState(2);
  const [description, setDescription] = useState('');
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [emotionRecords, setEmotionRecords] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
      
      const records = await StorageService.getEmotionRecords();
      setEmotionRecords(records);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmotionSelect = (emotion) => {
    setSelectedEmotion(emotion);
  };

  const handleIntensitySelect = (level) => {
    setSelectedIntensity(level);
  };

  const handleSaveRecord = async () => {
    if (!selectedEmotion) {
      Alert.alert('提示', '请选择一种情绪');
      return;
    }

    if (!description.trim()) {
      Alert.alert('提示', '请描述一下你的感受');
      return;
    }

    try {
      const record = {
        emotionType: selectedEmotion.id,
        emotionName: selectedEmotion.name,
        intensity: selectedIntensity,
        description: description.trim(),
        timestamp: new Date().toISOString(),
        userId: currentUser?.id,
      };

      const savedRecord = await StorageService.saveEmotionRecord(record);
      
      if (savedRecord) {
        setEmotionRecords(prev => [savedRecord, ...prev]);
        setShowRecordModal(false);
        resetForm();
        Alert.alert('成功', '情绪记录已保存');
      }
    } catch (error) {
      console.error('保存情绪记录失败:', error);
      Alert.alert('错误', '保存失败，请重试');
    }
  };

  const resetForm = () => {
    setSelectedEmotion(null);
    setSelectedIntensity(2);
    setDescription('');
  };

  const getRecentEmotionStats = () => {
    const last7Days = emotionRecords.filter(record => {
      const recordDate = new Date(record.timestamp);
      const today = new Date();
      const diffTime = Math.abs(today - recordDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    });

    const emotionCounts = {};
    last7Days.forEach(record => {
      emotionCounts[record.emotionType] = (emotionCounts[record.emotionType] || 0) + 1;
    });

    return {
      totalRecords: last7Days.length,
      mostFrequent: Object.keys(emotionCounts).reduce((a, b) => 
        emotionCounts[a] > emotionCounts[b] ? a : b, ''),
      emotionCounts,
    };
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays <= 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  const getEmotionColor = (emotionType) => {
    const emotion = EMOTION_TYPES.find(e => e.id === emotionType);
    return emotion ? emotion.color : MaterialTheme.colors.onSurface.medium;
  };

  const getEmotionEmoji = (emotionType) => {
    const emotion = EMOTION_TYPES.find(e => e.id === emotionType);
    return emotion ? emotion.emoji : '❓';
  };

  const stats = getRecentEmotionStats();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 头部统计信息 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>情绪日记</Text>
        <Text style={styles.headerSubtitle}>
          最近7天记录了 {stats.totalRecords} 次情绪
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* 快速记录按钮 */}
        <View style={styles.quickRecordSection}>
          <MaterialButton
            title="记录当前情绪"
            onPress={() => setShowRecordModal(true)}
            variant="contained"
            icon="add"
            style={styles.recordButton}
          />
        </View>

        {/* 情绪统计概览 */}
        {stats.totalRecords > 0 && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>情绪概览</Text>
            <View style={styles.statsGrid}>
              {Object.entries(stats.emotionCounts).map(([emotionType, count]) => {
                const emotion = EMOTION_TYPES.find(e => e.id === emotionType);
                return (
                  <View key={emotionType} style={styles.statItem}>
                    <Text style={styles.statEmoji}>{emotion?.emoji}</Text>
                    <Text style={styles.statCount}>{count}</Text>
                    <Text style={styles.statLabel}>{emotion?.name}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* 历史记录 */}
        <View style={styles.recordsSection}>
          <Text style={styles.sectionTitle}>历史记录</Text>
          {emotionRecords.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>还没有情绪记录</Text>
              <Text style={styles.emptySubtext}>
                点击上方按钮记录你的第一份情绪日记
              </Text>
            </View>
          ) : (
            emotionRecords.map((record, index) => (
              <View key={record.id || index} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <View style={styles.emotionInfo}>
                    <Text style={[styles.emotionEmoji, {fontSize: 20}]}>
                      {getEmotionEmoji(record.emotionType)}
                    </Text>
                    <View>
                      <Text style={styles.emotionName}>{record.emotionName}</Text>
                      <Text style={styles.recordTime}>
                        {formatDate(record.timestamp)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.intensityBadge}>
                    <Text style={styles.intensityText}>
                      强度: {record.intensity}
                    </Text>
                  </View>
                </View>
                <Text style={styles.recordDescription}>{record.description}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* 记录情绪模态框 */}
      <Modal
        visible={showRecordModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>记录情绪</Text>
            <TouchableOpacity
              onPress={() => {
                setShowRecordModal(false);
                resetForm();
              }}>
              <Text style={styles.modalClose}>取消</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* 选择情绪类型 */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>选择情绪</Text>
              <View style={styles.emotionGrid}>
                {EMOTION_TYPES.map(emotion => (
                  <TouchableOpacity
                    key={emotion.id}
                    style={[
                      styles.emotionOption,
                      selectedEmotion?.id === emotion.id && {
                        backgroundColor: emotion.color + '20',
                        borderColor: emotion.color,
                      },
                    ]}
                    onPress={() => handleEmotionSelect(emotion)}>
                    <Text style={[styles.emotionEmoji, {fontSize: 24}]}>
                      {emotion.emoji}
                    </Text>
                    <Text style={styles.emotionLabel}>{emotion.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 选择情绪强度 */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>情绪强度</Text>
              <View style={styles.intensityGrid}>
                {INTENSITY_LEVELS.map(level => (
                  <TouchableOpacity
                    key={level.level}
                    style={[
                      styles.intensityOption,
                      {backgroundColor: level.color},
                      selectedIntensity === level.level && styles.intensitySelected,
                    ]}
                    onPress={() => handleIntensitySelect(level.level)}>
                    <Text style={styles.intensityLabel}>{level.label}</Text>
                    <Text style={styles.intensityLevel}>{level.level}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 情绪描述 */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>描述感受</Text>
              <TextInput
                style={styles.descriptionInput}
                placeholder="描述一下你现在的感受和原因..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <MaterialButton
              title="保存记录"
              onPress={handleSaveRecord}
              variant="contained"
              disabled={!selectedEmotion || !description.trim()}
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
  quickRecordSection: {
    marginBottom: MaterialTheme.spacing.xl,
  },
  recordButton: {
    borderRadius: MaterialTheme.borderRadius.lg,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: MaterialTheme.spacing.md,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: MaterialTheme.spacing.xs,
  },
  statCount: {
    fontSize: MaterialTheme.typography.headline4.fontSize,
    fontWeight: 'bold',
    color: MaterialTheme.colors.onSurface.high,
    marginBottom: MaterialTheme.spacing.xs,
  },
  statLabel: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
    textAlign: 'center',
  },
  recordsSection: {
    marginBottom: MaterialTheme.spacing.xl,
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
  recordCard: {
    backgroundColor: MaterialTheme.colors.surface.container,
    borderRadius: MaterialTheme.borderRadius.lg,
    padding: MaterialTheme.spacing.lg,
    marginBottom: MaterialTheme.spacing.md,
    ...MaterialTheme.elevation.small,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: MaterialTheme.spacing.md,
  },
  emotionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emotionEmoji: {
    marginRight: MaterialTheme.spacing.md,
  },
  emotionName: {
    fontSize: MaterialTheme.typography.body1.fontSize,
    fontWeight: '500',
    color: MaterialTheme.colors.onSurface.high,
    marginBottom: MaterialTheme.spacing.xs,
  },
  recordTime: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
  },
  intensityBadge: {
    backgroundColor: MaterialTheme.colors.surface.variant,
    paddingHorizontal: MaterialTheme.spacing.sm,
    paddingVertical: MaterialTheme.spacing.xs,
    borderRadius: MaterialTheme.borderRadius.sm,
  },
  intensityText: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
    fontWeight: '500',
  },
  recordDescription: {
    fontSize: MaterialTheme.typography.body2.fontSize,
    color: MaterialTheme.colors.onSurface.high,
    lineHeight: 20,
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
  modalSection: {
    marginBottom: MaterialTheme.spacing.xl,
  },
  modalSectionTitle: {
    fontSize: MaterialTheme.typography.headline3.fontSize,
    fontWeight: MaterialTheme.typography.headline3.fontWeight,
    color: MaterialTheme.colors.onSurface.high,
    marginBottom: MaterialTheme.spacing.md,
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emotionOption: {
    width: '23%',
    alignItems: 'center',
    padding: MaterialTheme.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: MaterialTheme.borderRadius.md,
    marginBottom: MaterialTheme.spacing.md,
  },
  emotionLabel: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
    marginTop: MaterialTheme.spacing.xs,
    textAlign: 'center',
  },
  intensityGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  intensityOption: {
    flex: 1,
    alignItems: 'center',
    padding: MaterialTheme.spacing.md,
    marginHorizontal: MaterialTheme.spacing.xs,
    borderRadius: MaterialTheme.borderRadius.md,
    opacity: 0.7,
  },
  intensitySelected: {
    opacity: 1,
    transform: [{scale: 1.05}],
    ...MaterialTheme.elevation.small,
  },
  intensityLabel: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.onSurface.high,
    fontWeight: '500',
    marginBottom: MaterialTheme.spacing.xs,
  },
  intensityLevel: {
    fontSize: MaterialTheme.typography.headline4.fontSize,
    fontWeight: 'bold',
    color: MaterialTheme.colors.onSurface.high,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: MaterialTheme.colors.outline.default,
    borderRadius: MaterialTheme.borderRadius.md,
    padding: MaterialTheme.spacing.md,
    fontSize: MaterialTheme.typography.body1.fontSize,
    color: MaterialTheme.colors.onSurface.high,
    backgroundColor: MaterialTheme.colors.surface.default,
    minHeight: 100,
  },
  modalFooter: {
    padding: MaterialTheme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: MaterialTheme.colors.outline.variant,
  },
  saveButton: {
    borderRadius: MaterialTheme.borderRadius.lg,
  },
});

export default EmotionDiaryScreen;