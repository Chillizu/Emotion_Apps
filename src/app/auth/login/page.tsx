'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  Container,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store/auth-store';
import { LoginCredentials } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  
  const [formData, setFormData] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [demoHint, setDemoHint] = useState(false);

  const handleInputChange = (field: keyof LoginCredentials) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('请输入用户名和密码');
      return;
    }

    try {
      const success = await login(formData);
      if (success) {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请重试');
    }
  };

  const fillDemoCredentials = (role: 'student' | 'parent') => {
    if (role === 'student') {
      setFormData({
        username: 'student1',
        password: 'password123',
      });
    } else {
      setFormData({
        username: 'parent1',
        password: 'password123',
      });
    }
    setDemoHint(true);
  };

  return (
    <Container 
      component="main" 
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%' }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* 页面标题 */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  mb: 1,
                }}
              >
                欢迎回来
              </Typography>
            </motion.div>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
              }}
            >
              登录您的账户，继续管理您的心理健康
            </Typography>
          </Box>

          {/* 错误提示 */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            </motion.div>
          )}

          {/* 演示提示 */}
          {demoHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <Alert severity="info" sx={{ mb: 3 }}>
                已填充演示账户信息，点击登录即可体验
              </Alert>
            </motion.div>
          )}

          {/* 登录表单 */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <TextField
                fullWidth
                label="用户名"
                variant="outlined"
                value={formData.username}
                onChange={handleInputChange('username')}
                disabled={isLoading}
                sx={{ mb: 3 }}
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <TextField
                fullWidth
                label="密码"
                type="password"
                variant="outlined"
                value={formData.password}
                onChange={handleInputChange('password')}
                disabled={isLoading}
                sx={{ mb: 3 }}
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  position: 'relative',
                }}
              >
                {isLoading ? (
                  <>
                    <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
                    登录中...
                  </>
                ) : (
                  '登录'
                )}
              </Button>
            </motion.div>
          </Box>

          {/* 演示账户快速登录 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="body2"
                sx={{
                  textAlign: 'center',
                  color: 'text.secondary',
                  mb: 2,
                }}
              >
                或使用演示账户快速体验
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="medium"
                  onClick={() => fillDemoCredentials('student')}
                  disabled={isLoading}
                  sx={{
                    borderRadius: 2,
                    py: 1,
                  }}
                >
                  学生演示账户
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  size="medium"
                  onClick={() => fillDemoCredentials('parent')}
                  disabled={isLoading}
                  sx={{
                    borderRadius: 2,
                    py: 1,
                  }}
                >
                  家长演示账户
                </Button>
              </Box>
            </Box>
          </motion.div>

          {/* 注册链接 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                还没有账户？{' '}
                <Link
                  href="/auth/register"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  立即注册
                </Link>
              </Typography>
            </Box>
          </motion.div>

          {/* 返回首页链接 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link
                href="/"
                sx={{
                  color: 'text.secondary',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                ← 返回首页
              </Link>
            </Box>
          </motion.div>
        </Paper>

        {/* 底部信息 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
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
            保护您的隐私安全是我们的首要任务
          </Typography>
        </motion.div>
      </motion.div>
    </Container>
  );
}