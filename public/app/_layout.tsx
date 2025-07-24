import React, { useEffect } from 'react';
import { Stack, router, usePathname } from 'expo-router';
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
  const path = usePathname();
  const isAuthPage = path.startsWith('/login') || path.startsWith('/reset-password');
  // console.log('path: ', path);
  useEffect(() => {
    if (!isAuthPage) { 
      window.frameworkReady?.();
      getLoggedInUser().then((user) => {
        console.log('user', user);
        if (user == null) {
            console.log('No logged in user, redirecting to login');
            router.replace('/login' as any);
          }
      });
    }
  }, []);

  if (isAuthPage) {
    return (
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    );
  }

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