import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

const FEATURED_CHALLENGES = [
  {
    id: '1',
    title: 'Morning HIIT Warriors',
    description: '30-day morning workout challenge',
    participants: 128,
    duration: '30 days',
    intensity: 'High',
    votes: 45,
    image: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?q=80&w=800&auto=format&fit=crop',
    color: '#FFE1E1',
  },
  {
    id: '2',
    title: 'Squad Strength Week',
    description: '7-day strength training challenge',
    participants: 64,
    duration: '7 days',
    intensity: 'Medium',
    votes: 32,
    image: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?q=80&w=800&auto=format&fit=crop',
    color: '#E1F5FF',
  },
];

const HOME_CHALLENGES = [
  {
    id: '1',
    title: '100 Push-ups',
    description: 'Build upper body strength with daily push-ups',
    accepted: 18,
    totalMembers: 25,
    timeLeft: '5h 23m',
    color: '#FFE1E1',
    type: 'Upper Body',
    benefits: [
      'Chest strength',
      'Core stability',
      'Triceps development'
    ]
  },
  {
    id: '2',
    title: '5km Run',
    description: 'Improve cardiovascular endurance',
    accepted: 22,
    totalMembers: 25,
    timeLeft: '8h 45m',
    color: '#E1F5FF',
    type: 'Cardio',
    benefits: [
      'Endurance',
      'Heart health',
      'Mental clarity'
    ]
  },
  {
    id: '3',
    title: '20min Yoga Flow',
    description: 'Daily flexibility and mindfulness practice',
    accepted: 15,
    totalMembers: 25,
    timeLeft: '12h 10m',
    color: '#FFE8D9',
    type: 'Flexibility',
    benefits: [
      'Flexibility',
      'Stress reduction',
      'Better posture'
    ]
  },
];

export default function Challenges() {
  const showChallengeDetails = (challenge: typeof HOME_CHALLENGES[0]) => {
    Alert.alert(
      challenge.title,
      `Type: ${challenge.type}\n\n` +
      'Benefits:\n' + challenge.benefits.map(b => `• ${b}`).join('\n') + '\n\n' +
      `${challenge.description}\n\n` +
      `${challenge.accepted} out of ${challenge.totalMembers} squad members accepted this challenge!\n\n` +
      'Accept this challenge to improve together with your squad! 💪',
      [
        {
          text: 'Accept Challenge',
          onPress: () => console.log('Accepted challenge'),
          style: 'default'
        },
        {
          text: 'Maybe Later',
          style: 'cancel'
        }
      ]
    );
  };

  const handleVote = (challengeId: string) => {
    const challenge = FEATURED_CHALLENGES.find(c => c.id === challengeId);
    if (challenge) {
      Alert.alert(
        'Vote for Challenge',
        'Would you like to see this workout plan in our upcoming sessions?',
        [
          {
            text: 'Vote',
            onPress: () => {
              challenge.votes++;
              console.log(`Voted for challenge: ${challenge.title}`);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Featured Challenges</Text>
        <Text style={styles.subtitle}>Vote for upcoming workout plans</Text>
      </View>

      {FEATURED_CHALLENGES.map((challenge, index) => (
        <Animated.View
          key={challenge.id}
          entering={FadeInUp.delay(index * 200)}
          style={[styles.featuredCard, { backgroundColor: challenge.color }]}
        >
          <Image source={{ uri: challenge.image }} style={styles.challengeImage} />
          <View style={styles.challengeContent}>
            <View style={styles.challengeHeader}>
              <View>
                <Text style={styles.challengeTitle}>{challenge.title}</Text>
                <Text style={styles.challengeDescription}>{challenge.description}</Text>
              </View>
            </View>
            <View style={styles.challengeMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color="#000000" />
                <Text style={styles.metaText}>{challenge.duration}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="flame-outline" size={14} color="#000000" />
                <Text style={styles.metaText}>{challenge.intensity}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={14} color="#000000" />
                <Text style={styles.metaText}>{challenge.participants} joined</Text>
              </View>
            </View>
            <View style={styles.voteSection}>
              <View style={styles.voteCount}>
                <Ionicons name="thumbs-up" size={14} color="#000000" />
                <Text style={styles.voteText}>{challenge.votes} votes</Text>
              </View>
              <Pressable
                style={styles.voteButton}
                onPress={() => handleVote(challenge.id)}
              >
                <Text style={styles.voteButtonText}>Vote for Plan</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      ))}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Home Challenges</Text>
        <Text style={styles.sectionSubtitle}>Keep the momentum going outside the gym</Text>

        {HOME_CHALLENGES.map((challenge, index) => (
          <Animated.View
            key={challenge.id}
            entering={FadeInUp.delay(index * 100)}
          >
            <Pressable
              style={[styles.homeChallengeCard, { backgroundColor: challenge.color }]}
              onPress={() => showChallengeDetails(challenge)}
            >
              <View style={styles.homeChallengeHeader}>
                <View>
                  <Text style={styles.homeChallengeTitle}>{challenge.title}</Text>
                  <Text style={styles.homeChallengeDescription}>{challenge.description}</Text>
                </View>
                <BlurView intensity={80} style={styles.acceptanceRate}>
                  <Text style={styles.acceptanceText}>
                    {Math.round((challenge.accepted / challenge.totalMembers) * 100)}%
                  </Text>
                </BlurView>
              </View>

              <View style={styles.homeChallengeFooter}>
                <View style={styles.timeContainer}>
                  <Ionicons name="time" size={14} color="#000000" />
                  <Text style={styles.timeText}>{challenge.timeLeft} left</Text>
                </View>
                <View style={styles.acceptedContainer}>
                  <Ionicons name="people" size={14} color="#000000" />
                  <Text style={styles.acceptedText}>
                    {challenge.accepted}/{challenge.totalMembers} accepted
                  </Text>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8E93',
  },
  featuredCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  challengeImage: {
    width: '100%',
    height: 200,
  },
  challengeContent: {
    padding: 16,
  },
  challengeHeader: {
    marginBottom: 12,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#000000',
  },
  challengeMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#000000',
  },
  voteSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
  },
  voteCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  voteText: {
    fontSize: 14,
    color: '#000000',
  },
  voteButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  voteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    marginBottom: 16,
  },
  homeChallengeCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  homeChallengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  homeChallengeTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  homeChallengeDescription: {
    fontSize: 14,
    color: '#000000',
    maxWidth: '80%',
  },
  acceptanceRate: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  acceptanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  homeChallengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#000000',
  },
  acceptedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  acceptedText: {
    fontSize: 12,
    color: '#000000',
  },
});