import { useEffect } from 'react';
import { router, Stack } from 'expo-router';

import { subscribeToSessionInvalidation } from '../src/auth/session';

export default function RootLayout() {
  useEffect(() => {
    return subscribeToSessionInvalidation(() => {
      router.replace('/');
    });
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
