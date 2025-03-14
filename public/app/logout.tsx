import { useEffect } from 'react';
import { Redirect, router } from 'expo-router';
import { logout } from '../utils/supabase';
import { View, Text } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function LogoutPage() {
    useFrameworkReady();
    logout();
    return <Redirect href='/'/>
} 