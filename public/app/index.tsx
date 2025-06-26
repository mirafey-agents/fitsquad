import { Redirect } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { getLoggedInUser } from '@/utils/auth';

const Index = () => {
  useFrameworkReady();
  const user = getLoggedInUser();
  if (!user?.user) {
    return <Redirect href="/login"/>
  }

  if (user.profile && user.profile.role === 'trainer') {
    return <Redirect href="/trainer"/>
  } else {
    return <Redirect href="/member"/>
  }
};

export default Index; 