import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import MaterialButton from '../components/MaterialButton';
import MaterialTheme from '../theme/MaterialTheme';
import AuthService, {USER_ROLES} from '../services/AuthService';

const ProfileScreen = ({navigation}) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('加载用户资料失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('确认登出', '确定要退出登录吗？', [
      {text: '取消', style: 'cancel'},
      {
        text: '确定',
        style: 'destructive',
        onPress: async () => {
          try {
            await AuthService.logout();
            // 登出后会自动跳转到登录页面
          } catch (error) {
            console.error('登出失败:', error);
            Alert.alert('登出失败', '请重试');
          }
        },
      },
    ]);
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case USER_ROLES.STUDENT:
        return '学生';
      case USER_ROLES.PARENT:
        return '家长';
      case USER_ROLES.TEACHER:
        return '教师';
      case USER_ROLES.ADMIN:
        return '管理员';
      default:
        return '用户';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>无法加载用户信息</Text>
        <MaterialButton
          title="重新加载"
          onPress={loadUserProfile}
          variant="contained"
          style={styles.retryButton}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 用户信息卡片 */}
      <View style={styles.profileCard}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {user.profile.name ? user.profile.name.charAt(0) : '?'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.profile.name || '未设置姓名'}</Text>
            <Text style={styles.userRole}>{getRoleDisplayName(user.role)}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>
      </View>

      {/* 个人信息部分 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>个人信息</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>用户名</Text>
            <Text style={styles.infoValue}>{user.username}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>年龄</Text>
            <Text style={styles.infoValue}>
              {user.profile.age ? `${user.profile.age}岁` : '未设置'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>年级</Text>
            <Text style={styles.infoValue}>
              {user.profile.grade || '未设置'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>学校</Text>
            <Text style={styles.infoValue}>
              {user.profile.school || '未设置'}
            </Text>
          </View>
        </View>
      </View>

      {/* 账户设置部分 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>账户设置</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>编辑个人资料</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>通知设置</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>隐私设置</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>帮助与反馈</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* 角色特定功能 */}
      {user.role === USER_ROLES.PARENT && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>家长功能</Text>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>关联学生账户</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>查看孩子报告</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>
      )}

      {user.role === USER_ROLES.TEACHER && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>教师功能</Text>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>管理班级</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>班级报告</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 应用信息 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>应用信息</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>版本</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>最后登录</Text>
          <Text style={styles.infoValue}>
            {user.lastLogin
              ? new Date(user.lastLogin).toLocaleDateString('zh-CN')
              : '未知'}
          </Text>
        </View>
      </View>

      {/* 登出按钮 */}
      <MaterialButton
        title="退出登录"
        onPress={handleLogout}
        variant="outlined"
        style={styles.logoutButton}
        textStyle={styles.logoutButtonText}
      />

      {/* 底部信息 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          心情守护 - 关注中小学生心理健康
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MaterialTheme.colors.surface.default,
  },
  content: {
    padding: MaterialTheme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MaterialTheme.colors.surface.default,
  },
  loadingText: {
    fontSize: MaterialTheme.typography.body1.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MaterialTheme.colors.surface.default,
    padding: MaterialTheme.spacing.xl,
  },
  errorText: {
    fontSize: MaterialTheme.typography.body1.fontSize,
    color: MaterialTheme.colors.error.default,
    marginBottom: MaterialTheme.spacing.lg,
    textAlign: 'center',
  },
  retryButton: {
    minWidth: 120,
  },
  profileCard: {
    backgroundColor: MaterialTheme.colors.surface.container,
    borderRadius: MaterialTheme.borderRadius.lg,
    padding: MaterialTheme.spacing.lg,
    marginBottom: MaterialTheme.spacing.lg,
    ...MaterialTheme.elevation.small,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: MaterialTheme.colors.primary.container,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: MaterialTheme.spacing.lg,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: MaterialTheme.colors.primary.default,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: MaterialTheme.typography.headline2.fontSize,
    fontWeight: MaterialTheme.typography.headline2.fontWeight,
    color: MaterialTheme.colors.onSurface.high,
    marginBottom: MaterialTheme.spacing.xs,
  },
  userRole: {
    fontSize: MaterialTheme.typography.body2.fontSize,
    color: MaterialTheme.colors.primary.default,
    fontWeight: '500',
    marginBottom: MaterialTheme.spacing.xs,
  },
  userEmail: {
    fontSize: MaterialTheme.typography.body2.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
  },
  section: {
    backgroundColor: MaterialTheme.colors.surface.container,
    borderRadius: MaterialTheme.borderRadius.lg,
    padding: MaterialTheme.spacing.lg,
    marginBottom: MaterialTheme.spacing.lg,
    ...MaterialTheme.elevation.small,
  },
  sectionTitle: {
    fontSize: MaterialTheme.typography.headline3.fontSize,
    fontWeight: MaterialTheme.typography.headline3.fontWeight,
    color: MaterialTheme.colors.onSurface.high,
    marginBottom: MaterialTheme.spacing.md,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: MaterialTheme.spacing.md,
  },
  infoLabel: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.onSurface.medium,
    marginBottom: MaterialTheme.spacing.xs,
  },
  infoValue: {
    fontSize: MaterialTheme.typography.body2.fontSize,
    color: MaterialTheme.colors.onSurface.high,
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: MaterialTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: MaterialTheme.colors.outline.variant,
  },
  settingLabel: {
    fontSize: MaterialTheme.typography.body1.fontSize,
    color: MaterialTheme.colors.onSurface.high,
  },
  settingArrow: {
    fontSize: 20,
    color: MaterialTheme.colors.onSurface.medium,
  },
  logoutButton: {
    marginTop: MaterialTheme.spacing.md,
    borderColor: MaterialTheme.colors.error.default,
  },
  logoutButtonText: {
    color: MaterialTheme.colors.error.default,
  },
  footer: {
    alignItems: 'center',
    marginTop: MaterialTheme.spacing.xl,
    paddingTop: MaterialTheme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: MaterialTheme.colors.outline.variant,
  },
  footerText: {
    fontSize: MaterialTheme.typography.caption.fontSize,
    color: MaterialTheme.colors.onSurface.low,
    textAlign: 'center',
  },
});

export default ProfileScreen;