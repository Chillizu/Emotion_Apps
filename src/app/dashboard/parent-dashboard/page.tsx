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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  alpha,
} from '@mui/material';
import {
  FamilyRestroom as FamilyIcon,
  Mood as MoodIcon,
  Analytics as AnalyticsIcon,
  Psychology as PsychologyIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

import { useAuthStore } from '@/lib/store/auth-store';
import { indexedDBStorage, ParentMonitoringRecord } from '@/lib/storage/indexedDB';
import { EmotionRecord, PressureAssessment } from '@/lib/storage/indexedDB';

// 模拟学生数据（实际项目中应从服务器获取）
const mockStudents = [
  {
    id: 'student_1',
    name: '小明',
    grade: '五年级',
    age: 11,
    avatar: '/avatars/student1.png',
  },
  {
    id: 'student_2',
    name: '小红',
    grade: '四年级',
    age: 10,
    avatar: '/avatars/student2.png',
  },
  {
    id: 'student_3',
    name: '小华',
    grade: '六年级',
    age: 12,
    avatar: '/avatars/student3.png',
  },
];

// 情绪状态配置
const emotionStatus = {
  positive: { label: '积极', color: '#4CAF50', icon: '😊' },
  neutral: { label: '平稳', color: '#FFC107', icon: '😐' },
  negative: { label: '消极', color: '#F44336', icon: '😔' },
};

// 压力等级配置
const pressureLevels = [
  { min: 0, max: 16, level: '低压力', color: '#4CAF50', suggestions: ['保持良好作息', '适当运动'] },
  { min: 17, max: 24, level: '中等压力', color: '#FFC107', suggestions: ['适当休息', '寻求支持'] },
  { min: 25, max: 32, level: '较高压力', color: '#FF9800', suggestions: ['寻求专业帮助', '调整生活节奏'] },
  { min: 33, max: 40, level: '高压力', color: '#F44336', suggestions: ['立即寻求专业帮助', '调整学习计划'] },
];

interface StudentFormData {
  name: string;
  grade: string;
  age: number;
  relationship: string;
}

export default function ParentDashboardPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuthStore();
  
  const [students, setStudents] = useState(mockStudents);
  const [monitoringRecords, setMonitoringRecords] = useState<ParentMonitoringRecord[]>([]);
  const [studentEmotions, setStudentEmotions] = useState<Record<string, EmotionRecord[]>>({});
  const [studentPressures, setStudentPressures] = useState<Record<string, PressureAssessment[]>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    grade: '',
    age: 10,
    relationship: '子女',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // 加载监控数据
  useEffect(() => {
    loadMonitoringData();
  }, []);

  const loadMonitoringData = async () => {
    try {
      setLoading(true);
      
      // 加载监控记录
      if (user?.id) {
        const records = await indexedDBStorage.getByIndex<ParentMonitoringRecord>(
          'parentMonitoring',
          'parentId',
          user.id
        );
        setMonitoringRecords(records.sort((a, b) => b.timestamp - a.timestamp));
      }

      // 模拟加载学生情绪和压力数据
      const emotions: Record<string, EmotionRecord[]> = {};
      const pressures: Record<string, PressureAssessment[]> = {};

      for (const student of students) {
        // 模拟情绪数据
        emotions[student.id] = await generateMockEmotions(student.id);
        // 模拟压力数据
        pressures[student.id] = await generateMockPressures(student.id);
      }

      setStudentEmotions(emotions);
      setStudentPressures(pressures);
    } catch (err) {
      console.error('加载监控数据失败:', err);
      setError('加载数据失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 生成模拟情绪数据
  const generateMockEmotions = async (studentId: string): Promise<EmotionRecord[]> => {
    try {
      const existing = await indexedDBStorage.getByIndex<EmotionRecord>('emotions', 'userId', studentId);
      if (existing.length > 0) return existing;

      // 创建模拟数据
      const emotions = ['happy', 'satisfied', 'neutral', 'dissatisfied', 'sad'];
      const mockData: EmotionRecord[] = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        mockData.push({
          id: `emotion_${studentId}_${i}`,
          userId: studentId,
          emotion: emotions[Math.floor(Math.random() * emotions.length)],
          intensity: Math.floor(Math.random() * 10) + 1,
          description: '模拟情绪记录',
          date: date.toISOString().split('T')[0],
          timestamp: date.getTime(),
          tags: ['学习', '家庭', '朋友'].slice(0, Math.floor(Math.random() * 3) + 1),
        });
      }

      // 保存模拟数据
      for (const record of mockData) {
        await indexedDBStorage.add('emotions', record);
      }

      return mockData;
    } catch (err) {
      console.error('生成模拟情绪数据失败:', err);
      return [];
    }
  };

  // 生成模拟压力数据
  const generateMockPressures = async (studentId: string): Promise<PressureAssessment[]> => {
    try {
      const existing = await indexedDBStorage.getByIndex<PressureAssessment>('pressureAssessments', 'userId', studentId);
      if (existing.length > 0) return existing;

      // 创建模拟数据
      const mockData: PressureAssessment[] = [];
      
      for (let i = 0; i < 3; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i * 2);
        
        const score = Math.floor(Math.random() * 20) + 15; // 15-35分
        const level = pressureLevels.find(l => score >= l.min && score <= l.max) || pressureLevels[0];

        mockData.push({
          id: `pressure_${studentId}_${i}`,
          userId: studentId,
          score,
          factors: ['学业压力', '社交压力', '自我要求'].slice(0, Math.floor(Math.random() * 3) + 1),
          suggestions: level.suggestions || ['保持良好作息', '适当运动'],
          date: date.toISOString().split('T')[0],
          timestamp: date.getTime(),
        });
      }

      // 保存模拟数据
      for (const record of mockData) {
        await indexedDBStorage.add('pressureAssessments', record);
      }

      return mockData;
    } catch (err) {
      console.error('生成模拟压力数据失败:', err);
      return [];
    }
  };

  // 打开添加学生对话框
  const handleAddStudent = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      grade: '',
      age: 10,
      relationship: '子女',
    });
    setDialogOpen(true);
    setError('');
  };

  // 打开编辑学生对话框
  const handleEditStudent = (student: any) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      grade: student.grade,
      age: student.age,
      relationship: '子女',
    });
    setDialogOpen(true);
    setError('');
  };

  // 保存学生信息
  const handleSaveStudent = () => {
    if (!formData.name || !formData.grade) {
      setError('请填写完整信息');
      return;
    }

    if (editingStudent) {
      // 更新学生
      setStudents(prev => prev.map(s => 
        s.id === editingStudent.id 
          ? { ...s, ...formData }
          : s
      ));
    } else {
      // 添加新学生
      const newStudent = {
        id: `student_${Date.now()}`,
        ...formData,
        avatar: '/avatars/student_default.png',
      };
      setStudents(prev => [...prev, newStudent]);
    }

    setDialogOpen(false);
  };

  // 删除学生
  const handleDeleteStudent = (studentId: string) => {
    if (confirm('确定要删除这个学生的监控吗？')) {
      setStudents(prev => prev.filter(s => s.id !== studentId));
      // 同时删除相关数据
      indexedDBStorage.getByIndex<{id: string}>('emotions', 'userId', studentId).then(records => {
        records.forEach(record => {
          indexedDBStorage.delete('emotions', record.id);
        });
      });
      indexedDBStorage.getByIndex<{id: string}>('pressureAssessments', 'userId', studentId).then(records => {
        records.forEach(record => {
          indexedDBStorage.delete('pressureAssessments', record.id);
        });
      });
    }
  };

  // 获取学生情绪状态
  const getStudentEmotionStatus = (studentId: string) => {
    const emotions = studentEmotions[studentId] || [];
    if (emotions.length === 0) return emotionStatus.neutral;

    const recentEmotion = emotions[0];
    if (['happy', 'satisfied', 'excited'].includes(recentEmotion.emotion)) {
      return emotionStatus.positive;
    } else if (['sad', 'angry', 'anxious'].includes(recentEmotion.emotion)) {
      return emotionStatus.negative;
    } else {
      return emotionStatus.neutral;
    }
  };

  // 获取学生压力状态
  const getStudentPressureStatus = (studentId: string) => {
    const pressures = studentPressures[studentId] || [];
    if (pressures.length === 0) return pressureLevels[0];

    const recentPressure = pressures[0];
    return pressureLevels.find(level => 
      recentPressure.score >= level.min && recentPressure.score <= level.max
    ) || pressureLevels[0];
  };

  // 获取最近活动时间
  const getLastActivity = (studentId: string) => {
    const emotions = studentEmotions[studentId] || [];
    const pressures = studentPressures[studentId] || [];
    
    const allActivities = [...emotions, ...pressures];
    if (allActivities.length === 0) return '暂无活动';

    const latest = allActivities.sort((a, b) => b.timestamp - a.timestamp)[0];
    const date = new Date(latest.timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return '刚刚';
    if (diffHours < 24) return `${diffHours}小时前`;
    return `${Math.floor(diffHours / 24)}天前`;
  };

  // 格式化日期
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN');
  };

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      {/* 页面标题和操作按钮 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            家长监控
          </Typography>
          <Typography variant="body1" color="text.secondary">
            关注孩子的情绪状态和心理健康
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddStudent}
          sx={{
            borderRadius: 3,
            px: 3,
            py: 1,
          }}
        >
          添加学生
        </Button>
      </Box>

      {/* 错误提示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 学生概览卡片 */}
        {students.map((student, index) => {
          const emotionStatus = getStudentEmotionStatus(student.id);
          const pressureStatus = getStudentPressureStatus(student.id);
          const lastActivity = getLastActivity(student.id);

          return (
            <Grid item xs={12} md={6} lg={4} key={student.id}>
              <Card sx={{
                  borderRadius: 3,
                  boxShadow: theme.shadows[2],
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: theme.shadows[6],
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* 学生基本信息 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      sx={{ width: 60, height: 60, mr: 2 }}
                      src={student.avatar}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {student.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {student.grade} · {student.age}岁
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleEditStudent(student)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* 情绪状态 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: emotionStatus.color,
                        mr: 2,
                      }}
                    />
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      情绪状态: <strong>{emotionStatus.label}</strong>
                    </Typography>
                    <Typography variant="h6">
                      {emotionStatus.icon}
                    </Typography>
                  </Box>

                  {/* 压力水平 */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        压力水平: <strong>{pressureStatus.level}</strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {studentPressures[student.id]?.[0]?.score || 0}/40
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={((studentPressures[student.id]?.[0]?.score || 0) / 40) * 100}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: alpha(pressureStatus.color, 0.2),
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: pressureStatus.color,
                        },
                      }}
                    />
                  </Box>

                  {/* 最近活动 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <ScheduleIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      最近活动: {lastActivity}
                    </Typography>
                  </Box>

                  {/* 操作按钮 */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      onClick={() => {
                        // 查看详细情绪记录
                        console.log('查看情绪记录:', student.id);
                      }}
                    >
                      情绪记录
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      onClick={() => {
                        // 查看压力评估
                        console.log('查看压力评估:', student.id);
                      }}
                    >
                      压力评估
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}

        {/* 情绪趋势图表区域 */}
        <Grid item xs={12}>
          <Card sx={{
              borderRadius: 3,
              boxShadow: theme.shadows[2],
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                情绪趋势分析
              </Typography>
              
              {students.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>学生</TableCell>
                        <TableCell align="center">今日情绪</TableCell>
                        <TableCell align="center">压力水平</TableCell>
                        <TableCell align="center">最近记录</TableCell>
                        <TableCell align="center">情绪变化</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {students.map((student) => {
                        const emotionStatus = getStudentEmotionStatus(student.id);
                        const pressureStatus = getStudentPressureStatus(student.id);
                        const emotions = studentEmotions[student.id] || [];
                        const recentEmotion = emotions[0];

                        return (
                          <TableRow key={student.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar
                                  sx={{ width: 32, height: 32, mr: 2 }}
                                  src={student.avatar}
                                />
                                <Typography variant="body2" sx={{ fontWeight: '500' }}>
                                  {student.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={emotionStatus.label}
                                size="small"
                                sx={{
                                  backgroundColor: emotionStatus.color,
                                  color: 'white',
                                  fontWeight: 'bold',
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: pressureStatus.color,
                                    mr: 1,
                                  }}
                                />
                                <Typography variant="body2">
                                  {pressureStatus.level}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2">
                                {recentEmotion ? formatDate(recentEmotion.timestamp) : '无记录'}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <TrendingUpIcon
                                sx={{
                                  color: emotionStatus.color,
                                  transform: emotionStatus.label === '消极' ? 'rotate(180deg)' : 'none',
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
                  <FamilyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    暂无监控学生
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    点击"添加学生"开始监控孩子的心理健康状态
                  </Typography>
                  <Button variant="contained" onClick={handleAddStudent}>
                    添加学生
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 添加/编辑学生对话框 */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {editingStudent ? '编辑学生信息' : '添加监控学生'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="学生姓名"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            
            <FormControl fullWidth>
              <InputLabel>年级</InputLabel>
              <Select
                value={formData.grade}
                label="年级"
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              >
                <MenuItem value="一年级">一年级</MenuItem>
                <MenuItem value="二年级">二年级</MenuItem>
                <MenuItem value="三年级">三年级</MenuItem>
                <MenuItem value="四年级">四年级</MenuItem>
                <MenuItem value="五年级">五年级</MenuItem>
                <MenuItem value="六年级">六年级</MenuItem>
                <MenuItem value="初一">初一</MenuItem>
                <MenuItem value="初二">初二</MenuItem>
                <MenuItem value="初三">初三</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type="number"
              label="年龄"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 10 })}
              inputProps={{ min: 6, max: 18 }}
            />

            <FormControl fullWidth>
              <InputLabel>关系</InputLabel>
              <Select
                value={formData.relationship}
                label="关系"
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              >
                <MenuItem value="子女">子女</MenuItem>
                <MenuItem value="侄子/侄女">侄子/侄女</MenuItem>
                <MenuItem value="其他亲属">其他亲属</MenuItem>
                <MenuItem value="监护对象">监护对象</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDialogOpen(false)}>
            取消
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveStudent}
            disabled={!formData.name || !formData.grade}
          >
            {editingStudent ? '更新' : '添加'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
