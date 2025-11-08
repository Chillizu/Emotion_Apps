# 极简App框架快速编辑指南

## 快速开始

### 1. 编辑页面内容
只需修改 `pages/` 目录下的JSON文件即可更新App内容：

```json
// pages/home.json
{
  "name": "首页",
  "components": [
    {
      "type": "text",
      "content": "你的文本内容",
      "style": {
        "fontSize": 16,
        "color": "#333333"
      }
    }
  ]
}
```

### 2. 可用的组件类型

#### 文本组件 (text)
```json
{
  "type": "text",
  "content": "显示的文字",
  "style": {
    "fontSize": 16,
    "color": "#333333",
    "textAlign": "center"
  }
}
```

#### 图片组件 (image)
```json
{
  "type": "image",
  "source": "https://example.com/image.jpg",
  "style": {
    "width": "100%",
    "height": 200,
    "borderRadius": 8
  }
}
```

#### 按钮组件 (button)
```json
{
  "type": "button",
  "text": "按钮文字",
  "action": "navigate",
  "target": "profile",
  "style": {
    "backgroundColor": "#007AFF",
    "padding": 16
  }
}
```

#### 容器组件 (container)
```json
{
  "type": "container",
  "style": {
    "padding": 16,
    "backgroundColor": "#ffffff"
  },
  "children": [
    // 在这里添加其他组件
  ]
}
```

#### 滚动视图 (scrollview)
```json
{
  "type": "scrollview",
  "style": {
    "backgroundColor": "#f5f5f5"
  },
  "children": [
    // 在这里添加可滚动的内容
  ]
}
```

### 3. 常用样式属性

#### 布局样式
```json
"style": {
  "padding": 16,
  "margin": 8,
  "backgroundColor": "#ffffff",
  "borderRadius": 8,
  "borderWidth": 1,
  "borderColor": "#e0e0e0"
}
```

#### 文本样式
```json
"style": {
  "fontSize": 16,
  "fontWeight": "bold",
  "color": "#333333",
  "textAlign": "center",
  "lineHeight": 24
}
```

#### 图片样式
```json
"style": {
  "width": "100%",
  "height": 200,
  "borderRadius": 8,
  "resizeMode": "cover"
}
```

### 4. 添加新页面

1. 在 `pages/` 目录创建新的JSON文件
2. 在 `src/App.js` 中导入并添加到页面映射
3. 在其他页面添加导航按钮指向新页面

### 5. 比赛快速编辑模板

#### 信息展示页面
```json
{
  "name": "信息页",
  "components": [
    {
      "type": "scrollview",
      "children": [
        {
          "type": "container",
          "style": {"padding": 20, "backgroundColor": "#ffffff"},
          "children": [
            {
              "type": "text",
              "content": "标题",
              "style": {"fontSize": 24, "fontWeight": "bold", "textAlign": "center"}
            },
            {
              "type": "text", 
              "content": "描述内容...",
              "style": {"fontSize": 16, "marginTop": 16}
            },
            {
              "type": "image",
              "source": "图片URL",
              "style": {"width": "100%", "height": 200, "marginTop": 16}
            }
          ]
        }
      ]
    }
  ]
}
```

#### 列表页面
```json
{
  "name": "列表页",
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
              "content": "项目1",
              "style": {"padding": 16, "borderBottomWidth": 1, "borderBottomColor": "#f0f0f0"}
            },
            {
              "type": "text",
              "content": "项目2", 
              "style": {"padding": 16, "borderBottomWidth": 1, "borderBottomColor": "#f0f0f0"}
            }
          ]
        }
      ]
    }
  ]
}
```

## 快速提示

1. **修改后立即生效** - 保存JSON文件后重新加载App即可看到变化
2. **使用网络图片** - 确保图片URL可访问
3. **样式继承** - 容器内的组件会继承容器的背景色等样式
4. **调试技巧** - 如果页面显示异常，检查JSON格式是否正确

## 常见问题

**Q: 如何更改页面背景色？**
A: 在scrollview的style中添加 `"backgroundColor": "你的颜色"`

**Q: 如何添加多个按钮？**
A: 在容器中按顺序添加多个button组件

**Q: 如何调整组件间距？**
A: 使用 `"marginBottom": 数值` 或 `"padding": 数值`