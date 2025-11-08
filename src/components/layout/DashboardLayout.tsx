'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Mood as MoodIcon,
  Analytics as AnalyticsIcon,
  Psychology as PsychologyIcon,
  FamilyRestroom as FamilyIcon,
  Insights as InsightsIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Group as GroupIcon,
  SmartToy as AIIcon,
} from '@mui/icons-material';
import { useAuthStore, authUtils } from '@/lib/store/auth-store';
import { UserRole } from '@/types';
import MusicPlayer from '@/components/music/MusicPlayer';

// 导航项定义
const navigationItems = [
  {
    id: 'dashboard',
    label: '首页',
    path: '/dashboard',
    icon: <HomeIcon />,
    role: [UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER],
  },
  {
    id: 'emotion-diary',
    label: '情绪日记',
    path: '/dashboard/emotion-diary',
    icon: <MoodIcon />,
    role: [UserRole.STUDENT, UserRole.TEACHER],
  },
  {
    id: 'pressure-assessment',
    label: '压力评估',
    path: '/dashboard/pressure-assessment',
    icon: <AnalyticsIcon />,
    role: [UserRole.STUDENT, UserRole.TEACHER],
  },
  {
    id: 'psychological-tools',
    label: '心理调适',
    path: '/dashboard/psychological-tools',
    icon: <PsychologyIcon />,
    role: [UserRole.STUDENT, UserRole.TEACHER],
  },
  {
    id: 'parent-dashboard',
    label: '家长监控',
    path: '/dashboard/parent-dashboard',
    icon: <FamilyIcon />,
    role: [UserRole.PARENT],
  },
  {
    id: 'reports',
    label: '数据分析',
    path: '/dashboard/reports',
    icon: <InsightsIcon />,
    role: [UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER],
  },
  {
    id: 'community',
    label: '心情社区',
    path: '/dashboard/community',
    icon: <GroupIcon />,
    role: [UserRole.STUDENT, UserRole.TEACHER],
  },
  {
    id: 'ai-chat',
    label: 'AI陪伴',
    path: '/dashboard/ai-chat',
    icon: <AIIcon />,
    role: [UserRole.STUDENT, UserRole.TEACHER],
  },
  {
    id: 'profile',
    label: '个人资料',
    path: '/dashboard/profile',
    icon: <PersonIcon />,
    role: [UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER],
  },
];

const drawerWidth = 240;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [musicPlayerOpen, setMusicPlayerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // 根据用户角色过滤导航项
  const filteredNavigationItems = navigationItems.filter(item =>
    authUtils.hasRole(user, item.role)
  );

  // 移动端底部导航当前选中的项
  const currentNavItem = filteredNavigationItems.find(item =>
    pathname && pathname.startsWith(item.path)
  )?.id || 'dashboard';

  // 抽屉内容
  const drawer = (
    <Box sx={{ p: 2 }}>
      {/* 应用标题 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          心情守护
        </Typography>
      </Box>

      {/* 用户信息 */}
      <Box sx={{ mb: 3, p: 2, borderRadius: 2, backgroundColor: 'action.hover' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          {authUtils.getDisplayName(user)}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {user?.role === UserRole.STUDENT && '学生'}
          {user?.role === UserRole.PARENT && '家长'}
          {user?.role === UserRole.TEACHER && '教师'}
        </Typography>
      </Box>

      {/* 导航菜单 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {filteredNavigationItems.map((item) => (
          <Box
            key={item.id}
            onClick={() => handleNavigation(item.path)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 2,
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backgroundColor: pathname && pathname.startsWith(item.path)
                ? 'primary.main'
                : 'transparent',
              color: pathname && pathname.startsWith(item.path)
                ? 'primary.contrastText'
                : 'text.primary',
              '&:hover': {
                backgroundColor: pathname && pathname.startsWith(item.path)
                  ? 'primary.dark'
                  : 'action.hover',
              },
            }}
          >
            <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
              {item.icon}
            </Box>
            <Typography variant="body2" sx={{ fontWeight: '500' }}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* 退出登录按钮 */}
      <Box
        onClick={logout}
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          borderRadius: 2,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          mt: 'auto',
          color: 'error.main',
          '&:hover': {
            backgroundColor: 'error.light',
            color: 'error.dark',
          },
        }}
      >
        <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
          <PersonIcon />
        </Box>
        <Typography variant="body2" sx={{ fontWeight: '500' }}>
          退出登录
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* 顶部应用栏 */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="打开菜单"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {currentNavItem && filteredNavigationItems.find(item => item.id === currentNavItem)?.label}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {authUtils.getDisplayName(user)}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* 侧边栏导航（桌面端） */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* 移动端抽屉 */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // 更好的移动端性能
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* 桌面端抽屉 */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* 主内容区域 */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          pb: { xs: 8, md: 3 }, // 为移动端底部导航留出空间
        }}
      >
        <Toolbar /> {/* 为顶部应用栏留出空间 */}
        {children}
        
        {/* 音乐播放器 */}
        <MusicPlayer
          isOpen={musicPlayerOpen}
          onToggle={setMusicPlayerOpen}
        />
      </Box>

      {/* 移动端底部导航 - 移除，避免与侧边栏重复 */}
      {/* 移动端通过侧边栏抽屉提供导航，底部导航会造成交互冲突 */}
    </Box>
  );
}