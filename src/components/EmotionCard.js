import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import MaterialTheme from '../theme/MaterialTheme';

const EmotionCard = ({
  emotion,
  intensity = 3,
  timestamp,
  description,
  onPress,
  style,
}) => {
  const getEmotionColor = (emotionType) => {
    const emotionColors = {
      happy: MaterialTheme.colors.emotion.happy,
      calm: MaterialTheme.colors.emotion.calm,
      sad: MaterialTheme.colors.emotion.sad,
      angry: MaterialTheme.colors.emotion.angry,
      anxious: MaterialTheme.colors.emotion.anxious,
      tired: MaterialTheme.colors.emotion.tired,
    };
    return emotionColors[emotionType] || MaterialTheme.colors.primary[500];
  };

  const getEmotionLabel = (emotionType) => {
    const emotionLabels = {
      happy: '开心',
      calm: '平静',
      sad: '悲伤',
      angry: '愤怒',
      anxious: '焦虑',
      tired: '疲惫',
    };
    return emotionLabels[emotionType] || '未知';
  };

  const renderIntensityDots = (level) => {
    const dots = [];
    for (let i = 1; i <= 5; i++) {
      dots.push(
        <View
          key={i}
          style={[
            styles.intensityDot,
            i <= level
              ? {backgroundColor: getEmotionColor(emotion)}
              : styles.intensityDotInactive,
          ]}
        />,
      );
    }
    return dots;
  };

  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const recordDate = new Date(date);
    
    if (now.toDateString() === recordDate.toDateString()) {
      return recordDate.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return recordDate.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.emotionInfo}>
          <View
            style={[
              styles.emotionIcon,
              {backgroundColor: getEmotionColor(emotion)},
            ]}
          />
          <Text style={styles.emotionLabel}>{getEmotionLabel(emotion)}</Text>
        </View>
        <Text style={styles.timestamp}>{formatTime(timestamp)}</Text>
      </View>

      <View style={styles.intensityContainer}>
        <Text style={styles.intensityLabel}>强度</Text>
        <View style={styles.intensityDots}>
          {renderIntensityDots(intensity)}
        </View>
      </View>

      {description && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText} numberOfLines={2}>
            {description}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: MaterialTheme.colors.surface.default,
    borderRadius: MaterialTheme.borderRadius.lg,
    padding: MaterialTheme.spacing.md,
    ...MaterialTheme.elevation[1],
    marginVertical: MaterialTheme.spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: MaterialTheme.spacing.sm,
  },
  emotionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emotionIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: MaterialTheme.spacing.sm,
  },
  emotionLabel: {
    ...MaterialTheme.typography.body2,
    fontWeight: '600',
    color: MaterialTheme.colors.text.primary,
  },
  timestamp: {
    ...MaterialTheme.typography.caption,
    color: MaterialTheme.colors.text.secondary,
  },
  intensityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: MaterialTheme.spacing.sm,
  },
  intensityLabel: {
    ...MaterialTheme.typography.caption,
    color: MaterialTheme.colors.text.secondary,
    marginRight: MaterialTheme.spacing.sm,
    minWidth: 32,
  },
  intensityDots: {
    flexDirection: 'row',
    flex: 1,
  },
  intensityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: MaterialTheme.spacing.xs,
  },
  intensityDotInactive: {
    backgroundColor: MaterialTheme.colors.surface.disabled,
  },
  descriptionContainer: {
    backgroundColor: MaterialTheme.colors.surface.variant,
    borderRadius: MaterialTheme.borderRadius.md,
    padding: MaterialTheme.spacing.sm,
  },
  descriptionText: {
    ...MaterialTheme.typography.body2,
    color: MaterialTheme.colors.text.secondary,
  },
});

export default EmotionCard;