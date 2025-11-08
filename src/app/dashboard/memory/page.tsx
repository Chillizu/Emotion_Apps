'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  TextField,
  IconButton,
  Paper,
  Fab,
} from '@mui/material';
import {
  Memory as MemoryIcon,
  Psychology as PsychologyIcon,
  EmojiEmotions as EmojiIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  Add as AddIcon,
  SentimentVerySatisfied as HappyIcon,
  SentimentSatisfied as SatisfiedIcon,
  SentimentNeutral as NeutralIcon,
  SentimentDissatisfied as DissatisfiedIcon,
  SentimentVeryDissatisfied as SadIcon,
} from '@mui/icons-material';
import { useAuthStore } from '@/lib/store/auth-store';
import { indexedDBStorage, EmotionRecord } from '@/lib/storage/indexedDB';

interface MemoryEntry {
  id: string;
  userId: string;
  content: string;
  emotion: string;
  timestamp: number;
  isPublic: boolean;
  likes: string[];
  tags: string[];
}

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

const emotionIcons: Record<string, JSX.Element> = {
  happy: <HappyIcon />,
  satisfied: <SatisfiedIcon />,
  neutral: <NeutralIcon />,
  dissatisfied: <DissatisfiedIcon />,
  sad: <SadIcon />,
  angry: <SadIcon />,
  anxious: <DissatisfiedIcon />,
  excited: <HappyIcon />,
};

export default function MemoryPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState(0);
  const [emotionRecords, setEmotionRecords] = useState<EmotionRecord[]>([]);
  const [memoryEntries, setMemoryEntries] = useState<MemoryEntry[]>([]);
  const [newMemoryContent, setNewMemoryContent] = useState('');
  const [newMemoryEmotion, setNewMemoryEmotion] = useState('neutral');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (user?.id) {
        // 加载情绪记录
        const emotions = await indexedDBStorage.getByIndex<EmotionRecord>('emotions', 'userId', user.id);
        setEmotionRecords(emotions.sort((a, b) => b.timestamp - a.timestamp));
        
        // 加载记忆条目
        const memories = await indexedDBStorage.getAll<MemoryEntry>('memoryEntries');
        setMemoryEntries(memories.filter(m => m.userId === user.id).sort((a, b) => b.timestamp - a.timestamp));
      }
    } catch (err) {
      console.error('加载数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMemory = async () => {
    if (!user || !newMemoryContent.trim()) return;

    try {
      const newMemory: MemoryEntry = {
        id: `memory-${Date.now()}`,
        userId: user.id,
        content: newMemoryContent,
        emotion: newMemoryEmotion,
        timestamp: Date.now(),
        isPublic,
        likes: [],
        tags: [],
      };

      await indexedDBStorage.add('memoryEntries', newMemory);
      setMemoryEntries(prev => [newMemory, ...prev]);
      setNewMemoryContent('');
      setNewMemoryEmotion('neutral');
    } catch (err) {
      console.error('创建记忆失败:', err);
    }
  };

  const handleLikeMemory = async (memoryId: string) => {
    if (!user) return;

    try {
      const memory = memoryEntries.find(m => m.id === memoryId);
      if (!memory) return;

      const isLiked = memory.likes.includes(user.id);
      const updatedLikes = isLiked
        ? memory.likes.filter(id => id !== user.id)
        : [...memory.likes, user.id];

      const updatedMemory = { ...memory, likes: updatedLikes };
      await indexedDBStorage.update('memoryEntries', updatedMemory);
      
      setMemoryEntries(prev => prev.map(m => m.id === memoryId ? updatedMemory : m));
    } catch (err) {
      console.error('点赞失败:', err);
    }
  };

  const getEmotionStats = () => {
    const stats: Record<string, number> = {};
    emotionRecords.forEach(record => {
      if (!stats[record.emotion]) {
        stats[record.emotion] = 0;
      }
      stats[record.emotion]++;
    });
    return stats;
  };

  const getTopEmotions = () => {
    const stats = getEmotionStats();
    return Object.entries(stats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([emotion]) => emotion);
  };

  return (
    <Box sx={{ p: { xs: 1, md: 2 }, pb: 8 }}>
      {/* 页面标题 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          情绪回忆树洞
        </Typography>
        <Typography variant="body1" color="text.secondary">
          回顾情绪历程，在树洞中倾诉心声
        </Typography>
      </Box>

      {/* 标签页 */}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mb: 3,
          '& .MuiTab-root': {
            fontWeight: 'bold',
          },
        }}
      >
        <Tab label="情绪回顾" icon={<MemoryIcon />} iconPosition="start" />
        <Tab label="树洞倾诉" icon={<PsychologyIcon />} iconPosition="start" />
        <Tab label="情绪统计" icon={<EmojiIcon />} iconPosition="start" />
      </Tabs>

      {/* 情绪回顾标签页 */}
      <Box sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
        <Grid container spacing={3}>
          {emotionRecords.slice(0, 12).map((record, index) => (
            <Grid item xs={12} sm={6} md={4} key={record.id}>
              
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: theme.shadows[2],
                    height: '100%',
                    background: `linear-gradient(135deg, ${emotionColors[record.emotion]}20, ${theme.palette.background.paper})`,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          backgroundColor: emotionColors[record.emotion],
                          mr: 2,
                        }}
                      >
                        {emotionIcons[record.emotion]}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {emotionLabels[record.emotion]}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(record.timestamp).toLocaleDateString('zh-CN')}
                        </Typography>
                      </Box>
                    </Box>

                    {record.description && (
                      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
                        {record.description}
                      </Typography>
                    )}

                    {record.tags && record.tags.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {record.tags.map(tag => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              
            </Grid>
          ))}

          {emotionRecords.length === 0 && !loading && (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <MemoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  暂无情绪记录
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  开始记录情绪，创建美好的回忆
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* 树洞倾诉标签页 */}
      <Box sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            {memoryEntries.map((memory, index) => (
              
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: theme.shadows[2],
                    mb: 3,
                    background: `linear-gradient(135deg, ${emotionColors[memory.emotion]}15, ${theme.palette.background.paper})`,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar
                        sx={{
                          backgroundColor: emotionColors[memory.emotion],
                          mr: 2,
                        }}
                      >
                        {emotionIcons[memory.emotion]}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ lineHeight: 1.6, mb: 1 }}>
                          {memory.content}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(memory.timestamp).toLocaleString('zh-CN')}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Chip
                        label={emotionLabels[memory.emotion]}
                        size="small"
                        sx={{
                          backgroundColor: emotionColors[memory.emotion],
                          color: 'white',
                        }}
                      />
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleLikeMemory(memory.id)}
                          color={memory.likes.includes(user?.id || '') ? 'error' : 'default'}
                        >
                          {memory.likes.includes(user?.id || '') ? (
                            <FavoriteIcon />
                          ) : (
                            <FavoriteBorderIcon />
                          )}
                        </IconButton>
                        <Typography variant="body2" color="text.secondary">
                          {memory.likes.length}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
            ))}

            {memoryEntries.length === 0 && !loading && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <PsychologyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  树洞空空如也
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  写下你的心声，让树洞倾听
                </Typography>
              </Box>
            )}
          </Grid>

          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, borderRadius: 3, position: 'sticky', top: 100 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                写下心声
              </Typography>
              
              <TextField
                multiline
                rows={4}
                fullWidth
                placeholder="在这里写下你的心情、想法或任何想说的话..."
                value={newMemoryContent}
                onChange={(e) => setNewMemoryContent(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                选择情绪
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {Object.entries(emotionLabels).map(([key, label]) => (
                  <Chip
                    key={key}
                    label={label}
                    clickable
                    color={newMemoryEmotion === key ? 'primary' : 'default'}
                    onClick={() => setNewMemoryEmotion(key)}
                    sx={{
                      backgroundColor: newMemoryEmotion === key ? emotionColors[key] : undefined,
                      color: newMemoryEmotion === key ? 'white' : undefined,
                    }}
                  />
                ))}
              </Box>

              <Button
                variant="contained"
                fullWidth
                onClick={handleCreateMemory}
                disabled={!newMemoryContent.trim()}
                sx={{ borderRadius: 2 }}
              >
                发布到树洞
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* 情绪统计标签页 */}
      <Box sx={{ display: activeTab === 2 ? 'block' : 'none' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: theme.shadows[2],
                height: '100%',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                  情绪分布
                </Typography>
                
                {Object.keys(getEmotionStats()).length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {Object.entries(getEmotionStats())
                      .sort(([, a], [, b]) => b - a)
                      .map(([emotion, count]) => (
                        <Box key={emotion} sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: emotionColors[emotion],
                                mr: 2,
                              }}
                            />
                            <Typography variant="body2" sx={{ minWidth: 60 }}>
                              {emotionLabels[emotion]}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'right' }}>
                            {count}次
                          </Typography>
                        </Box>
                      ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    暂无情绪统计
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: theme.shadows[2],
                height: '100%',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                  情绪洞察
                </Typography>
                
                {emotionRecords.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                        {emotionRecords.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        总记录数
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                        主要情绪
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {getTopEmotions().map(emotion => (
                          <Chip
                            key={emotion}
                            label={emotionLabels[emotion]}
                            sx={{
                              backgroundColor: emotionColors[emotion],
                              color: 'white',
                            }}
                          />
                        ))}
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                        记录周期
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {emotionRecords.length > 0 && 
                          `从 ${new Date(Math.min(...emotionRecords.map(r => r.timestamp))).toLocaleDateString('zh-CN')} 至今`
                        }
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    暂无情绪数据
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}