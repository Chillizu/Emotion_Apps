import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import MaterialTheme from '../theme/MaterialTheme';

const MaterialButton = ({
  title,
  onPress,
  variant = 'contained',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  color = 'primary',
  style,
  textStyle,
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];
    
    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }

    if (variant === 'contained') {
      baseStyle.push(styles.contained);
      baseStyle.push({backgroundColor: MaterialTheme.colors[color][500]});
    } else if (variant === 'outlined') {
      baseStyle.push(styles.outlined);
      baseStyle.push({borderColor: MaterialTheme.colors[color][500]});
    } else if (variant === 'text') {
      baseStyle.push(styles.text);
    }

    if (disabled) {
      baseStyle.push(styles.disabled);
    }

    if (style) {
      baseStyle.push(style);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`text_${size}`]];
    
    if (variant === 'contained') {
      baseStyle.push(styles.textOnPrimary);
    } else if (variant === 'outlined' || variant === 'text') {
      baseStyle.push({color: MaterialTheme.colors[color][500]});
    }

    if (disabled) {
      baseStyle.push(styles.textDisabled);
    }

    if (textStyle) {
      baseStyle.push(textStyle);
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'contained'
              ? MaterialTheme.colors.text.onPrimary
              : MaterialTheme.colors[color][500]
          }
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: MaterialTheme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  small: {
    paddingHorizontal: MaterialTheme.spacing.md,
    paddingVertical: MaterialTheme.spacing.xs,
    minHeight: 32,
  },
  medium: {
    paddingHorizontal: MaterialTheme.spacing.lg,
    paddingVertical: MaterialTheme.spacing.sm,
    minHeight: 40,
  },
  large: {
    paddingHorizontal: MaterialTheme.spacing.xl,
    paddingVertical: MaterialTheme.spacing.md,
    minHeight: 48,
  },
  fullWidth: {
    width: '100%',
  },
  contained: {
    ...MaterialTheme.elevation[2],
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  text: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.38,
  },
  text: {
    ...MaterialTheme.typography.button,
  },
  text_small: {
    fontSize: 12,
  },
  text_medium: {
    fontSize: 14,
  },
  text_large: {
    fontSize: 16,
  },
  textOnPrimary: {
    color: MaterialTheme.colors.text.onPrimary,
  },
  textDisabled: {
    color: MaterialTheme.colors.text.disabled,
  },
});

export default MaterialButton;