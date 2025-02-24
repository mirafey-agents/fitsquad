import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

const CHALLENGES = [
  {
    id: '1',
    title: 'Morning HIIT Warriors',
    description: '30-day morning workout challenge',
    participants: 128,
    duration: '30 days',
    intensity: 'High',
    image: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '2',
    title: 'Squad Strength Week',
    description: '7-day strength training challenge',
    participants: 64,
    duration: '7 days',
    intensity: 'Medium',
    image: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?q=80&w=800&auto=format&fit=crop',
  },
];

export default function Challenges() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Featured Challenges</Text>
        {CHALLENGES.map((challenge, index) => (
          <Animated.View
            key={challenge.id}
            entering={FadeInUp.delay(index * 200)}
            style={styles.challengeCard}>
            <Pressable
              onPress={() => {
                Alert.alert(
                  challenge.title,
                  `${challenge.description}\n\n` +
                  'Exercise Plan:\n' +
                  '- 20 min HIIT cardio\n' +
                  '- 15 min strength training\n' +
                  '- 10 min core workout\n\n' +
                  'Benefits:\n' +
                  '- Improves cardiovascular health\n' +
                  '- Builds lean muscle mass\n' +
                  '- Enhances metabolic rate\n' +
                  '- Increases energy levels\n\n' +
                  'Upvote this challenge to help it get featured!',
                  [
                    {
                      text: 'Upvote',
                      onPress: () => console.log('Upvoted challenge'),
                      style: 'default'
                    },
                    {
                      text: 'Close',
                      style: 'cancel'
                    }
                  ]
                );
              }}
              style={styles.challengePressable}
            >
              <Image source={{ uri: challenge.image }} style={styles.challengeImage} />
              <View style={styles.challengeContent}>
                <View style={styles.challengeHeader}>
                  <View>
                    <Text style={styles.challengeTitle}>{challenge.title}</Text>
                    <Text style={styles.challengeDescription}>{challenge.description}</Text>
                  </View>
                  <View style={styles.challengeMeta}>
                    <View style={styles.challengeMetaItem}>
                      <Ionicons name="time-outline" size={14} color="#6B7280" />
                      <Text style={styles.challengeMetaText}>{challenge.duration}</Text>
                    </View>
                    <View style={styles.challengeMetaItem}>
                      <Ionicons name="flame-outline" size={14} color="#6B7280" />
                      <Text style={styles.challengeMetaText}>{challenge.intensity}</Text>
                    </View>
                    <View style={styles.challengeMetaItem}>
                      <Ionicons name="people-outline" size={14} color="#6B7280" />
                      <Text style={styles.challengeMetaText}>{challenge.participants} joined</Text>
                    </View>
                  </View>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: 20,
  },
  scrollContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
    marginHorizontal: 20,
  },
  challengeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  challengePressable: {
    width: '100%',
  },
  challengeImage: {
    width: '100%',
    height: 200,
  },
  challengeContent: {
    padding: 16,
  },
  challengeHeader: {
    gap: 12,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  challengeMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  challengeMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  challengeMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },
});