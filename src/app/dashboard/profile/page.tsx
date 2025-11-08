'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Switch,
  FormControlLabel,
  FormGroup,
  Divider,
  useTheme,
  useMediaQuery,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Storage as StorageIcon,
  Devices as DevicesIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Psychology as PsychologyIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store/auth-store';
import { indexedDBStorage } from '@/lib/storage/indexedDB';
import { User } from '@/types';

interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  language: string;
  reminderTime: string;
  dataRetention: number; // 数据保留天数
  emotionGuidancePriority: string[]; // 情绪疏导方法优先级
  emotionGuidanceRejectionLimit: number; // 连续否定次数阈值
  currentPriorityIndex: number; // 当前优先级索引
  rejectionCount: number; // 当前方法被否定次数
}

export default function ProfilePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, updateUser } = useAuthStore();
  
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'auto',
    notifications: true,
    language: 'zh-CN',
    reminderTime: '20:00',
    dataRetention: 365,
    emotionGuidancePriority: ['music', 'breathing', 'meditation', 'gratitude', 'visualization'],
    emotionGuidanceRejectionLimit: 3,
    currentPriorityIndex: 0,
    rejectionCount: 0,
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editField, setEditField] = useState('');
  const [editValue, setEditValue] = useState('');
  const [storageInfo, setStorageInfo] = useState({
    emotions: 0,
    pressures: 0,
    tools: 0,
    total: 0,
  });
  const [compatibility, setCompatibility] = useState({
    indexedDB: false,
    serviceWorker: false,
    touch: false,
    responsive: true,
  });

  // 加载用户设置和存储信息
  useEffect(() => {
    loadUserSettings();
    loadStorageInfo();
    checkCompatibility();
  }, []);

  const loadUserSettings = async () => {
    try {
      if (user?.id) {
        const savedSettings = await indexedDBStorage.get<UserSettings>('userSettings', user.id);
        if (savedSettings) {
          setSettings(savedSettings);
        }
      }
    } catch (err) {
      console.error('加载用户设置失败:', err);
    }
  };

  const loadStorageInfo = async () => {
    try {
      if (user?.id) {
        const emotions = await indexedDBStorage.getByIndex('emotions', 'userId', user.id);
        const pressures = await indexedDBStorage.getByIndex('pressureAssessments', 'userId', user.id);
        const tools = await indexedDBStorage.getByIndex('psychologicalTools', 'userId', user.id);
        
        setStorageInfo({
          emotions: emotions.length,
          pressures: pressures.length,
          tools: tools.length,
          total: emotions.length + pressures.length + tools.length,
        });
      }
    } catch (err) {
      console.error('加载存储信息失败:', err);
    }
  };

  const checkCompatibility = () => {
    setCompatibility({
      indexedDB: 'indexedDB' in window,
      serviceWorker: 'serviceWorker' in navigator,
      touch: 'ontouchstart' in window,
      responsive: true, // 通过CSS媒体查询检测
    });
  };

  const saveSettings = async () => {
    try {
      if (user?.id) {
        await indexedDBStorage.update('userSettings', {
          userId: user.id,
          ...settings,
        });
        
        // 应用主题设置
        if (settings.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (settings.theme === 'light') {
          document.documentElement.classList.remove('dark');
        } else {
          // 自动模式 - 跟随系统
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      }
    } catch (err) {
      console.error('保存用户设置失败:', err);
    }
  };

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // 自动保存设置
    setTimeout(() => {
      if (user?.id) {
        indexedDBStorage.update('userSettings', {
          userId: user.id,
          ...newSettings,
        }).catch(console.error);
      }
    }, 500);
  };

  const openEditDialog = (field: string, value: string) => {
    setEditField(field);
    setEditValue(value);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editField === 'name' && user) {
      updateUser({
        ...user,
        profile: { ...user.profile, name: editValue }
      } as User);
    }
    setEditDialogOpen(false);
  };

  const clearData = async (type: string) => {
    if (confirm(`确定要清除所有${type}数据吗？此操作不可撤销。`)) {
      try {
        if (user?.id) {
          const records = await indexedDBStorage.getByIndex<{id: string}>('emotions', 'userId', user.id);
          for (const record of records) {
            await indexedDBStorage.delete('emotions', record.id);
          }
          await loadStorageInfo();
        }
      } catch (err) {
        console.error('清除数据失败:', err);
      }
    }
  };

  const MotionCard = motion(Card);

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      {/* 页面标题 */}
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        个人资料
      </Typography>

      <Grid container spacing={3}>
        {/* 用户信息卡片 */}
        <Grid item xs={12} lg={4}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{
              borderRadius: 3,
              boxShadow: theme.shadows[2],
              mb: 3,
            }}
          >
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 2,
                  backgroundColor: 'primary.main',
                }}
              >
                <PersonIcon sx={{ fontSize: 40 }} />
              </Avatar>
              
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                {user?.profile.name || '用户'}
              </Typography>
              
              <Chip
                label={user?.role === 'student' ? '学生' : user?.role === 'parent' ? '家长' : '教师'}
                color="primary"
                variant="outlined"
                sx={{ mb: 2 }}
              />
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                用户ID: {user?.id?.substring(0, 8)}...
              </Typography>

              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => openEditDialog('name', user?.profile.name || '')}
                fullWidth
              >
                编辑资料
              </Button>
            </CardContent>
          </MotionCard>

          {/* 设备兼容性检查 */}
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            sx={{
              borderRadius: 3,
              boxShadow: theme.shadows[2],
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DevicesIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  设备兼容性
                </Typography>
              </Box>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <StorageIcon color={compatibility.indexedDB ? 'success' : 'error'} />
                  </ListItemIcon>
                  <ListItemText
                    primary="本地存储"
                    secondary={compatibility.indexedDB ? '支持' : '不支持'}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <DevicesIcon color={compatibility.touch ? 'success' : 'error'} />
                  </ListItemIcon>
                  <ListItemText
                    primary="触摸支持"
                    secondary={compatibility.touch ? '支持' : '不支持'}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <DevicesIcon color={compatibility.responsive ? 'success' : 'error'} />
                  </ListItemIcon>
                  <ListItemText
                    primary="响应式设计"
                    secondary={compatibility.responsive ? '支持' : '不支持'}
                  />
                </ListItem>
              </List>

              <Alert severity="info" sx={{ mt: 2 }}>
                当前设备: {isMobile ? '移动端' : '桌面端'}
              </Alert>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* 设置选项 */}
        <Grid item xs={12} lg={8}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            sx={{
              borderRadius: 3,
              boxShadow: theme.shadows[2],
              mb: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                应用设置
              </Typography>

              <FormGroup>
                {/* 主题设置 */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PaletteIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      主题设置
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {[
                      { value: 'auto', label: '自动' },
                      { value: 'light', label: '浅色' },
                      { value: 'dark', label: '深色' },
                    ].map((themeOption) => (
                      <Chip
                        key={themeOption.value}
                        label={themeOption.label}
                        clickable
                        color={settings.theme === themeOption.value ? 'primary' : 'default'}
                        onClick={() => handleSettingChange('theme', themeOption.value)}
                        variant={settings.theme === themeOption.value ? 'filled' : 'outlined'}
                      />
                    ))}
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* 通知设置 */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications}
                      onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <NotificationsIcon sx={{ mr: 1, fontSize: 20 }} />
                      启用通知提醒
                    </Box>
                  }
                  sx={{ mb: 2 }}
                />

                {/* 语言设置 */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LanguageIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      语言设置
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {[
                      { value: 'zh-CN', label: '简体中文' },
                      { value: 'en-US', label: 'English' },
                    ].map((lang) => (
                      <Chip
                        key={lang.value}
                        label={lang.label}
                        clickable
                        color={settings.language === lang.value ? 'primary' : 'default'}
                        onClick={() => handleSettingChange('language', lang.value)}
                        variant={settings.language === lang.value ? 'filled' : 'outlined'}
                      />
                    ))}
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* 数据管理 */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <StorageIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      数据管理
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">情绪记录</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {storageInfo.emotions} 条
                        </Typography>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => clearData('情绪记录')}
                        >
                          清除
                        </Button>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">压力评估</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {storageInfo.pressures} 条
                        </Typography>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => clearData('压力评估')}
                        >
                          清除
                        </Button>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">工具使用</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {storageInfo.tools} 条
                        </Typography>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => clearData('工具使用')}
                        >
                          清除
                        </Button>
                      </Box>
                    </Box>
                  </Box>

                  <Alert severity="info" sx={{ mt: 2 }}>
                    总计 {storageInfo.total} 条记录
                  </Alert>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* 数据保留设置 */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                    数据保留期限
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {[
                      { value: 30, label: '30天' },
                      { value: 90, label: '90天' },
                      { value: 365, label: '1年' },
                      { value: 0, label: '永久' },
                    ].map((option) => (
                      <Chip
                        key={option.value}
                        label={option.label}
                        clickable
                        color={settings.dataRetention === option.value ? 'primary' : 'default'}
                        onClick={() => handleSettingChange('dataRetention', option.value)}
                        variant={settings.dataRetention === option.value ? 'filled' : 'outlined'}
                      />
                    ))}
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* 情绪疏导优先级设置 */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PsychologyIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      情绪疏导方法优先级
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    设置情绪疏导方法的推荐顺序。当优先级1的方法连续被否定
                    <TextField
                      size="small"
                      type="number"
                      value={settings.emotionGuidanceRejectionLimit}
                      onChange={(e) => handleSettingChange('emotionGuidanceRejectionLimit', parseInt(e.target.value) || 3)}
                      sx={{ width: 60, mx: 1 }}
                    />
                    次后，将自动推荐优先级2的方法。
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                    {settings.emotionGuidancePriority.map((methodId, index) => {
                      const method = emotionGuidanceMethods.find(m => m.id === methodId);
                      return (
                        <Card key={methodId} variant="outlined" sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Chip
                                label={`优先级 ${index + 1}`}
                                color="primary"
                                size="small"
                                sx={{ mr: 2 }}
                              />
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  {method?.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {method?.description}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              {index > 0 && (
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    const newPriority = [...settings.emotionGuidancePriority];
                                    [newPriority[index], newPriority[index - 1]] = [newPriority[index - 1], newPriority[index]];
                                    handleSettingChange('emotionGuidancePriority', newPriority);
                                  }}
                                >
                                  <ArrowUpwardIcon fontSize="small" />
                                </IconButton>
                              )}
                              {index < settings.emotionGuidancePriority.length - 1 && (
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    const newPriority = [...settings.emotionGuidancePriority];
                                    [newPriority[index], newPriority[index + 1]] = [newPriority[index + 1], newPriority[index]];
                                    handleSettingChange('emotionGuidancePriority', newPriority);
                                  }}
                                >
                                  <ArrowDownwardIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          </Box>
                        </Card>
                      );
                    })}
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      // 重置优先级设置
                      handleSettingChange('emotionGuidancePriority', ['music', 'breathing', 'meditation', 'gratitude', 'visualization']);
                      handleSettingChange('currentPriorityIndex', 0);
                      handleSettingChange('rejectionCount', 0);
                    }}
                  >
                    重置为默认顺序
                  </Button>
                </Box>
              </FormGroup>

              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={saveSettings}
                sx={{ mt: 2 }}
              >
                保存设置
              </Button>
            </CardContent>
          </MotionCard>

          {/* 优化建议 */}
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            sx={{
              borderRadius: 3,
              boxShadow: theme.shadows[2],
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                优化建议
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <DevicesIcon color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="响应式设计"
                    secondary="应用已适配各种屏幕尺寸，确保在手机、平板和电脑上都有良好体验"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <StorageIcon color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="离线功能"
                    secondary="所有数据本地存储，支持离线使用，网络恢复后自动同步"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="隐私保护"
                    secondary="数据存储在本地设备，不会上传到服务器，保护用户隐私"
                  />
                </ListItem>
              </List>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>

      {/* 编辑对话框 */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>编辑{editField === 'name' ? '姓名' : '信息'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={editField === 'name' ? '姓名' : '值'}
            fullWidth
            variant="outlined"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>取消</Button>
          <Button onClick={handleSaveEdit}>保存</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// 添加Grid组件导入
import Grid from '@mui/material/Grid';

// 情绪疏导方法配置
const emotionGuidanceMethods = [
{ id: 'music', name: '听音乐', description: '通过音乐放松心情' },
{ id: 'breathing', name: '呼吸练习', description: '深呼吸缓解紧张' },
{ id: 'meditation', name: '正念冥想', description: '专注当下，平静心灵' },
{ id: 'gratitude', name: '感恩练习', description: '记录感恩事项培养积极心态' },
{ id: 'visualization', name: '积极想象', description: '想象美好场景提升情绪' },
{ id: 'movie', name: '看电影', description: '通过影片转移注意力' },
{ id: 'exercise', name: '轻度运动', description: '活动身体释放压力' },
{ id: 'writing', name: '情绪写作', description: '通过书写表达情感' },
];