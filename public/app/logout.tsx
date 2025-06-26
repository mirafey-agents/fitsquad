import { Redirect, router } from 'expo-router';
import { logout } from '@/utils/auth';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function LogoutPage() {
    useFrameworkReady();
    logout();
    return <Redirect href='/'/>
} 