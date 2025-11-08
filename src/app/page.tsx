'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Container, Button, Paper } from '@mui/material';
import { useAuthStore } from '@/lib/store/auth-store';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // 如果已认证，跳转到仪表板
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // 如果正在加载认证状态，显示加载界面
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div>
          <Typography
            variant="h4"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            心情守护
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'white',
              textAlign: 'center',
              mt: 1,
              opacity: 0.8,
            }}
          >
            加载中...
          </Typography>
        </div>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <div>
          <Paper
            elevation={8}
            sx={{
              p: 4,
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* 应用标题和图标 */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <div>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    mb: 2,
                  }}
                >
                  心情守护
                </Typography>
              </div>
              <Typography
                variant="h6"
                sx={{
                  color: 'text.secondary',
                  mb: 1,
                }}
              >
                中小学生情绪管理平台
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  opacity: 0.8,
                }}
              >
                记录情绪 · 评估压力 · 学习调适
              </Typography>
            </Box>

            {/* 功能特点 */}
            <Box sx={{ mb: 4 }}>
              {[
                {
                  emoji: '📝',
                  title: '情绪日记',
                  description: '记录每日情绪变化，了解自己的情感模式',
                },
                {
                  emoji: '📊',
                  title: '压力评估',
                  description: '科学评估压力水平，获得个性化建议',
                },
                {
                  emoji: '🧘',
                  title: '心理调适',
                  description: '学习放松技巧，提升心理韧性',
                },
                {
                  emoji: '👨‍👩‍👧‍👦',
                  title: '家长监控',
                  description: '家长关注孩子心理健康，及时提供支持',
                },
              ].map((feature, index) => (
                <div key={feature.title}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: 'background.default',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        transform: 'translateX(8px)',
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '2rem',
                        mr: 2,
                      }}
                    >
                      {feature.emoji}
                    </Typography>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: '600',
                          mb: 0.5,
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </Box>
                  </Box>
                </div>
              ))}
            </Box>

            {/* 行动按钮 */}
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <div style={{ flex: 1 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => router.push('/auth/login')}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                  }}
                >
                  开始使用
                </Button>
              </div>
              <div style={{ flex: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={() => router.push('/auth/register')}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                  }}
                >
                  注册账户
                </Button>
              </div>
            </Box>

            {/* 底部信息 */}
            <div>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  textAlign: 'center',
                  mt: 3,
                  color: 'text.secondary',
                  opacity: 0.7,
                }}
              >
                专业心理健康管理工具 · 保护隐私安全 · 多设备支持
              </Typography>
            </div>
          </Paper>
        </div>
      </Container>
    </Box>
  );
}