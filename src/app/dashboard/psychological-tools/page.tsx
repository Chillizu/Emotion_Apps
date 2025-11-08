'use client';

import { useState, useEffect, useRef } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  IconButton,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  TextField,
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  SelfImprovement as MeditationIcon,
  MusicNote as MusicIcon,
  Favorite as FavoriteIcon,
  Spa as SpaIcon,
  Timer as TimerIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Replay as ReplayIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  History as HistoryIcon,
} from '@mui/icons-material';

import { useAuthStore } from '@/lib/store/auth-store';
import { indexedDBStorage, PsychologicalToolRecord } from '@/lib/storage/indexedDB';
import { alpha } from '@mui/system';

// 心理调适工具配置
const psychologicalTools = [
  {
    id: 'breathing',
    title: '呼吸练习',
    description: '通过规律的呼吸节奏帮助放松身心，缓解焦虑',
    icon: <SpaIcon sx={{ fontSize: 40 }} />,
    color: '#4CAF50',
    duration: 300, // 5分钟
    category: '放松',
  },
  {
    id: 'meditation',
    title: '正念冥想',
    description: '引导式冥想，帮助集中注意力，提升专注力',
    icon: <MeditationIcon sx={{ fontSize: 40 }} />,
    color: '#2196F3',
    duration: 600, // 10分钟
    category: '专注',
  },
  {
    id: 'music',
    title: '放松音乐',
    description: '精选放松音乐，帮助缓解压力，改善情绪',
    icon: <MusicIcon sx={{ fontSize: 40 }} />,
    color: '#9C27B0',
    duration: 600, // 10分钟
    category: '情绪',
  },
  {
    id: 'gratitude',
    title: '感恩练习',
    description: '记录感恩事项，培养积极心态',
    icon: <FavoriteIcon sx={{ fontSize: 40 }} />,
    color: '#FF9800',
    duration: 180, // 3分钟
    category: '积极',
  },
  {
    id: 'progressive-relaxation',
    title: '渐进式放松',
    description: '逐步放松身体各部位，深度缓解紧张',
    icon: <PsychologyIcon sx={{ fontSize: 40 }} />,
    color: '#607D8B',
    duration: 480, // 8分钟
    category: '放松',
  },
  {
    id: 'visualization',
    title: '积极想象',
    description: '引导积极场景想象，提升情绪状态',
    icon: <PsychologyIcon sx={{ fontSize: 40 }} />,
    color: '#E91E63',
    duration: 360, // 6分钟
    category: '情绪',
  },
];

// 呼吸练习阶段
const breathingStages = [
  { name: '吸气', duration: 4, color: '#4CAF50' },
  { name: '屏息', duration: 2, color: '#2196F3' },
  { name: '呼气', duration: 6, color: '#FF9800' },
  { name: '屏息', duration: 2, color: '#9C27B0' },
];

// 放松音乐选项
const musicOptions = [
  {
    id: 'nature',
    name: '自然之声',
    description: '鸟鸣、流水、雨声等自然声音',
    src: '/audio/nature.mp3', // 实际项目中需要提供音频文件
  },
  {
    id: 'classical',
    name: '古典音乐',
    description: '轻柔的古典音乐，帮助放松',
    src: '/audio/classical.mp3',
  },
  {
    id: 'ambient',
    name: '环境音乐',
    description: '舒缓的环境音乐，营造平静氛围',
    src: '/audio/ambient.mp3',
  },
];

interface ToolSession {
  toolId: string;
  startTime: number;
  duration: number;
  completed: boolean;
}

export default function PsychologicalToolsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuthStore();
  
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [session, setSession] = useState<ToolSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [breathingStage, setBreathingStage] = useState(0);
  const [breathingProgress, setBreathingProgress] = useState(0);
  const [selectedMusic, setSelectedMusic] = useState(musicOptions[0].id);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [gratitudeItems, setGratitudeItems] = useState<string[]>(['']);
  const [history, setHistory] = useState<PsychologicalToolRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const breathingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 加载使用历史
  useEffect(() => {
    loadToolHistory();
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);
    };
  }, []);

  const loadToolHistory = async () => {
    try {
      if (user?.id) {
        const userHistory = await indexedDBStorage.getByIndex<PsychologicalToolRecord>(
          'psychologicalTools',
          'userId',
          user.id
        );
        const sortedHistory = userHistory.sort((a, b) => b.timestamp - a.timestamp);
        setHistory(sortedHistory);
      }
    } catch (err) {
      console.error('加载工具历史失败:', err);
    }
  };

  // 开始工具会话
  const startToolSession = (toolId: string) => {
    const tool = psychologicalTools.find(t => t.id === toolId);
    if (!tool) return;

    const newSession: ToolSession = {
      toolId,
      startTime: Date.now(),
      duration: tool.duration,
      completed: false,
    };

    setActiveTool(toolId);
    setSession(newSession);
    setTimeRemaining(tool.duration);
    setIsPlaying(true);

    // 如果是呼吸练习，初始化呼吸阶段
    if (toolId === 'breathing') {
      setBreathingStage(0);
      setBreathingProgress(0);
      startBreathingCycle();
    }

    // 启动计时器
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          completeToolSession(newSession);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 开始呼吸循环
  const startBreathingCycle = () => {
    const currentStage = breathingStages[breathingStage];
    setBreathingProgress(0);

    breathingTimerRef.current = setInterval(() => {
      setBreathingProgress(prev => {
        if (prev >= 100) {
          // 切换到下一个阶段
          const nextStage = (breathingStage + 1) % breathingStages.length;
          setBreathingStage(nextStage);
          setBreathingProgress(0);
          return 0;
        }
        return prev + (100 / (currentStage.duration * 10)); // 每100ms更新一次
      });
    }, 100);
  };

  // 暂停/继续会话
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    
    if (isPlaying) {
      // 暂停
      if (timerRef.current) clearInterval(timerRef.current);
      if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);
    } else {
      // 继续
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            completeToolSession(session!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      if (activeTool === 'breathing') {
        startBreathingCycle();
      }
    }
  };

  // 停止会话
  const stopToolSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);
    
    setActiveTool(null);
    setSession(null);
    setIsPlaying(false);
    setTimeRemaining(0);
  };

  // 完成工具会话
  const completeToolSession = async (completedSession: ToolSession) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);

    try {
      const record: Omit<PsychologicalToolRecord, 'id'> = {
        userId: user?.id || '',
        toolType: completedSession.toolId,
        duration: completedSession.duration - timeRemaining,
        timestamp: Date.now(),
      };

      await indexedDBStorage.add('psychologicalTools', {
        ...record,
        id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });

      await loadToolHistory();
    } catch (err) {
      console.error('保存工具记录失败:', err);
    }

    setActiveTool(null);
    setSession(null);
    setIsPlaying(false);
    setTimeRemaining(0);
  };

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 添加感恩事项
  const addGratitudeItem = () => {
    setGratitudeItems([...gratitudeItems, '']);
  };

  // 更新感恩事项
  const updateGratitudeItem = (index: number, value: string) => {
    const newItems = [...gratitudeItems];
    newItems[index] = value;
    setGratitudeItems(newItems);
  };

  // 移除感恩事项
  const removeGratitudeItem = (index: number) => {
    if (gratitudeItems.length > 1) {
      const newItems = gratitudeItems.filter((_, i) => i !== index);
      setGratitudeItems(newItems);
    }
  };

  // 完成感恩练习
  const completeGratitudePractice = async () => {
    const validItems = gratitudeItems.filter(item => item.trim() !== '');
    if (validItems.length === 0) {
      setError('请至少填写一个感恩事项');
      return;
    }

    try {
      const record: Omit<PsychologicalToolRecord, 'id'> = {
        userId: user?.id || '',
        toolType: 'gratitude',
        duration: 180, // 默认3分钟
        result: { items: validItems },
        timestamp: Date.now(),
      };

      await indexedDBStorage.add('psychologicalTools', {
        ...record,
        id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });

      await loadToolHistory();
      setGratitudeItems(['']);
      setError('');
      alert('感恩练习已完成！');
    } catch (err) {
      console.error('保存感恩练习失败:', err);
      setError('保存失败，请重试');
    }
  };

  // 获取工具使用次数
  const getToolUsageCount = (toolId: string) => {
    return history.filter(record => record.toolType === toolId).length;
  };

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      {/* 页面标题 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          心理调适工具
        </Typography>
        <Typography variant="body1" color="text.secondary">
          使用专业心理调适工具，帮助您缓解压力、提升情绪
        </Typography>
      </Box>

      {/* 错误提示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* 活动工具会话 */}
      {activeTool && session && (
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: theme.shadows[4],
            mb: 4,
            backgroundColor: 'background.paper',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {psychologicalTools.find(t => t.id === activeTool)?.title}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {formatTime(timeRemaining)}
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={((session.duration - timeRemaining) / session.duration) * 100}
              sx={{ height: 8, borderRadius: 4, mb: 3 }}
            />

            {/* 呼吸练习可视化 */}
            {activeTool === 'breathing' && (
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    backgroundColor: breathingStages[breathingStage].color,
                    opacity: 0.6,
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    }}
                  >
                    {breathingStages[breathingStage].name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  持续 {breathingStages[breathingStage].duration} 秒
                </Typography>
              </Box>
            )}

            {/* 音乐控制 */}
            {activeTool === 'music' && (
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>选择音乐</InputLabel>
                  <Select
                    value={selectedMusic}
                    label="选择音乐"
                    onChange={(e) => setSelectedMusic(e.target.value)}
                  >
                    {musicOptions.map(music => (
                      <MenuItem key={music.id} value={music.id}>
                        {music.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconButton onClick={() => setIsMuted(!isMuted)}>
                    {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                  </IconButton>
                  <Slider
                    value={volume}
                    onChange={(_, value) => setVolume(value as number)}
                    min={0}
                    max={100}
                    sx={{ flex: 1 }}
                  />
                </Box>
              </Box>
            )}

            {/* 控制按钮 */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<StopIcon />}
                onClick={stopToolSession}
              >
                停止
              </Button>
              <Button
                variant="contained"
                startIcon={isPlaying ? <PauseIcon /> : <PlayIcon />}
                onClick={togglePlayPause}
              >
                {isPlaying ? '暂停' : '继续'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 感恩练习对话框 */}
      {activeTool === 'gratitude' && !session && (
        <Dialog
          open={true}
          onClose={() => setActiveTool(null)}
          maxWidth="sm"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>感恩练习</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 3 }}>
              请写下今天您想要感谢的人或事。感恩可以帮助我们培养积极心态。
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {gratitudeItems.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    value={item}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateGratitudeItem(index, e.target.value)}
                    placeholder={`感恩事项 ${index + 1}`}
                    size="small"
                  />
                  {gratitudeItems.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={() => removeGratitudeItem(index)}
                      color="error"
                    >
                      <StopIcon />
                    </IconButton>
                  )}
                </Box>
              ))}
              
              <Button
                variant="outlined"
                onClick={addGratitudeItem}
                sx={{ alignSelf: 'flex-start' }}
              >
                添加更多
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActiveTool(null)}>取消</Button>
            <Button variant="contained" onClick={completeGratitudePractice}>
              完成练习
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Grid container spacing={3}>
        {/* 工具卡片 */}
        {psychologicalTools.map((tool, index) => (
          <Grid item xs={12} sm={6} lg={4} key={tool.id}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                cursor: activeTool ? 'default' : 'pointer',
                boxShadow: theme.shadows[2],
                transition: 'all 0.3s ease',
                opacity: activeTool && activeTool !== tool.id ? 0.5 : 1,
                '&:hover': {
                  boxShadow: activeTool ? theme.shadows[2] : theme.shadows[6],
                },
              }}
              onClick={() => !activeTool && setActiveTool(tool.id)}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2,
                    color: tool.color,
                  }}
                >
                  {tool.icon}
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    mb: 1,
                    background: `linear-gradient(135deg, ${tool.color} 0%, ${alpha(tool.color, 0.8)} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  {tool.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2, lineHeight: 1.5 }}
                >
                  {tool.description}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip
                    label={tool.category}
                    size="small"
                    variant="outlined"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(tool.duration)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    使用 {getToolUsageCount(tool.id)} 次
                  </Typography>
                  
                  {!activeTool && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (tool.id === 'gratitude') {
                          setActiveTool('gratitude');
                        } else {
                          startToolSession(tool.id);
                        }
                      }}
                      sx={{
                        backgroundColor: tool.color,
                        '&:hover': {
                          backgroundColor: alpha(tool.color, 0.8),
                        },
                      }}
                    >
                      开始使用
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 使用历史 */}
      {history.length > 0 && (
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: theme.shadows[2],
            mt: 4,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <HistoryIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                使用历史
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {history.slice(0, 6).map((record, index) => {
                const tool = psychologicalTools.find(t => t.id === record.toolType);
                return (
                  <Grid item xs={12} sm={6} md={4} key={record.id}>
                    <div key={record.id}>
                      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            backgroundColor: tool?.color || 'primary.main',
                            mr: 2,
                          }}
                        >
                          {tool?.icon || <PsychologyIcon />}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {tool?.title || record.toolType}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(record.duration)} · {new Date(record.timestamp).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </div>
                </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
