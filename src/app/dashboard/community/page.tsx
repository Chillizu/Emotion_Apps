'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Fab,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  Comment as CommentIcon,
  Public as PublicIcon,
  Group as GroupIcon,
  EmojiEmotions as EmojiIcon,
} from '@mui/icons-material';

import { useAuthStore } from '@/lib/store/auth-store';
import { indexedDBStorage } from '@/lib/storage/indexedDB';

interface CommunityPost {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  emotion: string;
  images?: string[];
  createdAt: number;
  likes: string[];
  comments: Comment[];
  isPublic: boolean;
}

interface Comment {
  id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: number;
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

export default function CommunityPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState(0);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostEmotion, setNewPostEmotion] = useState('neutral');
  const [isPublic, setIsPublic] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      // 加载公开的帖子
      const publicPosts = await indexedDBStorage.getAll<CommunityPost>('communityPosts');
      setPosts(publicPosts.filter(post => post.isPublic).sort((a, b) => b.createdAt - a.createdAt));
    } catch (err) {
      console.error('加载社区帖子失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user || !newPostContent.trim()) return;

    try {
      const newPost: CommunityPost = {
        id: `post-${Date.now()}`,
        userId: user.id,
        username: user.username || '匿名用户',
        content: newPostContent,
        emotion: newPostEmotion,
        createdAt: Date.now(),
        likes: [],
        comments: [],
        isPublic,
      };

      await indexedDBStorage.add('communityPosts', newPost);
      setPosts(prev => [newPost, ...prev]);
      setNewPostContent('');
      setNewPostEmotion('neutral');
      setCreateDialogOpen(false);
    } catch (err) {
      console.error('创建帖子失败:', err);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const isLiked = post.likes.includes(user.id);
      const updatedLikes = isLiked
        ? post.likes.filter(id => id !== user.id)
        : [...post.likes, user.id];

      const updatedPost = { ...post, likes: updatedLikes };
      await indexedDBStorage.update('communityPosts', updatedPost);
      
      setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
    } catch (err) {
      console.error('点赞失败:', err);
    }
  };

  const handleAddComment = async (postId: string, content: string) => {
    if (!user || !content.trim()) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const newComment: Comment = {
        id: `comment-${Date.now()}`,
        userId: user.id,
        username: user.username || '匿名用户',
        content,
        createdAt: Date.now(),
      };

      const updatedPost = {
        ...post,
        comments: [...post.comments, newComment],
      };

      await indexedDBStorage.update('communityPosts', updatedPost);
      setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
    } catch (err) {
      console.error('添加评论失败:', err);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, md: 2 }, pb: 8 }}>
      {/* 页面标题 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          心情社区
        </Typography>
        <Typography variant="body1" color="text.secondary">
          与朋友们分享心情，互相支持鼓励
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
        <Tab label="全部动态" icon={<PublicIcon />} iconPosition="start" />
        <Tab label="好友动态" icon={<GroupIcon />} iconPosition="start" />
      </Tabs>

      {/* 帖子列表 */}
      <Grid container spacing={3}>
        {posts.map((post, index) => (
          <Grid item xs={12} key={post.id}>
            
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: theme.shadows[2],
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* 帖子头部 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={post.avatar}
                      sx={{ width: 40, height: 40, mr: 2 }}
                    >
                      {post.username.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {post.username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(post.createdAt).toLocaleString('zh-CN')}
                      </Typography>
                    </Box>
                    <Chip
                      label={emotionLabels[post.emotion]}
                      size="small"
                      sx={{
                        backgroundColor: emotionColors[post.emotion],
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                    />
                  </Box>

                  {/* 帖子内容 */}
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                    {post.content}
                  </Typography>

                  {/* 互动按钮 */}
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <IconButton
                      size="small"
                      onClick={() => handleLikePost(post.id)}
                      color={post.likes.includes(user?.id || '') ? 'error' : 'default'}
                    >
                      {post.likes.includes(user?.id || '') ? (
                        <FavoriteIcon />
                      ) : (
                        <FavoriteBorderIcon />
                      )}
                    </IconButton>
                    <Typography variant="body2" color="text.secondary">
                      {post.likes.length}
                    </Typography>

                    <IconButton size="small">
                      <CommentIcon />
                    </IconButton>
                    <Typography variant="body2" color="text.secondary">
                      {post.comments.length}
                    </Typography>

                    <IconButton size="small">
                      <ShareIcon />
                    </IconButton>
                  </Box>

                  {/* 评论区域 */}
                  {post.comments.length > 0 && (
                    <Box sx={{ mt: 2, p: 2, backgroundColor: 'background.default', borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                        评论 ({post.comments.length})
                      </Typography>
                      {post.comments.map(comment => (
                        <Box key={comment.id} sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: '500' }}>
                            {comment.username}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {comment.content}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(comment.createdAt).toLocaleString('zh-CN')}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            
          </Grid>
        ))}

        {posts.length === 0 && !loading && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <EmojiIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                暂无动态
              </Typography>
              <Typography variant="body2" color="text.secondary">
                成为第一个分享心情的人吧！
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* 创建帖子按钮 */}
      <Fab
        color="primary"
        aria-label="创建帖子"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* 创建帖子对话框 */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>分享心情</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            placeholder="分享您此刻的心情..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {Object.entries(emotionLabels).map(([key, label]) => (
              <Chip
                key={key}
                label={label}
                clickable
                color={newPostEmotion === key ? 'primary' : 'default'}
                onClick={() => setNewPostEmotion(key)}
                sx={{
                  backgroundColor: newPostEmotion === key ? emotionColors[key] : undefined,
                  color: newPostEmotion === key ? 'white' : undefined,
                }}
              />
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={() => setIsPublic(!isPublic)}
              color={isPublic ? 'primary' : 'default'}
            >
              {isPublic ? <PublicIcon /> : <GroupIcon />}
            </IconButton>
            <Typography variant="body2">
              {isPublic ? '公开分享' : '仅好友可见'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>取消</Button>
          <Button
            variant="contained"
            onClick={handleCreatePost}
            disabled={!newPostContent.trim()}
          >
            发布
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}