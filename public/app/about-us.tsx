import React from 'react';
import { View, Text } from 'react-native';

const AboutUs = () => {
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center' 
    }}>
      <Text style={{ 
        fontSize: 32, 
        fontWeight: 'bold',
        color: '#1f2937' 
      }}>
        Coming Soon
      </Text>
    </View>
  );
};

export default AboutUs; 