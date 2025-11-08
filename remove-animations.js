// 移除所有页面中的动画效果脚本
// 这个脚本会移除 framer-motion 相关的导入和组件

const fs = require('fs');
const path = require('path');

// 要处理的文件列表
const filesToProcess = [
  'src/app/dashboard/emotion-diary/page.tsx',
  'src/app/dashboard/reports/page.tsx',
  'src/app/dashboard/community/page.tsx',
  'src/app/dashboard/ai-chat/page.tsx',
  'src/app/dashboard/memory/page.tsx',
  'src/app/dashboard/pressure-assessment/page.tsx',
  'src/app/dashboard/psychological-tools/page.tsx',
  'src/app/dashboard/parent-dashboard/page.tsx',
  'src/components/layout/DashboardLayout.tsx',
  'src/components/music/MusicPlayer.tsx'
];

// 替换规则
const replacements = [
  // 移除 framer-motion 导入
  {
    pattern: /import\s*{\s*[^}]*\bmotion\b[^}]*}\s*from\s*['"]framer-motion['"];?/g,
    replacement: ''
  },
  {
    pattern: /import\s*{\s*[^}]*\bAnimatePresence\b[^}]*}\s*from\s*['"]framer-motion['"];?/g,
    replacement: ''
  },
  
  // 移除 motion 组件
  {
    pattern: /const\s+MotionCard\s*=\s*motion\(Card[^;]*\);?/g,
    replacement: ''
  },
  {
    pattern: /const\s+MotionBox\s*=\s*motion\(Box[^;]*\);?/g,
    replacement: ''
  },
  {
    pattern: /const\s+MotionTypography\s*=\s*motion\(Typography[^;]*\);?/g,
    replacement: ''
  },
  
  // 替换 MotionCard 为 Card
  {
    pattern: /<MotionCard/g,
    replacement: '<Card'
  },
  {
    pattern: /<\/MotionCard>/g,
    replacement: '</Card>'
  },
  
  // 移除动画属性
  {
    pattern: /\s+initial=\{[^}]*\}/g,
    replacement: ''
  },
  {
    pattern: /\s+animate=\{[^}]*\}/g,
    replacement: ''
  },
  {
    pattern: /\s+transition=\{[^}]*\}/g,
    replacement: ''
  },
  {
    pattern: /\s+exit=\{[^}]*\}/g,
    replacement: ''
  },
  {
    pattern: /\s+whileHover=\{[^}]*\}/g,
    replacement: ''
  },
  {
    pattern: /\s+layoutId=[^ ]+/g,
    replacement: ''
  },
  {
    pattern: /\s+forwardMotionProps/g,
    replacement: ''
  },
  
  // 移除 StableAnimation 组件
  {
    pattern: /import\s*{\s*[^}]*\bStableAnimation\b[^}]*}\s*from\s*['"]@\/components\/animation\/StableAnimation['"];?/g,
    replacement: ''
  },
  {
    pattern: /<StableAnimation[^>]*>/g,
    replacement: ''
  },
  {
    pattern: /<\/StableAnimation>/g,
    replacement: ''
  },
  
  // 移除 AnimatePresence 组件
  {
    pattern: /<AnimatePresence[^>]*>/g,
    replacement: ''
  },
  {
    pattern: /<\/AnimatePresence>/g,
    replacement: ''
  }
];

// 处理文件
filesToProcess.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let originalContent = content;
    
    // 应用所有替换规则
    replacements.forEach(({ pattern, replacement }) => {
      content = content.replace(pattern, replacement);
    });
    
    // 清理多余的空行
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✓ 已处理: ${filePath}`);
    } else {
      console.log(`- 无需修改: ${filePath}`);
    }
  } else {
    console.log(`× 文件不存在: ${filePath}`);
  }
});

console.log('\n✅ 动画移除完成！');