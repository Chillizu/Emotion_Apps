import React, {useState} from 'react';
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

const RegisterScreen = ({navigation}) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: USER_ROLES.STUDENT,
    profile: {
      name: '',
      age: '',
      grade: '',
      school: '',
    },
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      Alert.alert('输入错误', '请输入用户名');
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      Alert.alert('输入错误', '请输入有效的邮箱地址');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('输入错误', '密码长度至少6位');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('输入错误', '两次输入的密码不一致');
      return false;
    }
    if (!formData.profile.name.trim()) {
      Alert.alert('输入错误', '请输入姓名');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await AuthService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        profile: {
          name: formData.profile.name,
          age: parseInt(formData.profile.age) || 0,
          grade: formData.profile.grade,
          school: formData.profile.school,
        },
      });

      if (result.success) {
        Alert.alert('注册成功', '账户创建成功，请登录使用', [
          {
            text: '确定',
            onPress: () => navigation.navigate('Login'),
          },
        ]);
      } else {
        Alert.alert('注册失败', result.error);
      }
    } catch (error) {
      Alert.alert('注册错误', '注册过程中发生错误，请重试');
      console.error('注册错误:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case USER_ROLES.STUDENT:
        return '记录情绪、使用调适工具、查看个人报告';
      case USER_ROLES.PARENT:
        return '关联孩子账户、查看孩子情绪状态、接收提醒';
      case USER_ROLES.TEACHER:
        return '管理班级学生、查看班级情绪报告、发布通知';
      default:
        return '';
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* 头部 */}
        <View style={styles.header}>
          <Text style={styles.title}>注册账户</Text>
          <Text style={styles.subtitle}>创建您的心情守护账户</Text>
        </View>

        {/* 注册表单 */}
        <View style={styles.formContainer}>
          {/* 账户信息 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>账户信息</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>用户名 *</Text>
              <TextInput
                style={styles.input}
                placeholder="设置用户名（用于登录）"
                value={formData.username}
                onChangeText={value => handleInputChange('username', value)}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>邮箱 *</Text>
              <TextInput
                style={styles.input}
                placeholder="请输入邮箱地址"
                value={formData.email}
                onChangeText={value => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>密码 *</Text>
              <TextInput
                style={styles.input}
                placeholder="设置密码（至少6位）"
                value={formData.password}
                onChangeText={value => handleInputChange('password', value)}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>确认密码 *</Text>
              <TextInput
                style={styles.input}
                placeholder="再次输入密码"
                value={formData.confirmPassword}
                onChangeText={value => handleInputChange('confirmPassword', value)}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* 角色选择 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>选择角色</Text>
            <View style={styles.roleContainer}>
              {Object.values(USER_ROLES).map(role => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleButton,
                    formData.role === role && styles.roleButtonSelected,
                  ]}
                  onPress={() => handleInputChange('role', role)}>
                  <Text
                    style={[
                      styles.roleText,
                      formData.role === role && styles.roleTextSelected,
                    ]}>
                    {role === USER_ROLES.STUDENT && '学生'}
                    {role === USER_ROLES.PARENT && '家长'}
                    {role === USER_ROLES.TEACHER && '教师'}
                  </Text>
                  <Text style={styles.roleDescription}>
                    {getRoleDescription(role)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 个人信息 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>个人信息</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>姓名 *</Text>
              <TextInput
                style={styles.input}
                placeholder="请输入真实姓名"
                value={formData.profile.name}
                onChangeText={value => handleInputChange('profile.name', value)}
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputContainer, styles.halfInput]}>
                <Text style={styles.label}>年龄</Text>
                <TextInput
                  style={styles.input}
                  placeholder="年龄"
                  value={formData.profile.age}
                  onChangeText={value => handleInputChange('profile.age', value)}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputContainer, styles.halfInput]}>
                <Text style={styles.label}>年级</Text>
                <TextInput
                  style={styles.input}
                  placeholder="年级"
                  value={formData.profile.grade}
                  onChangeText={value => handleInputChange('profile.grade', value)}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>学校</Text>
              <TextInput
                style={styles.input}
                placeholder="学校名称"
                value={formData.profile.school}
                onChangeText={value => handleInputChange('profile.school', value)}
              />
            </View>
          </View>

          <MaterialButton
            title={isLoading ? '注册中...' : '注册账户'}
            onPress={handleRegister}
            variant="contained"
            disabled={isLoading}
            style={styles.registerButton}
          />

          {/* 登录链接 */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>已有账户？</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>立即登录</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 底部信息 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            注册即表示您同意我们的服务条款和隐私政策
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
    paddingHorizontal: MaterialTheme.spacing.lg,
    paddingVertical: MaterialTheme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: MaterialTheme.spacing.xl,
  },
  title: {
    fontSize: MaterialTheme.typography.headline2.fontSize,
    fontWeight: MaterialTheme.typography.headline2.fontWeight,
    color: MaterialTheme.colors.onSurface.high,
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
  section: {
    marginBottom: MaterialTheme.spacing.xl,
  },
  sectionTitle: {
    fontSize: MaterialTheme.typography.headline3.fontSize,
    fontWeight: MaterialTheme.typography.headline3.fontWeight,
    color: MaterialTheme.colors.onSurface.high,
    marginBottom: MaterialTheme.spacing.md,
    paddingBottom: MaterialTheme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: MaterialTheme.colors.outline.variant,
  },
  inputContainer: {
    marginBottom: MaterialTheme.spacing.md,
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
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  roleContainer: {
    marginTop: MaterialTheme.spacing.sm,
  },
  roleButton: {
    backgroundColor: MaterialTheme.colors.surface.variant,
    borderRadius: MaterialTheme.borderRadius.md,
    padding: MaterialTheme.spacing.md,
    marginBottom: MaterialTheme.spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleButtonSelected: {
    borderColor: MaterialTheme.colors.primary.default,
    backgroundColor: MaterialTheme.colors.primary.container,
  },
  roleText: {
    fontSize: MaterialTheme.typography.body1.fontSize,
    fontWeight: '500',
    color: MaterialTheme.colors.onSurface.high,
    marginBottom: MaterialTheme.spacing.xs,
  },
  roleTextSelected: {
    color: MaterialTheme.colors.primary.default,
  },
  roleDescription: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
    lineHeight: 16,
  },
  registerButton: {
    marginTop: MaterialTheme.spacing.md,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: MaterialTheme.spacing.lg,
  },
  loginText: {
    fontSize: MaterialTheme.typography.body2.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
    marginRight: MaterialTheme.spacing.xs,
  },
  loginLink: {
    fontSize: MaterialTheme.typography.body2.fontSize,
    color: MaterialTheme.colors.primary.default,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.onSurface.low,
    textAlign: 'center',
  },
});

export default RegisterScreen;