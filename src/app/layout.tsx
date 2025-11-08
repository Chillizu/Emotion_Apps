import type { Metadata } from 'next'
import { ThemeProvider } from '@mui/material/styles'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'
import CssBaseline from '@mui/material/CssBaseline'
import theme from '@/lib/theme'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: '心情守护 - 专业中小学生情绪管理应用',
    template: '%s | 心情守护'
  },
  description: '心情守护是专业的心理健康管理平台，帮助中小学生记录情绪变化、评估压力水平、学习心理调适技巧。提供情绪日记、压力评估、心理工具和家长监控等功能。',
  keywords: [
    '情绪管理', '心理健康', '中小学生', '压力评估', '情绪日记',
    '心理调适', '家长监控', '心理健康教育', '情绪记录', '压力测试'
  ],
  authors: [{ name: '心情守护团队' }],
  creator: '心情守护',
  publisher: '心情守护',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://moodguard.app'),
  alternates: {
    canonical: '/',
    languages: {
      'zh-CN': '/zh-CN',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://moodguard.app',
    title: '心情守护 - 专业中小学生情绪管理应用',
    description: '帮助中小学生记录情绪变化、评估压力水平、学习心理调适技巧的心理健康管理平台',
    siteName: '心情守护',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '心情守护 - 情绪管理应用',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '心情守护 - 专业中小学生情绪管理应用',
    description: '帮助中小学生记录情绪变化、评估压力水平、学习心理调适技巧的心理健康管理平台',
    images: ['/og-image.jpg'],
    creator: '@moodguard',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#1976d2" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="心情守护" />
      </head>
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}