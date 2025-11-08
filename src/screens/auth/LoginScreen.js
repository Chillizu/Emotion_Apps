import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import MaterialButton from '../../components/MaterialButton';
import MaterialTheme from '../../theme/MaterialTheme';
import AuthService, {USER_ROLES} from '../../services/AuthService';

const LoginScreen = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoHint, setShowDemoHint] = useState(false);

  useEffect(() => {
    // 初始化演示数据
    AuthService.initializeDemoData();
    setShowDemoHint(true);
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('输入错误', '请输入用户名和密码');
      return;
    }

    setIsLoading(true);
    try {
      const result = await AuthService.login({username, password});
      
      if (result.success) {
        Alert.alert('登录成功', `欢迎回来，${result.user.profile.name || result.user.username}！`);
        // 登录成功后的导航将在App.js中处理
      } else {
        Alert.alert('登录失败', result.error);
      }
    } catch (error) {
      Alert.alert('登录错误', '登录过程中发生错误，请重试');
      console.error('登录错误:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    let demoCredentials = {};
    switch (role) {
      case USER_ROLES.STUDENT:
        demoCredentials = {username: 'student1', password: '123456'};
        break;
      case USER_ROLES.PARENT:
        demoCredentials = {username: 'parent1', password: '123456'};
        break;
      case USER_ROLES.TEACHER:
        demoCredentials = {username: 'teacher1', password: '123456'};
        break;
    }
    setUsername(demoCredentials.username);
    setPassword(demoCredentials.password);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* 头部 */}
        <View style={styles.header}>
          <Text style={styles.title}>心情守护</Text>
          <Text style={styles.subtitle}>中小学生情绪管理助手</Text>
        </View>

        {/* 登录表单 */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>用户登录</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>用户名/邮箱</Text>
            <TextInput
              style={styles.input}
              placeholder="请输入用户名或邮箱"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>密码</Text>
            <TextInput
              style={styles.input}
              placeholder="请输入密码"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <MaterialButton
            title={isLoading ? '登录中...' : '登录'}
            onPress={handleLogin}
            variant="contained"
            disabled={isLoading}
            style={styles.loginButton}
          />

          {/* 演示账户快速登录 */}
          {showDemoHint && (
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>演示账户快速登录</Text>
              <View style={styles.demoButtons}>
                <TouchableOpacity
                  style={[styles.demoButton, {backgroundColor: MaterialTheme.colors.primary.default}]}
                  onPress={() => handleDemoLogin(USER_ROLES.STUDENT)}>
                  <Text style={styles.demoButtonText}>学生账户</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.demoButton, {backgroundColor: MaterialTheme.colors.secondary.default}]}
                  onPress={() => handleDemoLogin(USER_ROLES.PARENT)}>
                  <Text style={styles.demoButtonText}>家长账户</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.demoButton, {backgroundColor: MaterialTheme.colors.tertiary.default}]}
                  onPress={() => handleDemoLogin(USER_ROLES.TEACHER)}>
                  <Text style={styles.demoButtonText}>教师账户</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 注册链接 */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>还没有账户？</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>立即注册</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 底部信息 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            心情守护 - 关注中小学生心理健康
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MaterialTheme.colors.surface.default,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: MaterialTheme.spacing.lg,
    paddingVertical: MaterialTheme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: MaterialTheme.spacing.xxl,
    marginBottom: MaterialTheme.spacing.xxl,
  },
  title: {
    fontSize: MaterialTheme.typography.headline1.fontSize,
    fontWeight: MaterialTheme.typography.headline1.fontWeight,
    color: MaterialTheme.colors.primary.default,
    marginBottom: MaterialTheme.spacing.xs,
  },
  subtitle: {
    fontSize: MaterialTheme.typography.body1.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: MaterialTheme.colors.surface.container,
    borderRadius: MaterialTheme.borderRadius.lg,
    padding: MaterialTheme.spacing.lg,
    marginBottom: MaterialTheme.spacing.xl,
    ...MaterialTheme.elevation.small,
  },
  formTitle: {
    fontSize: MaterialTheme.typography.headline2.fontSize,
    fontWeight: MaterialTheme.typography.headline2.fontWeight,
    color: MaterialTheme.colors.onSurface.high,
    marginBottom: MaterialTheme.spacing.lg,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: MaterialTheme.spacing.lg,
  },
  label: {
    fontSize: MaterialTheme.typography.body2.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
    marginBottom: MaterialTheme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: MaterialTheme.colors.outline.default,
    borderRadius: MaterialTheme.borderRadius.md,
    paddingHorizontal: MaterialTheme.spacing.md,
    paddingVertical: MaterialTheme.spacing.sm,
    fontSize: MaterialTheme.typography.body1.fontSize,
    color: MaterialTheme.colors.onSurface.high,
    backgroundColor: MaterialTheme.colors.surface.default,
  },
  loginButton: {
    marginTop: MaterialTheme.spacing.md,
  },
  demoSection: {
    marginTop: MaterialTheme.spacing.xl,
    paddingTop: MaterialTheme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: MaterialTheme.colors.outline.variant,
  },
  demoTitle: {
    fontSize: MaterialTheme.typography.body2.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
    textAlign: 'center',
    marginBottom: MaterialTheme.spacing.md,
  },
  demoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  demoButton: {
    flex: 1,
    marginHorizontal: MaterialTheme.spacing.xs,
    paddingVertical: MaterialTheme.spacing.sm,
    borderRadius: MaterialTheme.borderRadius.md,
    alignItems: 'center',
  },
  demoButtonText: {
    color: MaterialTheme.colors.onPrimary.default,
    fontSize: MaterialTheme.typography.caption.fontSize,
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: MaterialTheme.spacing.lg,
  },
  registerText: {
    fontSize: MaterialTheme.typography.body2.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
    marginRight: MaterialTheme.spacing.xs,
  },
  registerLink: {
    fontSize: MaterialTheme.typography.body2.fontSize,
    color: MaterialTheme.colors.primary.default,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: MaterialTheme.spacing.xl,
  },
  footerText: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.onSurface.low,
    textAlign: 'center',
  },
});

export default LoginScreen;