'use client';

import { useRouter } from 'next/navigation';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  Mood as MoodIcon,
  Analytics as AnalyticsIcon,
  Psychology as PsychologyIcon,
  FamilyRestroom as FamilyIcon,
  Insights as InsightsIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as EmojiEventsIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useAuthStore, authUtils } from '@/lib/store/auth-store';
import { UserRole } from '@/types';

// 功能卡片数据
const featureCards = [
  {
    id: 'emotion-diary',
    title: '情绪日记',
    description: '记录每日情绪变化，了解自己的情绪模式',
    icon: <MoodIcon sx={{ fontSize: 40 }} />,
    color: '#4CAF50',
    path: '/dashboard/emotion-diary',
    roles: [UserRole.STUDENT, UserRole.TEACHER],
  },
  {
    id: 'pressure-assessment',
    title: '压力评估',
    description: '评估当前压力水平，获取个性化建议',
    icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
    color: '#FF9800',
    path: '/dashboard/pressure-assessment',
    roles: [UserRole.STUDENT, UserRole.TEACHER],
  },
  {
    id: 'psychological-tools',
    title: '心理调适',
    description: '使用专业工具调节情绪，保持心理健康',
    icon: <PsychologyIcon sx={{ fontSize: 40 }} />,
    color: '#9C27B0',
    path: '/dashboard/psychological-tools',
    roles: [UserRole.STUDENT, UserRole.TEACHER],
  },
  {
    id: 'parent-dashboard',
    title: '家长监控',
    description: '关注孩子情绪状态，及时提供支持',
    icon: <FamilyIcon sx={{ fontSize: 40 }} />,
    color: '#2196F3',
    path: '/dashboard/parent-dashboard',
    roles: [UserRole.PARENT],
  },
  {
    id: 'reports',
    title: '数据分析',
    description: '查看情绪趋势和统计分析报告',
    icon: <InsightsIcon sx={{ fontSize: 40 }} />,
    color: '#607D8B',
    path: '/dashboard/reports',
    roles: [UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER],
  },
];

// 统计数据卡片
const statCards = [
  {
    id: 'streak',
    title: '连续记录',
    value: '7天',
    icon: <TrendingUpIcon />,
    color: '#4CAF50',
  },
  {
    id: 'emotion-score',
    title: '情绪评分',
    value: '8.5',
    icon: <EmojiEventsIcon />,
    color: '#FFC107',
  },
  {
    id: 'last-record',
    title: '最近记录',
    value: '今天',
    icon: <CalendarIcon />,
    color: '#2196F3',
  },
];


export default function DashboardPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const { user } = useAuthStore();

  // 根据用户角色过滤功能卡片
  const filteredFeatureCards = featureCards.filter(card =>
    authUtils.hasRole(user, card.roles)
  );

  const handleCardClick = (path: string) => {
    router.push(path);
  };

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      {/* 欢迎区域 */}
      <div>
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            borderRadius: 3,
            p: 4,
            mb: 4,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              backgroundColor: alpha('#fff', 0.1),
            }}
          />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              欢迎回来，{authUtils.getDisplayName(user)}！
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
              今天的心情如何？让我们一起来关注您的心理健康状态。
            </Typography>
            <Chip
              label={`${user?.role === UserRole.STUDENT ? '学生' : user?.role === UserRole.PARENT ? '家长' : '教师'}模式`}
              sx={{
                backgroundColor: alpha('#fff', 0.2),
                color: 'white',
                fontWeight: 'bold',
              }}
            />
          </Box>
        </Box>
      </div>

      {/* 统计数据 */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={4} key={stat.id}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  boxShadow: theme.shadows[2],
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: theme.shadows[6],
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        backgroundColor: alpha(stat.color, 0.1),
                        color: stat.color,
                        mr: 2,
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.title}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
          </Grid>
        ))}
      </Grid>

      {/* 功能卡片 */}
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        快速开始
      </Typography>
      <Grid container spacing={3}>
        {filteredFeatureCards.map((card, index) => (
          <Grid item xs={12} sm={6} lg={4} key={card.id}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                cursor: 'pointer',
                boxShadow: theme.shadows[2],
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: theme.shadows[8],
                },
              }}
              onClick={() => handleCardClick(card.path)}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2,
                    color: card.color,
                  }}
                >
                  {card.icon}
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    mb: 1,
                    background: `linear-gradient(135deg, ${card.color} 0%, ${alpha(card.color, 0.8)} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  {card.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2, lineHeight: 1.5 }}
                >
                  {card.description}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: card.color,
                    color: card.color,
                    '&:hover': {
                      backgroundColor: alpha(card.color, 0.1),
                      borderColor: card.color,
                    },
                  }}
                >
                  开始使用
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 提示信息 */}
      {filteredFeatureCards.length === 0 && (
          <Card
            sx={{
              mt: 4,
              borderRadius: 3,
              backgroundColor: theme.palette.background.default,
            }}
          >
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                暂无可用功能
              </Typography>
              <Typography variant="body2" color="text.secondary">
                当前用户角色没有可用的功能模块，请联系管理员配置权限。
              </Typography>
            </CardContent>
          </Card>
      )}

      {/* 底部提示 */}
      <div>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            需要帮助？请查看使用指南或联系客服
          </Typography>
        </Box>
      </div>
    </Box>
  );
}