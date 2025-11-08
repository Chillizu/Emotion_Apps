'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Paper,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  Settings as SettingsIcon,
  SmartToy as AIIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

import { useAuthStore } from '@/lib/store/auth-store';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AIConfig {
  url: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

// 默认的情绪陪聊系统提示词
const DEFAULT_SYSTEM_PROMPT = `你是一个专业的心理健康陪伴助手，专门为中小学生提供情绪支持和心理辅导。请遵循以下原则：

1. 使用温暖、关怀、理解的语言
2. 积极倾听，不随意打断
3. 提供建设性的建议，而不是简单的安慰
4. 帮助用户识别和表达情绪
5. 教授简单的情绪调节技巧
6. 保持专业但亲切的语气
7. 避免使用专业术语，用简单易懂的语言
8. 鼓励用户分享更多感受
9. 提供具体的、可操作的建议
10. 强调情绪的正常化和接纳

请用中文回复，保持回复长度适中（100-200字）。`;

const DEFAULT_CONFIG: AIConfig = {
  url: 'https://api.deepseek.com/chat/completions',
  apiKey: '',
  model: 'deepseek-chat',
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  temperature: 0.7,
  maxTokens: 1000,
};

export default function AIChatPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuthStore();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [config, setConfig] = useState<AIConfig>(DEFAULT_CONFIG);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // 从本地存储加载配置
  useEffect(() => {
    const savedConfig = localStorage.getItem('ai-chat-config');
    if (savedConfig) {
      setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(savedConfig) });
    }
  }, []);

  // 保存配置到本地存储
  const saveConfig = (newConfig: AIConfig) => {
    setConfig(newConfig);
    localStorage.setItem('ai-chat-config', JSON.stringify(newConfig));
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    try {
      // 构建请求数据
      const requestData = {
        model: config.model,
        messages: [
          {
            role: 'system',
            content: config.systemPrompt,
          },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          {
            role: 'user',
            content: inputMessage,
          },
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        stream: false,
      };

      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.choices[0]?.message?.content || '抱歉，我没有收到回复。',
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('AI聊天错误:', err);
      setError(err instanceof Error ? err.message : '未知错误');
      
      const errorMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: '抱歉，我暂时无法回复。请检查您的API配置或网络连接。',
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const generateCurlCommand = () => {
    const requestData = {
      model: config.model,
      messages: [
        {
          role: 'system',
          content: config.systemPrompt,
        },
        {
          role: 'user',
          content: '你好，请介绍一下你自己',
        },
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      stream: false,
    };

    return `curl ${config.url} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${config.apiKey}" \\
  -d '${JSON.stringify(requestData, null, 2)}'`;
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 页面标题和设置按钮 */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              AI情绪陪伴
            </Typography>
            <Typography variant="body2" color="text.secondary">
              专业的心理健康支持，24小时在线倾听
            </Typography>
          </Box>
          <IconButton onClick={() => setConfigDialogOpen(true)}>
            <SettingsIcon />
          </IconButton>
        </Box>
      </Box>

      {/* 聊天消息区域 */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <AIIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              欢迎使用AI情绪陪伴
            </Typography>
            <Typography variant="body2" color="text.secondary">
              我可以倾听您的心情，提供情绪支持和建议
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.map((message, index) => (
              
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                      alignItems: 'flex-start',
                      maxWidth: '70%',
                      gap: 1,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main',
                      }}
                    >
                      {message.role === 'user' ? <PersonIcon /> : <AIIcon />}
                    </Avatar>
                    <Card                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: message.role === 'user' ? 'primary.light' : 'background.paper',
                        color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
                        boxShadow: theme.shadows[1],
                      }}
                    >
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {message.content}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: 'block' }}>
                        {new Date(message.timestamp).toLocaleTimeString('zh-CN')}
                      </Typography>
                    </Card>
                  </Box>
                </Box>
              
            ))}
            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                    <AIIcon />
                  </Avatar>
                  <Card
                    sx={{ p: 2, borderRadius: 2 }}
                  >
                    <Typography variant="body1">正在思考中...</Typography>
                  </Card>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* 错误提示 */}
      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* 输入区域 */}
      <Paper sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            variant="outlined"
            placeholder="告诉我您的心情..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            sx={{ minWidth: 'auto' }}
          >
            发送
          </Button>
        </Box>
      </Paper>

      {/* 配置对话框 */}
      <Dialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>AI聊天配置</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="API URL"
              value={config.url}
              onChange={(e) => saveConfig({ ...config, url: e.target.value })}
              fullWidth
            />
            <TextField
              label="API密钥"
              type="password"
              value={config.apiKey}
              onChange={(e) => saveConfig({ ...config, apiKey: e.target.value })}
              fullWidth
              placeholder="请输入您的API密钥"
            />
            <TextField
              label="模型名称"
              value={config.model}
              onChange={(e) => saveConfig({ ...config, model: e.target.value })}
              fullWidth
            />
            <TextField
              label="系统提示词"
              multiline
              rows={6}
              value={config.systemPrompt}
              onChange={(e) => saveConfig({ ...config, systemPrompt: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>温度</InputLabel>
              <Select
                value={config.temperature}
                label="温度"
                onChange={(e) => saveConfig({ ...config, temperature: Number(e.target.value) })}
              >
                <MenuItem value={0.1}>0.1 (保守)</MenuItem>
                <MenuItem value={0.3}>0.3 (稳定)</MenuItem>
                <MenuItem value={0.7}>0.7 (平衡)</MenuItem>
                <MenuItem value={1.0}>1.0 (创意)</MenuItem>
                <MenuItem value={1.5}>1.5 (随机)</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="最大令牌数"
              type="number"
              value={config.maxTokens}
              onChange={(e) => saveConfig({ ...config, maxTokens: Number(e.target.value) })}
              fullWidth
            />

            {/* 生成的curl命令 */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                生成的curl命令
              </Typography>
              <Paper
                variant="outlined"
                sx={{ p: 2, backgroundColor: 'background.default', fontFamily: 'monospace', fontSize: '0.8rem' }}
              >
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {generateCurlCommand()}
                </pre>
              </Paper>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>取消</Button>
          <Button
            variant="contained"
            onClick={() => {
              setConfigDialogOpen(false);
              setError('');
            }}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}