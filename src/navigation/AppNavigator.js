import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialTheme from '../theme/MaterialTheme';

// 导入屏幕组件
import EmotionDiaryScreen from '../screens/EmotionDiaryScreen';
import PressureAssessmentScreen from '../screens/PressureAssessmentScreen';
import PsychologicalToolsScreen from '../screens/PsychologicalToolsScreen';
import ParentDashboardScreen from '../screens/ParentDashboardScreen';
import ReportScreen from '../screens/ReportScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AuthService from '../services/AuthService';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 认证堆栈导航器
const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

// 情绪日记堆栈导航器
const EmotionDiaryStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="EmotionDiaryMain"
      component={EmotionDiaryScreen}
      options={{title: '情绪日记'}}
    />
  </Stack.Navigator>
);

// 压力评估堆栈导航器
const PressureAssessmentStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="PressureAssessmentMain"
      component={PressureAssessmentScreen}
      options={{title: '压力评估'}}
    />
  </Stack.Navigator>
);

// 心理工具堆栈导航器
const PsychologicalToolsStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="PsychologicalToolsMain"
      component={PsychologicalToolsScreen}
      options={{title: '心理调适'}}
    />
  </Stack.Navigator>
);

// 家长监控堆栈导航器
const ParentDashboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="ParentDashboardMain"
      component={ParentDashboardScreen}
      options={{title: '家长监控'}}
    />
  </Stack.Navigator>
);

// 报告堆栈导航器
const ReportStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="ReportMain"
      component={ReportScreen}
      options={{title: '数据分析'}}
    />
  </Stack.Navigator>
);

// 个人资料堆栈导航器
const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="ProfileMain"
      component={ProfileScreen}
      options={{title: '个人资料'}}
    />
  </Stack.Navigator>
);

// 主应用导航器（已登录用户）
const MainAppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === '情绪日记') {
            iconName = focused ? 'mood' : 'mood-outline';
          } else if (route.name === '压力评估') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === '心理调适') {
            iconName = focused ? 'psychology' : 'psychology-outline';
          } else if (route.name === '家长监控') {
            iconName = focused ? 'family-restroom' : 'family-restroom';
          } else if (route.name === '数据分析') {
            iconName = focused ? 'insights' : 'insights';
          } else if (route.name === '个人资料') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: MaterialTheme.colors.primary.default,
        tabBarInactiveTintColor: MaterialTheme.colors.onSurface.medium,
        tabBarStyle: {
          backgroundColor: MaterialTheme.colors.surface.container,
          borderTopWidth: 1,
          borderTopColor: MaterialTheme.colors.outline.variant,
        },
        headerStyle: {
          backgroundColor: MaterialTheme.colors.surface.container,
        },
        headerTintColor: MaterialTheme.colors.onSurface.high,
        headerTitleStyle: {
          fontWeight: '500',
        },
      })}>
      <Tab.Screen
        name="情绪日记"
        component={EmotionDiaryStack}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="压力评估"
        component={PressureAssessmentStack}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="心理调适"
        component={PsychologicalToolsStack}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="家长监控"
        component={ParentDashboardStack}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="数据分析"
        component={ReportStack}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="个人资料"
        component={ProfileStack}
        options={{headerShown: false}}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setIsAuthenticated(!!currentUser);
    } catch (error) {
      console.error('检查认证状态失败:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 显示加载状态
  if (isLoading) {
    return null; // 或者返回一个加载组件
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainAppNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
};

export {AuthStack, MainAppNavigator};
export default AppNavigator;