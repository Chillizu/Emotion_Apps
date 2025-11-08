# Android 模拟器测试指南

## 环境准备

### 1. 安装 Android Studio
下载并安装最新版 Android Studio：
- 官网：https://developer.android.com/studio
- 安装时选择默认组件，包括 Android SDK 和模拟器

### 2. 安装必要的 SDK 组件
打开 Android Studio，进入 SDK Manager：
- 确保安装 Android 11 (API 30) 或更高版本
- 安装 Android SDK Build-Tools
- 安装 Android Emulator
- 安装 Android SDK Platform-Tools

### 3. 创建 Android 虚拟设备 (AVD)
1. 打开 Android Studio
2. 点击 "Tools" → "AVD Manager"
3. 点击 "Create Virtual Device"
4. 选择设备类型（推荐 Pixel 4）
5. 选择系统镜像（推荐 Android 11，API 30）
6. 配置 AVD 名称和设置

## 配置项目环境

### 1. 检查环境变量
确保以下环境变量已设置：

```bash
# Windows 系统环境变量
ANDROID_HOME=C:\Users\你的用户名\AppData\Local\Android\Sdk
# 在 Path 中添加
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\emulator
```

### 2. 验证安装
打开命令提示符，运行以下命令验证：

```bash
# 检查 Java 版本
java -version

# 检查 Android SDK
adb version

# 列出所有 AVD
emulator -list-avds
```

## 启动和运行

### 1. 启动 Android 模拟器

**方法一：通过 Android Studio**
```bash
# 打开 AVD Manager 并启动模拟器
```

**方法二：通过命令行**
```bash
# 列出所有可用的 AVD
emulator -list-avds

# 启动特定的 AVD（替换 Your_AVD_Name）
emulator -avd Your_AVD_Name
```

**方法三：通过 React Native 命令**
```bash
# 启动模拟器并运行应用
npm run android
```

### 2. 运行 React Native 应用

```bash
# 1. 安装项目依赖
npm install

# 2. 启动 Metro 打包器（新终端窗口）
npm start

# 3. 在另一个终端窗口运行 Android 应用
npm run android
```

## 常见问题解决

### 1. 模拟器启动失败
**问题**: `emulator: ERROR: x86 emulation currently requires hardware acceleration`
**解决方案**:
- 启用 BIOS 中的虚拟化技术 (Intel VT-x 或 AMD-V)
- 安装 Intel HAXM（通过 Android Studio SDK Manager）

### 2. ADB 设备未识别
**问题**: `adb devices` 显示为空
**解决方案**:
```bash
# 重启 ADB 服务
adb kill-server
adb start-server

# 检查设备连接
adb devices
```

### 3. 端口占用问题
**问题**: Metro 打包器端口被占用
**解决方案**:
```bash
# 使用不同端口启动
npm start -- --port 8088

# 或者重置 Metro 缓存
npm start -- --reset-cache
```

### 4. 构建失败
**问题**: Gradle 构建错误
**解决方案**:
```bash
# 清理 Gradle 缓存
cd android
./gradlew clean
cd ..

# 重新构建
npm run android
```

## 调试技巧

### 1. 开发者菜单
在模拟器中：
- 按 `Ctrl + M` (Windows) 或 `Cmd + M` (Mac) 打开开发者菜单
- 或者摇动模拟器设备

### 2. 常用调试命令
```bash
# 重新加载应用
adb shell input keyevent 82  # 打开开发者菜单
# 然后选择 "Reload"

# 查看应用日志
adb logcat | findstr ReactNative

# 安装 APK
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### 3. 性能优化
```bash
# 启用硬件加速（如果支持）
emulator -avd Your_AVD_Name -gpu host

# 分配更多内存
emulator -avd Your_AVD_Name -memory 2048
```

## 测试流程示例

### 完整测试流程
```bash
# 1. 启动模拟器
emulator -avd Pixel_4_API_30

# 2. 等待模拟器完全启动（约1-2分钟）

# 3. 启动 Metro 打包器
npm start

# 4. 在另一个终端安装并运行应用
npm run android

# 5. 测试应用功能
# - 使用演示账户登录
# - 测试所有核心功能模块
# - 验证数据持久化
```

### 演示账户测试
```
学生账户:
用户名: student1
密码: 123456

家长账户:
用户名: parent1
密码: 123456

教师账户:
用户名: teacher1
密码: 123456
```

## 高级配置

### 1. 自定义模拟器配置
在 AVD Manager 中编辑设备：
- RAM: 至少 2GB
- 内部存储: 至少 2GB
- 启用 "Use Host GPU"

### 2. 网络配置
如果需要测试网络功能：
```bash
# 设置代理（如果需要）
emulator -avd Your_AVD_Name -http-proxy http://proxy-server:port
```

### 3. 快照功能
使用快照快速恢复测试环境：
- 在模拟器运行时创建快照
- 关机时选择 "Save to Quickboot"
- 下次启动时快速恢复

## 替代方案

### 1. 第三方模拟器
如果官方模拟器性能不佳，可以考虑：
- **BlueStacks**: 游戏优化，性能较好
- **Genymotion**: 开发者专用，功能强大
- **NoxPlayer**: 轻量级替代方案

### 2. 真机调试
如果模拟器仍有问题，可以使用真机：
```bash
# 启用 USB 调试
# 连接手机后运行
adb devices
npm run android
```

## 性能监控

### 1. 监控工具
- Android Studio Profiler
- React Native Debugger
- Chrome DevTools

### 2. 关键指标
- 应用启动时间
- 内存使用情况
- 帧率 (FPS)
- 电池消耗

## 故障排除清单

1. ✅ 检查 Java 安装
2. ✅ 检查 Android SDK 路径
3. ✅ 验证 AVD 创建
4. ✅ 检查端口占用
5. ✅ 验证 Gradle 构建
6. ✅ 检查网络连接
7. ✅ 验证依赖安装

如果遇到其他问题，请查看 React Native 官方文档或提交 Issue。

---

*最后更新: 2025年11月7日*
*适用于: Windows 11, React Native 0.73+*