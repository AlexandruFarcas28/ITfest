import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopNav from '../../src/components/TopNav';
import { COLORS } from '../../src/styles/theme';

export default function TabsLayout() {
  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.navShell}>
        <TopNav />
      </SafeAreaView>

      <View style={styles.content}>
        <Tabs
          screenOptions={{
            headerShown: false,
            sceneStyle: { backgroundColor: COLORS.bg },
            tabBarStyle: { display: 'none' },
          }}
        >
          <Tabs.Screen name="home" />
          <Tabs.Screen name="nutrition" />
          <Tabs.Screen name="water" />
          <Tabs.Screen name="metrics" />
          <Tabs.Screen name="profile" />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  navShell: {
    backgroundColor: COLORS.bg,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  content: {
    flex: 1,
  },
});
