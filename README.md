# React Native 极简手机App框架

这是一个专为比赛场景设计的极简手机App框架，支持通过编辑JSON文件快速修改页面布局和内容，无需编写代码即可完成App定制。

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- React Native CLI
- Android Studio (Android开发) 或 Xcode (iOS开发)

### 安装和运行
```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 运行应用 (新开终端)
npm run android   # Android
npm run ios       # iOS
```

## 📁 项目结构

```
mobile-app-framework/
├── pages/                    # 页面配置文件
│   ├── home.json            # 首页配置
│   └── profile.json         # 个人资料页配置
├── src/
│   ├── App.js               # 应用主入口
│   └── PageRenderer.js      # 页面渲染引擎
├── quick-edit-guide.md      # 快速编辑指南
├── package.json             # 项目配置
├── index.js                 # 应用入口
└── app.json                 # 应用信息
```

## ✨ 核心特性

### 1. JSON配置驱动
- 每个页面一个JSON文件
- 修改JSON即可更新App内容
- 无需编写React代码

### 2. 支持组件类型
- **text** - 文本显示
- **image** - 图片显示  
- **button** - 按钮交互
- **container** - 布局容器
- **scrollview** - 滚动视图

### 3. 完整样式支持
- 支持所有React Native样式属性
- 内联样式定义
- 响应式布局

## 🎯 快速编辑指南

### 修改页面内容
编辑 `pages/` 目录下的JSON文件：

```json
// 修改文本内容
{
  "type": "text",
  "content": "你的新文本",
  "style": {
    "fontSize": 18,
    "color": "#333333"
  }
}

// 修改图片
{
  "type": "image", 
  "source": "https://你的图片URL",
  "style": {
    "width": "100%",
    "height": 200
  }
}

// 添加按钮
{
  "type": "button",
  "text": "点击我",
  "action": "navigate",
  "target": "目标页面"
}
```

### 添加新页面
1. 在 `pages/` 目录创建新的JSON文件
2. 在 `src/App.js` 中导入并添加到页面映射
3. 在其他页面添加导航按钮

## 📋 比赛场景快速模板

### 信息展示页面
```json
{
  "name": "比赛信息",
  "components": [
    {
      "type": "scrollview",
      "children": [
        {
          "type": "container",
          "style": {"padding": 20},
          "children": [
            {
              "type": "text",
              "content": "比赛标题",
              "style": {"fontSize": 24, "fontWeight": "bold", "textAlign": "center"}
            },
            {
              "type": "text",
              "content": "比赛描述内容...",
              "style": {"fontSize": 16, "marginTop": 16, "lineHeight": 24}
            }
          ]
        }
      ]
    }
  ]
}
```

### 列表展示页面
```json
{
  "name": "参赛列表", 
  "components": [
    {
      "type": "scrollview",
      "children": [
        {
          "type": "container",
          "style": {"backgroundColor": "#ffffff"},
          "children": [
            {
              "type": "text",
              "content": "参赛者1",
              "style": {"padding": 16, "borderBottomWidth": 1, "borderBottomColor": "#f0f0f0"}
            },
            {
              "type": "text",
              "content": "参赛者2",
              "style": {"padding": 16, "borderBottomWidth": 1, "borderBottomColor": "#f0f0f0"}  
            }
          ]
        }
      ]
    }
  ]
}
```

## 🛠 开发命令

- `npm start` - 启动开发服务器
- `npm run android` - 运行Android应用
- `npm run ios` - 运行iOS应用  
- `npm test` - 运行测试
- `npm run lint` - 代码检查

## 📖 详细文档

查看 [`quick-edit-guide.md`](quick-edit-guide.md) 获取完整的编辑指南和组件参考。

## 💡 使用技巧

1. **实时预览** - 修改JSON后重新加载App即可看到变化
2. **网络图片** - 确保图片URL可公开访问
3. **样式调试** - 使用内联样式快速调整布局
4. **组件嵌套** - 使用container组件组织复杂布局

## 🔧 扩展开发

如需添加自定义功能，可以修改：
- [`src/PageRenderer.js`](src/PageRenderer.js) - 添加新的组件类型
- [`src/App.js`](src/App.js) - 修改导航逻辑和应用配置

## 📄 许可证

MIT License