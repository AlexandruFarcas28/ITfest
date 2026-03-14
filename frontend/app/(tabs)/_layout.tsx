import React from 'react';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#0A0A0A' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '800' },
        tabBarStyle: {
          backgroundColor: '#111111',
          borderTopColor: '#1f1f1f',
        },
        tabBarActiveTintColor: '#22C55E',
        tabBarInactiveTintColor: '#888888',
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="nutrition" options={{ title: 'Food' }} />
      <Tabs.Screen name="water" options={{ title: 'Water' }} />
      <Tabs.Screen name="metrics" options={{ title: 'Metrics' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}