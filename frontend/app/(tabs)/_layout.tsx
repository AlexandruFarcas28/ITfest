import React from 'react';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="nutrition" />
      <Tabs.Screen name="water" />
      <Tabs.Screen name="metrics" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}