'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode, useMemo, HTMLAttributes } from 'react';

interface StableAnimationProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  stableKey?: string;
  disableAnimation?: boolean;
}

interface StaticDivProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * 稳定的动画组件，防止在频繁更新的场景中动画重复播放
 */
export function StableAnimation({ 
  children, 
  stableKey, 
  disableAnimation = false,
  initial = { opacity: 0, y: 20 },
  animate = { opacity: 1, y: 0 },
  transition = { duration: 0.3 },
  ...props 
}: StableAnimationProps) {
  // 使用稳定的key来防止不必要的重新动画
  const animationKey = useMemo(() => {
    return stableKey || `animation-${Date.now()}`;
  }, [stableKey]);

  if (disableAnimation) {
    // 当禁用动画时，只传递children和className，避免类型冲突
    return <div className={props.className}>{children}</div>;
  }

  return (
    <motion.div
      key={animationKey}
      initial={initial}
      animate={animate}
      transition={transition}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * 专门用于频繁更新元素的动画包装器
 */
export function StableProgressAnimation({ 
  children, 
  progressKey,
  ...props 
}: StableAnimationProps & { progressKey: string | number }) {
  return (
    <StableAnimation
      stableKey={`progress-${progressKey}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </StableAnimation>
  );
}