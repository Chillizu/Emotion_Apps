/**
 * 动画配置
 * 由于动画重复播放问题，暂时禁用所有动画
 */
export const animationConfig = {
  // 是否启用动画
  enabled: false,
  
  // 页面切换动画
  pageTransition: {
    duration: 0,
    ease: 'linear'
  },
  
  // 卡片动画
  cardAnimation: {
    initial: { opacity: 1, y: 0 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0 }
  },
  
  // 列表项动画
  listItemAnimation: {
    initial: { opacity: 1, y: 0 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 1, y: 0 },
    transition: { duration: 0 }
  },
  
  // 按钮动画
  buttonAnimation: {
    whileHover: { scale: 1 },
    whileTap: { scale: 1 },
    transition: { duration: 0 }
  }
};

/**
 * 禁用动画的Motion组件包装器
 */
export function NoAnimation({ children, ...props }: any) {
  return <div {...props}>{children}</div>;
}