'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  LinearProgress,
  Chip,
  Alert,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  alpha,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

import { useAuthStore } from '@/lib/store/auth-store';
import { indexedDBStorage, PressureAssessment } from '@/lib/storage/indexedDB';

// 压力评估问题
const pressureQuestions = [
  {
    id: 1,
    question: "最近一周，我感到紧张、焦虑或不安的频率如何？",
    options: [
      { value: 1, label: "几乎没有" },
      { value: 2, label: "偶尔" },
      { value: 3, label: "有时" },
      { value: 4, label: "经常" },
      { value: 5, label: "几乎总是" },
    ],
  },
  {
    id: 2,
    question: "我在学习或做作业时感到压力的程度？",
    options: [
      { value: 1, label: "完全没有压力" },
      { value: 2, label: "轻微压力" },
      { value: 3, label: "中等压力" },
      { value: 4, label: "较大压力" },
      { value: 5, label: "极大压力" },
    ],
  },
  {
    id: 3,
    question: "我因为压力而影响睡眠的情况？",
    options: [
      { value: 1, label: "从不影响" },
      { value: 2, label: "偶尔影响" },
      { value: 3, label: "有时影响" },
      { value: 4, label: "经常影响" },
      { value: 5, label: "严重影响" },
    ],
  },
  {
    id: 4,
    question: "我感到情绪低落或沮丧的频率？",
    options: [
      { value: 1, label: "几乎没有" },
      { value: 2, label: "偶尔" },
      { value: 3, label: "有时" },
      { value: 4, label: "经常" },
      { value: 5, label: "几乎总是" },
    ],
  },
  {
    id: 5,
    question: "我因为压力而感到身体不适（如头痛、胃痛等）？",
    options: [
      { value: 1, label: "从不" },
      { value: 2, label: "偶尔" },
      { value: 3, label: "有时" },
      { value: 4, label: "经常" },
      { value: 5, label: "总是" },
    ],
  },
  {
    id: 6,
    question: "我对未来感到担忧的程度？",
    options: [
      { value: 1, label: "完全不担忧" },
      { value: 2, label: "轻微担忧" },
      { value: 3, label: "中等担忧" },
      { value: 4, label: "比较担忧" },
      { value: 5, label: "极度担忧" },
    ],
  },
  {
    id: 7,
    question: "我感到难以集中注意力的频率？",
    options: [
      { value: 1, label: "几乎没有" },
      { value: 2, label: "偶尔" },
      { value: 3, label: "有时" },
      { value: 4, label: "经常" },
      { value: 5, label: "几乎总是" },
    ],
  },
  {
    id: 8,
    question: "我感到没有精力或疲惫的程度？",
    options: [
      { value: 1, label: "精力充沛" },
      { value: 2, label: "轻微疲惫" },
      { value: 3, label: "中等疲惫" },
      { value: 4, label: "比较疲惫" },
      { value: 5, label: "极度疲惫" },
    ],
  },
];

// 压力等级配置
const pressureLevels = [
  {
    min: 8,
    max: 16,
    level: "低压力",
    color: "#4CAF50",
    description: "您的压力水平在正常范围内，继续保持良好的生活习惯",
    suggestions: [
      "保持规律的作息时间",
      "适当进行体育锻炼",
      "培养兴趣爱好",
      "保持积极的社交活动",
    ],
  },
  {
    min: 17,
    max: 24,
    level: "中等压力",
    color: "#FFC107",
    description: "您感受到一定的压力，需要适当调整和放松",
    suggestions: [
      "学习时间管理技巧",
      "尝试深呼吸或冥想",
      "与朋友或家人交流感受",
      "适当减少不必要的任务",
    ],
  },
  {
    min: 25,
    max: 32,
    level: "较高压力",
    color: "#FF9800",
    description: "您的压力水平较高，需要认真对待并采取措施",
    suggestions: [
      "寻求老师或心理咨询师的帮助",
      "制定合理的学习计划",
      "保证充足的睡眠",
      "学习放松技巧如渐进性肌肉放松",
    ],
  },
  {
    min: 33,
    max: 40,
    level: "高压力",
    color: "#F44336",
    description: "您的压力水平很高，建议尽快寻求专业帮助",
    suggestions: [
      "立即联系心理咨询师",
      "与家长或老师沟通情况",
      "适当调整学习目标",
      "保证每天有放松时间",
    ],
  },
];

// 压力因素分析
const pressureFactors = [
  {
    id: "academic",
    name: "学业压力",
    description: "考试、作业、成绩等方面的压力",
  },
  {
    id: "social",
    name: "社交压力",
    description: "与同学、朋友、家人关系带来的压力",
  },
  {
    id: "future",
    name: "未来担忧",
    description: "对升学、就业等未来发展的担忧",
  },
  {
    id: "self",
    name: "自我要求",
    description: "对自己过高的期望和要求",
  },
  {
    id: "family",
    name: "家庭压力",
    description: "家庭期望或家庭关系带来的压力",
  },
];

export default function PressureAssessmentPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuthStore();
  
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<PressureAssessment | null>(null);
  const [history, setHistory] = useState<PressureAssessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  // 加载历史记录
  useEffect(() => {
    loadAssessmentHistory();
  }, []);

  const loadAssessmentHistory = async () => {
    try {
      if (user?.id) {
        const userAssessments = await indexedDBStorage.getByIndex<PressureAssessment>(
          'pressureAssessments',
          'userId',
          user.id
        );
        const sortedAssessments = userAssessments.sort((a, b) => b.timestamp - a.timestamp);
        setHistory(sortedAssessments);
      }
    } catch (err) {
      console.error('加载评估历史失败:', err);
    }
  };

  // 处理答案选择
  const handleAnswerSelect = (questionId: number, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // 下一步
  const handleNext = () => {
    if (activeStep < pressureQuestions.length - 1) {
      setActiveStep(prev => prev + 1);
    } else {
      calculateResult();
    }
  };

  // 上一步
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  // 重新开始
  const handleRestart = () => {
    setActiveStep(0);
    setAnswers({});
    setShowResult(false);
    setAssessmentResult(null);
    setError('');
  };

  // 计算评估结果
  const calculateResult = async () => {
    const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
    
    // 确定压力等级
    const level = pressureLevels.find(l => totalScore >= l.min && totalScore <= l.max) || pressureLevels[0];
    
    // 分析压力因素（基于问题类型）
    const factors: string[] = [];
    if (answers[2] >= 4) factors.push("学业压力");
    if (answers[4] >= 4) factors.push("社交压力");
    if (answers[6] >= 4) factors.push("未来担忧");
    if (answers[1] >= 4 || answers[3] >= 4) factors.push("自我要求");
    if (answers[5] >= 4) factors.push("家庭压力");

    const result: Omit<PressureAssessment, 'id'> = {
      userId: user?.id || '',
      score: totalScore,
      factors,
      suggestions: level.suggestions,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
    };

    try {
      setLoading(true);
      const recordId = await indexedDBStorage.add('pressureAssessments', {
        ...result,
        id: `pressure_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });

      setAssessmentResult({
        ...result,
        id: recordId,
      });
      setShowResult(true);
      await loadAssessmentHistory();
    } catch (err) {
      console.error('保存评估结果失败:', err);
      setError('保存结果失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 获取当前压力等级
  const getCurrentPressureLevel = (score: number) => {
    return pressureLevels.find(l => score >= l.min && score <= l.max) || pressureLevels[0];
  };

  // 删除评估记录
  const handleDeleteRecord = async (recordId: string) => {
    try {
      await indexedDBStorage.delete('pressureAssessments', recordId);
      await loadAssessmentHistory();
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
    } catch (err) {
      console.error('删除记录失败:', err);
      setError('删除失败，请重试');
    }
  };

  // 打开删除确认对话框
  const openDeleteDialog = (recordId: string) => {
    setRecordToDelete(recordId);
    setDeleteDialogOpen(true);
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      {/* 页面标题 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          压力评估
        </Typography>
        <Typography variant="body1" color="text.secondary">
          通过专业问卷评估您的压力水平，获取个性化建议
        </Typography>
      </Box>

      {/* 错误提示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 评估问卷和结果 */}
        <Grid item xs={12} lg={8}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: theme.shadows[2],
            }}
          >
            <CardContent sx={{ p: 3 }}>
              {!showResult ? (
                <>
                  {/* 进度指示器 */}
                  <Box sx={{ mb: 4 }}>
                    <Stepper activeStep={activeStep} alternativeLabel>
                      {pressureQuestions.map((question, index) => (
                        <Step key={question.id}>
                          <StepLabel>{`问题 ${index + 1}`}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                    <LinearProgress
                      variant="determinate"
                      value={((activeStep + 1) / pressureQuestions.length) * 100}
                      sx={{ mt: 2, height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  {/* 当前问题 */}
                  
                    <div key={activeStep}>
                      <FormControl component="fieldset" sx={{ width: '100%' }}>
                        <FormLabel component="legend" sx={{ mb: 3 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {pressureQuestions[activeStep].question}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            请根据您的实际情况选择最符合的选项
                          </Typography>
                        </FormLabel>
                        
                        <RadioGroup
                          value={answers[pressureQuestions[activeStep].id] || ''}
                          onChange={(e) => handleAnswerSelect(pressureQuestions[activeStep].id, parseInt(e.target.value))}
                        >
                          {pressureQuestions[activeStep].options.map((option) => (
                            <FormControlLabel
                              key={option.value}
                              value={option.value}
                              control={<Radio />}
                              label={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography variant="body1">{option.label}</Typography>
                                </Box>
                              }
                              sx={{
                                mb: 2,
                                p: 2,
                                borderRadius: 2,
                                border: `1px solid ${theme.palette.divider}`,
                                '&:hover': {
                                  backgroundColor: 'action.hover',
                                },
                              }}
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </div>

                  {/* 导航按钮 */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                      onClick={handleBack}
                      disabled={activeStep === 0}
                    >
                      上一步
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!answers[pressureQuestions[activeStep].id]}
                    >
                      {activeStep === pressureQuestions.length - 1 ? '完成评估' : '下一步'}
                    </Button>
                  </Box>
                </>
              ) : (
                /* 评估结果 */
                assessmentResult && (
                  <div>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                      <AnalyticsIcon
                        sx={{
                          fontSize: 64,
                          color: getCurrentPressureLevel(assessmentResult.score).color,
                          mb: 2,
                        }}
                      />
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                        评估完成
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        您的压力评估结果如下
                      </Typography>
                    </Box>

                    {/* 压力等级 */}
                    <Card
                      sx={{
                        p: 3,
                        mb: 3,
                        backgroundColor: alpha(getCurrentPressureLevel(assessmentResult.score).color, 0.1),
                        border: `1px solid ${getCurrentPressureLevel(assessmentResult.score).color}`,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: getCurrentPressureLevel(assessmentResult.score).color,
                            mr: 2,
                          }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          压力等级: {getCurrentPressureLevel(assessmentResult.score).level}
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        得分: <strong>{assessmentResult.score}</strong> / 40
                      </Typography>
                      <Typography variant="body2">
                        {getCurrentPressureLevel(assessmentResult.score).description}
                      </Typography>
                    </Card>

                    {/* 压力因素 */}
                    {assessmentResult.factors.length > 0 && (
                      <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                          主要压力因素
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {assessmentResult.factors.map((factor) => (
                            <Chip
                              key={factor}
                              label={factor}
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Card>
                    )}

                    {/* 建议 */}
                    <Card sx={{ p: 3, mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                        个性化建议
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {assessmentResult.suggestions.map((suggestion, index) => (
                          <Box
                            key={index}
                            sx={{ display: 'flex', alignItems: 'flex-start' }}
                          >
                            <CheckCircleIcon
                              sx={{ color: 'success.main', mr: 2, mt: 0.5 }}
                            />
                            <Typography variant="body1">{suggestion}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Card>

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                      <Button variant="outlined" onClick={handleRestart}>
                        重新评估
                      </Button>
                      <Button variant="contained" onClick={() => setShowResult(false)}>
                        查看历史
                      </Button>
                    </Box>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 历史记录和说明 */}
        <Grid item xs={12} lg={4}>
          {/* 评估说明 */}
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: theme.shadows[2],
              mb: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  评估说明
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                本评估基于专业心理学量表设计，帮助您了解当前的压力状况。请根据最近一周的真实感受作答。
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                {pressureLevels.map((level) => (
                  <Box
                    key={level.level}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 1,
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: alpha(level.color, 0.1),
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: level.color,
                        mr: 2,
                      }}
                    />
                    <Typography variant="body2">
                      {level.level}: {level.min}-{level.max}分
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* 历史记录 */}
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: theme.shadows[2],
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <HistoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  评估历史
                </Typography>
              </Box>

              {history.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {history.slice(0, 5).map((record, index) => (
                    <div key={record.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: `1px solid ${getCurrentPressureLevel(record.score).color}`,
                        }}
                      >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {getCurrentPressureLevel(record.score).level}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            得分: {record.score}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(record.date)}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => openDeleteDialog(record.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(record.score / 40) * 100}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: alpha(getCurrentPressureLevel(record.score).color, 0.2),
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getCurrentPressureLevel(record.score).color,
                          },
                        }}
                      />
                      </Card>
                    </div>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    暂无评估记录
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 删除确认对话框 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>删除记录</DialogTitle>
        <DialogContent>
          <Typography>确定要删除这条评估记录吗？此操作无法撤销。</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>取消</Button>
          <Button
            color="error"
            onClick={() => recordToDelete && handleDeleteRecord(recordToDelete)}
          >
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
