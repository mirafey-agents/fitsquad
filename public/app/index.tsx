import { Redirect } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { getUserProfile } from '@/utils/storage';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';

const Index = () => {
  useFrameworkReady();
  const [profile, setProfile] = useState({role: '', id: ''});
  
  useEffect(() => {
    getUserProfile().then((profile) => {
        setProfile(profile);
    });
  }, []);

  if (profile?.role === '') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  } else if (profile == null) {
    return <Redirect href="/login"/>
  } else if (profile.role === 'trainer') {
    return <Redirect href="/trainer"/>
  } else {
    return <Redirect href="/member"/>
  }
};

export default Index; 