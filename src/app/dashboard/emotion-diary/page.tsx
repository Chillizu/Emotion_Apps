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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Mood as MoodIcon,
  SentimentVerySatisfied as HappyIcon,
  SentimentSatisfied as SatisfiedIcon,
  SentimentNeutral as NeutralIcon,
  SentimentDissatisfied as DissatisfiedIcon,
  SentimentVeryDissatisfied as SadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  BarChart as ChartIcon,
  Photo as PhotoIcon,
  Videocam as VideoIcon,
  Brush as BrushIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAuthStore } from '@/lib/store/auth-store';
import { indexedDBStorage, EmotionRecord } from '@/lib/storage/indexedDB';
import { alpha } from '@mui/system';

// 情绪选项配置
const emotionOptions = [
  { value: 'happy', label: '开心', icon: <HappyIcon />, color: '#4CAF50' },
  { value: 'satisfied', label: '满意', icon: <SatisfiedIcon />, color: '#8BC34A' },
  { value: 'neutral', label: '平静', icon: <NeutralIcon />, color: '#FFC107' },
  { value: 'dissatisfied', label: '不满', icon: <DissatisfiedIcon />, color: '#FF9800' },
  { value: 'sad', label: '悲伤', icon: <SadIcon />, color: '#F44336' },
  { value: 'angry', label: '愤怒', icon: <SadIcon />, color: '#D32F2F' },
  { value: 'anxious', label: '焦虑', icon: <DissatisfiedIcon />, color: '#7B1FA2' },
  { value: 'excited', label: '兴奋', icon: <HappyIcon />, color: '#2196F3' },
];

// 标签选项
const tagOptions = [
  '学习', '考试', '家庭', '朋友', '运动', '游戏', '休息', '饮食',
  '睡眠', '天气', '成绩', '社交', '娱乐', '健康', '其他'
];

interface MediaItem {
  type: 'image' | 'video' | 'drawing';
  data: string; // base64 data or URL
  thumbnail?: string;
}

interface EmotionFormData {
  emotion: string;
  intensity: number;
  description: string;
  tags: string[];
  media: MediaItem[];
}

export default function EmotionDiaryPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuthStore();
  
  const [records, setRecords] = useState<EmotionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<EmotionRecord | null>(null);
  const [formData, setFormData] = useState<EmotionFormData>({
    emotion: '',
    intensity: 5,
    description: '',
    tags: [],
    media: [],
  });
  const [error, setError] = useState('');

  // 加载情绪记录
  useEffect(() => {
    loadEmotionRecords();
  }, []);

  const loadEmotionRecords = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        const userRecords = await indexedDBStorage.getByIndex<EmotionRecord>(
          'emotions',
          'userId',
          user.id
        );
        // 按时间倒序排列
        const sortedRecords = userRecords.sort((a, b) => b.timestamp - a.timestamp);
        setRecords(sortedRecords);
      }
    } catch (err) {
      console.error('加载情绪记录失败:', err);
      setError('加载记录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 打开添加对话框
  const handleAddClick = () => {
    setEditingRecord(null);
    setFormData({
      emotion: '',
      intensity: 5,
      description: '',
      tags: [],
      media: [],
    });
    setDialogOpen(true);
    setError('');
  };

  // 打开编辑对话框
  const handleEditClick = (record: EmotionRecord) => {
    setEditingRecord(record);
    setFormData({
      emotion: record.emotion,
      intensity: record.intensity,
      description: record.description || '',
      tags: record.tags || [],
      media: record.media || [],
    });
    setDialogOpen(true);
    setError('');
  };

  // 保存情绪记录
  const handleSave = async () => {
    if (!formData.emotion) {
      setError('请选择一种情绪');
      return;
    }

    try {
      const record: Omit<EmotionRecord, 'id'> = {
        userId: user?.id || '',
        emotion: formData.emotion,
        intensity: formData.intensity,
        description: formData.description,
        tags: formData.tags,
        media: formData.media,
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now(),
      };

      if (editingRecord) {
        // 更新记录
        await indexedDBStorage.update('emotions', {
          ...record,
          id: editingRecord.id,
        });
      } else {
        // 新增记录
        await indexedDBStorage.add('emotions', {
          ...record,
          id: `emotion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        });
      }

      setDialogOpen(false);
      await loadEmotionRecords();
    } catch (err) {
      console.error('保存情绪记录失败:', err);
      setError('保存失败，请重试');
    }
  };

  // 删除情绪记录
  const handleDelete = async (recordId: string) => {
    if (confirm('确定要删除这条情绪记录吗？')) {
      try {
        await indexedDBStorage.delete('emotions', recordId);
        await loadEmotionRecords();
      } catch (err) {
        console.error('删除情绪记录失败:', err);
        setError('删除失败，请重试');
      }
    }
  };

  // 获取情绪配置
  const getEmotionConfig = (emotionValue: string) => {
    return emotionOptions.find(opt => opt.value === emotionValue) || emotionOptions[0];
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (dateString === today) return '今天';
    if (dateString === yesterday) return '昨天';
    
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  // 计算情绪统计
  const emotionStats = records.reduce((acc, record) => {
    const emotion = record.emotion;
    if (!acc[emotion]) {
      acc[emotion] = 0;
    }
    acc[emotion]++;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      {/* 页面标题和操作按钮 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          情绪日记
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          sx={{
            borderRadius: 3,
            px: 3,
            py: 1,
          }}
        >
          记录心情
        </Button>
      </Box>

      {/* 错误提示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 情绪统计卡片 */}
        <Grid item xs={12} lg={4}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: theme.shadows[2],
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <ChartIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  情绪统计
                </Typography>
              </Box>

              {Object.keys(emotionStats).length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {Object.entries(emotionStats)
                    .sort(([, a], [, b]) => b - a)
                    .map(([emotion, count]) => {
                      const config = getEmotionConfig(emotion);
                      return (
                        <Box
                          key={emotion}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 1,
                            borderRadius: 2,
                            backgroundColor: alpha(config.color, 0.1),
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                backgroundColor: config.color,
                                mr: 2,
                              }}
                            >
                              {config.icon}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: '500' }}>
                              {config.label}
                            </Typography>
                          </Box>
                          <Chip
                            label={count}
                            size="small"
                            sx={{
                              backgroundColor: config.color,
                              color: 'white',
                              fontWeight: 'bold',
                            }}
                          />
                        </Box>
                      );
                    })}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  暂无情绪记录
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 情绪记录列表 */}
        <Grid item xs={12} lg={8}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: theme.shadows[2],
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                最近记录
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : records.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {records.map((record, index) => {
                      const config = getEmotionConfig(record.emotion);
                      return (
                        <Card
                          key={record.id}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: `1px solid ${theme.palette.divider}`,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: theme.shadows[4],
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                              <Avatar
                                sx={{
                                  width: 48,
                                  height: 48,
                                  backgroundColor: config.color,
                                  mr: 2,
                                }}
                              >
                                {config.icon}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                  <Typography variant="h6" sx={{ fontWeight: 'bold', mr: 2 }}>
                                    {config.label}
                                  </Typography>
                                  <Chip
                                    label={`强度: ${record.intensity}`}
                                    size="small"
                                    variant="outlined"
                                  />
                                </Box>
                                {record.description && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {record.description}
                                  </Typography>
                                )}
                                {record.tags && record.tags.length > 0 && (
                                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
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

                                {/* 显示媒体附件 */}
                                {record.media && record.media.length > 0 && (
                                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                    {record.media.map((media, mediaIndex) => (
                                      <Box
                                        key={mediaIndex}
                                        sx={{
                                          width: 60,
                                          height: 60,
                                          borderRadius: 1,
                                          overflow: 'hidden',
                                          border: `1px solid ${theme.palette.divider}`,
                                          cursor: 'pointer',
                                          '&:hover': {
                                            opacity: 0.8,
                                          },
                                        }}
                                        onClick={() => {
                                          // 点击预览媒体
                                          if (media.type === 'image') {
                                            window.open(media.data, '_blank');
                                          } else if (media.type === 'video') {
                                            window.open(media.data, '_blank');
                                          }
                                        }}
                                      >
                                        {media.type === 'image' && (
                                          <img
                                            src={media.data}
                                            alt={`附件 ${mediaIndex + 1}`}
                                            style={{
                                              width: '100%',
                                              height: '100%',
                                              objectFit: 'cover',
                                            }}
                                          />
                                        )}
                                        {media.type === 'video' && (
                                          <video
                                            src={media.data}
                                            style={{
                                              width: '100%',
                                              height: '100%',
                                              objectFit: 'cover',
                                            }}
                                          />
                                        )}
                                        {media.type === 'drawing' && (
                                          <Box
                                            sx={{
                                              width: '100%',
                                              height: '100%',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              backgroundColor: 'background.default',
                                            }}
                                          >
                                            <BrushIcon sx={{ color: 'text.secondary' }} />
                                          </Box>
                                        )}
                                      </Box>
                                    ))}
                                  </Box>
                                )}
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(record.date)} · {new Date(record.timestamp).toLocaleTimeString()}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditClick(record);
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(record.id);
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Box>
                        </Card>
                      );
                    })}
                  
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <MoodIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    还没有情绪记录
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    点击"记录心情"开始记录您的情绪变化
                  </Typography>
                  <Button variant="contained" onClick={handleAddClick}>
                    开始记录
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 情绪记录对话框 */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {editingRecord ? '编辑情绪记录' : '记录心情'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {/* 情绪选择 */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                选择情绪
              </Typography>
              <Grid container spacing={1}>
                {emotionOptions.map((emotion) => (
                  <Grid item xs={6} sm={4} key={emotion.value}>
                    <Card
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: formData.emotion === emotion.value 
                          ? `2px solid ${emotion.color}`
                          : '1px solid transparent',
                        backgroundColor: formData.emotion === emotion.value 
                          ? alpha(emotion.color, 0.1)
                          : 'transparent',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: alpha(emotion.color, 0.05),
                        },
                      }}
                      onClick={() => setFormData({ ...formData, emotion: emotion.value })}
                    >
                      <Box sx={{ color: emotion.color, mb: 1 }}>
                        {emotion.icon}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: '500' }}>
                        {emotion.label}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </FormControl>

            {/* 情绪强度 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                情绪强度: {formData.intensity}
              </Typography>
              <Slider
                value={formData.intensity}
                onChange={(_, value) => setFormData({ ...formData, intensity: value as number })}
                min={1}
                max={10}
                marks={[
                  { value: 1, label: '轻微' },
                  { value: 5, label: '中等' },
                  { value: 10, label: '强烈' },
                ]}
                valueLabelDisplay="auto"
              />
            </Box>

            {/* 描述 */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="心情描述（可选）"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{ mb: 3 }}
            />

            {/* 多媒体附件 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                添加附件（可选）
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<PhotoIcon />}
                  component="label"
                  size="small"
                >
                  上传图片
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const newMedia: MediaItem = {
                            type: 'image',
                            data: event.target?.result as string,
                          };
                          setFormData({
                            ...formData,
                            media: [...formData.media, newMedia],
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<VideoIcon />}
                  component="label"
                  size="small"
                >
                  上传视频
                  <input
                    type="file"
                    hidden
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const newMedia: MediaItem = {
                            type: 'video',
                            data: event.target?.result as string,
                          };
                          setFormData({
                            ...formData,
                            media: [...formData.media, newMedia],
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<BrushIcon />}
                  size="small"
                  onClick={() => {
                    // 这里可以打开涂鸦画板
                    alert('涂鸦功能将在后续版本中实现');
                  }}
                >
                  涂鸦
                </Button>
              </Box>

              {/* 预览附件 */}
              {formData.media.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.media.map((media, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: 'relative',
                        width: 80,
                        height: 80,
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      {media.type === 'image' && (
                        <img
                          src={media.data}
                          alt={`附件 ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      )}
                      {media.type === 'video' && (
                        <video
                          src={media.data}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      )}
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.7)',
                          },
                        }}
                        onClick={() => {
                          const newMedia = formData.media.filter((_, i) => i !== index);
                          setFormData({ ...formData, media: newMedia });
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* 标签选择 */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                选择标签（可选）
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {tagOptions.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    clickable
                    color={formData.tags.includes(tag) ? 'primary' : 'default'}
                    onClick={() => {
                      const newTags = formData.tags.includes(tag)
                        ? formData.tags.filter(t => t !== tag)
                        : [...formData.tags, tag];
                      setFormData({ ...formData, tags: newTags });
                    }}
                  />
                ))}
              </Box>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDialogOpen(false)}>
            取消
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={!formData.emotion}
          >
            {editingRecord ? '更新' : '保存'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
