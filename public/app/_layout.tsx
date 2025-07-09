import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { SessionsProvider } from '@/app/context/SessionsContext';
import { HabitsProvider } from '@/app/context/HabitsContext';
import { getLoggedInUser } from '@/utils/storage';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    window.frameworkReady?.();
    getLoggedInUser().then((user) => {
      if (user == null) {
        console.log('No logged in user, redirecting to login');
        router.push('/login');
      }
    });
  }, []);

  return (
    <HabitsProvider>
      <SessionsProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </SessionsProvider>
    </HabitsProvider>
  );
}