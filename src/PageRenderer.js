import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

// 页面渲染引擎 - 根据JSON配置动态生成UI
const PageRenderer = ({pageConfig}) => {
  if (!pageConfig) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>页面配置为空</Text>
      </View>
    );
  }

  const renderComponent = (component, index) => {
    const {type, props, children, style} = component;
    const key = `${type}_${index}`;

    // 合并基础样式和自定义样式
    const componentStyle = [styles[type], style];

    switch (type) {
      case 'container':
        return (
          <View key={key} style={componentStyle} {...props}>
            {children && children.map(renderComponent)}
          </View>
        );

      case 'text':
        return (
          <Text key={key} style={componentStyle} {...props}>
            {component.content}
          </Text>
        );

      case 'image':
        return (
          <Image
            key={key}
            source={{uri: component.source}}
            style={componentStyle}
            {...props}
          />
        );

      case 'button':
        return (
          <TouchableOpacity
            key={key}
            style={componentStyle}
            onPress={() => {
              if (component.action === 'navigate' && component.target) {
                // 这里可以添加导航逻辑
                console.log(`导航到: ${component.target}`);
              }
            }}
            {...props}>
            <Text style={styles.buttonText}>{component.text}</Text>
          </TouchableOpacity>
        );

      case 'scrollview':
        return (
          <ScrollView key={key} style={componentStyle} {...props}>
            {children && children.map(renderComponent)}
          </ScrollView>
        );

      default:
        return (
          <View key={key} style={componentStyle}>
            <Text>未知组件: {type}</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.page}>
      {pageConfig.components && pageConfig.components.map(renderComponent)}
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
  },
  container: {
    padding: 16,
  },
  text: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollview: {
    flex: 1,
  },
});

export default PageRenderer;