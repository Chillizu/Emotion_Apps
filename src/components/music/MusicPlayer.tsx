'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Slider,
  Chip,
  useTheme,
  useMediaQuery,
  Collapse,
  Fab,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipNext as NextIcon,
  SkipPrevious as PrevIcon,
  VolumeUp as VolumeIcon,
  MusicNote as MusicIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

// 音乐库 - 使用无版权音乐或示例链接
const musicLibrary = [
  {
    id: 1,
    title: '宁静的清晨',
    artist: '自然之声',
    src: '/music/sample1.mp3', // 实际使用时需要提供音乐文件
    type: '纯音乐',
    duration: 180,
    mood: '平静',
  },
  {
    id: 2,
    title: '月光奏鸣曲',
    artist: '贝多芬',
    src: '/music/sample2.mp3',
    type: '古典音乐',
    duration: 240,
    mood: '放松',
  },
  {
    id: 3,
    title: '雨后彩虹',
    artist: '轻音乐团',
    src: '/music/sample3.mp3',
    type: '纯音乐',
    duration: 210,
    mood: '愉悦',
  },
  {
    id: 4,
    title: '森林漫步',
    artist: '自然之声',
    src: '/music/sample4.mp3',
    type: '环境音乐',
    duration: 195,
    mood: '专注',
  },
  {
    id: 5,
    title: '深海冥想',
    artist: '放松音乐',
    src: '/music/sample5.mp3',
    type: '冥想音乐',
    duration: 300,
    mood: '冥想',
  },
];

interface MusicPlayerProps {
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

export default function MusicPlayer({ isOpen = false, onToggle }: MusicPlayerProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [isExpanded, setIsExpanded] = useState(isOpen);

  const currentMusic = musicLibrary[currentTrack];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      handleNext();
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    setIsExpanded(isOpen);
  }, [isOpen]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(err => {
        console.error('播放失败:', err);
        // 在实际应用中，这里可以显示错误消息或使用备用音乐源
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentTrack((prev) => (prev + 1) % musicLibrary.length);
    setIsPlaying(true);
    setTimeout(() => {
      audioRef.current?.play().catch(console.error);
    }, 100);
  };

  const handlePrev = () => {
    setCurrentTrack((prev) => (prev - 1 + musicLibrary.length) % musicLibrary.length);
    setIsPlaying(true);
    setTimeout(() => {
      audioRef.current?.play().catch(console.error);
    }, 100);
  };

  const handleProgressChange = (event: Event, newValue: number | number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newProgress = Array.isArray(newValue) ? newValue[0] : newValue;
    const newTime = (newProgress / 100) * audio.duration;
    audio.currentTime = newTime;
    setProgress(newProgress);
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    const newVolume = Array.isArray(newValue) ? newValue[0] : newValue;
    setVolume(newVolume / 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleExpanded = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onToggle?.(newExpanded);
  };

  // 隐藏的音频元素
  const audioElement = (
    <audio
      ref={audioRef}
      src={currentMusic.src}
      preload="metadata"
      onPlay={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
    />
  );

  // 移动端简化版本
  if (isMobile) {
    return (
      <>
        {audioElement}
        <div
          style={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            zIndex: theme.zIndex.speedDial,
          }}
        >
          <Fab
            color="primary"
            onClick={toggleExpanded}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            <MusicIcon />
          </Fab>
        </div>

        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Paper
            sx={{
              position: 'fixed',
              bottom: 160,
              right: 16,
              left: 16,
              p: 2,
              borderRadius: 3,
              boxShadow: theme.shadows[8],
              zIndex: theme.zIndex.modal,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {currentMusic.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentMusic.artist}
                </Typography>
              </Box>
              <IconButton onClick={toggleExpanded} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Chip label={currentMusic.type} size="small" variant="outlined" />
              <Chip label={currentMusic.mood} size="small" variant="outlined" />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <IconButton onClick={handlePrev} size="small">
                <PrevIcon />
              </IconButton>
              <IconButton
                onClick={handlePlayPause}
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                }}
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </IconButton>
              <IconButton onClick={handleNext} size="small">
                <NextIcon />
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VolumeIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
              <Slider
                value={volume * 100}
                onChange={handleVolumeChange}
                size="small"
                sx={{ flex: 1 }}
              />
            </Box>
          </Paper>
        </Collapse>
      </>
    );
  }

  // 桌面端完整版本
  return (
    <>
      {audioElement}
      <div
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: theme.zIndex.speedDial,
        }}
      >
        <Paper
          sx={{
            p: 2,
            borderRadius: 3,
            boxShadow: theme.shadows[8],
            minWidth: 300,
            background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {currentMusic.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentMusic.artist}
              </Typography>
            </Box>
            <IconButton onClick={toggleExpanded} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Chip label={currentMusic.type} size="small" variant="outlined" />
            <Chip label={currentMusic.mood} size="small" variant="outlined" />
          </Box>

          {/* 进度条 */}
          <Box sx={{ mb: 2 }}>
            <Slider
              value={progress}
              onChange={handleProgressChange}
              sx={{
                color: 'primary.main',
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                {formatTime((progress / 100) * currentMusic.duration)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatTime(currentMusic.duration)}
              </Typography>
            </Box>
          </Box>

          {/* 控制按钮 */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <IconButton onClick={handlePrev}>
              <PrevIcon />
            </IconButton>
            <IconButton
              onClick={handlePlayPause}
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </IconButton>
            <IconButton onClick={handleNext}>
              <NextIcon />
            </IconButton>
          </Box>

          {/* 音量控制 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VolumeIcon sx={{ color: 'text.secondary' }} />
            <Slider
              value={volume * 100}
              onChange={handleVolumeChange}
              size="small"
              sx={{ flex: 1 }}
            />
          </Box>
        </Paper>
      </div>

      {/* 浮动按钮 */}
      {!isExpanded && (
        <div
          style={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: theme.zIndex.speedDial,
          }}
        >
          <Fab
            color="primary"
            onClick={toggleExpanded}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            <MusicIcon />
          </Fab>
        </div>
      )}
    </>
  );
}