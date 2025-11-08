'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box } from '@mui/material';
import { useAuthStore } from '@/lib/store/auth-store';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // 如果未认证且不在加载状态，跳转到登录页
    if (!isAuthenticated && !isLoading) {
      router.push('/auth/login');
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
        <Box
          sx={{
            color: 'white',
            textAlign: 'center',
          }}
        >
          加载中...
        </Box>
      </Box>
    );
  }

  // 如果未认证，不渲染内容（会触发重定向）
  if (!isAuthenticated) {
    return null;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}