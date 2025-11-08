import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const HomeScreen = ({navigation}) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>欢迎使用</Text>
        <Text style={styles.subtitle}>React Native 手机App框架</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.buttonText}>前往个人资料</Text>
        </TouchableOpacity>

        <View style={styles.featureList}>
          <Text style={styles.featureTitle}>框架特性：</Text>
          <Text style={styles.featureItem}>• React Native 0.73</Text>
          <Text style={styles.featureItem}>• React Navigation 导航</Text>
          <Text style={styles.featureItem}>• TypeScript 支持</Text>
          <Text style={styles.featureItem}>• 模块化组件结构</Text>
          <Text style={styles.featureItem}>• 响应式设计</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  content: {
    padding: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  featureList: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  featureItem: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
});

export default HomeScreen;