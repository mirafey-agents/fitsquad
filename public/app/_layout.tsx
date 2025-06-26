import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { SessionsProvider } from '@/app/context/SessionsContext';
import { HabitsProvider } from '@/app/context/HabitsContext';
import { getLoggedInUser } from '@/utils/auth';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export default function RootLayout() {
  useFrameworkReady();
  console.log('loggedInUser: ', getLoggedInUser());

  useEffect(() => {
    window.frameworkReady?.();
    if (getLoggedInUser() == null) {
      console.log('logged in user is null');
      router.push('/login');
    }
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