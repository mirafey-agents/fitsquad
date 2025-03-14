import { Redirect } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { getLoggedInUser } from '../utils/supabase';

const Index = () => {
  useFrameworkReady();
  const user = getLoggedInUser();
    
  if (!user || !user.profile) {
    return <Redirect href="/login"/>
  }

  if (user.profile.role === 'trainer') {
    return <Redirect href="/trainer"/>
  } else if(user.profile.role === 'member') {
    return <Redirect href="/member"/>
  }
  alert('Unknown user role: ' + user.profile.role);
  return <Redirect href="/logout"/>;
};

export default Index; 