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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store/auth-store';
import { RegisterData, UserRole, UserProfile } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    password: '',
    confirmPassword: '',
    role: UserRole.STUDENT,
    profile: {
      name: '',
      age: undefined,
      grade: '',
      school: '',
    },
  });
  const [error, setError] = useState<string>('');

  const handleInputChange = (field: keyof Omit<RegisterData, 'profile'>) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    setError('');
  };

  const handleProfileChange = (field: keyof UserProfile) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: event.target.value,
      },
    }));
    setError('');
  };

  const handleRoleChange = (event: any) => {
    setFormData(prev => ({
      ...prev,
      role: event.target.value as UserRole,
    }));
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // 表单验证
    if (!formData.username || !formData.password || !formData.confirmPassword) {
      setError('请填写所有必填字段');
      return;
    }

    if (formData.password.length < 6) {
      setError('密码长度至少6位');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('密码确认不匹配');
      return;
    }

    if (!formData.profile.name) {
      setError('请输入姓名');
      return;
    }

    try {
      const success = await register(formData);
      if (success) {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败，请重试');
    }
  };

  return (
    <Container 
      component="main" 
      maxWidth="md"
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
                创建账户
              </Typography>
            </motion.div>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
              }}
            >
              加入心情守护，开始管理您的心理健康
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

          {/* 注册表单 */}
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* 账户信息 */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  账户信息
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <TextField
                    fullWidth
                    label="用户名 *"
                    variant="outlined"
                    value={formData.username}
                    onChange={handleInputChange('username')}
                    disabled={isLoading}
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                  />
                </motion.div>
              </Grid>

              <Grid item xs={12} sm={6}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <FormControl fullWidth>
                    <InputLabel>角色 *</InputLabel>
                    <Select
                      value={formData.role}
                      label="角色 *"
                      onChange={handleRoleChange}
                      disabled={isLoading}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value={UserRole.STUDENT}>学生</MenuItem>
                      <MenuItem value={UserRole.PARENT}>家长</MenuItem>
                      <MenuItem value={UserRole.TEACHER}>教师</MenuItem>
                    </Select>
                  </FormControl>
                </motion.div>
              </Grid>

              <Grid item xs={12} sm={6}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <TextField
                    fullWidth
                    label="密码 *"
                    type="password"
                    variant="outlined"
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    disabled={isLoading}
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                    helperText="密码长度至少6位"
                  />
                </motion.div>
              </Grid>

              <Grid item xs={12} sm={6}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <TextField
                    fullWidth
                    label="确认密码 *"
                    type="password"
                    variant="outlined"
                    value={formData.confirmPassword}
                    onChange={handleInputChange('confirmPassword')}
                    disabled={isLoading}
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                  />
                </motion.div>
              </Grid>

              {/* 个人信息 */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', mt: 2 }}>
                  个人信息
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <TextField
                    fullWidth
                    label="姓名 *"
                    variant="outlined"
                    value={formData.profile.name}
                    onChange={handleProfileChange('name')}
                    disabled={isLoading}
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                  />
                </motion.div>
              </Grid>

              <Grid item xs={12} sm={6}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <TextField
                    fullWidth
                    label="年龄"
                    type="number"
                    variant="outlined"
                    value={formData.profile.age || ''}
                    onChange={handleProfileChange('age')}
                    disabled={isLoading}
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                  />
                </motion.div>
              </Grid>

              <Grid item xs={12} sm={6}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <TextField
                    fullWidth
                    label="年级"
                    variant="outlined"
                    value={formData.profile.grade}
                    onChange={handleProfileChange('grade')}
                    disabled={isLoading}
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                    placeholder="例如：六年级"
                  />
                </motion.div>
              </Grid>

              <Grid item xs={12} sm={6}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 }}
                >
                  <TextField
                    fullWidth
                    label="学校"
                    variant="outlined"
                    value={formData.profile.school}
                    onChange={handleProfileChange('school')}
                    disabled={isLoading}
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                  />
                </motion.div>
              </Grid>

              {/* 提交按钮 */}
              <Grid item xs={12}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
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
                      mt: 2,
                    }}
                  >
                    {isLoading ? (
                      <>
                        <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
                        注册中...
                      </>
                    ) : (
                      '注册账户'
                    )}
                  </Button>
                </motion.div>
              </Grid>
            </Grid>
          </Box>

          {/* 登录链接 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                已有账户？{' '}
                <Link
                  href="/auth/login"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  立即登录
                </Link>
              </Typography>
            </Box>
          </motion.div>

          {/* 返回首页链接 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
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
          transition={{ delay: 1.4 }}
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
            我们承诺保护您的隐私，所有数据仅用于心理健康管理
          </Typography>
        </motion.div>
      </motion.div>
    </Container>
  );
}