'use client';

import { createTheme } from '@mui/material/styles';
import { ThemeConfig } from '@/types';

// 基于React Native应用的颜色方案
export const materialTheme: ThemeConfig = {
  colors: {
    primary: {
      default: '#6750A4',
      light: '#EADDFF',
      dark: '#21005D',
      container: '#EADDFF',
    },
    secondary: {
      default: '#625B71',
      light: '#E8DEF8',
      dark: '#1D192B',
      container: '#E8DEF8',
    },
    tertiary: {
      default: '#7D5260',
      light: '#FFD8E4',
      dark: '#31111D',
      container: '#FFD8E4',
    },
    error: {
      default: '#BA1A1A',
      light: '#FFDAD6',
      dark: '#410E0B',
      container: '#FFDAD6',
    },
    warning: {
      default: '#7D5800',
      light: '#FFFBEA',
      dark: '#271900',
      container: '#FFFBEA',
    },
    info: {
      default: '#006A6B',
      light: '#D4F5F5',
      dark: '#002021',
      container: '#D4F5F5',
    },
    success: {
      default: '#2E7D32',
      light: '#E8F5E8',
      dark: '#1B5E20',
      container: '#E8F5E8',
    },
    neutral: {
      default: '#5D5D5D',
      light: '#F5F5F5',
      dark: '#2D2D2D',
      container: '#F5F5F5',
    },
    surface: {
      default: '#FFFBFE',
      container: '#F3EDF7',
      variant: '#E7E0EC',
    },
    outline: {
      default: '#79747E',
      variant: '#C4C7C5',
    },
    onSurface: {
      high: '#1C1B1F',
      medium: '#49454F',
      low: '#605D62',
    },
    onPrimary: {
      default: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Noto Sans SC", "Helvetica", "Arial", sans-serif',
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '0.75rem',  // 12px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
  },
  borderRadius: {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '0.75rem',  // 12px
    lg: '1rem',     // 16px
    xl: '1.5rem',   // 24px
  },
  elevation: {
    small: '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
    medium: '0px 2px 6px 2px rgba(0, 0, 0, 0.15), 0px 1px 2px rgba(0, 0, 0, 0.3)',
    large: '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px rgba(0, 0, 0, 0.3)',
  },
  breakpoints: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  },
};

// 创建MUI主题
export const theme = createTheme({
  palette: {
    primary: {
      main: materialTheme.colors.primary.default,
      light: materialTheme.colors.primary.light,
      dark: materialTheme.colors.primary.dark,
      contrastText: materialTheme.colors.onPrimary.default,
    },
    secondary: {
      main: materialTheme.colors.secondary.default,
      light: materialTheme.colors.secondary.light,
      dark: materialTheme.colors.secondary.dark,
    },
    error: {
      main: materialTheme.colors.error.default,
      light: materialTheme.colors.error.light,
      dark: materialTheme.colors.error.dark,
    },
    warning: {
      main: materialTheme.colors.warning.default,
      light: materialTheme.colors.warning.light,
      dark: materialTheme.colors.warning.dark,
    },
    info: {
      main: materialTheme.colors.info.default,
      light: materialTheme.colors.info.light,
      dark: materialTheme.colors.info.dark,
    },
    success: {
      main: materialTheme.colors.success.default,
      light: materialTheme.colors.success.light,
      dark: materialTheme.colors.success.dark,
    },
    background: {
      default: materialTheme.colors.surface.default,
      paper: materialTheme.colors.surface.container,
    },
    text: {
      primary: materialTheme.colors.onSurface.high,
      secondary: materialTheme.colors.onSurface.medium,
      disabled: materialTheme.colors.onSurface.low,
    },
    divider: materialTheme.colors.outline.variant,
  },
  typography: {
    fontFamily: materialTheme.typography.fontFamily,
    h1: {
      fontSize: materialTheme.typography.fontSize['4xl'],
      fontWeight: materialTheme.typography.fontWeight.bold,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: materialTheme.typography.fontSize['3xl'],
      fontWeight: materialTheme.typography.fontWeight.bold,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: materialTheme.typography.fontSize['2xl'],
      fontWeight: materialTheme.typography.fontWeight.semibold,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: materialTheme.typography.fontSize.xl,
      fontWeight: materialTheme.typography.fontWeight.semibold,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: materialTheme.typography.fontSize.lg,
      fontWeight: materialTheme.typography.fontWeight.medium,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: materialTheme.typography.fontSize.base,
      fontWeight: materialTheme.typography.fontWeight.medium,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: materialTheme.typography.fontSize.base,
      fontWeight: materialTheme.typography.fontWeight.normal,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: materialTheme.typography.fontSize.sm,
      fontWeight: materialTheme.typography.fontWeight.normal,
      lineHeight: 1.43,
    },
    caption: {
      fontSize: materialTheme.typography.fontSize.xs,
      fontWeight: materialTheme.typography.fontWeight.normal,
      lineHeight: 1.33,
    },
    button: {
      fontSize: materialTheme.typography.fontSize.base,
      fontWeight: materialTheme.typography.fontWeight.medium,
      textTransform: 'none' as const,
    },
  },
  spacing: (factor: number) => `${0.25 * factor}rem`, // 4px base
  shape: {
    borderRadius: 8, // md border radius
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: materialTheme.borderRadius.lg,
          padding: `${materialTheme.spacing.sm} ${materialTheme.spacing.lg}`,
          fontWeight: materialTheme.typography.fontWeight.medium,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: materialTheme.elevation.small,
          },
        },
        contained: {
          '&:hover': {
            boxShadow: materialTheme.elevation.small,
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: materialTheme.borderRadius.lg,
          boxShadow: materialTheme.elevation.small,
          border: `1px solid ${materialTheme.colors.outline.variant}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: materialTheme.colors.surface.container,
          color: materialTheme.colors.onSurface.high,
          boxShadow: 'none',
          borderBottom: `1px solid ${materialTheme.colors.outline.variant}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: materialTheme.colors.surface.container,
          borderRight: `1px solid ${materialTheme.colors.outline.variant}`,
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: materialTheme.colors.surface.container,
          borderTop: `1px solid ${materialTheme.colors.outline.variant}`,
        },
      },
    },
  },
  breakpoints: {
    values: materialTheme.breakpoints,
  },
});

// 响应式工具函数
export const responsive = {
  // 媒体查询断点
  up: (breakpoint: keyof typeof materialTheme.breakpoints) => 
    `@media (min-width:${materialTheme.breakpoints[breakpoint]}px)`,
  down: (breakpoint: keyof typeof materialTheme.breakpoints) => 
    `@media (max-width:${materialTheme.breakpoints[breakpoint] - 0.05}px)`,
  between: (start: keyof typeof materialTheme.breakpoints, end: keyof typeof materialTheme.breakpoints) => 
    `@media (min-width:${materialTheme.breakpoints[start]}px) and (max-width:${materialTheme.breakpoints[end] - 0.05}px)`,
  
  // 响应式间距
  spacing: (xs: string, sm?: string, md?: string, lg?: string, xl?: string) => ({
    [responsive.up('xs')]: { margin: xs },
    ...(sm && { [responsive.up('sm')]: { margin: sm } }),
    ...(md && { [responsive.up('md')]: { margin: md } }),
    ...(lg && { [responsive.up('lg')]: { margin: lg } }),
    ...(xl && { [responsive.up('xl')]: { margin: xl } }),
  }),
};

export default theme;