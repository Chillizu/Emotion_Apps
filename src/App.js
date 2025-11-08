import React from 'react';
import {SafeAreaView, StatusBar, StyleSheet} from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import MaterialTheme from './theme/MaterialTheme';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={MaterialTheme.colors.surface.default}
      />
      <AppNavigator />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MaterialTheme.colors.surface.default,
  },
});

export default App;