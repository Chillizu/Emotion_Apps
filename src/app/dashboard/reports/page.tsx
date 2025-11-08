'use client';

import { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
} from '@mui/material';
import {
  Insights as InsightsIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  CalendarToday as CalendarIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Mood as MoodIcon,
  Analytics as AnalyticsIcon,
  Psychology as PsychologyIcon,
  EmojiEvents as EmojiEventsIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

import { useAuthStore } from '@/lib/store/auth-store';
import { indexedDBStorage } from '@/lib/storage/indexedDB';
import { EmotionRecord, PressureAssessment, PsychologicalToolRecord } from '@/lib/storage/indexedDB';

// 报告时间段选项
const timePeriods = [
  { value: 'week', label: '最近一周' },
  { value: 'month', label: '最近一月' },
  { value: 'quarter', label: '最近三月' },
  { value: 'year', label: '最近一年' },
];

// 情绪颜色映射
const emotionColors: Record<string, string> = {
  happy: '#4CAF50',
  satisfied: '#8BC34A',
  neutral: '#FFC107',
  dissatisfied: '#FF9800',
  sad: '#F44336',
  angry: '#D32F2F',
  anxious: '#7B1FA2',
  excited: '#2196F3',
};

// 情绪标签映射
const emotionLabels: Record<string, string> = {
  happy: '开心',
  satisfied: '满意',
  neutral: '平静',
  dissatisfied: '不满',
  sad: '悲伤',
  angry: '愤怒',
  anxious: '焦虑',
  excited: '兴奋',
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ReportsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState(0);
  const [timePeriod, setTimePeriod] = useState('month');
  const [emotionData, setEmotionData] = useState<EmotionRecord[]>([]);
  const [pressureData, setPressureData] = useState<PressureAssessment[]>([]);
  const [toolData, setToolData] = useState<PsychologicalToolRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // 加载报告数据
  useEffect(() => {
    loadReportData();
  }, [timePeriod]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      if (user?.id) {
        // 加载情绪数据
        const emotions = await indexedDBStorage.getByIndex<EmotionRecord>('emotions', 'userId', user.id);
        setEmotionData(filterByTimePeriod(emotions, timePeriod));
        
        // 加载压力数据
        const pressures = await indexedDBStorage.getByIndex<PressureAssessment>('pressureAssessments', 'userId', user.id);
        setPressureData(filterByTimePeriod(pressures, timePeriod));
        
        // 加载工具数据
        const tools = await indexedDBStorage.getByIndex<PsychologicalToolRecord>('psychologicalTools', 'userId', user.id);
        setToolData(filterByTimePeriod(tools, timePeriod));
      }
    } catch (err) {
      console.error('加载报告数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 根据时间段过滤数据
  const filterByTimePeriod = <T extends { timestamp: number }>(data: T[], period: string): T[] => {
    const now = Date.now();
    let timeAgo = now;
    
    switch (period) {
      case 'week':
        timeAgo = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case 'month':
        timeAgo = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case 'quarter':
        timeAgo = now - 90 * 24 * 60 * 60 * 1000;
        break;
      case 'year':
        timeAgo = now - 365 * 24 * 60 * 60 * 1000;
        break;
      default:
        timeAgo = now - 30 * 24 * 60 * 60 * 1000;
    }
    
    return data.filter(item => item.timestamp >= timeAgo);
  };

  // 计算情绪统计
  const emotionStats = emotionData.reduce((acc, record) => {
    if (!acc[record.emotion]) {
      acc[record.emotion] = 0;
    }
    acc[record.emotion]++;
    return acc;
  }, {} as Record<string, number>);

  // 计算平均情绪强度
  const averageIntensity = emotionData.length > 0 
    ? emotionData.reduce((sum, record) => sum + record.intensity, 0) / emotionData.length
    : 0;

  // 计算压力统计
  const averagePressure = pressureData.length > 0
    ? pressureData.reduce((sum, record) => sum + record.score, 0) / pressureData.length
    : 0;

  // 计算工具使用统计
  const toolStats = toolData.reduce((acc, record) => {
    if (!acc[record.toolType]) {
      acc[record.toolType] = 0;
    }
    acc[record.toolType]++;
    return acc;
  }, {} as Record<string, number>);

  // 获取最常用情绪标签
  const getTopTags = () => {
    const tagCounts: Record<string, number> = {};
    emotionData.forEach(record => {
      record.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
  };

  // 获取情绪趋势数据
  const getEmotionTrend = () => {
    const trend: Record<string, number> = {};
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    last7Days.forEach(date => {
      trend[date] = 0;
    });

    emotionData.forEach(record => {
      if (trend[record.date] !== undefined) {
        // 使用情绪强度作为趋势值
        trend[record.date] += record.intensity;
      }
    });

    return Object.entries(trend).map(([date, value]) => ({
      date: new Date(date).getDate() + '日',
      value: value > 0 ? value / emotionData.filter(r => r.date === date).length : 0,
    }));
  };

  // 导出报告
  const handleExportReport = () => {
    const reportData = {
      period: timePeriods.find(p => p.value === timePeriod)?.label,
      emotionStats,
      averageIntensity: Math.round(averageIntensity * 10) / 10,
      averagePressure: Math.round(averagePressure * 10) / 10,
      toolStats,
      topTags: getTopTags(),
      generatedAt: new Date().toLocaleString('zh-CN'),
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `心情守护报告_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    setExportDialogOpen(false);
  };

  // 打印报告
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      {/* 页面标题和操作栏 */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              数据分析报告
            </Typography>
            <Typography variant="body1" color="text.secondary">
              深入了解您的情绪模式和心理健康状态
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>时间段</InputLabel>
              <Select
                value={timePeriod}
                label="时间段"
                onChange={(e) => setTimePeriod(e.target.value)}
              >
                {timePeriods.map(period => (
                  <MenuItem key={period.value} value={period.value}>
                    {period.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => setExportDialogOpen(true)}
            >
              导出
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrintReport}
            >
              打印
            </Button>
          </Box>
        </Box>

        {/* 标签页 */}
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              fontWeight: 'bold',
            },
          }}
        >
          <Tab label="情绪分析" icon={<MoodIcon />} iconPosition="start" />
          <Tab label="压力评估" icon={<AnalyticsIcon />} iconPosition="start" />
          <Tab label="工具使用" icon={<PsychologyIcon />} iconPosition="start" />
          <Tab label="综合报告" icon={<InsightsIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* 情绪分析标签页 */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          {/* 情绪概览卡片 */}
          <Grid item xs={12} lg={8}>
            <Card sx={{
                borderRadius: 3,
                boxShadow: theme.shadows[2],
                mb: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                  情绪分布统计
                </Typography>
                
                {Object.keys(emotionStats).length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {Object.entries(emotionStats)
                      .sort(([, a], [, b]) => b - a)
                      .map(([emotion, count]) => (
                        <Box key={emotion} sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: emotionColors[emotion] || '#ccc',
                                mr: 2,
                              }}
                            />
                            <Typography variant="body2" sx={{ minWidth: 60 }}>
                              {emotionLabels[emotion] || emotion}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ flex: 1, mr: 2 }}>
                              <LinearProgress
                                variant="determinate"
                                value={(count / emotionData.length) * 100}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  backgroundColor: alpha(emotionColors[emotion] || '#ccc', 0.2),
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: emotionColors[emotion] || '#ccc',
                                  },
                                }}
                              />
                          </Box>
                          
                          <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'right' }}>
                            {count}次
                          </Typography>
                        </Box>
                      ))}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <MoodIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      暂无情绪记录数据
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* 情绪趋势 */}
            <Card sx={{
                borderRadius: 3,
                boxShadow: theme.shadows[2],
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                  情绪趋势
                </Typography>
                
                {emotionData.length > 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 200 }}>
                    {getEmotionTrend().map((day, index) => (
                      <Box
                        key={index}
                        sx={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                          {day.date}
                        </Typography>
                        <Box
                          sx={{
                            width: '80%',
                            height: day.value > 0 ? Math.max(day.value * 10, 10) : 0,
                            backgroundColor: theme.palette.primary.main,
                            borderRadius: 1,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: theme.palette.primary.dark,
                            },
                          }}
                        />
                        <Typography variant="caption" sx={{ mt: 1 }}>
                          {day.value > 0 ? day.value.toFixed(1) : 0}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <TrendingUpIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      暂无趋势数据
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* 情绪统计侧边栏 */}
          <Grid item xs={12} lg={4}>
            <Card sx={{
                borderRadius: 3,
                boxShadow: theme.shadows[2],
                mb: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                  情绪统计
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ textAlign: 'center', p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {emotionData.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      总记录数
                    </Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center', p: 2, backgroundColor: alpha(theme.palette.success.main, 0.1), borderRadius: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      {Math.round(averageIntensity * 10) / 10}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      平均情绪强度
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                      常用情绪标签
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {getTopTags().map(({ tag, count }) => (
                        <Chip
                          key={tag}
                          label={`${tag} (${count})`}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* 压力评估标签页 */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <Card sx={{
                borderRadius: 3,
                boxShadow: theme.shadows[2],
                height: '100%',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                  压力评估统计
                </Typography>
                
                {pressureData.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                        {Math.round(averagePressure * 10) / 10}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        平均压力分数
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                        压力等级分布
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {pressureData.map((assessment, index) => (
                          <Box key={assessment.id} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ minWidth: 100 }}>
                              {new Date(assessment.timestamp).toLocaleDateString('zh-CN')}
                            </Typography>
                            <Box sx={{ flex: 1, mx: 2 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={(assessment.score / 40) * 100}
                                  sx={{
                                    height: 8,
                                    borderRadius: 4,
                                  }}
                                />
                            </Box>
                            <Typography variant="body2" sx={{ minWidth: 40 }}>
                              {assessment.score}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <AnalyticsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      暂无压力评估数据
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Card sx={{
                borderRadius: 3,
                boxShadow: theme.shadows[2],
                height: '100%',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                  压力因素分析
                </Typography>
                
                {pressureData.length > 0 ? (
                  <Box>
                    {/* 压力因素统计 */}
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                      常见压力因素
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                      {Array.from(new Set(pressureData.flatMap(a => a.factors))).map(factor => (
                        <Chip
                          key={factor}
                          label={factor}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Box>
                    
                    {/* 最新评估建议 */}
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                      最新评估建议
                    </Typography>
                    {pressureData[0] && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {pressureData[0].suggestions.map((suggestion, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <EmojiEventsIcon
                              sx={{ color: 'success.main', fontSize: 16, mr: 1, mt: 0.5 }}
                            />
                            <Typography variant="body2">{suggestion}</Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <PsychologyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      暂无压力因素数据
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* 工具使用标签页 */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{
                borderRadius: 3,
                boxShadow: theme.shadows[2],
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                  工具使用统计
                </Typography>
                
                {Object.keys(toolStats).length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>工具名称</TableCell>
                          <TableCell align="center">使用次数</TableCell>
                          <TableCell align="center">总时长</TableCell>
                          <TableCell align="center">平均时长</TableCell>
                          <TableCell align="center">使用频率</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(toolStats).map(([toolType, count]) => {
                          const toolRecords = toolData.filter(record => record.toolType === toolType);
                          const totalDuration = toolRecords.reduce((sum, record) => sum + record.duration, 0);
                          const avgDuration = totalDuration / count;
                          
                          return (
                            <TableRow key={toolType}>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: '500' }}>
                                  {toolType === 'breathing' && '呼吸练习'}
                                  {toolType === 'meditation' && '正念冥想'}
                                  {toolType === 'music' && '放松音乐'}
                                  {toolType === 'gratitude' && '感恩练习'}
                                  {toolType === 'progressive-relaxation' && '渐进式放松'}
                                  {toolType === 'visualization' && '积极想象'}
                                  {!['breathing', 'meditation', 'music', 'gratitude', 'progressive-relaxation', 'visualization'].includes(toolType) && toolType}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip label={count} size="small" color="primary" />
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2">
                                  {Math.floor(totalDuration / 60)}分钟
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2">
                                  {Math.floor(avgDuration / 60)}分钟
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                  <LinearProgress
                                    variant="determinate"
                                    value={(count / Math.max(...Object.values(toolStats))) * 100}
                                    sx={{
                                      height: 8,
                                      borderRadius: 4,
                                      maxWidth: 100,
                                      margin: '0 auto',
                                    }}
                                  />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <PsychologyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      暂无工具使用数据
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* 综合报告标签页 */}
      <TabPanel value={activeTab} index={3}>
        <Card sx={{
            borderRadius: 3,
            boxShadow: theme.shadows[2],
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
              心理健康综合报告
            </Typography>
            
            <Grid container spacing={3}>
              {/* 关键指标 */}
              <Grid item xs={12} md={6} lg={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <MoodIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {emotionData.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    情绪记录
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6} lg={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <AnalyticsIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {pressureData.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    压力评估
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6} lg={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <PsychologyIcon sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {toolData.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    工具使用
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6} lg={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <ScheduleIcon sx={{ fontSize: 48, color: 'info.main', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {Math.round(averageIntensity * 10) / 10}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    情绪强度
                  </Typography>
                </Box>
              </Grid>

              {/* 总结和建议 */}
              <Grid item xs={12}>
                <Box sx={{ p: 3, backgroundColor: 'background.default', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    报告总结
                  </Typography>
                  <Typography variant="body1" paragraph>
                    在{timePeriods.find(p => p.value === timePeriod)?.label}期间，您共记录了{' '}
                    {emotionData.length}条情绪记录，进行了{pressureData.length}次压力评估，
                    使用了{toolData.length}次心理调适工具。
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {averageIntensity > 7 ? '您的情绪强度较高，' : 
                     averageIntensity > 5 ? '您的情绪强度适中，' : '您的情绪强度较低，'}
                    {averagePressure > 30 ? '压力水平需要关注。' :
                     averagePressure > 20 ? '压力水平在可控范围内。' : '压力水平良好。'}
                  </Typography>
                  <Typography variant="body1">
                    建议继续坚持记录情绪，定期进行压力评估，并合理使用心理调适工具来维持心理健康。
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* 导出对话框 */}
      <Dialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>导出报告</DialogTitle>
        <DialogContent>
          <Typography>
            您即将导出{timePeriods.find(p => p.value === timePeriod)?.label}的心理健康报告。
            报告将包含情绪统计、压力评估和工具使用等数据。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleExportReport}>
            确认导出
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
